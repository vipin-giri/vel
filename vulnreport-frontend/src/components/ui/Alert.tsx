import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export function Alert({ variant = 'info', children, onClose, className }: AlertProps) {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  }

  const Icon = icons[variant]

  return (
    <div className={cn(
      'rounded-md border p-4',
      variants[variant],
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
