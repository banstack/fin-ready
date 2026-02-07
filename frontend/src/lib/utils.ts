import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function customLogger(message : string) {
    const now: Date = new Date();
    console.log("[%s] - %s", now.toLocaleString(), message);
}

export const formatBillions = (value: number): string => {
  if (!value) return '0B'
  return `${(value / 1000000000).toFixed(1)}B`
}