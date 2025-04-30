import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function getRandomPosition(width: number, height: number): { x: number; y: number } {
  // Get window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Calculate max positions to keep sticky note fully visible
  const maxX = Math.max(windowWidth - width - 20, 100);
  const maxY = Math.max(windowHeight - height - 20, 100);
  
  // Calculate random position within safe bounds
  const x = 100 + Math.floor(Math.random() * (maxX - 100));
  const y = 100 + Math.floor(Math.random() * (maxY - 100));
  
  return { x, y };
}

export function getColorClass(color: string): string {
  switch (color) {
    case 'yellow':
      return 'bg-amber-100 border-amber-300';
    case 'pink':
      return 'bg-pink-100 border-pink-300';
    case 'blue':
      return 'bg-sky-100 border-sky-300';
    case 'green':
      return 'bg-emerald-100 border-emerald-300';
    default:
      return 'bg-amber-100 border-amber-300';
  }
}

export function getColorTabClass(color: string, isSelected: boolean): string {
  const baseClass = 'h-8 w-8 rounded-md cursor-pointer transition-all duration-200 border-2';
  const selectedClass = isSelected ? 'ring-2 ring-offset-2 scale-110' : '';
  
  switch (color) {
    case 'yellow':
      return `${baseClass} ${selectedClass} bg-amber-200 border-amber-300 ring-amber-500`;
    case 'pink':
      return `${baseClass} ${selectedClass} bg-pink-200 border-pink-300 ring-pink-500`;
    case 'blue':
      return `${baseClass} ${selectedClass} bg-sky-200 border-sky-300 ring-sky-500`;
    case 'green':
      return `${baseClass} ${selectedClass} bg-emerald-200 border-emerald-300 ring-emerald-500`;
    default:
      return `${baseClass} ${selectedClass} bg-amber-200 border-amber-300 ring-amber-500`;
  }
}

export const getUserId = () => {
  // Check if user ID exists in cookie
  const userId = document.cookie
    .split('; ')
    .find(row => row.startsWith('userId='))
    ?.split('=')[1];

  if (userId) {
    return userId;
  }

  // Generate new user ID if none exists
  const newUserId = uuidv4();
  
  // Set cookie to expire in 1 year
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  
  // Set cookie with SameSite=Strict for security
  document.cookie = `userId=${newUserId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  
  return newUserId;
};