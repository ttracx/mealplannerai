"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar,
  Sparkles, 
  Loader2,
  ChefHat,
  ShoppingCart
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface MealPlanItem {
  id: string
  date: string
  mealType: string
  servings: number
  recipe: {
    id: string
    name: string
    totalTime: number
    calories: number
  }
}

interface MealPlan {
  id: string
  name: string
  startDate: string
  endDate: string
  items: MealPlanItem[]
  createdAt: string
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function MealPlansPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [days, setDays] = useState("7")
  const [meals, setMeals] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
  })
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)
  const [creatingList, setCreatingList] = useState(false)

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const fetchMealPlans = async () => {
    try {
      const res = await fetch("/api/meal-plans")
      if (res.ok) {
        const data = await res.json()
        setMealPlans(data)
      }
    } catch (error) {
      console.error("Failed to fetch meal plans:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMealPlan = async () => {
    setGenerating(true)
    try {
      const mealsPerDay = Object.entries(meals)
        .filter(([, enabled]) => enabled)
        .map(([type]) => type)

      const res = await fetch("/api/meal-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: parseInt(days),
          mealsPerDay,
          startDate: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        const newPlan = await res.json()
        setMealPlans([newPlan, ...mealPlans])
        setGenerateOpen(false)
        setSelectedPlan(newPlan)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to generate meal plan")
      }
    } catch (error) {
      console.error("Failed to generate meal plan:", error)
      alert("Failed to generate meal plan")
    } finally {
      setGenerating(false)
    }
  }

  const createShoppingList = async (planId: string) => {
    setCreatingList(true)
    try {
      const res = await fetch("/api/shopping-lists/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealPlanId: planId }),
      })

      if (res.ok) {
        alert("Shopping list created! Check the Shopping Lists page.")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create shopping list")
      }
    } catch (error) {
      console.error("Failed to create shopping list:", error)
    } finally {
      setCreatingList(false)
    }
  }

  const groupByDate = (items: MealPlanItem[]) => {
    return items.reduce((acc, item) => {
      const date = new Date(item.date).toDateString()
      if (!acc[date]) acc[date] = []
      acc[date].push(item)
      return acc
    }, {} as Record<string, MealPlanItem[]>)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meal Plans</h1>
          <p className="text-muted-foreground">Your weekly meal calendars</p>
        </div>
        <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" /> Generate Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Meal Plan</DialogTitle>
              <DialogDescription>
                Create an AI-powered meal plan for the week
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Number of Days</Label>
                <Select value={days} onValueChange={setDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Meals to Include</Label>
                <div className="space-y-2">
                  {Object.entries(meals).map(([meal, checked]) => (
                    <div key={meal} className="flex items-center gap-2">
                      <Checkbox
                        id={meal}
                        checked={checked}
                        onCheckedChange={(c) => setMeals({ ...meals, [meal]: !!c })}
                      />
                      <Label htmlFor={meal} className="capitalize">{meal}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generateMealPlan} disabled={generating}>
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {mealPlans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mealPlans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedPlan(plan)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>
                  {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{plan.items.length} meals planned</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No meal plans yet</p>
            <Button onClick={() => setGenerateOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" /> Generate Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Meal Plan Detail Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPlan && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPlan.name}</DialogTitle>
                <DialogDescription>
                  {formatDate(selectedPlan.startDate)} - {formatDate(selectedPlan.endDate)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {Object.entries(groupByDate(selectedPlan.items)).map(([date, items]) => (
                  <div key={date}>
                    <h3 className="font-semibold mb-3">
                      {DAYS[new Date(date).getDay()]} - {formatDate(date)}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {items
                        .sort((a, b) => {
                          const order = { breakfast: 0, lunch: 1, dinner: 2 }
                          return (order[a.mealType as keyof typeof order] || 3) - 
                                 (order[b.mealType as keyof typeof order] || 3)
                        })
                        .map((item) => (
                        <Card key={item.id}>
                          <CardHeader className="pb-2">
                            <Badge variant="outline" className="w-fit capitalize">
                              {item.mealType}
                            </Badge>
                            <CardTitle className="text-base">{item.recipe.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm text-muted-foreground">
                            <p>{item.recipe.totalTime} min • {item.recipe.calories} cal</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => createShoppingList(selectedPlan.id)}
                  disabled={creatingList}
                  className="gap-2"
                >
                  {creatingList ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  Create Shopping List
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
