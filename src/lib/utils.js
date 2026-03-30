import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function generateBugId() {
  return `BUG-${Math.floor(1000 + Math.random() * 9000)}`
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
