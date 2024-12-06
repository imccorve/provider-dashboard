import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (status: string) => ({
    'INQUIRY': 'bg-blue-100 text-blue-700',
    'ONBOARDING': 'bg-yellow-100 text-yellow-700',
    'ACTIVE': 'bg-green-100 text-green-700',
    'CHURNED': 'bg-red-100 text-red-700'
  }[status] || 'bg-gray-100 text-gray-700');