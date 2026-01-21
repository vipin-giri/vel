'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Shield, User, LogOut, Settings, BarChart3 } from 'lucide-react'

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">VulnReport Pro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button
                  variant={isActive('/admin') ? 'primary' : 'ghost'}
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}

            {user?.role !== 'admin' && (
              <Link href="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? 'primary' : 'ghost'}
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
            )}

            <div className="relative group">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                {user?.nickname || user?.email}
              </Button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link href="/profile-complete">
                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <User className="h-4 w-4 inline mr-2" />
                      View Profile
                    </div>
                  </Link>
                  <Link href="/edit-profile">
                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <Settings className="h-4 w-4 inline mr-2" />
                      Edit Profile
                    </div>
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
