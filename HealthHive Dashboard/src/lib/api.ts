/**
 * API Client for HealthHive Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry request
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(url, { ...options, headers });
      } else {
        // Logout user
        this.logout();
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response;
  }

  async login(username: string, password: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  async getCurrentUser() {
    const response = await this.request('/api/auth/me');
    return response.json();
  }

  // Analytics endpoints
  async getOverview() {
    const response = await this.request('/api/analytics/overview');
    return response.json();
  }

  async getHtnTrends() {
    const response = await this.request('/api/analytics/htn-trends');
    return response.json();
  }

  async getDmTrends() {
    const response = await this.request('/api/analytics/dm-trends');
    return response.json();
  }

  async getBarangayStats() {
    const response = await this.request('/api/analytics/barangay-summary');
    return response.json();
  }

  async getCohortRetention() {
    const response = await this.request('/api/analytics/cohort-retention');
    return response.json();
  }

  async getMedicationAdherence() {
    const response = await this.request('/api/analytics/medication-adherence');
    return response.json();
  }

  async getDistributions() {
    const response = await this.request('/api/analytics/distributions');
    return response.json();
  }

  async getCohortSeries() {
    const response = await this.request('/api/analytics/cohort-series');
    return response.json();
  }

  async getRiskDistribution() {
    const response = await this.request('/api/analytics/risk-distribution');
    return response.json();
  }

  // Patient endpoints
  async getPatients(params?: { barangay?: string; risk_level?: string; skip?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.barangay) queryParams.append('barangay', params.barangay);
    if (params?.risk_level) queryParams.append('risk_level', params.risk_level);
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await this.request(`/api/patients?${queryParams}`);
    return response.json();
  }

  async getPatient(patientId: string) {
    const response = await this.request(`/api/patients/${patientId}`);
    return response.json();
  }

  async registerPatient(data: any) {
    const response = await this.request('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updatePatient(patientId: string, data: any) {
    const response = await this.request(`/api/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Visit endpoints
  async getPatientVisits(patientId: string) {
    const response = await this.request(`/api/patients/${patientId}/visits`);
    return response.json();
  }

  async recordVisit(data: any) {
    const response = await this.request('/api/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Admin endpoints
  async getAdminUsers() {
    const response = await this.request('/api/admin/users');
    return response.json();
  }

  async getAdminSummary() {
    const response = await this.request('/api/admin/summary');
    return response.json();
  }

  async getAuditLogs() {
    const response = await this.request('/api/admin/audit-logs');
    return response.json();
  }

  // Resources endpoints
  async getResourcesSummary() {
    const response = await this.request('/api/resources/summary');
    return response.json();
  }

  // Field ops endpoints
  async getFieldOpsSummary() {
    const response = await this.request('/api/field-ops/summary');
    return response.json();
  }
}

export const api = new ApiClient();
