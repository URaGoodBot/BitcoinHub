import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number as currency
export function formatCurrency(value: number, currency: string = 'USD', maximumFractionDigits: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits
  }).format(value);
}

// Format number with commas
export function formatNumber(value: number, maximumFractionDigits: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Format date relative to now (e.g., "2 hours ago")
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return date.toLocaleDateString();
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get user initials from username
export function getUserInitials(username: string): string {
  if (!username) return '';
  
  const parts = username.split(/[^a-zA-Z0-9]/);
  const filteredParts = parts.filter(part => part.length > 0);
  
  if (filteredParts.length === 0) return '';
  if (filteredParts.length === 1) return filteredParts[0].charAt(0).toUpperCase();
  
  return (filteredParts[0].charAt(0) + filteredParts[1].charAt(0)).toUpperCase();
}

// Get random color based on string (for user avatars)
export function getStringColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
