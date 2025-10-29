// services/api.ts
import type { LoginData, RegisterData, AuthResponse } from "./auth";

const API_BASE_URL = "http://localhost:8000/api";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private requestQueue = new Map<string, Promise<any>>();

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("access_token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    } as HeadersInit;

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    // Request deduplication - prevent duplicate simultaneous requests
    const requestKey = `${endpoint}-${JSON.stringify(options)}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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

  // Cache frequently used requests
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
    this.cache.clear(); // Clear API cache on logout
  }

  async getDashboard(): Promise<any> {
    // Cache dashboard data since it doesn't change frequently
    return this.cachedRequest("/users/dashboard/");
  }

  // Hospital endpoints with caching where appropriate
  async getAppointments() {
    return this.cachedRequest("/hospital/appointments/");
  }

  // services/api.ts - Update createAppointment method
  async createAppointment(data: any) {
    try {
      // Invalidate appointments cache when creating new appointment
      this.invalidateCache("/hospital/appointments/");

      const response = await this.request("/hospital/appointments/create/", {
        method: "POST",
        body: JSON.stringify(data),
      });

      console.log("Appointment created successfully:", response);
      return response;
    } catch (error) {
      console.error("Appointment creation failed:", error);
      throw error;
    }
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

  // services/api.ts - Add methods to get staff members
  async getStaffMembers(): Promise<any[]> {
    // This endpoint should be created in your backend to return staff members
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
//  Add methods to refresh appointments
async refreshAppointments(): Promise<any> {
  // Clear cache and fetch fresh data
  this.invalidateCache('/hospital/appointments/');
  return this.getAppointments();
}

async refreshTestRequests(): Promise<any> {
  this.invalidateCache('/hospital/test-requests/');
  return this.getTestRequests();
}

async refreshVitalRequests(): Promise<any> {
  this.invalidateCache('/hospital/vital-requests/');
  return this.getVitalRequests();
}

  // Cache invalidation helper
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
