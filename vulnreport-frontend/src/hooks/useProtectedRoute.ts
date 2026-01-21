'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function useProtectedRoute(requireAdmin = false) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }

      if (requireAdmin && user?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
    }
  }, [isAuthenticated, isLoading, user, requireAdmin, router])

  return { isAuthenticated, isLoading, user }
}
