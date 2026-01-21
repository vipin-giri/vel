'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { VulnerabilityReport } from '@/types'
import { apiClient } from '@/lib/api'
import { formatDate, getStatusColor } from '@/lib/utils'
import { ArrowLeft, Edit, Trash2, Shield, Bug, Globe, Link2, FileText, Calendar, User } from 'lucide-react'

export default function ReportDetailPage() {
  const { user } = useAuth()
  const { isLoading } = useProtectedRoute()
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<VulnerabilityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isLoading && params.id) {
      fetchReport()
    }
  }, [isLoading, params.id])

  const fetchReport = async () => {
    setError('') // Clear previous errors
    try {
      const response = await apiClient.getReport(params.id as string)
      if (response.success && response.data) {
        setReport(response.data)
      } else {
        setError(response.error || 'Failed to load report')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await apiClient.deleteReport(params.id as string)
      if (response.success) {
        router.push('/dashboard')
      } else {
        setError(response.error || 'Failed to delete report')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto">
            <Alert variant="error">{error}</Alert>
          </div>
        </div>
      </Layout>
    )
  }

  if (!report) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
            <p className="text-gray-700">The vulnerability report you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Report Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bug className="h-5 w-5" />
                Vulnerability Report Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Domain</h3>
                  <p className="text-lg font-semibold text-gray-900">{report.domain}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Affected URL</h3>
                <p className="text-blue-700 font-medium break-all">{report.affected_url}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Vulnerability Type</h3>
                <p className="font-medium text-gray-900">{report.vulnerability_type}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Steps to Reproduce</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="whitespace-pre-wrap text-gray-800">{report.steps_to_reproduce}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Impact</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-800">{report.impact}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Proof of Concept</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-800">{report.proof_of_concept || 'No proof of concept provided'}</p>
                  </div>
                </div>
              </div>

              {report.admin_comment && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Admin Comment</h3>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-gray-800">{report.admin_comment}</p>
                  </div>
                </div>
              )}

              {report.attachments && report.attachments.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {report.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <a 
                          href={`/api/reports/attachments/${attachment}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {attachment}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {(user?.id === report.user_id || user?.role === 'admin') && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {user?.id === report.user_id && (
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Report
                    </Button>
                  )}
                  <Button 
                    variant="danger" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Report'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
