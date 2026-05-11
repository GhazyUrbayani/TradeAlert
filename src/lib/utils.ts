import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRiskScore(score: number): string {
  return score.toFixed(0);
}

export function getRiskColor(score: number): string {
  if (score >= 70) return 'text-error border-error bg-error/10';
  if (score >= 40) return 'text-tertiary border-tertiary bg-tertiary/10';
  return 'text-secondary border-secondary bg-secondary/10';
}

export function getRiskLevel(score: number): string {
  if (score >= 70) return 'Critical';
  if (score >= 40) return 'Warning';
  return 'Safe';
}
