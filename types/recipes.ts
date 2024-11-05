export interface Ingredient {
  id: number
  name: string
  qty: number
  unit: string
}

export interface Step {
  id: number
  description: string
}

export interface Recipe {
  id: number
  name: string
  description: string
  hours: number
  minutes: number
  servings: number
  difficulty: string
  imageUrl: string
  ratings: number
  diet: string
  calories: number
  fat: number
  protein: number
  carbs: number
  sugar: number
  sourceUrl: string
  createdAt: number

  ingredients: Ingredient[]
  steps: Step[]
}

export type IngredientState = Omit<Ingredient, 'id'>
export type StepState = Omit<Step, 'id'>

export interface RecipeState
  extends Omit<Recipe, 'id' | 'ingredients' | 'steps' | 'createdAt'> {
  ingredients: IngredientState[]
  steps: StepState[]
}
