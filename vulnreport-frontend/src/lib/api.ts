import { ApiResponse, LoginCredentials, SignupCredentials, ProfileData, User, VulnerabilityReport, ReportFormData, Analytics } from '@/types'
import URLEncryption from './urlEncryption'

// Use the live backend URL - fallback only for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vel-0ozj.onrender.com/api'

// Log the API URL being used (for debugging)
if (typeof window !== 'undefined') {
  console.log('API Base URL:', API_BASE_URL)
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken()
    
    // Use encrypted URL for security
    const encryptedUrl = URLEncryption.generateEncryptedUrl(endpoint)
    const url = `${API_BASE_URL}${endpoint}` // Fallback to direct URL for now
    
    // Log encrypted URL in development
    URLEncryption.logEncryptedUrl(endpoint)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      console.error('API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async signup(credentials: SignupCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async completeProfile(profileData: ProfileData): Promise<ApiResponse<User>> {
    return this.request('/auth/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  }

  async updateProfile(profileData: ProfileData): Promise<ApiResponse<User>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me')
  }

  async submitReport(reportData: ReportFormData): Promise<ApiResponse<VulnerabilityReport>> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  }

  async getUserReports(): Promise<ApiResponse<VulnerabilityReport[]>> {
    return this.request('/reports/user')
  }

  async getAllReports(): Promise<ApiResponse<VulnerabilityReport[]>> {
    return this.request('/reports')
  }

  async updateReportStatus(reportId: string, status: string, comment?: string): Promise<ApiResponse<VulnerabilityReport>> {
    return this.request(`/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comment }),
    })
  }

  async deleteReport(reportId: string): Promise<ApiResponse<void>> {
    return this.request(`/reports/${reportId}`, {
      method: 'DELETE',
    })
  }

  async getReport(reportId: string): Promise<ApiResponse<VulnerabilityReport>> {
    return this.request(`/reports/${reportId}`)
  }

  async getAnalytics(): Promise<ApiResponse<Analytics>> {
    return this.request('/analytics')
  }
}

export const apiClient = new ApiClient()
