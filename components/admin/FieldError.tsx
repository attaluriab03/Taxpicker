import { AlertCircle } from 'lucide-react'

interface FieldErrorProps {
  error?: string
  className?: string
}

export default function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null
  return (
    <p className={`text-red-500 text-xs mt-1 flex items-center gap-1 ${className}`}>
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {error}
    </p>
  )
}
