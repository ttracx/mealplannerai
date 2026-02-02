"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Settings,
  Loader2,
  Save,
  X,
  Plus
} from "lucide-react"

interface Preferences {
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isDairyFree: boolean
  isKeto: boolean
  isPaleo: boolean
  isLowCarb: boolean
  isLowSodium: boolean
  allergies: string[]
  dislikedFoods: string[]
  calorieTarget: number | null
  proteinTarget: number | null
  carbTarget: number | null
  fatTarget: number | null
  cuisinePreferences: string[]
  cookingSkillLevel: string
  maxPrepTime: number | null
  servingsPerMeal: number
}

const CUISINES = [
  "American", "Italian", "Mexican", "Chinese", "Japanese", "Indian", 
  "Thai", "Mediterranean", "French", "Greek", "Korean", "Vietnamese"
]

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Preferences>({
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    isKeto: false,
    isPaleo: false,
    isLowCarb: false,
    isLowSodium: false,
    allergies: [],
    dislikedFoods: [],
    calorieTarget: null,
    proteinTarget: null,
    carbTarget: null,
    fatTarget: null,
    cuisinePreferences: [],
    cookingSkillLevel: "intermediate",
    maxPrepTime: null,
    servingsPerMeal: 2,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newAllergy, setNewAllergy] = useState("")
  const [newDislike, setNewDislike] = useState("")

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/preferences")
      if (res.ok) {
        const data = await res.json()
        if (Object.keys(data).length > 0) {
          setPreferences({ ...preferences, ...data })
        }
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (res.ok) {
        alert("Preferences saved!")
      } else {
        alert("Failed to save preferences")
      }
    } catch (error) {
      console.error("Failed to save preferences:", error)
      alert("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !preferences.allergies.includes(newAllergy.trim())) {
      setPreferences({
        ...preferences,
        allergies: [...preferences.allergies, newAllergy.trim()],
      })
      setNewAllergy("")
    }
  }

  const addDislike = () => {
    if (newDislike.trim() && !preferences.dislikedFoods.includes(newDislike.trim())) {
      setPreferences({
        ...preferences,
        dislikedFoods: [...preferences.dislikedFoods, newDislike.trim()],
      })
      setNewDislike("")
    }
  }

  const toggleCuisine = (cuisine: string) => {
    const cuisines = preferences.cuisinePreferences.includes(cuisine)
      ? preferences.cuisinePreferences.filter(c => c !== cuisine)
      : [...preferences.cuisinePreferences, cuisine]
    setPreferences({ ...preferences, cuisinePreferences: cuisines })
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
          <h1 className="text-3xl font-bold">Dietary Preferences</h1>
          <p className="text-muted-foreground">Customize your meal planning experience</p>
        </div>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Preferences
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Diet Types */}
        <Card>
          <CardHeader>
            <CardTitle>Diet Types</CardTitle>
            <CardDescription>Select your dietary restrictions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { key: "isVegetarian", label: "Vegetarian" },
              { key: "isVegan", label: "Vegan" },
              { key: "isGlutenFree", label: "Gluten-Free" },
              { key: "isDairyFree", label: "Dairy-Free" },
              { key: "isKeto", label: "Keto" },
              { key: "isPaleo", label: "Paleo" },
              { key: "isLowCarb", label: "Low Carb" },
              { key: "isLowSodium", label: "Low Sodium" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={preferences[key as keyof Preferences] as boolean}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, [key]: !!checked })
                  }
                />
                <Label htmlFor={key}>{label}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
            <CardDescription>Foods you're allergic to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add allergy..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAllergy()}
              />
              <Button onClick={addAllergy} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.allergies.map((allergy) => (
                <Badge key={allergy} variant="destructive" className="gap-1">
                  {allergy}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setPreferences({
                      ...preferences,
                      allergies: preferences.allergies.filter(a => a !== allergy),
                    })}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disliked Foods */}
        <Card>
          <CardHeader>
            <CardTitle>Disliked Foods</CardTitle>
            <CardDescription>Foods you don't enjoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add disliked food..."
                value={newDislike}
                onChange={(e) => setNewDislike(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDislike()}
              />
              <Button onClick={addDislike} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.dislikedFoods.map((food) => (
                <Badge key={food} variant="secondary" className="gap-1">
                  {food}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setPreferences({
                      ...preferences,
                      dislikedFoods: preferences.dislikedFoods.filter(f => f !== food),
                    })}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cuisine Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Cuisine Preferences</CardTitle>
            <CardDescription>Your favorite cuisines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={preferences.cuisinePreferences.includes(cuisine) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Goals</CardTitle>
            <CardDescription>Daily targets (optional)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input
                type="number"
                placeholder="e.g., 2000"
                value={preferences.calorieTarget || ""}
                onChange={(e) => setPreferences({
                  ...preferences,
                  calorieTarget: e.target.value ? parseInt(e.target.value) : null,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input
                type="number"
                placeholder="e.g., 100"
                value={preferences.proteinTarget || ""}
                onChange={(e) => setPreferences({
                  ...preferences,
                  proteinTarget: e.target.value ? parseInt(e.target.value) : null,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input
                type="number"
                placeholder="e.g., 250"
                value={preferences.carbTarget || ""}
                onChange={(e) => setPreferences({
                  ...preferences,
                  carbTarget: e.target.value ? parseInt(e.target.value) : null,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fat (g)</Label>
              <Input
                type="number"
                placeholder="e.g., 65"
                value={preferences.fatTarget || ""}
                onChange={(e) => setPreferences({
                  ...preferences,
                  fatTarget: e.target.value ? parseInt(e.target.value) : null,
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cooking Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Cooking Preferences</CardTitle>
            <CardDescription>Your cooking style</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Skill Level</Label>
              <Select
                value={preferences.cookingSkillLevel}
                onValueChange={(v) => setPreferences({ ...preferences, cookingSkillLevel: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Prep Time (minutes)</Label>
              <Input
                type="number"
                placeholder="e.g., 30"
                value={preferences.maxPrepTime || ""}
                onChange={(e) => setPreferences({
                  ...preferences,
                  maxPrepTime: e.target.value ? parseInt(e.target.value) : null,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Servings</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={preferences.servingsPerMeal}
                onChange={(e) => setPreferences({
                  ...preferences,
                  servingsPerMeal: parseInt(e.target.value) || 2,
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
