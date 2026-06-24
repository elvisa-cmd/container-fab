'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  maxChars?: number
  value?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 border text-sm bg-white text-steel
          focus:outline-none focus:ring-2 focus:ring-rust focus:border-rust
          transition-colors duration-150 rounded-none
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({
  label,
  error,
  maxChars,
  value,
  className = '',
  ...props
}: TextareaProps) {
  const charCount = typeof value === 'string' ? value.length : 0

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        value={value}
        className={`
          w-full px-4 py-2.5 border text-sm bg-white text-steel
          focus:outline-none focus:ring-2 focus:ring-rust focus:border-rust
          transition-colors duration-150 rounded-none resize-none
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      <div className="flex justify-between">
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <span />
        )}
        {maxChars && (
          <p className={`text-xs ${charCount > maxChars ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount}/{maxChars}
          </p>
        )}
      </div>
    </div>
  )
}

export default Input
