import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { categorizeIngredient } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mealPlanId } = await request.json()

    if (!mealPlanId) {
      return NextResponse.json(
        { error: "Meal plan ID required" },
        { status: 400 }
      )
    }

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId, userId: session.user.id },
      include: {
        items: {
          include: { recipe: true },
        },
      },
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      )
    }

    // Aggregate ingredients from all recipes
    const ingredientMap = new Map<string, { amount: number; unit: string; category: string }>()

    for (const item of mealPlan.items) {
      const ingredients = item.recipe.ingredients as Array<{
        name: string
        amount: number
        unit: string
      }>

      for (const ingredient of ingredients) {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`
        const existing = ingredientMap.get(key)
        
        if (existing) {
          existing.amount += ingredient.amount * item.servings
        } else {
          ingredientMap.set(key, {
            amount: ingredient.amount * item.servings,
            unit: ingredient.unit,
            category: categorizeIngredient(ingredient.name),
          })
        }
      }
    }

    // Create shopping list
    const shoppingList = await prisma.shoppingList.create({
      data: {
        userId: session.user.id,
        name: `Shopping List - ${mealPlan.name}`,
        startDate: mealPlan.startDate,
        endDate: mealPlan.endDate,
      },
    })

    // Create shopping list items
    const items = Array.from(ingredientMap.entries()).map(([key, value]) => {
      const name = key.split("-")[0]
      return {
        shoppingListId: shoppingList.id,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: value.amount,
        unit: value.unit,
        category: value.category,
        isChecked: false,
      }
    })

    await prisma.shoppingListItem.createMany({ data: items })

    // Fetch complete shopping list
    const completeList = await prisma.shoppingList.findUnique({
      where: { id: shoppingList.id },
      include: {
        items: { orderBy: { category: "asc" } },
      },
    })

    return NextResponse.json(completeList)
  } catch (error) {
    console.error("Shopping list generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate shopping list" },
      { status: 500 }
    )
  }
}
