import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateRecipe(params: {
  preferences: {
    isVegetarian?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean
    isDairyFree?: boolean
    isKeto?: boolean
    isPaleo?: boolean
    isLowCarb?: boolean
    allergies?: string[]
    dislikedFoods?: string[]
    cuisinePreferences?: string[]
    maxPrepTime?: number
    servings?: number
  }
  mealType: string
  additionalInstructions?: string
}) {
  const { preferences, mealType, additionalInstructions } = params

  const dietaryRestrictions = []
  if (preferences.isVegetarian) dietaryRestrictions.push('vegetarian')
  if (preferences.isVegan) dietaryRestrictions.push('vegan')
  if (preferences.isGlutenFree) dietaryRestrictions.push('gluten-free')
  if (preferences.isDairyFree) dietaryRestrictions.push('dairy-free')
  if (preferences.isKeto) dietaryRestrictions.push('keto')
  if (preferences.isPaleo) dietaryRestrictions.push('paleo')
  if (preferences.isLowCarb) dietaryRestrictions.push('low-carb')

  const prompt = `Generate a ${mealType} recipe with the following requirements:

Dietary restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'none'}
Allergies to avoid: ${preferences.allergies?.length ? preferences.allergies.join(', ') : 'none'}
Foods to avoid: ${preferences.dislikedFoods?.length ? preferences.dislikedFoods.join(', ') : 'none'}
Preferred cuisines: ${preferences.cuisinePreferences?.length ? preferences.cuisinePreferences.join(', ') : 'any'}
Maximum prep time: ${preferences.maxPrepTime ? `${preferences.maxPrepTime} minutes` : 'no limit'}
Servings: ${preferences.servings || 2}
${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}

Respond with a JSON object in this exact format:
{
  "name": "Recipe Name",
  "description": "Brief description of the dish",
  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "servings": 4,
  "ingredients": [
    {"name": "ingredient name", "amount": 1, "unit": "cup", "notes": "optional notes"}
  ],
  "instructions": [
    {"step": 1, "description": "Step description"}
  ],
  "calories": 400,
  "protein": 25,
  "carbs": 35,
  "fat": 15,
  "fiber": 5,
  "sugar": 8,
  "sodium": 500,
  "cuisine": "Italian",
  "mealType": ["dinner"],
  "dietTags": ["vegetarian", "gluten-free"]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional chef and nutritionist. Generate delicious, healthy recipes that match the given requirements. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content)
}

export async function suggestIngredientSubstitution(params: {
  ingredient: string
  reason?: string
  dietaryRestrictions?: string[]
}) {
  const { ingredient, reason, dietaryRestrictions } = params

  const prompt = `Suggest substitutions for "${ingredient}"${reason ? ` (reason: ${reason})` : ''}.
${dietaryRestrictions?.length ? `Must be compatible with: ${dietaryRestrictions.join(', ')}` : ''}

Respond with a JSON object:
{
  "originalIngredient": "${ingredient}",
  "substitutions": [
    {
      "name": "substitute name",
      "ratio": "1:1 or specific ratio",
      "notes": "any tips for using this substitute",
      "dietaryTags": ["vegan", "gluten-free"]
    }
  ]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a culinary expert. Suggest practical ingredient substitutions that maintain flavor and texture as much as possible.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content)
}

export async function generateMealPlan(params: {
  preferences: {
    isVegetarian?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean
    isDairyFree?: boolean
    allergies?: string[]
    dislikedFoods?: string[]
    cuisinePreferences?: string[]
    calorieTarget?: number
    servings?: number
  }
  days: number
  mealsPerDay: string[]
}) {
  const { preferences, days, mealsPerDay } = params

  const dietaryRestrictions = []
  if (preferences.isVegetarian) dietaryRestrictions.push('vegetarian')
  if (preferences.isVegan) dietaryRestrictions.push('vegan')
  if (preferences.isGlutenFree) dietaryRestrictions.push('gluten-free')
  if (preferences.isDairyFree) dietaryRestrictions.push('dairy-free')

  const prompt = `Generate a ${days}-day meal plan with the following requirements:

Meals per day: ${mealsPerDay.join(', ')}
Dietary restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'none'}
Allergies to avoid: ${preferences.allergies?.length ? preferences.allergies.join(', ') : 'none'}
Foods to avoid: ${preferences.dislikedFoods?.length ? preferences.dislikedFoods.join(', ') : 'none'}
Preferred cuisines: ${preferences.cuisinePreferences?.length ? preferences.cuisinePreferences.join(', ') : 'variety'}
${preferences.calorieTarget ? `Daily calorie target: ${preferences.calorieTarget}` : ''}
Servings per meal: ${preferences.servings || 2}

Generate varied, balanced meals. Respond with JSON:
{
  "mealPlan": [
    {
      "day": 1,
      "meals": [
        {
          "mealType": "breakfast",
          "recipe": {
            "name": "Recipe Name",
            "description": "Brief description",
            "prepTime": 15,
            "cookTime": 10,
            "totalTime": 25,
            "servings": 2,
            "ingredients": [{"name": "ingredient", "amount": 1, "unit": "cup"}],
            "instructions": [{"step": 1, "description": "Step"}],
            "calories": 350,
            "protein": 15,
            "carbs": 40,
            "fat": 12,
            "cuisine": "American",
            "dietTags": []
          }
        }
      ]
    }
  ]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional meal planner and nutritionist. Create balanced, delicious meal plans that are practical to prepare.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.9,
    max_tokens: 4000,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content)
}

export async function analyzeNutrition(ingredients: { name: string; amount: number; unit: string }[]) {
  const ingredientList = ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`).join('\n')

  const prompt = `Analyze the nutritional content of these ingredients (combined total):

${ingredientList}

Respond with JSON:
{
  "totalNutrition": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 0
  },
  "breakdown": [
    {
      "ingredient": "name",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  ],
  "healthNotes": ["note about nutritional benefits or concerns"]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a nutritionist. Provide accurate nutritional estimates for ingredients.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content)
}
