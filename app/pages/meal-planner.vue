<script setup lang="ts">
import type { Recipe } from '~~/types/recipes'
import { categorizeIngredient, type IngredientCategory } from '~/utils/ingredientCategories'

// Store recipes with their custom serving sizes
interface MealPlanItem {
  recipe: Recipe
  customServings: number
}

// Initialize meal plan list (client-side only)
const mealPlanList = ref<MealPlanItem[]>([])
const showShoppingList = ref(false)
const servingSize = ref(2)

onMounted(() => {
  // Load from localStorage on client side only
  if (process.client) {
    const stored = localStorage.getItem('meal-plan-list')
    if (stored) {
      try {
        mealPlanList.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse meal plan list:', e)
      }
    }

    // Migrate old format to new format (one-time migration)
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
  }
})

// Watch for changes and save to localStorage
watch(mealPlanList, (newValue) => {
  if (process.client) {
    localStorage.setItem('meal-plan-list', JSON.stringify(newValue))
  }
}, { deep: true })

// Scale ingredient quantities based on serving size
function scaleRecipeIngredients(recipe: Recipe, targetServings: number): Recipe {
  if (!recipe.servings || recipe.servings === 0) return recipe
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return recipe

  const scale = targetServings / recipe.servings

  return {
    ...recipe,
    servings: targetServings,
    ingredients: recipe.ingredients.map(ingredient => ({
      ...ingredient,
      qty: Number((ingredient.qty * scale).toFixed(2))
    }))
  }
}

// Generate shopping list from meal plan
const shoppingList = computed(() => {
  if (!mealPlanList.value.length) return []

  const ingredientMap = new Map<string, { name: string, qty: number, unit: string }>()

  // Use the current serving size for ALL recipes
  mealPlanList.value.forEach(mealPlanItem => {
    const scaledRecipe = scaleRecipeIngredients(mealPlanItem.recipe, servingSize.value)

    if (!scaledRecipe.ingredients || !Array.isArray(scaledRecipe.ingredients)) return

    scaledRecipe.ingredients.forEach(ingredient => {
      const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!
        existing.qty += ingredient.qty
      } else {
        ingredientMap.set(key, {
          name: ingredient.name,
          qty: ingredient.qty,
          unit: ingredient.unit
        })
      }
    })
  })

  return Array.from(ingredientMap.values()).map(item => ({
    ...item,
    qty: Number(item.qty.toFixed(2))
  }))
})

// Group ingredients by category
const categorizedShoppingList = computed(() => {
  const list = shoppingList.value
  const categories: Record<IngredientCategory, typeof list> = {
    'Veg': [],
    'Fruit': [],
    'Dairy': [],
    'Meat/Fish': [],
    'Bakery': [],
    'Pantry': [],
    'Household': [],
    'Other': []
  }

  list.forEach(item => {
    const category = categorizeIngredient(item.name)
    if (categories[category]) {
      categories[category].push(item)
    } else {
      categories['Other'].push(item)
    }
  })

  return categories
})

// Remove item from meal plan
function removeFromMealPlan(index: number) {
  if (confirm('Remove this recipe from your meal plan?')) {
    mealPlanList.value.splice(index, 1)
  }
}

// Move item up
function moveUp(index: number) {
  if (index > 0) {
    const temp = mealPlanList.value[index]!
    mealPlanList.value[index] = mealPlanList.value[index - 1]!
    mealPlanList.value[index - 1] = temp
  }
}

// Move item down
function moveDown(index: number) {
  if (index < mealPlanList.value.length - 1) {
    const temp = mealPlanList.value[index]!
    mealPlanList.value[index] = mealPlanList.value[index + 1]!
    mealPlanList.value[index + 1] = temp
  }
}

// Copy shopping list to clipboard
async function copyShoppingList() {
  let text = 'CookMate Shopping List\n'
  
  for (const [category, items] of Object.entries(categorizedShoppingList.value)) {
    if (items.length === 0) continue
    text += `\n[${category}]\n`
    text += items.map(item => `- ${item.name}: ${item.qty} ${item.unit}`).join('\n')
  }

  try {
    await navigator.clipboard.writeText(text)
    const toast = useToast()
    toast.add({
      title: 'Copied!',
      description: 'Categorized shopping list copied to clipboard',
      color: 'green'
    })
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

useSeoMeta({
  title: 'Meal Planner - CookMate',
  ogTitle: 'Meal Planner - CookMate',
  ogType: 'website',
  description: 'CookMate is a simple app that manage your recipes and plan your meals.',
  ogDescription: 'CookMate is a simple app that manage your recipes and plan your meals.',
  ogImage: '/logo.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <UContainer>
    <main>
      <div class="flex items-center justify-between my-8">
        <h1 class="text-2xl font-semibold">
          Your Meal Plan
        </h1>
        <div class="flex items-center gap-4">
          <!-- Serving size selector -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Servings:</span>
            <div class="flex items-center gap-2">
              <UButton
                icon="heroicons-solid:minus"
                size="xs"
                color="gray"
                @click="servingSize > 1 && servingSize--"
              />
              <span class="text-lg font-semibold min-w-[2rem] text-center">{{ servingSize }}</span>
              <UButton
                icon="heroicons-solid:plus"
                size="xs"
                color="gray"
                @click="servingSize < 12 && servingSize++"
              />
            </div>
          </div>

          <UButton
            v-if="mealPlanList.length > 0"
            icon="heroicons:shopping-cart-20-solid"
            color="primary"
            @click="showShoppingList = true"
          >
            Shopping List
          </UButton>
        </div>
      </div>

      <div v-if="mealPlanList.length === 0" class="text-center py-16">
        <p class="text-gray-500 mb-4">Your meal plan is empty</p>
        <UButton to="/" color="primary">
          Go to Randomiser
        </UButton>
      </div>

      <!-- Meal plan list with reorder and remove -->
      <div v-else class="space-y-4">
        <div
          v-for="(item, index) in mealPlanList"
          :key="item.recipe.id"
          class="flex items-center gap-4 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700"
        >
          <!-- Recipe Image -->
          <NuxtLink :to="`/recipes/${item.recipe.id}`" class="flex-shrink-0">
            <img
              :src="item.recipe.imageUrl || '/recipe-placeholder.png'"
              :alt="item.recipe.name"
              class="w-20 h-20 object-cover rounded-lg"
            >
          </NuxtLink>

          <!-- Recipe Info -->
          <div class="flex-1 min-w-0">
            <NuxtLink :to="`/recipes/${item.recipe.id}`" class="hover:text-primary">
              <h3 class="text-lg font-semibold truncate">{{ item.recipe.name }}</h3>
            </NuxtLink>
            <p class="text-sm text-gray-500">{{ item.recipe.description?.substring(0, 100) }}...</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <UButton
              icon="heroicons:arrow-up-20-solid"
              size="sm"
              color="gray"
              variant="ghost"
              :disabled="index === 0"
              aria-label="Move up"
              @click="moveUp(index)"
            />
            <UButton
              icon="heroicons:arrow-down-20-solid"
              size="sm"
              color="gray"
              variant="ghost"
              :disabled="index === mealPlanList.length - 1"
              aria-label="Move down"
              @click="moveDown(index)"
            />
            <UButton
              icon="heroicons:trash-20-solid"
              size="sm"
              color="red"
              variant="ghost"
              aria-label="Remove"
              @click="removeFromMealPlan(index)"
            />
          </div>
        </div>
      </div>

      <!-- Shopping List Modal -->
      <UModal v-model="showShoppingList" :ui="{ width: 'max-w-2xl' }">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold">Shopping List</h3>
                <div class="text-sm text-gray-500">
                  {{ mealPlanList.length }} {{ mealPlanList.length === 1 ? 'recipe' : 'recipes' }} in meal plan
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-primary">{{ servingSize }}</div>
                <div class="text-xs text-gray-500">{{ servingSize === 1 ? 'serving' : 'servings' }}</div>
              </div>
            </div>
          </template>

          <div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div v-if="shoppingList.length === 0" class="text-center py-8 text-gray-500">
              Add recipes to your meal plan to generate a shopping list
            </div>
            <div v-else>
              <!-- Categorized Ingredients list -->
              <div 
                v-for="(items, category) in categorizedShoppingList" 
                :key="category"
              >
                <div v-if="items.length > 0" class="mb-6">
                  <h4 class="text-sm font-bold text-primary mb-2 uppercase tracking-wide flex items-center gap-2">
                    {{ category }}
                    <span class="text-xs font-normal text-gray-500 normal-case bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {{ items.length }}
                    </span>
                  </h4>
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2">
                    <div
                      v-for="(item, index) in items"
                      :key="index"
                      class="py-2 flex items-center justify-between border-b last:border-0 border-gray-100 dark:border-gray-700/50"
                    >
                      <span class="text-gray-900 dark:text-gray-200 font-medium">{{ item.name }}</span>
                      <span class="text-gray-600 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                        {{ item.qty }} {{ item.unit }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="gray" variant="ghost" @click="showShoppingList = false">
                Close
              </UButton>
              <UButton
                icon="heroicons:clipboard-document-16-solid"
                @click="copyShoppingList"
              >
                Copy to Clipboard
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </main>
  </UContainer>
</template>
