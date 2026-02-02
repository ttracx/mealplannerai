import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, Check, ArrowLeft } from "lucide-react"

export default function PricingPage() {
  const features = [
    "Unlimited AI recipe generation",
    "Personalized meal plans",
    "Smart shopping lists",
    "Nutritional tracking",
    "Ingredient substitutions",
    "Weekly meal calendar",
    "Export & share recipes",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">MealPlanner AI</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            One plan with everything you need for healthy eating
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
              <CardTitle className="text-2xl">MealPlanner Pro</CardTitle>
              <div className="text-4xl font-bold mt-4">
                $7.99<span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full" size="lg">
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground">
                No credit card required to start
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
