"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChefHat, 
  Plus, 
  Sparkles, 
  Clock, 
  Flame,
  Loader2,
  Search
} from "lucide-react"

interface Recipe {
  id: string
  name: string
  description: string
  prepTime: number
  cookTime: number
  totalTime: number
  servings: number
  ingredients: { name: string; amount: number; unit: string; notes?: string }[]
  instructions: { step: number; description: string }[]
  calories: number
  protein: number
  carbs: number
  fat: number
  cuisine: string
  mealType: string[]
  dietTags: string[]
  isAIGenerated: boolean
  createdAt: string
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [mealType, setMealType] = useState("dinner")
  const [instructions, setInstructions] = useState("")

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/recipes")
      if (res.ok) {
        const data = await res.json()
        setRecipes(data)
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecipe = async () => {
    setGenerating(true)
    try {
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          additionalInstructions: instructions,
        }),
      })

      if (res.ok) {
        const newRecipe = await res.json()
        setRecipes([newRecipe, ...recipes])
        setGenerateOpen(false)
        setSelectedRecipe(newRecipe)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to generate recipe")
      }
    } catch (error) {
      console.error("Failed to generate recipe:", error)
      alert("Failed to generate recipe")
    } finally {
      setGenerating(false)
    }
  }

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase()) ||
    recipe.cuisine?.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold">Recipes</h1>
          <p className="text-muted-foreground">Your collection of delicious recipes</p>
        </div>
        <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" /> Generate Recipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate AI Recipe</DialogTitle>
              <DialogDescription>
                Create a personalized recipe based on your dietary preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Additional Instructions (optional)</Label>
                <Input
                  placeholder="e.g., quick and easy, Mediterranean style..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generateRecipe} disabled={generating}>
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search recipes..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredRecipes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  {recipe.isAIGenerated && (
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" /> AI
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {recipe.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {recipe.totalTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4" /> {recipe.calories} cal
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  {recipe.mealType?.slice(0, 2).map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                  {recipe.cuisine && (
                    <Badge variant="outline" className="text-xs">
                      {recipe.cuisine}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No recipes found</p>
            <Button onClick={() => setGenerateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Generate Your First Recipe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                  {selectedRecipe.isAIGenerated && (
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" /> AI Generated
                    </Badge>
                  )}
                </div>
                <DialogDescription>{selectedRecipe.description}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Prep: {selectedRecipe.prepTime}m
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Cook: {selectedRecipe.cookTime}m
                </span>
                <span>Servings: {selectedRecipe.servings}</span>
              </div>

              <Tabs defaultValue="ingredients">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                </TabsList>
                <TabsContent value="ingredients" className="space-y-2">
                  {selectedRecipe.ingredients?.map((ing, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <span className="font-medium">{ing.amount} {ing.unit}</span>
                      <span>{ing.name}</span>
                      {ing.notes && <span className="text-muted-foreground">({ing.notes})</span>}
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="instructions" className="space-y-3">
                  {selectedRecipe.instructions?.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                        {step.step}
                      </span>
                      <p>{step.description}</p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="nutrition">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="text-2xl font-bold">{selectedRecipe.calories}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="text-2xl font-bold">{selectedRecipe.protein}g</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Carbs</p>
                      <p className="text-2xl font-bold">{selectedRecipe.carbs}g</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Fat</p>
                      <p className="text-2xl font-bold">{selectedRecipe.fat}g</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                {selectedRecipe.dietTags?.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
