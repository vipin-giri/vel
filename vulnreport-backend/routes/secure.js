// Secure API Route Handler
// This route handles encrypted URLs and decrypts them to actual endpoints

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

class URLEncryption {
  static ENCRYPTION_KEY = 'VulnReportPro2024SecureKey';
  static BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api';

  // XOR decryption (matches frontend)
  static xorDecrypt(encryptedText, key) {
    try {
      const decoded = Buffer.from(encryptedText, 'base64').toString();
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return '';
    }
  }

  // Decrypt URL and extract endpoint
  static decryptUrl(encryptedUrl) {
    const decrypted = this.xorDecrypt(encryptedUrl, this.ENCRYPTION_KEY);
    
    // Extract endpoint from full URL
    if (decrypted.startsWith(this.BASE_URL)) {
      return decrypted.replace(this.BASE_URL, '');
    }
    
    return '';
  }
}

// Middleware to handle encrypted URLs
router.use('/', async (req, res, next) => {
  try {
    const { url: encryptedUrl } = req.query;
    
    if (!encryptedUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing encrypted URL parameter'
      });
    }

    // Decrypt the URL to get the actual endpoint
    const actualEndpoint = URLEncryption.decryptUrl(encryptedUrl);
    
    if (!actualEndpoint) {
      return res.status(400).json({
        success: false,
        error: 'Invalid encrypted URL'
      });
    }

    // Log for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Decrypted URL:', actualEndpoint);
    }

    // Rewrite the request URL to the actual endpoint
    req.originalUrl = actualEndpoint;
    req.url = actualEndpoint;
    
    // Continue to the actual route handler
    next();
  } catch (error) {
    console.error('Secure route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
