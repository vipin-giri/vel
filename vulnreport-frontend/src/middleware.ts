import { NextRequest, NextResponse } from 'next/server'
import URLMasking from './lib/urlMasking'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname
  
  // Check if this is a masked URL
  if (URLMasking.isMaskedUrl(url)) {
    // Get the original route
    const originalRoute = URLMasking.getOriginalRoute(url)
    
    // Rewrite to the original route without changing the URL in browser
    return NextResponse.rewrite(new URL(originalRoute, request.url))
  }
  
  // For direct routes, we can optionally redirect to masked URLs
  const maskedRoutes = ['/auth/login', '/auth/signup', '/dashboard', '/admin']
  
  if (maskedRoutes.includes(url)) {
    const maskedUrl = URLMasking.getMaskedUrl(url)
    return NextResponse.redirect(new URL(maskedUrl, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/auth/login',
    '/auth/signup', 
    '/dashboard',
    '/admin',
    '/submit-report',
    '/reports/:path*',
    '/edit-profile',
    '/profile-complete',
    '/secure/:path*'
  ]
}
