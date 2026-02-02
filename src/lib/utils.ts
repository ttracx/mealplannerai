import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export function getWeekDates(startDate: Date = new Date()): Date[] {
  const dates: Date[] = []
  const start = new Date(startDate)
  start.setDate(start.getDate() - start.getDay()) // Start from Sunday
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }
  
  return dates
}

export function categorizeIngredient(ingredient: string): string {
  const categories: Record<string, string[]> = {
    'Produce': ['apple', 'banana', 'lettuce', 'tomato', 'onion', 'garlic', 'carrot', 'potato', 'pepper', 'cucumber', 'spinach', 'broccoli', 'lemon', 'lime', 'orange', 'berry', 'fruit', 'vegetable', 'herb', 'cilantro', 'parsley', 'basil', 'avocado', 'mushroom', 'celery', 'ginger'],
    'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'sour cream'],
    'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'bacon', 'sausage', 'lamb', 'tuna'],
    'Bakery': ['bread', 'tortilla', 'bun', 'roll', 'bagel', 'croissant', 'pita'],
    'Pantry': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'vinegar', 'sauce', 'can', 'bean', 'lentil', 'chickpea', 'broth', 'stock', 'spice', 'salt', 'pepper', 'honey', 'maple', 'soy sauce', 'olive oil'],
    'Frozen': ['frozen', 'ice cream'],
    'Beverages': ['juice', 'coffee', 'tea', 'water', 'soda'],
    'Snacks': ['chips', 'crackers', 'nuts', 'seeds'],
  }

  const lowerIngredient = ingredient.toLowerCase()
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
      return category
    }
  }
  
  return 'Other'
}
