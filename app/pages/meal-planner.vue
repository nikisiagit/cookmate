<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { Recipe } from '~~/types/recipes'

// Store recipes with their custom serving sizes
interface MealPlanItem {
  recipe: Recipe
  customServings: number
}

// get localStorage
const mealPlanList = useStorage<MealPlanItem[]>('meal-plan-list', [])

// Migrate old format to new format (one-time migration)
onMounted(() => {
  if (mealPlanList.value.length > 0) {
    const firstItem = mealPlanList.value[0]
    if (firstItem && !('recipe' in firstItem) && 'id' in firstItem) {
      const oldData = mealPlanList.value as unknown as Recipe[]
      mealPlanList.value = oldData.map(recipe => ({
        recipe,
        customServings: recipe.servings || 2
      }))
    }
  }
})

useSeoMeta({
  title: 'Meal Planner - CookMate',
  ogTitle: 'Meal Planner - CookMate',
  ogType: 'website',
  description: 'CookMate is a simple app that manage your recipes and plan your meals.',
  ogDescription: 'CookMate is a simple app that manage your recipes and plan your meals.',
  ogImage: '/logo.png',
  twitterCard: 'summary_large_image',
})

const items = [{
  key: 'meal-plan',
  label: 'Meal Plan',
}, {
  key: 'shopping-list',
  label: 'Shopping List',
}]

const { data: ingredients } = useLazyFetch('/api/recipes/list-ingredients', {
  query: { recipeIds: mealPlanList.value.map(item => item.recipe.id).join(',') },
})

function convertToRecipeFraction(value: number): string {
  // Separate integer and fractional parts
  const integerPart = Math.floor(value)
  const fractionPart = value - integerPart

  // Handle case where the number is a whole number
  if (fractionPart === 0) {
    return integerPart.toString()
  }

  // Common fractions mapping with string keys
  const commonFractions: Record<string, string> = {
    0.5: '1/2',
    0.333: '1/3',
    0.667: '2/3',
    0.25: '1/4',
    0.75: '3/4',
    0.125: '1/8',
    0.375: '3/8',
    0.625: '5/8',
    0.875: '7/8',
  }

  let fractionText = ''

  // Find closest common fraction within a small tolerance
  for (const [key, text] of Object.entries(commonFractions)) {
    if (Math.abs(fractionPart - parseFloat(key)) < 0.01) {
      fractionText = text
      break
    }
  }

  // If no close common fraction, approximate with denominator 10 or 100
  if (!fractionText) {
    const denominator = fractionPart < 0.1 ? 10 : 100
    const fractionValue = Math.round(fractionPart * denominator)
    fractionText = `${fractionValue}/${denominator}`
  }

  // Format output: add integer part if greater than zero
  return integerPart > 0 ? `${integerPart} ${fractionText}` : fractionText
}
</script>

<template>
  <UContainer>
    <main class="pb-[90px]">
      <h1 class="text-2xl font-semibold text-center my-8">
        Your Meal Plan
      </h1>

      <UTabs
        :items="items"
        class="w-full"
      >
        <template #item="{ item }">
          <div
            v-if="item.key === 'meal-plan'"
            class="space-y-3 mt-6"
          >
            <!-- ListRecipes.vue -->
            <div class="grid lg:grid-cols-4 gap-8 items-stretch">
              <RecipeCard
                v-for="mealItem in mealPlanList"
                :key="mealItem.recipe.id"
                include-link
                :recipe="mealItem.recipe"
              />
            </div>
            <!-- end ListRecipes.vue -->
          </div>
          <div
            v-else-if="item.key === 'shopping-list'"
            class="space-y-3 mt-6 pl-2"
          >
            <ul
              v-for="ingredient in ingredients"
              :key="ingredient.id"
            >
              <li class="flex items-center">
                <label :for="ingredient.id">
                  {{ convertToRecipeFraction(ingredient.qty) }} {{ ingredient.unit }}
                  {{ ingredient.name }}
                </label>
              </li>
            </ul>
          </div>
        </template>
      </UTabs>
    </main>
  </UContainer>
</template>
