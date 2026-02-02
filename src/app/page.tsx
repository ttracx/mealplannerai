import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  UtensilsCrossed, 
  Calendar, 
  ShoppingCart, 
  Heart, 
  Sparkles,
  ArrowRight,
  Check,
  Leaf,
  ChefHat,
  BarChart3
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">MealPlanner AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">
          <Sparkles className="mr-1 h-3 w-3" />
          Powered by AI
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          Meal Planning Made Simple
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Let AI create personalized meal plans based on your dietary preferences, 
          generate delicious recipes, and build smart shopping lists automatically.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">View Pricing</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need for Healthy Eating</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>
                Set your dietary needs - vegetarian, vegan, gluten-free, keto, and more. 
                We'll tailor every recipe to your requirements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ChefHat className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Recipe Generation</CardTitle>
              <CardDescription>
                Get unlimited AI-generated recipes tailored to your taste and nutritional goals.
                Fresh ideas every day!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Weekly Meal Calendar</CardTitle>
              <CardDescription>
                Plan your entire week with a visual calendar. Drag, drop, and organize 
                your meals effortlessly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShoppingCart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Shopping Lists</CardTitle>
              <CardDescription>
                Automatically generate shopping lists from your meal plans. 
                Ingredients are organized by category for easy shopping.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Nutritional Tracking</CardTitle>
              <CardDescription>
                Track calories, protein, carbs, and more. See nutritional breakdown 
                for every recipe and meal.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Leaf className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Ingredient Substitutions</CardTitle>
              <CardDescription>
                Out of an ingredient? Get AI-powered substitution suggestions 
                that match your dietary restrictions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20" id="pricing">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-center text-muted-foreground mb-12">Start free, upgrade when you're ready</p>
        
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
              <CardTitle className="text-2xl">MealPlanner Pro</CardTitle>
              <div className="text-4xl font-bold mt-4">
                $7.99<span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Unlimited AI recipe generation",
                  "Personalized meal plans",
                  "Smart shopping lists",
                  "Nutritional tracking",
                  "Ingredient substitutions",
                  "Weekly meal calendar",
                  "Export & share recipes",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block mt-6">
                <Button className="w-full" size="lg">Start 7-Day Free Trial</Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground mt-2">
                No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Meal Planning?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of users who save time and eat healthier with MealPlanner AI.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            <span className="font-semibold">MealPlanner AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 MealPlanner AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
