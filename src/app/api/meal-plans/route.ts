import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { recipe: true },
          orderBy: [{ date: "asc" }, { mealType: "asc" }],
        },
      },
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json(mealPlans)
  } catch (error) {
    console.error("Error fetching meal plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 }
    )
  }
}
