// URL Encryption Utility
// This utility encrypts and decrypts URLs to hide direct API endpoints

class URLEncryption {
  private static readonly ENCRYPTION_KEY = 'VulnReportPro2024SecureKey'
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

  // Simple XOR encryption for demonstration
  private static xorEncrypt(text: string, key: string): string {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }
    return btoa(result) // Base64 encode for URL safety
  }

  private static xorDecrypt(encryptedText: string, key: string): string {
    try {
      const decoded = atob(encryptedText) // Base64 decode
      let result = ''
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        )
      }
      return result
    } catch (error) {
      console.error('Decryption error:', error)
      return ''
    }
  }

  // Encrypt endpoint and return encrypted URL
  static encryptEndpoint(endpoint: string): string {
    const fullUrl = `${this.BASE_URL}${endpoint}`
    return this.xorEncrypt(fullUrl, this.ENCRYPTION_KEY)
  }

  // Decrypt URL to get actual endpoint
  static decryptUrl(encryptedUrl: string): string {
    const decrypted = this.xorDecrypt(encryptedUrl, this.ENCRYPTION_KEY)
    
    // Extract endpoint from full URL
    if (decrypted.startsWith(this.BASE_URL)) {
      return decrypted.replace(this.BASE_URL, '')
    }
    
    // Fallback: return empty string if decryption fails
    return ''
  }

  // Generate encrypted URL for API calls
  static generateEncryptedUrl(endpoint: string): string {
    const encrypted = this.encryptEndpoint(endpoint)
    return `/api/secure?url=${encodeURIComponent(encrypted)}`
  }

  // For development: show encrypted URLs in console
  static logEncryptedUrl(endpoint: string): void {
    if (process.env.NODE_ENV === 'development') {
      const encrypted = this.encryptEndpoint(endpoint)
      console.log(`🔐 Encrypted URL for ${endpoint}:`, encrypted)
      console.log(`🔗 Secure endpoint:`, this.generateEncryptedUrl(endpoint))
    }
  }
}

export default URLEncryption
