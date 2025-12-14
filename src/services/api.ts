// services/api.ts - COMPLETE FIXED VERSION
import type { LoginData, RegisterData, AuthResponse } from "./auth";

const API_BASE_URL = "https://dhospitalback.onrender.com/api";
const MEDIA_BASE_URL = "https://dhospitalback.onrender.com"; // for images
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// ======================================
// 🔥 MEDIA URL FIX
// ======================================
const normalizeMediaUrl = (url: string | null) => {
  if (!url) return null;

  // Force global S3 URL
  if (url.includes(".s3.eu-north-1.amazonaws.com")) {
    return url.replace(".s3.eu-north-1.amazonaws.com", ".s3.amazonaws.com");
  }

  if (url.startsWith("http")) return url;
  return `${MEDIA_BASE_URL}${url}`;
};

// ======================================
// 🔥 BLOG POST NORMALIZER (IMAGES + FIELDS)
// ======================================
const normalizeBlogPost = (post: any) => {
  // Ensure subheadings is always an array with proper structure
  let subheadings = post.subheadings || post.sub_headings || [];

  // If subheadings is an array but items don't have ids, add them
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

    // Fix image fields
    featured_image: normalizeMediaUrl(post.featured_image),
    image_1: normalizeMediaUrl(post.image_1),
    image_2: normalizeMediaUrl(post.image_2),

    // Fix description variations
    description:
      post.description ||
      post.short_description ||
      post.excerpt ||
      post.content ||
      "",

    // Ensure subheadings is properly formatted
    subheadings: subheadings,

    // Fix TOC variations
    table_of_contents:
      post.table_of_contents ||
      post.toc ||
      post.toc_items ||
      post.contents ||
      [],
  };
};

class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private requestQueue = new Map<string, Promise<any>>();

  // ============================
  // PRIVATE CORE METHODS
  // ============================

  // Update the request method signature
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
      // Validate token format
      if (!token.startsWith("Bearer ")) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        headers["Authorization"] = token;
      }
    }

    Object.assign(headers, options.headers);

    console.log(`API Request: ${url}`, {
      headers: { ...headers, Authorization: "Bearer ***" },
    });

    const requestKey = `${endpoint}-${JSON.stringify(options)}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey) as Promise<T>;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const requestPromise = (async (): Promise<T> => {
      try {
        const config = {
          ...options,
          headers,
          signal: controller.signal,
        };

        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        console.log(`API Response: ${url} - Status: ${response.status}`);

        // Handle 401 specifically - token expired
        if (response.status === 401) {
          console.log("Token expired or invalid, clearing local storage");
          this.clearLocalStorage();
          throw new Error("Authentication expired. Please login again.");
        }

        if (!response.ok) {
          let errorMessage = `API error: ${response.status}`;
          try {
            const errorData = await response.json();
            console.error("API Error Details:", errorData);

            if (
              errorData.detail === "Given token not valid for any token type"
            ) {
              this.clearLocalStorage();
              errorMessage = "Session expired. Please login again.";
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.non_field_errors) {
              errorMessage = errorData.non_field_errors.join(", ");
            } else {
              errorMessage = JSON.stringify(errorData);
            }
          } catch {
            errorMessage =
              response.statusText || `API error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        if (
          response.status === 204 ||
          response.headers.get("content-length") === "0"
        ) {
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

  // Token refresh handler
  // Update the requestWithRetry method with proper TypeScript return type
  private async requestWithRetry<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      return (await this.request(endpoint, options)) as T;
    } catch (error: any) {
      // If token expired (401) and we haven't retried yet, try to refresh
      if (
        (error.message.includes("Authentication expired") ||
          error.message.includes("Session expired")) &&
        retryCount === 0
      ) {
        try {
          console.log("Attempting token refresh...");
          await this.refreshToken();
          // Retry the original request with new token
          console.log("Token refreshed, retrying original request");
          return await this.requestWithRetry<T>(
            endpoint,
            options,
            retryCount + 1
          );
        } catch (refreshError) {
          // Refresh failed, clear storage and throw
          console.error("Token refresh failed:", refreshError);
          this.clearLocalStorage();
          throw new Error("Session expired. Please login again.");
        }
      }
      throw error;
    }
  }

  private async cachedRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }

    const data = await this.requestWithRetry<T>(endpoint, options);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  // ============================
  // AUTH ENDPOINTS
  // ============================

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      console.log("Token refresh response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to refresh token";
        try {
          const errorData = await response.json();
          console.error("Token refresh error:", errorData);
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Ignore JSON parse error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Token refresh successful:", {
        hasAccess: !!data.access,
        hasRefresh: !!data.refresh,
      });

      // Save new tokens
      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      return data;
    } catch (error) {
      console.error("Token refresh failed completely:", error);
      this.clearLocalStorage();
      throw error;
    }
  }

  // services/api.ts - FIXED login method
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      // Use the SAME unified login endpoint as Google OAuth
      const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
          // NO google_auth_code - this will trigger regular login in UnifiedLoginView
        }),
      });

      console.log("Login Response Status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("Login Error Data:", errorData);
        } catch {
          throw new Error(`Login failed with status: ${response.status}`);
        }

        if (errorData.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error(
            "Invalid credentials. Please check your username and password."
          );
        }
      }

      const data = await response.json();
      console.log("Login Response:", data);

      // Save tokens
      localStorage.setItem("access_token", data.access);
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      return data as AuthResponse;
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  }

  // Remove or update the loginWithGoogle method to use the same endpoint
  async loginWithGoogle(code: string): Promise<AuthResponse> {
    try {
      // Use the SAME unified login endpoint
      const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          google_auth_code: code,
        }),
      });

      console.log("Google Login Response Status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("Google Login Error Data:", errorData);
        } catch {
          throw new Error(
            `Google login failed with status: ${response.status}`
          );
        }

        if (errorData.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error("Google authentication failed");
        }
      }

      const data = await response.json();
      console.log("Google Login Response:", data);

      // Save tokens
      localStorage.setItem("access_token", data.access);
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      return data as AuthResponse;
    } catch (error: any) {
      console.error("Google Login Error:", error);
      throw error;
    }
  }

  async register(registerData: RegisterData): Promise<any> {
    return this.request("/users/register/", {
      method: "POST",
      body: JSON.stringify(registerData),
    });
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      this.clearLocalStorage();
      return;
    }

    try {
      await this.request("/users/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch (error) {
      console.log("Logout API call failed:", error);
    } finally {
      this.clearLocalStorage();
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    this.cache.clear();
  }

  async getDashboard(): Promise<any> {
    return this.cachedRequest("/users/dashboard/");
  }

  // ============================
  // HOSPITAL DATA
  // ============================

  async getAppointments() {
    return this.cachedRequest("/hospital/appointments/");
  }

  async createAppointment(data: any) {
    this.invalidateCache("/hospital/appointments/");
    return this.request("/hospital/appointments/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTestRequests() {
    return this.cachedRequest("/hospital/test-requests/");
  }

  async createTestRequest(data: any) {
    this.invalidateCache("/hospital/test-requests/");
    return this.request("/hospital/test-requests/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getVitalRequests() {
    return this.cachedRequest("/hospital/vital-requests/");
  }

  async createVitalRequest(data: any) {
    this.invalidateCache("/hospital/vital-requests/");
    return this.request("/hospital/vital-requests/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createVitals(data: any) {
    return this.request("/hospital/vitals/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createLabResult(data: any) {
    return this.request("/hospital/lab-results/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createMedicalReport(data: any) {
    return this.request("/hospital/medical-reports/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStaffMembers(): Promise<any[]> {
    return this.cachedRequest("/hospital/staff/");
  }

  async getLabScientists(): Promise<any[]> {
    const staff = await this.getStaffMembers();
    return staff.filter((member) => member.role === "LAB");
  }

  async getNurses(): Promise<any[]> {
    const staff = await this.getStaffMembers();
    return staff.filter((member) => member.role === "NURSE");
  }

  async refreshAppointments() {
    this.invalidateCache("/hospital/appointments/");
    return this.getAppointments();
  }

  async refreshTestRequests() {
    this.invalidateCache("/hospital/test-requests/");
    return this.getTestRequests();
  }

  async refreshVitalRequests() {
    this.invalidateCache("/hospital/vital-requests/");
    return this.getVitalRequests();
  }

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
    return this.cachedRequest(
      `/hospital/assignments/appointment/${appointmentId}/`
    );
  }

  async getAvailableStaff(role?: string): Promise<any[]> {
    const url = role
      ? `/hospital/assignments/available-staff/?role=${role}`
      : "/hospital/assignments/available-staff/";
    return this.cachedRequest(url);
  }

  async getPatients(): Promise<any[]> {
    return this.cachedRequest("/hospital/patients/");
  }

  async getAppointmentDetails(appointmentId: number): Promise<any> {
    return this.cachedRequest(`/hospital/appointments/${appointmentId}/`);
  }

  async reassignStaff(assignmentId: number, newStaffId: string): Promise<any> {
    return this.request(`/hospital/assignments/${assignmentId}/reassign/`, {
      method: "PATCH",
      body: JSON.stringify({ staff_id: newStaffId }),
    });
  }

  // ============================
  // BLOG ENDPOINTS (FIXED!)
  // ============================

  async getBlogPosts(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/blog/");
    return data.map(normalizeBlogPost);
  }

  async getBlogPost(slug: string): Promise<any> {
    const data = await this.cachedRequest(`/hospital/blog/${slug}/`);
    return normalizeBlogPost(data);
  }

  async createBlogPost(data: FormData): Promise<any> {
    this.invalidateCache("/hospital/blog/");
    return this.request("/hospital/blog/", {
      method: "POST",
      body: data,
    });
  }

  async updateBlogPost(slug: string, data: FormData): Promise<any> {
    this.invalidateCache("/hospital/blog/");
    return this.request(`/hospital/blog/${slug}/`, {
      method: "PUT",
      body: data,
    });
  }

  async deleteBlogPost(slug: string): Promise<void> {
    this.invalidateCache("/hospital/blog/");
    await this.request(`/hospital/blog/${slug}/`, {
      method: "DELETE",
    });
  }

  async getBlogStats(): Promise<any> {
    return this.cachedRequest("/hospital/blog/admin/stats/");
  }

  async getAllBlogPosts(): Promise<any[]> {
    const data = await this.cachedRequest("/hospital/blog/admin/all/");
    return data.map(normalizeBlogPost);
  }

  async searchBlogPosts(query: string): Promise<any[]> {
    const data = await this.cachedRequest(
      `/hospital/blog/search/?q=${encodeURIComponent(query)}`
    );
    return data.map(normalizeBlogPost);
  }

  async getLatestBlogPosts(limit: number = 6): Promise<any[]> {
    try {
      console.log(`📞 Fetching latest ${limit} blog posts...`);

      // FIRST TRY: Use the main blog endpoint and get the latest
      const allPosts = await this.getBlogPosts();
      console.log("📦 All blog posts:", allPosts);

      if (!allPosts || allPosts.length === 0) {
        return [];
      }

      // Sort by created_at date (newest first) and take the limit
      const sortedPosts = allPosts
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.published_date || 0);
          const dateB = new Date(b.created_at || b.published_date || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);

      console.log(`✅ Latest ${limit} posts:`, sortedPosts);
      return sortedPosts;
    } catch (error) {
      console.error("❌ Failed to fetch latest blog posts:", error);

      // Fallback: Try the specific endpoint
      try {
        const data = await this.request(
          `/hospital/blog/latest/?limit=${limit}`
        );
        if (Array.isArray(data)) {
          return data.map(normalizeBlogPost);
        }
        return [];
      } catch {
        return [];
      }
    }
  }

  async registerWithImage(formData: FormData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/register/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || JSON.stringify(errorData));
    }

    return response.json();
  }

  // ============================
  // CACHE INVALIDATION
  // ============================

  private invalidateCache(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiService = new ApiService();
export default ApiService;
