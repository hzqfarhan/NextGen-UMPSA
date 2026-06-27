import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Haptic Feedback Helpers (U3)
export const haptic = {
  light: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  },
  heavy: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  },
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 50, 30]);
    }
  },
  error: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 50, 50, 50]);
    }
  }
};
