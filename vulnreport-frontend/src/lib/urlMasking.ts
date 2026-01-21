// URL Masking Utility
// This utility masks direct URLs and shows encrypted alternatives

class URLMasking {
  private static readonly ENCRYPTION_KEY = 'VulnReportPro2024SecureKey'
  private static readonly ROUTE_MAP = new Map<string, string>()

  // Initialize route mappings
  static initializeRoutes() {
    this.ROUTE_MAP.set('/auth/login', this.encryptRoute('/auth/login'))
    this.ROUTE_MAP.set('/auth/signup', this.encryptRoute('/auth/signup'))
    this.ROUTE_MAP.set('/dashboard', this.encryptRoute('/dashboard'))
    this.ROUTE_MAP.set('/admin', this.encryptRoute('/admin'))
    this.ROUTE_MAP.set('/submit-report', this.encryptRoute('/submit-report'))
    this.ROUTE_MAP.set('/reports', this.encryptRoute('/reports'))
    this.ROUTE_MAP.set('/edit-profile', this.encryptRoute('/edit-profile'))
    this.ROUTE_MAP.set('/profile-complete', this.encryptRoute('/profile-complete'))
  }

  // Simple route encryption
  private static encryptRoute(route: string): string {
    let result = ''
    for (let i = 0; i < route.length; i++) {
      result += String.fromCharCode(
        route.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
      )
    }
    return btoa(result).replace(/[+/=]/g, '').substring(0, 12) // Short, clean encrypted string
  }

  // Get masked URL for a route
  static getMaskedUrl(originalRoute: string): string {
    if (!this.ROUTE_MAP.has(originalRoute)) {
      this.ROUTE_MAP.set(originalRoute, this.encryptRoute(originalRoute))
    }
    const masked = this.ROUTE_MAP.get(originalRoute)!
    return `/secure/${masked}`
  }

  // Get original route from masked URL
  static getOriginalRoute(maskedUrl: string): string {
    const encryptedPart = maskedUrl.replace('/secure/', '')
    
    // Try to find matching route
    for (const [original, masked] of this.ROUTE_MAP.entries()) {
      if (masked === encryptedPart) {
        return original
      }
    }
    
    // Fallback decryption
    try {
      const decoded = atob(encryptedPart + '===') // Add padding back
      let result = ''
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        )
      }
      return result
    } catch {
      return maskedUrl // Fallback to original
    }
  }

  // Check if URL is masked
  static isMaskedUrl(url: string): boolean {
    return url.startsWith('/secure/')
  }

  // Generate random secure path
  static generateSecurePath(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `/secure/${result}`
  }
}

// Initialize routes on import
URLMasking.initializeRoutes()

export default URLMasking
