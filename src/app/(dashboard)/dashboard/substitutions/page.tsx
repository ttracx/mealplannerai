"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles,
  Loader2,
  ArrowRight,
  Leaf
} from "lucide-react"

interface Substitution {
  name: string
  ratio: string
  notes: string
  dietaryTags: string[]
}

interface SubstitutionResult {
  originalIngredient: string
  substitutions: Substitution[]
}

export default function SubstitutionsPage() {
  const [ingredient, setIngredient] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SubstitutionResult | null>(null)
  const [history, setHistory] = useState<SubstitutionResult[]>([])

  const findSubstitutions = async () => {
    if (!ingredient.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/substitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient, reason }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setHistory([data, ...history.slice(0, 4)])
        setIngredient("")
        setReason("")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to find substitutions")
      }
    } catch (error) {
      console.error("Failed to find substitutions:", error)
      alert("Failed to find substitutions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ingredient Substitutions</h1>
        <p className="text-muted-foreground">Find alternatives for ingredients you don't have</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Find Substitutes
          </CardTitle>
          <CardDescription>
            Enter an ingredient and we'll suggest alternatives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient">Ingredient</Label>
              <Input
                id="ingredient"
                placeholder="e.g., butter, eggs, milk..."
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && findSubstitutions()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., allergy, vegan, out of stock..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && findSubstitutions()}
              />
            </div>
          </div>
          <Button onClick={findSubstitutions} disabled={loading || !ingredient.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Find Substitutes
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">Substitutes for:</span>
              {result.originalIngredient}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {result.substitutions.map((sub, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      {sub.name}
                    </CardTitle>
                    <CardDescription>Ratio: {sub.ratio}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{sub.notes}</p>
                    <div className="flex flex-wrap gap-1">
                      {sub.dietaryTags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Searches</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setResult(item)}
              >
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{item.originalIngredient}</CardTitle>
                  <CardDescription className="text-xs">
                    {item.substitutions.length} substitutes found
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
