// services/api.ts - FIXED with proper TypeScript types
import type { LoginData, RegisterData, AuthResponse } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL ??
  "https://hospitalback-clean-0fre.onrender.com/api";

const TTL_BLOG = 5 * 60 * 1000;
const TTL_PERSONAL = 2 * 60 * 1000;
const TTL_LIST = 3 * 60 * 1000;

// Proper type definitions
interface ApiErrorResponse {
  detail?: string;
  error?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
}

interface StaffMember {
  id: number;
  role: string;
  [key: string]: unknown;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// Type guard for checking if value is an object
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Type guard for checking if value has results array
function hasResults(value: unknown): value is { results: unknown[] } {
  return isObject(value) && Array.isArray(value.results);
}

const unwrapList = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (hasResults(data)) return data.results;
  return [];
};

interface BlogSubheading {
  id?: number;
  title?: string;
  level?: number;
  description?: string;
  full_content?: string;
}

interface BlogPost {
  featured_image_url?: string | null;
  featured_image?: string | null;
  image_1_url?: string | null;
  image_1?: string | null;
  image_2_url?: string | null;
  image_2?: string | null;
  description?: string;
  short_description?: string;
  excerpt?: string;
  content?: string;
  table_of_contents?: unknown[];
  toc?: unknown[];
  toc_items?: unknown[];
  contents?: unknown[];
  subheadings?: BlogSubheading[] | null;
  sub_headings?: BlogSubheading[] | null;
  [key: string]: unknown;
}

export interface NormalizedBlogPost
  extends Omit<BlogPost, "subheadings" | "sub_headings"> {
  featured_image: string | null;
  image_1: string | null;
  image_2: string | null;
  description: string;
  subheadings: NormalizedSubheading[];
  table_of_contents: unknown[];
}

export interface NormalizedSubheading {
  id: number;
  title: string;
  level: number;
  description: string;
  full_content: string;
}

const S3_BASE_URL = "https://etha-hospital-clone-app.s3.eu-north-1.amazonaws.com/media/";

export const normalizeMediaUrl = (url: string | null | undefined): string | null => {
  if (!url || url.trim() === "") return null;

  // Already a full URL — return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Relative S3 path (e.g. "profile/username_profile.jpg") — prepend bucket URL
  // Strip leading "media/" if the backend already included it to avoid doubling
  const cleanPath = url.startsWith("media/") ? url.slice(6) : url;
  return `${S3_BASE_URL}${cleanPath}`;
};

// export const normalizeMediaUrl = (url: string | null | undefined): string | null => {
//   if (!url || url.trim() === "") return null;
//   return url;
// };



const normalizeSubheading = (
  subheading: BlogSubheading,
  index: number
): NormalizedSubheading => ({
  id: subheading.id ?? index + 1,
  title: subheading.title ?? `Section ${index + 1}`,
  level: subheading.level ?? 2,
  description: subheading.description ?? "",
  full_content: subheading.full_content ?? subheading.description ?? "",
});

const normalizeBlogPost = (post: BlogPost): NormalizedBlogPost => {
  const rawSubs = post.subheadings ?? post.sub_headings;
  const subheadings = Array.isArray(rawSubs)
    ? rawSubs.map((s: BlogSubheading, i: number) => normalizeSubheading(s, i))
    : [];

  return {
    ...post,
    featured_image: normalizeMediaUrl(post.featured_image_url ?? post.featured_image),
    image_1: normalizeMediaUrl(post.image_1_url ?? post.image_1),
    image_2: normalizeMediaUrl(post.image_2_url ?? post.image_2),
    description:
      post.description ?? post.short_description ?? post.excerpt ?? post.content ?? "",
    subheadings,
    table_of_contents:
      post.table_of_contents ?? post.toc ?? post.toc_items ?? post.contents ?? [],
  };
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp: number };
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
};

// Custom error class for API errors
class ApiError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

class ApiService {
  private cache = new Map<string, CacheEntry>();
  private requestQueue = new Map<string, Promise<unknown>>();

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    Object.assign(headers, options.headers);

    const method = (options.method ?? "GET").toUpperCase();
    const requestKey = `${method}:${endpoint}`;

    if (method === "GET" && this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey) as Promise<T>;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

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
          throw new ApiError("Authentication expired. Please login again.", 401);
        }

        if (!response.ok) {
          let msg = `API error: ${response.status}`;
          try {
            const err = (await response.json()) as ApiErrorResponse;
            if (err.detail === "Given token not valid for any token type") {
              this.clearLocalStorage();
              msg = "Session expired. Please login again.";
            } else if (err.detail) {
              msg = err.detail;
            } else if (err.error) {
              msg = err.error;
            } else if (err.non_field_errors) {
              msg = err.non_field_errors.join(", ");
            } else {
              msg = JSON.stringify(err);
            }
          } catch {
            // JSON parsing failed, use default message
          }
          throw new ApiError(msg, response.status);
        }

        if (response.status === 204 ||
          response.headers.get("content-length") === "0") {
          return null as T;
        }

        return response.json() as Promise<T>;
      } finally {
        clearTimeout(timeoutId);
        this.requestQueue.delete(requestKey);
      }
    })();

    if (method === "GET") {
      this.requestQueue.set(requestKey, promise);
    }
    return promise;
  }

  private async requestWithRetry<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    retried = false
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, options);
    } catch (err: unknown) {
      if (
        !retried &&
        err instanceof ApiError &&
        (err.message.includes("Authentication expired") ||
          err.message.includes("Session expired"))
      ) {
        try {
          await this.refreshToken();
          return await this.requestWithRetry<T>(endpoint, options, true);
        } catch {
          this.clearLocalStorage();
          throw new ApiError("Session expired. Please login again.");
        }
      }
      throw err;
    }
  }

  private async cachedRequest<T = unknown>(
    endpoint: string,
    ttl = TTL_LIST
  ): Promise<T> {
    const cached = this.cache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }

    const data = await this.requestWithRetry<T>(endpoint);
    this.cache.set(endpoint, { data, timestamp: Date.now() });
    return data;
  }

  invalidateCache(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    this.cache.clear();
  }

  async refreshToken(): Promise<TokenResponse> {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new ApiError("No refresh token available");

    const res = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      this.clearLocalStorage();
      throw new ApiError("Failed to refresh token");
    }

    const data = (await res.json()) as TokenResponse;
    if (data.access) localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data;
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loginData.username,
        password: loginData.password,
      }),
    });

    if (!res.ok) {
      let msg = `Login failed (${res.status})`;
      try {
        const errorData = (await res.json()) as ApiErrorResponse;
        msg = errorData.detail ?? msg;
      } catch {
        // Use default message
      }
      throw new ApiError(msg, res.status);
    }

    const data = (await res.json()) as AuthResponse;
    localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data;
  }

  async loginWithGoogle(code: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ google_auth_code: code }),
    });

    if (!res.ok) {
      let msg = "Google authentication failed";
      try {
        const errorData = (await res.json()) as ApiErrorResponse;
        msg = errorData.detail ?? msg;
      } catch {
        // Use default message
      }
      throw new ApiError(msg, res.status);
    }

    const data = (await res.json()) as AuthResponse;
    localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data;
  }

  async register(registerData: RegisterData): Promise<unknown> {
    return this.request("/users/register/", {
      method: "POST",
      body: JSON.stringify(registerData),
    });
  }

  async registerWithImage(formData: FormData): Promise<unknown> {
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/users/register/`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      // Guard against HTML error pages (Django 500s return text/html)
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const err = (await res.json()) as ApiErrorResponse;
        throw new ApiError(
          err.detail ?? err.error ?? JSON.stringify(err),
          res.status
        );
      }
      // Non-JSON response (HTML 500 page, etc.)
      throw new ApiError(
        `Registration failed with status ${res.status}. Please try again.`,
        res.status
      );
    }

    return res.json();
  }

  async logout(): Promise<void> {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      try {
        await this.request("/users/logout/", {
          method: "POST",
          body: JSON.stringify({ refresh }),
        });
      } catch {
        // Ignore logout errors
      }
    }
    this.clearLocalStorage();
  }

  async getDashboard(): Promise<unknown> {
    return this.cachedRequest("/users/dashboard/", TTL_PERSONAL);
  }

  async getAppointments(): Promise<unknown[]> {
    return unwrapList(await this.cachedRequest("/hospital/appointments/"));
  }

  async createAppointment(data: unknown): Promise<unknown> {
    this.invalidateCache("/hospital/appointments/");
    return this.request("/hospital/appointments/create/", {
      method: "POST",
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
    });
  }

  async refreshVitalRequests(): Promise<unknown[]> {
    this.invalidateCache("/hospital/vital-requests/");
    return this.getVitalRequests();
  }

  async createVitals(data: unknown): Promise<unknown> {
    return this.request("/hospital/vitals/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createLabResult(data: unknown): Promise<unknown> {
    return this.request("/hospital/lab-results/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createMedicalReport(data: unknown): Promise<unknown> {
    return this.request("/hospital/medical-reports/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStaffMembers(): Promise<StaffMember[]> {
    return unwrapList(await this.cachedRequest("/hospital/staff/")) as StaffMember[];
  }

  async getLabScientists(): Promise<StaffMember[]> {
    return (await this.getStaffMembers()).filter(
      (m: StaffMember) => m.role === "LAB"
    );
  }

  async getNurses(): Promise<StaffMember[]> {
    return (await this.getStaffMembers()).filter(
      (m: StaffMember) => m.role === "NURSE"
    );
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
      body: JSON.stringify(data),
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
      body: JSON.stringify({ staff_id: newStaffId }),
    });
  }

  async getBlogPosts(): Promise<NormalizedBlogPost[]> {
    const data = await this.cachedRequest("/hospital/blog/", TTL_BLOG);
    return unwrapList(data).map((item) => normalizeBlogPost(item as BlogPost));
  }

  async getBlogPost(slug: string): Promise<NormalizedBlogPost> {
    const data = await this.cachedRequest(`/hospital/blog/${slug}/`, TTL_BLOG);
    return normalizeBlogPost(data as BlogPost);
  }

  async createBlogPost(data: FormData): Promise<unknown> {
    this.invalidateCache("/hospital/blog/");
    return this.request("/hospital/blog/", { method: "POST", body: data });
  }

  async updateBlogPost(slug: string, data: FormData): Promise<unknown> {
    this.invalidateCache("/hospital/blog/");
    return this.request(`/hospital/blog/${slug}/`, { method: "PATCH", body: data });
  }

  async deleteBlogPost(slug: string): Promise<void> {
    this.invalidateCache("/hospital/blog/");
    await this.request(`/hospital/blog/${slug}/`, { method: "DELETE" });
  }

  async getBlogStats(): Promise<unknown> {
    return this.cachedRequest("/hospital/blog/admin/stats/");
  }

  async getAllBlogPosts(): Promise<NormalizedBlogPost[]> {
    const data = await this.cachedRequest("/hospital/blog/admin/all/", TTL_BLOG);
    return unwrapList(data).map((item) => normalizeBlogPost(item as BlogPost));
  }

  async searchBlogPosts(query: string): Promise<NormalizedBlogPost[]> {
    const data = await this.request(
      `/hospital/blog/search/?q=${encodeURIComponent(query)}`
    );
    return unwrapList(data).map((item) => normalizeBlogPost(item as BlogPost));
  }

  async getLatestBlogPosts(limit = 6): Promise<NormalizedBlogPost[]> {
    const data = await this.cachedRequest(
      `/hospital/blog/latest/?limit=${limit}`,
      TTL_BLOG
    );
    return unwrapList(data).map((item) => normalizeBlogPost(item as BlogPost));
  }
}

export const apiService = new ApiService();
export default ApiService;