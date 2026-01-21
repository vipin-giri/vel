'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { VulnerabilityReport } from '@/types'
import { apiClient } from '@/lib/api'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Plus, Eye, Trash2, Filter, Search } from 'lucide-react'
import Link from 'next/link'

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'patched'

export default function DashboardPage() {
  const { user } = useAuth()
  const { isLoading } = useProtectedRoute()
  const [reports, setReports] = useState<VulnerabilityReport[]>([])
  const [filteredReports, setFilteredReports] = useState<VulnerabilityReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isLoading && user) {
      fetchReports()
    }
  }, [isLoading, user])

  useEffect(() => {
    let filtered = reports

    console.log('Filtering reports:', { reports, filter, searchTerm })

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(report => report.status === filter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.vulnerability_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    console.log('Filtered result:', filtered)
    setFilteredReports(filtered)
  }, [reports, filter, searchTerm])

  // Clear error when changing filters or search
  useEffect(() => {
    setError('')
  }, [filter, searchTerm])

  const fetchReports = async () => {
    setError('') // Clear previous errors
    console.log('Fetching user reports...')
    try {
      const response = await apiClient.getUserReports()
      console.log('API response:', response)
      if (response.success && response.data) {
        console.log('Reports data:', response.data)
        setReports(response.data)
      } else {
        console.log('API error:', response.error)
        setError(response.error || 'Failed to fetch reports')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return
    }

    try {
      const response = await apiClient.deleteReport(reportId)
      if (response.success) {
        setReports(prev => prev.filter(report => report.id !== reportId))
        setFilteredReports(prev => prev.filter(report => report.id !== reportId))
      } else {
        setError(response.error || 'Failed to delete report')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const getStatusCount = (status: FilterStatus) => {
    if (status === 'all') return reports.length
    return reports.filter(report => report.status === status).length
  }

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.nickname || user.fullName || user.email}!
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your vulnerability reports and track their status
              </p>
            </div>
            <Link href="/submit-report">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{getStatusCount('all')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">{getStatusCount('pending')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-blue-700">{getStatusCount('accepted')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Patched</p>
                  <p className="text-2xl font-bold text-green-700">{getStatusCount('patched')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by domain or vulnerability type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'accepted', 'rejected', 'patched'] as FilterStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                  ({getStatusCount(status)})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Filter className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No reports yet' : `No ${filter} reports`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Start by submitting your first vulnerability report.'
                  : 'Try changing the filters or search terms.'
                }
              </p>
              {filter === 'all' && (
                <Link href="/submit-report">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your First Report
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.domain}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Vulnerability:</strong> {report.vulnerability_type}</p>
                        <p><strong>Submitted:</strong> {formatDate(report.submitted_at)}</p>
                        {report.admin_comment && (
                          <p><strong>Admin Comment:</strong> {report.admin_comment}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Link href={`/reports/${report.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
