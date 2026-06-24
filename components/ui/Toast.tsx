'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, variant }])
    const duration = variant === 'error' ? 6000 : 4000
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const icons: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
    error:   <XCircle    className="w-5 h-5 text-red-500 shrink-0" />,
    info:    <Info       className="w-5 h-5 text-blue-500 shrink-0" />,
  }

  const bgClasses: Record<ToastVariant, string> = {
    success: 'border-green-200 bg-green-50',
    error:   'border-red-200 bg-red-50',
    info:    'border-blue-200 bg-blue-50',
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              toast-enter flex items-start gap-3 px-4 py-3 border rounded shadow-lg
              pointer-events-auto bg-white
              ${bgClasses[toast.variant]}
            `}
          >
            {icons[toast.variant]}
            <p className="flex-1 text-sm text-steel">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
