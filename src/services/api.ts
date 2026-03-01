// services/api.ts
import type { LoginData, RegisterData, AuthResponse } from "./auth";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// const API_BASE_URL = "https://dhospitalback.onrender.com/api";

// ─────────────────────────────────────────────────────────────────────────────
// 🔑  PAGINATION UNWRAPPER
//
// Django REST Framework with LimitOffsetPagination (settings.py) wraps every
// list endpoint response as:
//   { "count": 12, "next": null, "previous": null, "results": [...] }
//
// unwrapList() extracts the plain array so callers never crash on .filter()
// or .map(). It is safe whether the endpoint is paginated or not.
// ─────────────────────────────────────────────────────────────────────────────
const unwrapList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  console.warn("⚠️ unwrapList: unexpected shape", data);
  return []; 
};

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA URL NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────
const normalizeMediaUrl = (path: string | null): string | null => {
  if (!path || path.trim() === "") return null;

  if (path.startsWith("http")) {
    if (path.includes("s3.amazonaws.com") && path.startsWith("http://")) {
      return path.replace("http://", "https://");
    }
    return path;
  }

  let cleanPath = path.startsWith("/") ? path.substring(1) : path;
  if (!cleanPath.includes("/") && !cleanPath.startsWith("blog_images/")) {
    cleanPath = `blog_images/${cleanPath}`;
  }
  if (!cleanPath.startsWith("media/")) {
    cleanPath = `media/${cleanPath}`;
  }
  return `https://etha-hospital.s3.eu-north-1.amazonaws.com/${cleanPath}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOG POST NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────
const normalizeBlogPost = (post: any) => {
  let subheadings = post.subheadings || post.sub_headings || [];
  if (Array.isArray(subheadings)) {
    subheadings = subheadings.map((s: any, index: number) => ({
      id: s.id || index + 1,
      title: s.title || `Section ${index + 1}`,
      level: s.level || 2,
      description: s.description || "",
      full_content: s.full_content || s.description || "",
    }));
  } else {
    subheadings = [];
  }

  return {
    id: post.id,
    ...post,
    featured_image: post.featured_image_url || normalizeMediaUrl(post.featured_image),
    image_1: post.image_1_url || normalizeMediaUrl(post.image_1),
    image_2: post.image_2_url || normalizeMediaUrl(post.image_2),
    description:
      post.description || post.short_description || post.excerpt || post.content || "",
    subheadings,
    table_of_contents:
      post.table_of_contents || post.toc || post.toc_items || post.contents || [],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// API SERVICE
// ─────────────────────────────────────────────────────────────────────────────
class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private requestQueue = new Map<string, Promise<any>>();

  // ── Core fetch ────────────────────────────────────────────────────────────
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {};

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }
    Object.assign(headers, options.headers);

    console.log(`API Request: ${url}`, { headers: { ...headers, Authorization: "Bearer ***" } });

    const requestKey = `${endpoint}-${JSON.stringify(options)}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey) as Promise<T>;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const requestPromise = (async (): Promise<T> => {
      try {
        const response = await fetch(url, { ...options, headers, signal: controller.signal });
        clearTimeout(timeoutId);
        console.log(`API Response: ${url} - Status: ${response.status}`);

        if (response.status === 401) {
          this.clearLocalStorage();
          throw new Error("Authentication expired. Please login again.");
        }

        if (!response.ok) {
          let errorMessage = `API error: ${response.status}`;
          try {
            const errorData = await response.json();
            console.error("API Error Details:", errorData);
            if (errorData.detail === "Given token not valid for any token type") {
              this.clearLocalStorage();
              errorMessage = "Session expired. Please login again.";
            } else if (errorData.detail)            errorMessage = errorData.detail;
            else if (errorData.error)               errorMessage = errorData.error;
            else if (errorData.non_field_errors)    errorMessage = errorData.non_field_errors.join(", ");
            else                                    errorMessage = JSON.stringify(errorData);
          } catch {
            errorMessage = response.statusText || `API error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        if (response.status === 204 || response.headers.get("content-length") === "0") {
          return null as T;
        }
        return response.json() as Promise<T>;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("API Request Failed:", error);
        throw error;
      } finally {
        this.requestQueue.delete(requestKey);
      }
    })();

    this.requestQueue.set(requestKey, requestPromise);
    return requestPromise;
  }

  // ── Retry with token refresh ──────────────────────────────────────────────
  private async requestWithRetry<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      return (await this.request(endpoint, options)) as T;
    } catch (error: any) {
      if (
        (error.message.includes("Authentication expired") ||
          error.message.includes("Session expired")) &&
        retryCount === 0
      ) {
        try {
          await this.refreshToken();
          return await this.requestWithRetry<T>(endpoint, options, retryCount + 1);
        } catch {
          this.clearLocalStorage();
          throw new Error("Session expired. Please login again.");
        }
      }
      throw error;
    }
  }

  // ── Cached request ────────────────────────────────────────────────────────
  private async cachedRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data as T;

    const data = await this.requestWithRetry<T>(endpoint, options);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  private invalidateCache(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) this.cache.delete(key);
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    this.cache.clear();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════════════════════════════════════

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      let msg = "Failed to refresh token";
      try { const e = await response.json(); if (e.detail) msg = e.detail; } catch { /* ignore */ }
      this.clearLocalStorage();
      throw new Error(msg);
    }

    const data = await response.json();
    if (data.access)  localStorage.setItem("access_token",  data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data;
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginData.username, password: loginData.password }),
    });

    console.log("Login Response Status:", response.status);

    if (!response.ok) {
      let errorData: any;
      try { errorData = await response.json(); console.error("Login Error Data:", errorData); }
      catch { throw new Error(`Login failed with status: ${response.status}`); }
      throw new Error(
        errorData.detail || "Invalid credentials. Please check your username and password."
      );
    }

    const data = await response.json();
    console.log("Login Response:", data);
    localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data as AuthResponse;
  }

  async loginWithGoogle(code: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ google_auth_code: code }),
    });
    if (!response.ok) {
      let errorData: any;
      try { errorData = await response.json(); } catch { /* ignore */ }
      throw new Error(errorData?.detail || "Google authentication failed");
    }
    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data as AuthResponse;
  }

  async register(registerData: RegisterData): Promise<any> {
    return this.request("/users/register/", { method: "POST", body: JSON.stringify(registerData) });
  }

  async registerWithImage(formData: FormData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/register/`, { method: "POST", body: formData });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || JSON.stringify(errorData));
    }
    return response.json();
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) { this.clearLocalStorage(); return; }
    try {
      await this.request("/users/logout/", { method: "POST", body: JSON.stringify({ refresh: refreshToken }) });
    } catch (error) {
      console.log("Logout API call failed:", error);
    } finally {
      this.clearLocalStorage();
    }
  }

  async getDashboard(): Promise<any> {
    return this.cachedRequest("/users/dashboard/");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HOSPITAL  —  every list endpoint calls unwrapList()
  // ══════════════════════════════════════════════════════════════════════════

  // Appointments ─────────────────────────────────────────────────────────────
  async getAppointments(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/appointments/");
    return unwrapList(data); // FIX: was returning raw paginated object
  }

  async createAppointment(data: any): Promise<any> {
    this.invalidateCache("/hospital/appointments/");
    return this.request("/hospital/appointments/create/", { method: "POST", body: JSON.stringify(data) });
  }

  async getAppointmentDetails(appointmentId: number): Promise<any> {
    return this.cachedRequest(`/hospital/appointments/${appointmentId}/`);
  }

  async refreshAppointments(): Promise<any[]> {
    this.invalidateCache("/hospital/appointments/");
    return this.getAppointments();
  }

  // Test requests ────────────────────────────────────────────────────────────
  async getTestRequests(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/test-requests/");
    return unwrapList(data); // FIX
  }

  async createTestRequest(data: any): Promise<any> {
    this.invalidateCache("/hospital/test-requests/");
    return this.request("/hospital/test-requests/create/", { method: "POST", body: JSON.stringify(data) });
  }

  async refreshTestRequests(): Promise<any[]> {
    this.invalidateCache("/hospital/test-requests/");
    return this.getTestRequests();
  }

  // Vital requests ───────────────────────────────────────────────────────────
  async getVitalRequests(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/vital-requests/");
    return unwrapList(data); // FIX
  }

  async createVitalRequest(data: any): Promise<any> {
    this.invalidateCache("/hospital/vital-requests/");
    return this.request("/hospital/vital-requests/create/", { method: "POST", body: JSON.stringify(data) });
  }

  async refreshVitalRequests(): Promise<any[]> {
    this.invalidateCache("/hospital/vital-requests/");
    return this.getVitalRequests();
  }

  // Single-object POSTs — no list unwrap needed ──────────────────────────────
  async createVitals(data: any): Promise<any> {
    return this.request("/hospital/vitals/create/", { method: "POST", body: JSON.stringify(data) });
  }

  async createLabResult(data: any): Promise<any> {
    return this.request("/hospital/lab-results/create/", { method: "POST", body: JSON.stringify(data) });
  }

  async createMedicalReport(data: any): Promise<any> {
    return this.request("/hospital/medical-reports/create/", { method: "POST", body: JSON.stringify(data) });
  }

  // Staff ────────────────────────────────────────────────────────────────────
  async getStaffMembers(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/staff/");
    return unwrapList(data); // FIX: getLabScientists/getNurses call .filter() on this
  }

  async getLabScientists(): Promise<any[]> {
    return (await this.getStaffMembers()).filter((m) => m.role === "LAB");
  }

  async getNurses(): Promise<any[]> {
    return (await this.getStaffMembers()).filter((m) => m.role === "NURSE");
  }

  // Patients ─────────────────────────────────────────────────────────────────
  async getPatients(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/patients/");
    return unwrapList(data); // FIX
  }

  // Assignments ──────────────────────────────────────────────────────────────
  async assignStaff(data: {
    appointment_id: number;
    staff_id: string;
    role: "DOCTOR" | "NURSE" | "LAB";
    notes?: string;
  }): Promise<any> {
    return this.request("/hospital/assignments/assign-staff/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAppointmentAssignments(appointmentId: number): Promise<any[]> {
    const data = await this.cachedRequest(`/hospital/assignments/appointment/${appointmentId}/`);
    return unwrapList(data); // FIX
  }

  async getAvailableStaff(role?: string): Promise<any[]> {
    const url = role
      ? `/hospital/assignments/available-staff/?role=${role}`
      : "/hospital/assignments/available-staff/";
    const data = await this.cachedRequest(url);
    return unwrapList(data); // FIX
  }

  async reassignStaff(assignmentId: number, newStaffId: string): Promise<any> {
    return this.request(`/hospital/assignments/${assignmentId}/reassign/`, {
      method: "PATCH",
      body: JSON.stringify({ staff_id: newStaffId }),
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BLOG  —  every list endpoint calls unwrapList() before .map()
  // ══════════════════════════════════════════════════════════════════════════

  async getBlogPosts(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/blog/");
    return unwrapList(data).map(normalizeBlogPost); // FIX: was data.map() → "not a function"
  }

  async getBlogPost(slug: string): Promise<any> {
    const data = await this.cachedRequest(`/hospital/blog/${slug}/`);
    return normalizeBlogPost(data); // single object — no unwrap needed
  }

  async createBlogPost(data: FormData): Promise<any> {
    this.invalidateCache("/hospital/blog/");
    return this.request("/hospital/blog/", { method: "POST", body: data });
  }

  async updateBlogPost(slug: string, data: FormData): Promise<any> {
    this.invalidateCache("/hospital/blog/");
    return this.request(`/hospital/blog/${slug}/`, { method: "PUT", body: data });
  }

  async deleteBlogPost(slug: string): Promise<void> {
    this.invalidateCache("/hospital/blog/");
    await this.request(`/hospital/blog/${slug}/`, { method: "DELETE" });
  }

  async getBlogStats(): Promise<any> {
    return this.cachedRequest("/hospital/blog/admin/stats/");
  }

  async getAllBlogPosts(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/blog/admin/all/");
    return unwrapList(data).map(normalizeBlogPost); // FIX
  }

  async searchBlogPosts(query: string): Promise<any[]> {
    const data = await this.cachedRequest(
      `/hospital/blog/search/?q=${encodeURIComponent(query)}`
    );
    return unwrapList(data).map(normalizeBlogPost); // FIX
  }

  async getLatestBlogPosts(limit: number = 6): Promise<any[]> {
    try {
      // getBlogPosts() already returns a plain, normalized array
      const allPosts = await this.getBlogPosts();
      if (!allPosts.length) return [];

      return allPosts
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.published_date || 0).getTime();
          const dateB = new Date(b.created_at || b.published_date || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, limit);
    } catch (error) {
      console.error("❌ Failed to fetch latest blog posts:", error);
      try {
        const data = await this.request(`/hospital/blog/latest/?limit=${limit}`);
        return unwrapList(data).map(normalizeBlogPost);
      } catch {
        return [];
      }
    }
  }
}

export const apiService = new ApiService();
export default ApiService;