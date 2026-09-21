// Post dates are calendar days ("2026-2-15", "2025-12-20"), not moments. Reading them with
// `new Date(...)` and printing in the local time zone moves some of them to the neighbouring
// day or month, and makes the server-rendered text differ from what the browser prints.
// Everything here works on the year/month/day as written and formats in UTC.

import { INTL_LOCALE, type Locale } from './i18n/config'

export interface DateParts {
  year: number
  month: number // 1-12
  day: number
}

export function parseDateParts(value: string): DateParts | null {
  const match = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

function toUtcDate(value: string): Date | null {
  const parts = parseDateParts(value)
  if (parts) return new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

// 'Jan 4, 2026' / '2026年1月4日'
export function formatDay(value: string, locale: Locale): string {
  const date = toUtcDate(value)
  if (!date) return String(value)
  return date.toLocaleDateString(INTL_LOCALE[locale], { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// 'February 2026' / '2026年2月'
export function formatMonth(value: string, locale: Locale): string {
  const date = toUtcDate(value)
  if (!date) return String(value)
  return date.toLocaleDateString(INTL_LOCALE[locale], { year: 'numeric', month: 'long', timeZone: 'UTC' })
}

// Sorts and groups by this: '2026-02'. Dates that cannot be read share the key ''.
export function monthKey(value: string): string {
  const parts = parseDateParts(value)
  if (parts) return `${parts.year}-${String(parts.month).padStart(2, '0')}`
  const date = toUtcDate(value)
  return date ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}` : ''
}
