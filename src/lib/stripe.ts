import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

export const PLANS = {
  pro: {
    name: 'MealPlanner Pro',
    description: 'Full access to AI meal planning features',
    price: 799, // $7.99 in cents
    priceId: '', // Will be set after creating the product
    features: [
      'Unlimited AI recipe generation',
      'Personalized meal plans',
      'Smart shopping lists',
      'Nutritional tracking',
      'Ingredient substitutions',
      'Weekly meal calendar',
      'Export & share recipes',
    ],
  },
}
