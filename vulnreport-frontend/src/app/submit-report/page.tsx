'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Alert } from '@/components/ui/Alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ReportFormData } from '@/types'
import { apiClient } from '@/lib/api'
import { Shield, Upload, Bug, Globe, Link2, FileText, AlertCircle } from 'lucide-react'

export default function SubmitReportPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<ReportFormData>({
    domain: '',
    affected_url: '',
    vulnerability_type: '',
    steps_to_reproduce: '',
    impact: '',
    proof_of_concept: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Debug: Log error state changes
  console.log('Current submitError:', submitError)

  const vulnerabilityTypes = [
    'SQL Injection',
    'Cross-Site Scripting (XSS)',
    'Cross-Site Request Forgery (CSRF)',
    'Remote Code Execution',
    'Local File Inclusion',
    'Remote File Inclusion',
    'Authentication Bypass',
    'Privilege Escalation',
    'Information Disclosure',
    'Denial of Service',
    'Broken Authentication',
    'Sensitive Data Exposure',
    'Security Misconfiguration',
    'Using Components with Known Vulnerabilities',
    'Insufficient Logging & Monitoring',
    'Other'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required'
    }

    if (!formData.affected_url.trim()) {
      newErrors.affected_url = 'Affected URL is required'
    }

    if (!formData.vulnerability_type) {
      newErrors.vulnerability_type = 'Vulnerability type is required'
    }

    if (!formData.steps_to_reproduce.trim()) {
      newErrors.steps_to_reproduce = 'Steps to reproduce are required'
    }

    if (!formData.impact.trim()) {
      newErrors.impact = 'Impact description is required'
    }

    // URL validation - accept complex URLs with payloads
    if (formData.affected_url.trim()) {
      try {
        const url = new URL(formData.affected_url)
        // Check if it's a valid URL with supported protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.affected_url = 'URL must start with http:// or https://'
        }
      } catch {
        newErrors.affected_url = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.submitReport(formData)
      
      if (response.success) {
        router.push('/dashboard?success=report-submitted')
      } else if (response.duplicate) {
        // Handle duplicate submission
        console.log('Duplicate response:', response)
        const nextTime = response.nextSubmissionTime ? new Date(response.nextSubmissionTime) : new Date()
        const hoursLeft = Math.ceil((nextTime.getTime() - new Date().getTime()) / (1000 * 60 * 60))
        const errorMessage = `${response.error} You can submit again in ${hoursLeft} hours.`
        console.log('Setting error message:', errorMessage)
        setSubmitError(errorMessage)
      } else {
        console.log('Other error response:', response)
        setSubmitError(response.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Submit Vulnerability Report</h1>
          </div>
          <p className="text-gray-700">
            Help us improve security by reporting vulnerabilities you've discovered.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Vulnerability Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="domain"
                  name="domain"
                  label="Domain Name"
                  placeholder="example.com"
                  value={formData.domain}
                  onChange={handleChange}
                  error={errors.domain}
                  required
                />

                <Input
                  id="affected_url"
                  name="affected_url"
                  label="Affected URL"
                  placeholder="https://example.com/vulnerable-page"
                  value={formData.affected_url}
                  onChange={handleChange}
                  error={errors.affected_url}
                  required
                />
              </div>

              <div>
                <label htmlFor="vulnerability_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Vulnerability Type
                </label>
                <select
                  id="vulnerability_type"
                  name="vulnerability_type"
                  value={formData.vulnerability_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                    errors.vulnerability_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="" className="text-gray-400">Select vulnerability type</option>
                  {vulnerabilityTypes.map((type: string) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.vulnerability_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.vulnerability_type}</p>
                )}
              </div>

              <Textarea
                id="steps_to_reproduce"
                name="steps_to_reproduce"
                label="Steps to Reproduce"
                placeholder="Provide detailed steps to reproduce the vulnerability..."
                rows={6}
                value={formData.steps_to_reproduce}
                onChange={handleChange}
                error={errors.steps_to_reproduce}
                helperText="Be as detailed as possible. Include exact URLs, parameters, and sequence of actions."
                required
              />

              <Textarea
                id="impact"
                name="impact"
                label="Impact"
                placeholder="Describe the potential impact of this vulnerability..."
                rows={4}
                value={formData.impact}
                onChange={handleChange}
                error={errors.impact}
                helperText="Explain what an attacker could do with this vulnerability."
                required
              />

              <Textarea
                id="proof_of_concept"
                name="proof_of_concept"
                label="Proof of Concept (Optional)"
                placeholder="Provide code snippets, screenshots, or other proof..."
                rows={4}
                value={formData.proof_of_concept}
                onChange={handleChange}
                helperText="Include any additional evidence that demonstrates the vulnerability."
              />

              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium">Upload supporting files</p>
                  <p className="mt-1">Images, videos, or documents (max 10MB each)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.txt,.doc,.docx"
                  className="mt-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {submitError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm font-medium">
                      {submitError}
                    </div>
                  </div>
                </div>
              )}

              {/* Debug: Show error state */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 p-2 mb-4 text-xs">
                  Debug - submitError: {JSON.stringify(submitError)}
                </div>
              )}

              {errors.domain && (
                <Alert variant="error" className="mb-4">
                  {errors.domain}
                </Alert>
              )}

              {errors.affected_url && (
                <Alert variant="error" className="mb-4">
                  {errors.affected_url}
                </Alert>
              )}

              {errors.vulnerability_type && (
                <Alert variant="error" className="mb-4">
                  {errors.vulnerability_type}
                </Alert>
              )}

              {errors.steps_to_reproduce && (
                <Alert variant="error" className="mb-4">
                  {errors.steps_to_reproduce}
                </Alert>
              )}

              {errors.impact && (
                <Alert variant="error" className="mb-4">
                  {errors.impact}
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
