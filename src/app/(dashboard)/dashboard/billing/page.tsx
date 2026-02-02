"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Crown,
  Check,
  Loader2,
  CreditCard
} from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Subscription {
  isActive: boolean
  currentPeriodEnd: string | null
  subscriptionId: string | null
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [priceId, setPriceId] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
    fetchPriceId()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/user/subscription")
      if (res.ok) {
        const data = await res.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPriceId = async () => {
    // The price ID will be set after we create the Stripe product
    // For now, we'll fetch it from an API or use a stored value
    const res = await fetch("/api/stripe/price")
    if (res.ok) {
      const data = await res.json()
      setPriceId(data.priceId)
    }
  }

  const handleCheckout = async () => {
    if (!priceId) {
      alert("Subscription not available yet")
      return
    }

    setCheckoutLoading(true)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })

      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      } else {
        alert("Failed to start checkout")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to start checkout")
    } finally {
      setCheckoutLoading(false)
    }
  }

  const features = [
    "Unlimited AI recipe generation",
    "Personalized meal plans",
    "Smart shopping lists",
    "Nutritional tracking",
    "Ingredient substitutions",
    "Weekly meal calendar",
    "Export & share recipes",
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription</p>
      </div>

      {subscription?.isActive ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  MealPlanner Pro
                </CardTitle>
                <CardDescription>You have an active subscription</CardDescription>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Next billing date</p>
              <p className="font-semibold">
                {subscription.currentPeriodEnd 
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <Badge className="w-fit mx-auto mb-2">Upgrade</Badge>
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
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={checkoutLoading || !priceId}
            >
              {checkoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Subscribe Now
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Cancel anytime. No questions asked.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
