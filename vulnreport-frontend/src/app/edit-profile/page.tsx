'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ProfileData } from '@/types'
import { apiClient } from '@/lib/api'
import { Save, ArrowLeft } from 'lucide-react'

export default function EditProfilePage() {
  const { user } = useAuth()
  const { isLoading } = useProtectedRoute()
  const router = useRouter()

  const [formData, setFormData] = useState<ProfileData>({
    nickname: '',
    fullName: '',
    about: '',
    experience: '',
    acceptTerms: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isLoading && user) {
      setFormData({
        nickname: user.nickname || '',
        fullName: user.fullName || '',
        about: user.about || '',
        experience: user.experience || '',
        acceptTerms: true // already accepted earlier
      })
    }
  }, [isLoading, user])

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nickname.trim()) {
      setError('Nickname is required')
      return
    }

    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return
    }

    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await apiClient.updateProfile(formData)

      if (res.success) {
        setSuccess('Profile updated successfully')
        setTimeout(() => router.push('/dashboard'), 1200)
      } else {
        setError(res.error || 'Failed to update profile')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- LOADING ---------------- */

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
        </div>
      </Layout>
    )
  }

  /* ---------------- UI ---------------- */

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            size="sm"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-700 mb-6">
              Update your personal information
            </p>

            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4">{success}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleCheckboxChange}
                />
                <span className="text-sm">I accept the terms and conditions</span>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}