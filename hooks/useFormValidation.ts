import { useState, useCallback } from 'react'
import { ZodSchema, ZodError } from 'zod'

export function useFormValidation<T>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback(
    (data: unknown): data is T => {
      try {
        schema.parse(data)
        setErrors({})
        return true
      } catch (e) {
        if (e instanceof ZodError) {
          const errorMap: Record<string, string> = {}
          e.issues.forEach((issue) => {
            const path = issue.path.join('.')
            if (!errorMap[path]) errorMap[path] = issue.message
          })
          setErrors(errorMap)
        }
        return false
      }
    },
    [schema]
  )

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const clearAllErrors = useCallback(() => setErrors({}), [])

  const getError = useCallback((field: string) => errors[field], [errors])

  const hasErrors = Object.keys(errors).length > 0

  return { errors, validate, clearError, clearAllErrors, getError, hasErrors }
}
