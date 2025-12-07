// services/api.ts
import type { LoginData, RegisterData, AuthResponse } from "./auth";

const API_BASE_URL = "http://localhost:8000/api";
const MEDIA_BASE_URL = "http://localhost:8000"; // for images
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// ======================================
// 🔥 MEDIA URL FIX
// ======================================
const normalizeMediaUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${MEDIA_BASE_URL}${url}`;
};

// ======================================
// 🔥 BLOG POST NORMALIZER (IMAGES + FIELDS)
// ======================================
const normalizeBlogPost = (post: any) => ({
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

  // Fix subheadings field variations
  subheadings:
    post.subheadings ||
    post.sub_headings ||
    post.sections ||
    post.subSections ||
    [],

  // Fix TOC variations
  table_of_contents:
    post.table_of_contents ||
    post.toc ||
    post.toc_items ||
    post.contents ||
    [],
});

class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private requestQueue = new Map<string, Promise<any>>();

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("access_token");

    const headers: HeadersInit = {};

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    Object.assign(headers, options.headers);

    const requestKey = `${endpoint}-${JSON.stringify(options)}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const requestPromise = (async () => {
      try {
        const config = {
          ...options,
          headers,
          signal: controller.signal,
        };

        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `API error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.detail || errorData.error || JSON.stringify(errorData);
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
          return null;
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      } finally {
        this.requestQueue.delete(requestKey);
      }
    })();

    this.requestQueue.set(requestKey, requestPromise);
    return requestPromise;
  }

  private async cachedRequest(endpoint: string, options: RequestInit = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const data = await this.request(endpoint, options);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  // ============================
  // AUTH ENDPOINTS
  // ============================

  async login(loginData: LoginData): Promise<AuthResponse> {
    return this.request("/users/login/", {
      method: "POST",
      body: JSON.stringify(loginData),
    });
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
    role: 'DOCTOR' | 'NURSE' | 'LAB';
    notes?: string;
  }): Promise<any> {
    return this.request("/hospital/assignments/assign-staff/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAppointmentAssignments(appointmentId: number): Promise<any[]> {
    return this.cachedRequest(`/hospital/assignments/appointment/${appointmentId}/`);
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
    const data = await this.cachedRequest(
      `/hospital/blog/latest/?limit=${limit}`
    );
    return data.map(normalizeBlogPost);
  }
  // services/api.ts - Add this method
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
