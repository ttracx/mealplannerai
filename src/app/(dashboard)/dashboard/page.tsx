import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  ChefHat, 
  Calendar, 
  ShoppingCart, 
  Sparkles,
  ArrowRight,
  Crown
} from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      recipes: { take: 5, orderBy: { createdAt: "desc" } },
      mealPlans: { take: 1, orderBy: { createdAt: "desc" } },
      shoppingLists: { take: 1, orderBy: { createdAt: "desc" } },
    },
  })

  const hasActiveSubscription = user?.stripeCurrentPeriodEnd && 
    new Date(user.stripeCurrentPeriodEnd) > new Date()

  const recipeCount = await prisma.recipe.count({
    where: { userId: session?.user?.id },
  })

  const mealPlanCount = await prisma.mealPlan.count({
    where: { userId: session?.user?.id },
  })

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || "Chef"}!</h1>
          <p className="text-muted-foreground">Here's what's cooking in your kitchen</p>
        </div>
        {hasActiveSubscription ? (
          <Badge variant="success" className="gap-1">
            <Crown className="h-3 w-3" /> Pro Member
          </Badge>
        ) : (
          <Link href="/dashboard/billing">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" /> Upgrade to Pro
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/recipes?generate=true">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <ChefHat className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Generate Recipe</CardTitle>
              <CardDescription>Create an AI-powered recipe</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/meal-plans?generate=true">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Plan Week</CardTitle>
              <CardDescription>Generate a weekly meal plan</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/shopping">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <ShoppingCart className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Shopping List</CardTitle>
              <CardDescription>View your grocery lists</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/substitutions">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Substitutions</CardTitle>
              <CardDescription>Find ingredient alternatives</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Recipes</CardDescription>
            <CardTitle className="text-4xl">{recipeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Meal Plans</CardDescription>
            <CardTitle className="text-4xl">{mealPlanCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Week's Meals</CardDescription>
            <CardTitle className="text-4xl">
              {user?.mealPlans[0]?.items?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Recipes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Recipes</CardTitle>
            <CardDescription>Your latest culinary creations</CardDescription>
          </div>
          <Link href="/dashboard/recipes">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {user?.recipes && user.recipes.length > 0 ? (
            <div className="space-y-4">
              {user.recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {recipe.totalTime} min • {recipe.calories} cal
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {recipe.isAIGenerated && (
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" /> AI
                      </Badge>
                    )}
                    {recipe.mealType?.map((type) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recipes yet. Start by generating one!</p>
              <Link href="/dashboard/recipes?generate=true">
                <Button className="mt-4" variant="outline">
                  Generate Your First Recipe
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
