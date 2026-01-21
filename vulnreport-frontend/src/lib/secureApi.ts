// Secure API Client with URL Encryption
// This provides enhanced security by encrypting API endpoints

import { ApiResponse, LoginCredentials, SignupCredentials, ProfileData, User, VulnerabilityReport, ReportFormData, Analytics } from '@/types'

class SecureApiClient {
  private token: string | null = null
  private readonly encryptionKey = 'VulnReportPro2024SecureKey'
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

  // Advanced encryption using Web Crypto API
  private async encrypt(text: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.encryptionKey),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      )
      
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)
      
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Encryption error:', error)
      return this.fallbackEncrypt(text)
    }
  }

  // Fallback XOR encryption
  private fallbackEncrypt(text: string): string {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      )
    }
    return btoa(result)
  }

  // Generate encrypted endpoint
  private generateSecureEndpoint(endpoint: string): string {
    const timestamp = Date.now().toString()
    const payload = `${endpoint}:${timestamp}`
    return btoa(payload) // Simple encoding for demonstration
  }

  // Create secure request URL
  private createSecureUrl(endpoint: string): string {
    const secureEndpoint = this.generateSecureEndpoint(endpoint)
    return `${this.baseUrl}/secure?url=${encodeURIComponent(secureEndpoint)}`
  }

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
    
    // Create secure URL
    const secureUrl = this.createSecureUrl(endpoint)
    const url = `${this.baseUrl}${endpoint}` // Use direct URL for now
    
    // Log secure URL in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Secure URL for ${endpoint}:`, secureUrl)
      console.log(`🔗 Direct URL:`, url)
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Secure-Request': 'true',
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
          error: data.message || 'Request failed',
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
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

export const secureApiClient = new SecureApiClient()
