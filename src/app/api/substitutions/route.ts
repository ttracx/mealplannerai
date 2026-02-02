import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { suggestIngredientSubstitution } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { dietaryPreferences: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check subscription
    const hasActiveSubscription = user.stripeCurrentPeriodEnd && 
      new Date(user.stripeCurrentPeriodEnd) > new Date()

    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      )
    }

    const { ingredient, reason } = await request.json()

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient is required" },
        { status: 400 }
      )
    }

    const preferences = user.dietaryPreferences
    const dietaryRestrictions: string[] = []
    
    if (preferences?.isVegetarian) dietaryRestrictions.push("vegetarian")
    if (preferences?.isVegan) dietaryRestrictions.push("vegan")
    if (preferences?.isGlutenFree) dietaryRestrictions.push("gluten-free")
    if (preferences?.isDairyFree) dietaryRestrictions.push("dairy-free")

    const substitutions = await suggestIngredientSubstitution({
      ingredient,
      reason,
      dietaryRestrictions,
    })

    return NextResponse.json(substitutions)
  } catch (error) {
    console.error("Substitution error:", error)
    return NextResponse.json(
      { error: "Failed to get substitutions" },
      { status: 500 }
    )
  }
}
