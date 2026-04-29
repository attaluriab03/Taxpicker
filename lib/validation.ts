import { z } from 'zod'

// ─── Reusable field validators ─────────────────────────────────────────────

export const requiredText = (label: string, max = 500) =>
  z.string().min(1, `${label} is required`).max(max, `${label} must be under ${max} characters`)

export const optionalText = (max = 500) =>
  z.string().max(max, `Must be under ${max} characters`).optional().or(z.literal(''))

export const httpsUrl = (label: string, required = true) => {
  const base = z
    .string()
    .url(`${label} must be a valid URL`)
    .startsWith('https://', `${label} must start with https://`)
  return required
    ? base.min(1, `${label} is required`)
    : z.union([z.literal(''), base]).optional()
}

export const positiveNumber = (label: string) =>
  z
    .number(`${label} must be a number`)
    .min(0, `${label} cannot be negative`)

export const positiveInteger = (label: string) =>
  z
    .number(`${label} must be a whole number`)
    .int(`${label} must be a whole number`)
    .min(0, `${label} cannot be negative`)

export const filterValueFormat = z
  .string()
  .min(1, 'Value is required')
  .max(50, 'Value must be under 50 characters')
  .regex(/^[a-zA-Z0-9_.\-\s]+$/, 'Value can only contain letters, numbers, spaces, hyphens, underscores, and dots')

export const filterLabelFormat = z
  .string()
  .min(1, 'Label is required')
  .max(100, 'Label must be under 100 characters')

export const priceRangeMax = z
  .number('Max price must be a number')
  .int('Max price must be a whole number')
  .min(1, 'Max price must be at least $1')
  .max(100000, 'Max price seems too high — please check the value')

export const pricingTypeEnum = z.enum(['free', 'freemium', 'paid'])

export const ratingValidator = z
  .number()
  .min(0, 'Rating cannot be negative')
  .max(5, 'Rating cannot exceed 5')
  .nullable()
  .optional()
