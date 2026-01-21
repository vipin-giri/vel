'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { VulnerabilityReport, Analytics } from '@/types'
import { apiClient } from '@/lib/api'
import { formatDate, getStatusColor } from '@/lib/utils'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Filter,
  Search,
  Download,
  Link as LinkIcon,
  Bug,
  FileText
} from 'lucide-react'

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'patched'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { isLoading } = useProtectedRoute(true)
  const [reports, setReports] = useState<VulnerabilityReport[]>([])
  const [filteredReports, setFilteredReports] = useState<VulnerabilityReport[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState<VulnerabilityReport | null>(null)
  const [statusUpdate, setStatusUpdate] = useState({ status: '', comment: '' })
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      fetchData()
    }
  }, [isLoading, user])

  useEffect(() => {
    let filtered = reports

    if (filter !== 'all') {
      filtered = filtered.filter(report => report.status === filter)
    }

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.vulnerability_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredReports(filtered)
  }, [reports, filter, searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reportsResponse, analyticsResponse] = await Promise.all([
        apiClient.getAllReports(),
        apiClient.getAnalytics()
      ])

      console.log('Admin API Response:', reportsResponse)
      console.log('Reports Data:', reportsResponse.data)

      if (reportsResponse.success && reportsResponse.data) {
        setReports(reportsResponse.data)
      } else {
        setError(reportsResponse.error || 'Failed to fetch reports')
      }

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data)
      }
    } catch (error) {
      console.error('Fetch data error:', error)
      setError('Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = (report: VulnerabilityReport) => {
    setSelectedReport(report)
    setStatusUpdate({ 
      status: report.status, 
      comment: report.admin_comment || '' 
    })
    setShowStatusModal(true)
  }

  const handleStatusUpdate = async () => {
    if (!selectedReport || !statusUpdate.status) {
      setError('Please select a status')
      return
    }

    try {
      setIsUpdating(true)
      setError('')

      const response = await apiClient.updateReportStatus(
        selectedReport.id,
        statusUpdate.status,
        statusUpdate.comment
      )

      console.log('Status Update Response:', response)

      if (response.success && response.data) {
        // Use the actual updated data from the server
        setReports(prev => prev.map(report => 
          report.id === selectedReport.id ? response.data! : report
        ))
        
        // Close modal and reset
        setShowStatusModal(false)
        setSelectedReport(null)
        setStatusUpdate({ status: '', comment: '' })
        
        // Optionally refresh analytics
        const analyticsResponse = await apiClient.getAnalytics()
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data)
        }
      } else {
        setError(response.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const closeModal = () => {
    setShowStatusModal(false)
    setSelectedReport(null)
    setStatusUpdate({ status: '', comment: '' })
    setError('')
  }

  const getStatusCount = (status: FilterStatus) => {
    if (status === 'all') return reports.length
    return reports.filter(report => report.status === status).length
  }

  // Helper function to safely get user info
  const getReporterEmail = (report: VulnerabilityReport) => {
    return report.email || 'Unknown'
  }

  const getReporterNickname = (report: VulnerabilityReport) => {
    return report.nickname || 'Not provided'
  }

  const getReporterFullName = (report: VulnerabilityReport) => {
    return report.full_name || 'Not provided'
  }

  if (!user || user.role !== 'admin' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Manage vulnerability reports and view platform analytics
          </p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalReports}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.pendingReports}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Patched</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.patchedReports}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-4">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.rejectedReports}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by domain, vulnerability type, or reporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'accepted', 'rejected', 'patched'] as FilterStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  {' '}({getStatusCount(status)})
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
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Filter className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reports found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'Try changing the filters or search terms.' 
                  : 'No vulnerability reports have been submitted yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.domain}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {/* Affected URL */}
                        <div className="flex items-start gap-2">
                          <LinkIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-1">Affected URL</p>
                            <p className="text-sm text-gray-900 break-all">{report.affected_url}</p>
                          </div>
                        </div>

                        {/* Vulnerability Type */}
                        <div className="flex items-start gap-2">
                          <Bug className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-1">Vulnerability Type</p>
                            <p className="text-sm text-gray-900 font-medium">{report.vulnerability_type}</p>
                          </div>
                        </div>

                        {/* Steps to Reproduce */}
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-1">Steps to Reproduce</p>
                            <p className="text-sm text-gray-800 line-clamp-3">{report.steps_to_reproduce}</p>
                          </div>
                        </div>

                        {/* Reporter & Impact */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Reporter</p>
                            <p className="text-sm text-gray-900">{getReporterFullName(report)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Impact</p>
                            <p className="text-sm text-gray-900">{report.impact}</p>
                          </div>
                        </div>

                        {/* Admin Comment */}
                        {report.admin_comment && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-3">
                            <p className="text-xs font-medium text-blue-700 mb-1">Admin Comment</p>
                            <p className="text-sm text-blue-900">{report.admin_comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View & Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Report Details & Status Update Modal */}
        {showStatusModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <h3 className="text-xl font-semibold text-gray-900">Report Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  disabled={isUpdating}
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                {/* Error in modal */}
                {error && (
                  <Alert variant="error" className="mb-4">
                    {error}
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Report Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Vulnerability Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Domain</label>
                          <p className="text-gray-900 font-medium">{selectedReport.domain}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Affected URL</label>
                          <p className="text-gray-900 font-medium break-all">{selectedReport.affected_url}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Vulnerability Type</label>
                          <p className="text-gray-900 font-medium">{selectedReport.vulnerability_type}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Impact</label>
                          <p className="text-gray-900">{selectedReport.impact}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Steps to Reproduce</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.steps_to_reproduce}</p>
                      </div>
                    </div>

                    {selectedReport.proof_of_concept && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Proof of Concept</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.proof_of_concept}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Status & Reporter Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Reporter Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Reporter Email</label>
                          <p className="text-gray-900 font-medium">{getReporterEmail(selectedReport)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nickname</label>
                          <p className="text-gray-900 font-medium">{getReporterNickname(selectedReport)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-gray-900 font-medium">{getReporterFullName(selectedReport)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="mt-1">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedReport.status)}`}>
                              {selectedReport.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {selectedReport.admin_comment && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Previous Admin Comment</label>
                            <p className="text-gray-900 mt-1">{selectedReport.admin_comment}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={statusUpdate.status}
                            onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isUpdating}
                          >
                            <option value="">Select status</option>
                            <option value="pending">Pending</option>
                            <option value="on_hold">On Hold</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="patched">Patched</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Comment
                          </label>
                          <textarea
                            placeholder="Add a comment about this status change..."
                            rows={4}
                            value={statusUpdate.comment}
                            onChange={(e) => setStatusUpdate(prev => ({ ...prev, comment: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isUpdating}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleStatusUpdate}
                            disabled={!statusUpdate.status || isUpdating}
                            className="flex-1"
                          >
                            {isUpdating ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Updating...
                              </>
                            ) : (
                              'Update Status'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={closeModal}
                            disabled={isUpdating}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}