import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateRecipe } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { dietaryPreferences: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has active subscription
    const hasActiveSubscription = user.stripeCurrentPeriodEnd && 
      new Date(user.stripeCurrentPeriodEnd) > new Date()

    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      )
    }

    const { mealType, additionalInstructions } = await request.json()

    const preferences = user.dietaryPreferences || {}

    const recipe = await generateRecipe({
      preferences: {
        isVegetarian: preferences.isVegetarian,
        isVegan: preferences.isVegan,
        isGlutenFree: preferences.isGlutenFree,
        isDairyFree: preferences.isDairyFree,
        isKeto: preferences.isKeto,
        isPaleo: preferences.isPaleo,
        isLowCarb: preferences.isLowCarb,
        allergies: preferences.allergies,
        dislikedFoods: preferences.dislikedFoods,
        cuisinePreferences: preferences.cuisinePreferences,
        maxPrepTime: preferences.maxPrepTime,
        servings: preferences.servingsPerMeal,
      },
      mealType,
      additionalInstructions,
    })

    // Save recipe to database
    const savedRecipe = await prisma.recipe.create({
      data: {
        userId: session.user.id,
        name: recipe.name,
        description: recipe.description,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        fiber: recipe.fiber,
        sugar: recipe.sugar,
        sodium: recipe.sodium,
        cuisine: recipe.cuisine,
        mealType: recipe.mealType,
        dietTags: recipe.dietTags,
        isAIGenerated: true,
      },
    })

    return NextResponse.json(savedRecipe)
  } catch (error) {
    console.error("Recipe generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    )
  }
}
