import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMealPlan } from "@/lib/openai"

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

    const { days, mealsPerDay, startDate } = await request.json()
    const preferences = user.dietaryPreferences || {}

    const mealPlanData = await generateMealPlan({
      preferences: {
        isVegetarian: preferences.isVegetarian,
        isVegan: preferences.isVegan,
        isGlutenFree: preferences.isGlutenFree,
        isDairyFree: preferences.isDairyFree,
        allergies: preferences.allergies,
        dislikedFoods: preferences.dislikedFoods,
        cuisinePreferences: preferences.cuisinePreferences,
        calorieTarget: preferences.calorieTarget,
        servings: preferences.servingsPerMeal,
      },
      days: days || 7,
      mealsPerDay: mealsPerDay || ["breakfast", "lunch", "dinner"],
    })

    // Calculate end date
    const start = new Date(startDate || new Date())
    const end = new Date(start)
    end.setDate(end.getDate() + (days || 7) - 1)

    // Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: session.user.id,
        name: `Weekly Meal Plan - ${start.toLocaleDateString()}`,
        startDate: start,
        endDate: end,
      },
    })

    // Create recipes and meal plan items
    for (const day of mealPlanData.mealPlan) {
      const dayDate = new Date(start)
      dayDate.setDate(start.getDate() + day.day - 1)

      for (const meal of day.meals) {
        // Create recipe
        const recipe = await prisma.recipe.create({
          data: {
            userId: session.user.id,
            name: meal.recipe.name,
            description: meal.recipe.description,
            prepTime: meal.recipe.prepTime,
            cookTime: meal.recipe.cookTime,
            totalTime: meal.recipe.totalTime,
            servings: meal.recipe.servings,
            ingredients: meal.recipe.ingredients,
            instructions: meal.recipe.instructions,
            calories: meal.recipe.calories,
            protein: meal.recipe.protein,
            carbs: meal.recipe.carbs,
            fat: meal.recipe.fat,
            cuisine: meal.recipe.cuisine,
            mealType: [meal.mealType],
            dietTags: meal.recipe.dietTags || [],
            isAIGenerated: true,
          },
        })

        // Create meal plan item
        await prisma.mealPlanItem.create({
          data: {
            mealPlanId: mealPlan.id,
            recipeId: recipe.id,
            date: dayDate,
            mealType: meal.mealType,
            servings: preferences.servingsPerMeal || 2,
          },
        })
      }
    }

    // Fetch complete meal plan
    const completeMealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlan.id },
      include: {
        items: {
          include: { recipe: true },
          orderBy: [{ date: "asc" }, { mealType: "asc" }],
        },
      },
    })

    return NextResponse.json(completeMealPlan)
  } catch (error) {
    console.error("Meal plan generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    )
  }
}
