"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ShoppingCart,
  Loader2,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ShoppingListItem {
  id: string
  name: string
  amount: number | null
  unit: string | null
  category: string | null
  isChecked: boolean
}

interface ShoppingList {
  id: string
  name: string
  startDate: string | null
  endDate: string | null
  items: ShoppingListItem[]
  createdAt: string
}

export default function ShoppingListsPage() {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null)

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      const res = await fetch("/api/shopping-lists")
      if (res.ok) {
        const data = await res.json()
        setLists(data)
        if (data.length > 0) {
          setSelectedList(data[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch shopping lists:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = async (listId: string, itemId: string, isChecked: boolean) => {
    try {
      await fetch(`/api/shopping-lists/${listId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked }),
      })

      // Update local state
      setLists(lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.map(item => 
              item.id === itemId ? { ...item, isChecked } : item
            ),
          }
        }
        return list
      }))

      if (selectedList?.id === listId) {
        setSelectedList({
          ...selectedList,
          items: selectedList.items.map(item =>
            item.id === itemId ? { ...item, isChecked } : item
          ),
        })
      }
    } catch (error) {
      console.error("Failed to update item:", error)
    }
  }

  const groupByCategory = (items: ShoppingListItem[]) => {
    return items.reduce((acc, item) => {
      const category = item.category || "Other"
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    }, {} as Record<string, ShoppingListItem[]>)
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
      <div>
        <h1 className="text-3xl font-bold">Shopping Lists</h1>
        <p className="text-muted-foreground">Your grocery lists from meal plans</p>
      </div>

      {lists.length > 0 ? (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* List selector */}
          <div className="space-y-2">
            <h2 className="font-semibold mb-3">Your Lists</h2>
            {lists.map((list) => (
              <Card
                key={list.id}
                className={`cursor-pointer transition-colors ${
                  selectedList?.id === list.id ? "border-primary" : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedList(list)}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">{list.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {list.items.filter(i => i.isChecked).length}/{list.items.length} items
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Selected list items */}
          <div className="lg:col-span-3">
            {selectedList ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedList.name}</CardTitle>
                  {selectedList.startDate && (
                    <CardDescription>
                      {formatDate(selectedList.startDate)} - {formatDate(selectedList.endDate!)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(groupByCategory(selectedList.items)).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Badge variant="secondary">{category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {items.filter(i => i.isChecked).length}/{items.length}
                          </span>
                        </h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                item.isChecked ? "bg-muted/50 opacity-60" : ""
                              }`}
                            >
                              <Checkbox
                                checked={item.isChecked}
                                onCheckedChange={(checked) => 
                                  toggleItem(selectedList.id, item.id, !!checked)
                                }
                              />
                              <span className={item.isChecked ? "line-through" : ""}>
                                {item.amount && item.unit 
                                  ? `${item.amount} ${item.unit} ` 
                                  : ""}
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <p className="text-muted-foreground">Select a list to view items</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No shopping lists yet</p>
            <p className="text-sm text-muted-foreground">
              Generate a meal plan first, then create a shopping list from it
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
