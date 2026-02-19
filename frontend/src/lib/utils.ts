import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return 'text-green-600 bg-green-50';
  if (difficulty <= 3) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

export function getDifficultyLabel(difficulty: number): string {
  if (difficulty === 1) return 'Easy';
  if (difficulty === 2) return 'Medium';
  if (difficulty === 3) return 'Medium-Hard';
  if (difficulty === 4) return 'Hard';
  return 'Expert';
}

export function getSkillColor(level: number): string {
  if (level >= 0.7) return 'bg-green-500';
  if (level >= 0.4) return 'bg-yellow-500';
  return 'bg-red-500';
}
