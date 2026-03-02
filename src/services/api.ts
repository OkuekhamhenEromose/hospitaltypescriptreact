// services/api.ts
import type { LoginData, RegisterData, AuthResponse } from "./auth";

// ── Production URL ────────────────────────────────────────────────────────────
// FIX: was hardcoded to http://127.0.0.1:8000/api — every production request
// was failing. Reads from VITE_API_URL env var, falls back to deployed backend.
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ??
  "https://hospitalback-clean.onrender.com/api";

// ── Cache TTLs (ms) ────────────────────────────────────────────────────────────
const TTL_BLOG     = 5 * 60 * 1000; // 5 min — blog rarely changes, Redis-backed
const TTL_PERSONAL = 2 * 60 * 1000; // 2 min — personal data, should feel fresh
const TTL_LIST     = 3 * 60 * 1000; // 3 min — staff/appointment lists

// ── List unwrapper ────────────────────────────────────────────────────────────
const unwrapList = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).results))
    return (data as any).results;
  return [];
};

// ── Media URL normalizer ──────────────────────────────────────────────────────
// FIX: Backend now returns full storage-backend URLs from field.url.
// The old path that assembled s3.amazonaws.com f-strings is removed.
// Only job remaining: ensure http→https for S3 URLs.
export const normalizeMediaUrl = (url: string | null | undefined): string | null => {
  if (!url || url.trim() === "") return null;
  return url;
};
// ── Blog post normalizer ──────────────────────────────────────────────────────
const normalizeBlogPost = (post: any) => {
  const rawSubs = post.subheadings ?? post.sub_headings;
  const subheadings = Array.isArray(rawSubs)
    ? rawSubs.map((s: any, i: number) => ({
        id:           s.id          ?? i + 1,
        title:        s.title       ?? `Section ${i + 1}`,
        level:        s.level       ?? 2,
        description:  s.description ?? "",
        full_content: s.full_content ?? s.description ?? "",
      }))
    : [];

  return {
    ...post,
    // Prefer *_url fields returned by the serializer over raw field paths
    featured_image: normalizeMediaUrl(post.featured_image_url ?? post.featured_image),
    image_1:        normalizeMediaUrl(post.image_1_url        ?? post.image_1),
    image_2:        normalizeMediaUrl(post.image_2_url        ?? post.image_2),
    description:
      post.description ?? post.short_description ?? post.excerpt ?? post.content ?? "",
    subheadings,
    table_of_contents:
      post.table_of_contents ?? post.toc ?? post.toc_items ?? post.contents ?? [],
  };
};

// ── Token expiry pre-check ────────────────────────────────────────────────────
// Decodes the JWT payload client-side (not for security — backend validates).
// Saves a round-trip when the token has already expired.
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now() + 30_000; // 30s buffer
  } catch {
    return true;
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// API SERVICE
// ══════════════════════════════════════════════════════════════════════════════
class ApiService {
  private cache        = new Map<string, { data: unknown; timestamp: number }>();
  private requestQueue = new Map<string, Promise<unknown>>();

  // ── Core fetch ─────────────────────────────────────────────────────────────
  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url    = `${API_BASE_URL}${endpoint}`;
    const token  = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};

    if (!(options.body instanceof FormData))
      headers["Content-Type"] = "application/json";
    if (token)
      headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    Object.assign(headers, options.headers);

    // FIX: Use method+endpoint as dedup key.
    // The original used JSON.stringify(options) which:
    //   (a) serialised the full request body on every call (slow)
    //   (b) never matched for FormData (FormData stringifies to "[object FormData]")
    const method     = (options.method ?? "GET").toUpperCase();
    const requestKey = `${method}:${endpoint}`;

    if (method === "GET" && this.requestQueue.has(requestKey))
      return this.requestQueue.get(requestKey) as Promise<T>;

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 30_000);

    const promise = (async (): Promise<T> => {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.status === 401) {
          this.clearLocalStorage();
          throw new Error("Authentication expired. Please login again.");
        }

        if (!response.ok) {
          let msg = `API error: ${response.status}`;
          try {
            const err = await response.json();
            if (err.detail === "Given token not valid for any token type") {
              this.clearLocalStorage();
              msg = "Session expired. Please login again.";
            } else if (err.detail)         msg = err.detail;
            else if (err.error)            msg = err.error;
            else if (err.non_field_errors) msg = err.non_field_errors.join(", ");
            else                           msg = JSON.stringify(err);
          } catch { /* response body was not JSON */ }
          throw new Error(msg);
        }

        if (response.status === 204 ||
            response.headers.get("content-length") === "0") return null as T;

        return response.json() as Promise<T>;
      } finally {
        clearTimeout(timeoutId);
        this.requestQueue.delete(requestKey);
      }
    })();

    if (method === "GET") this.requestQueue.set(requestKey, promise);
    return promise;
  }

  // ── Retry with token refresh ───────────────────────────────────────────────
  private async requestWithRetry<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    retried = false
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, options);
    } catch (err: any) {
      if (!retried &&
          (err.message.includes("Authentication expired") ||
           err.message.includes("Session expired"))) {
        try {
          await this.refreshToken();
          return await this.requestWithRetry<T>(endpoint, options, true);
        } catch {
          this.clearLocalStorage();
          throw new Error("Session expired. Please login again.");
        }
      }
      throw err;
    }
  }

  // ── Cached GET ─────────────────────────────────────────────────────────────
  private async cachedRequest<T = unknown>(
    endpoint: string,
    ttl = TTL_LIST
  ): Promise<T> {
    const cached = this.cache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < ttl)
      return cached.data as T;

    const data = await this.requestWithRetry<T>(endpoint);
    this.cache.set(endpoint, { data, timestamp: Date.now() });
    return data;
  }

  invalidateCache(prefix: string) {
    for (const key of this.cache.keys())
      if (key.startsWith(prefix)) this.cache.delete(key);
  }

  private clearLocalStorage() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    this.cache.clear();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════════════════════════════════════

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("No refresh token available");

    const res = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      this.clearLocalStorage();
      throw new Error("Failed to refresh token");
    }

    const data = await res.json();
    if (data.access)  localStorage.setItem("access_token",  data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data;
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/users/login/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        username: loginData.username,
        password: loginData.password,
      }),
    });

    if (!res.ok) {
      let msg = `Login failed (${res.status})`;
      try { msg = (await res.json()).detail ?? msg; } catch { /* ignore */ }
      throw new Error(msg);
    }

    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data as AuthResponse;
  }

  async loginWithGoogle(code: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/users/login/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ google_auth_code: code }),
    });
    if (!res.ok) {
      let msg = "Google authentication failed";
      try { msg = (await res.json()).detail ?? msg; } catch { /* ignore */ }
      throw new Error(msg);
    }
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data as AuthResponse;
  }

  async register(registerData: RegisterData): Promise<unknown> {
    return this.request("/users/register/", {
      method: "POST",
      body:   JSON.stringify(registerData),
    });
  }

  async registerWithImage(formData: FormData): Promise<unknown> {
    const res = await fetch(`${API_BASE_URL}/users/register/`, {
      method: "POST",
      body:   formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? JSON.stringify(err));
    }
    return res.json();
  }

  async logout(): Promise<void> {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      try {
        await this.request("/users/logout/", {
          method: "POST",
          body:   JSON.stringify({ refresh }),
        });
      } catch { /* ignore logout errors */ }
    }
    this.clearLocalStorage();
  }

  async getDashboard(): Promise<unknown> {
    return this.cachedRequest("/users/dashboard/", TTL_PERSONAL);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HOSPITAL
  // ════════════════════════════════════════════════════════════════════════════

  async getAppointments(): Promise<unknown[]> {
    return unwrapList(await this.cachedRequest("/hospital/appointments/"));
  }

  async createAppointment(data: unknown): Promise<unknown> {
    this.invalidateCache("/hospital/appointments/");
    return this.request("/hospital/appointments/create/", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  }

  async getAppointmentDetails(id: number): Promise<unknown> {
    return this.cachedRequest(`/hospital/appointments/${id}/`);
  }

  async refreshAppointments(): Promise<unknown[]> {
    this.invalidateCache("/hospital/appointments/");
    return this.getAppointments();
  }

  async getTestRequests(): Promise<unknown[]> {
    return unwrapList(await this.cachedRequest("/hospital/test-requests/"));
  }

  async createTestRequest(data: unknown): Promise<unknown> {
    this.invalidateCache("/hospital/test-requests/");
    return this.request("/hospital/test-requests/create/", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  }

  async refreshTestRequests(): Promise<unknown[]> {
    this.invalidateCache("/hospital/test-requests/");
    return this.getTestRequests();
  }

  async getVitalRequests(): Promise<unknown[]> {
    return unwrapList(await this.cachedRequest("/hospital/vital-requests/"));
  }

  async createVitalRequest(data: unknown): Promise<unknown> {
    this.invalidateCache("/hospital/vital-requests/");
    return this.request("/hospital/vital-requests/create/", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  }

  async refreshVitalRequests(): Promise<unknown[]> {
    this.invalidateCache("/hospital/vital-requests/");
    return this.getVitalRequests();
  }

  async createVitals(data: unknown): Promise<unknown> {
    return this.request("/hospital/vitals/create/", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  }

  async createLabResult(data: unknown): Promise<unknown> {
    return this.request("/hospital/lab-results/create/", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  }

  async createMedicalReport(data: unknown): Promise<unknown> {
    return this.request("/hospital/medical-reports/create/", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  }

  async getStaffMembers(): Promise<unknown[]> {
    return unwrapList(await this.cachedRequest("/hospital/staff/"));
  }

  async getLabScientists(): Promise<unknown[]> {
    return (await this.getStaffMembers()).filter((m: any) => m.role === "LAB");
  }

  async getNurses(): Promise<unknown[]> {
    return (await this.getStaffMembers()).filter((m: any) => m.role === "NURSE");
  }

  async getPatients(): Promise<unknown[]> {
    return unwrapList(await this.cachedRequest("/hospital/patients/"));
  }

  async assignStaff(data: {
    appointment_id: number;
    staff_id: string;
    role: "DOCTOR" | "NURSE" | "LAB";
    notes?: string;
  }): Promise<unknown> {
    return this.request("/hospital/assignments/assign-staff/", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  }

  async getAppointmentAssignments(id: number): Promise<unknown[]> {
    return unwrapList(
      await this.cachedRequest(`/hospital/assignments/appointment/${id}/`)
    );
  }

  async getAvailableStaff(role?: string): Promise<unknown[]> {
    const qs = role ? `?role=${encodeURIComponent(role)}` : "";
    return unwrapList(
      await this.cachedRequest(`/hospital/assignments/available-staff/${qs}`)
    );
  }

  async reassignStaff(assignmentId: number, newStaffId: string): Promise<unknown> {
    return this.request(`/hospital/assignments/${assignmentId}/reassign/`, {
      method: "PATCH",
      body:   JSON.stringify({ staff_id: newStaffId }),
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BLOG
  // ════════════════════════════════════════════════════════════════════════════

  async getBlogPosts(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/blog/", TTL_BLOG);
    return unwrapList(data).map(normalizeBlogPost);
  }

  async getBlogPost(slug: string): Promise<any> {
    const data = await this.cachedRequest(`/hospital/blog/${slug}/`, TTL_BLOG);
    return normalizeBlogPost(data);
  }

  async createBlogPost(data: FormData): Promise<unknown> {
    this.invalidateCache("/hospital/blog/");
    return this.request("/hospital/blog/", { method: "POST", body: data });
  }

  // In ApiService class — replace updateBlogPost
async updateBlogPost(slug: string, data: FormData): Promise<unknown> {
  this.invalidateCache("/hospital/blog/");
  // FIX: PUT requires ALL fields — any omitted field is set to null/blank.
  // When editing without changing an image, the image field is absent from
  // FormData, causing Django to clear it. PATCH only updates provided fields.
  return this.request(`/hospital/blog/${slug}/`, { method: "PATCH", body: data });
}

  async deleteBlogPost(slug: string): Promise<void> {
    this.invalidateCache("/hospital/blog/");
    await this.request(`/hospital/blog/${slug}/`, { method: "DELETE" });
  }

  async getBlogStats(): Promise<unknown> {
    return this.cachedRequest("/hospital/blog/admin/stats/");
  }

  async getAllBlogPosts(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/blog/admin/all/", TTL_BLOG);
    return unwrapList(data).map(normalizeBlogPost);
  }

  // Search is never cached — results depend on the query string
  async searchBlogPosts(query: string): Promise<any[]> {
    const data = await this.request(
      `/hospital/blog/search/?q=${encodeURIComponent(query)}`
    );
    return unwrapList(data).map(normalizeBlogPost);
  }

  // FIX: The original fetched ALL blog posts (full page of 20), sorted them
  // client-side in JS, then sliced. This sent 20 full objects over the wire
  // just to display 1–6 items.
  // Now calls /hospital/blog/latest/?limit=N directly — the backend returns
  // only what's needed, pre-sorted, pre-cached in Redis.
  async getLatestBlogPosts(limit = 6): Promise<any[]> {
    const data = await this.cachedRequest(
      `/hospital/blog/latest/?limit=${limit}`,
      TTL_BLOG
    );
    return unwrapList(data).map(normalizeBlogPost);
  }
}

export const apiService = new ApiService();
export default ApiService;