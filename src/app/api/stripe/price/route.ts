import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

let cachedPriceId: string | null = null

export async function GET() {
  try {
    if (cachedPriceId) {
      return NextResponse.json({ priceId: cachedPriceId })
    }

    // Search for existing product
    const products = await stripe.products.list({
      active: true,
      limit: 10,
    })

    let product = products.data.find(p => p.name === "MealPlanner Pro")
    
    if (!product) {
      // Create the product
      product = await stripe.products.create({
        name: "MealPlanner Pro",
        description: "Full access to AI meal planning features including unlimited recipe generation, personalized meal plans, smart shopping lists, and nutritional tracking.",
        metadata: {
          app: "mealplannerai",
        },
      })
    }

    // Search for existing price
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 10,
    })

    let price = prices.data.find(p => 
      p.unit_amount === 799 && 
      p.recurring?.interval === "month"
    )

    if (!price) {
      // Create the price
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 799, // $7.99
        currency: "usd",
        recurring: {
          interval: "month",
        },
        metadata: {
          app: "mealplannerai",
        },
      })
    }

    cachedPriceId = price.id

    return NextResponse.json({ 
      priceId: price.id,
      productId: product.id,
    })
  } catch (error) {
    console.error("Error fetching/creating price:", error)
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    )
  }
}
