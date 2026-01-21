'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Shield, Bug, Lock, BarChart3, Users, CheckCircle, ArrowRight, LogIn, UserPlus, Star, Zap, ShieldCheck, Menu, X, Share2, Facebook, Twitter, Linkedin, Link2 } from 'lucide-react'
import Link from 'next/link'
import URLMasking from '@/lib/urlMasking'

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Don't redirect authenticated users - let them see the landing page
  // They can navigate to dashboard/admin from the landing page itself

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show landing page for both authenticated and non-authenticated users
  // Don't return null for authenticated users
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="relative z-50">
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">VulnReport Pro</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                      className="text-blue-600 font-bold flex items-center"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      Go to Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Link 
                      href={URLMasking.getMaskedUrl('/auth/login')}
                      className="text-blue-600 font-bold flex items-center"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                    <Link href={URLMasking.getMaskedUrl('/auth/signup')}>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 hover:text-gray-900 p-2"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm">
                <div className="py-4 space-y-3">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                        className="flex items-center text-blue-600 font-bold px-4 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link 
                        href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                        className="block w-full text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full">
                          Go to Dashboard
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/auth/login"
                        className="border-2 border-purple-600 text-purple-600 font-bold px-10 py-4 rounded-xl flex items-center justify-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Link>
                      <Link 
                        href="/auth/signup" 
                        className="block w-full text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section - Modernized */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-50">
              VulnReport Pro
            </h1>
            <p className="text-xl md:text-3xl mb-8 text-white font-light">
              Professional Vulnerability Reporting Platform
            </p>
            <p className="text-lg md:text-xl mb-12 max-w-4xl mx-auto text-blue-50 leading-relaxed font-medium">
              Secure, efficient, and comprehensive platform for reporting, tracking, and managing 
              security vulnerabilities. Join thousands of security researchers in making the digital world safer.
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href={URLMasking.getMaskedUrl('/auth/signup')}>
                <Button size="lg" className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-2xl">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href={URLMasking.getMaskedUrl('/auth/login')}>
                <Button variant="outline" size="lg" className="border-2 border-white text-blue-600 font-semibold px-8 py-4 rounded-xl backdrop-blur-sm">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">10,000+ Researchers</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modernized */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">VulnReport Pro</span>?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              Our platform provides everything you need for effective vulnerability management with enterprise-grade features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Bug className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Easy Reporting
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Submit detailed vulnerability reports with our intuitive form interface. 
                Include screenshots, videos, and step-by-step reproduction instructions.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Real-time Analytics
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Track vulnerability trends, monitor resolution times, and gain insights 
                into your security posture with comprehensive analytics dashboard.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Secure & Private
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Enterprise-grade security with end-to-end encryption. Your vulnerability 
                data is protected with industry best practices.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Role-based Access
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Granular permission system with user and admin roles. Ensure the right 
                people have access to the right information.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Status Tracking
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Track your reports through the entire lifecycle from submission to resolution. 
                Get notified when status changes occur.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Professional Platform
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Built for security researchers, penetration testers, and organizations 
                serious about vulnerability management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-50 font-medium">Security Researchers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-blue-50 font-medium">Vulnerabilities Reported</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-blue-50 font-medium">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-50 font-medium">Security Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Secure Your Digital World?
          </h2>
          <p className="text-xl text-gray-200 mb-12 leading-relaxed font-medium">
            Join thousands of security professionals using VulnReport Pro to manage vulnerabilities efficiently and effectively.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href={URLMasking.getMaskedUrl('/auth/signup')}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold px-10 py-4 rounded-xl shadow-2xl">
                <UserPlus className="h-5 w-5 mr-2" />
                Create Your Account
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href={URLMasking.getMaskedUrl('/auth/login')}>
              <Button variant="outline" size="lg" className="border-2 border-purple-600 font-bold px-10 py-4 rounded-xl">
                <LogIn className="h-5 w-5 mr-2" />
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
