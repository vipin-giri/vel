'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Shield, User, FileText, Award, Edit, ArrowLeft } from 'lucide-react'

export default function ProfileCompletePage() {
  const { user } = useAuth()
  const { isLoading } = useProtectedRoute()
  const router = useRouter()

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
        </div>
      </Layout>
    )
  }

  const getExperienceBadge = (experience: string) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-blue-100 text-blue-800',
      Advanced: 'bg-purple-100 text-purple-800',
      Expert: 'bg-orange-100 text-orange-800'
    }
    return colors[experience as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user?.nickname || 'User'}</h1>
                  <p className="text-blue-100">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                <Button onClick={() => router.push('/edit-profile')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nickname</label>
                        <p className="text-gray-900 font-medium">{user?.nickname || 'Not set'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-gray-900 font-medium">{user?.fullName || 'Not set'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900 font-medium">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-blue-600" />
                      Professional Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Experience Level</label>
                        <div className="mt-1">
                          {user?.experience ? (
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getExperienceBadge(user.experience)}`}>
                              {user.experience}
                            </span>
                          ) : (
                            <p className="text-gray-900 font-medium">Not specified</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">About</label>
                        <p className="text-gray-900 font-medium">
                          {user?.about || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Account Status
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Account Status</p>
                        <p className="text-green-600">Active</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Registration</p>
                        <p className="text-blue-600">Completed</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-purple-800">Member Since</p>
                        <p className="text-purple-600">Today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
