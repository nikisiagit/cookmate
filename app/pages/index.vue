<script setup lang="ts">
import type { Recipe } from '~~/types/recipes'

const dummyRecipes = recipesDummyData()
const carouselRecipes = ref<Recipe[]>([])
const isLoadingCarousel = ref(false)

const mealAmount = ref(1)
const servingSize = ref(2)
const recipes = ref<Recipe[]>([])

// Store recipes with their custom serving sizes
interface MealPlanItem {
  recipe: Recipe
  customServings: number
}

// Initialize meal plan list (client-side only)
const mealPlanList = ref<MealPlanItem[]>([])

// Fetch recipes for carousel
async function fetchCarouselRecipes() {
  isLoadingCarousel.value = true
  try {
    const data = await $fetch<Recipe[]>('/api/recipes/random', {
      query: { limit: 12 }
    })
    if (data && data.length > 0) {
      carouselRecipes.value = data
    } else {
      // Fallback to dummy recipes if no recipes in database
      carouselRecipes.value = dummyRecipes
    }
  } catch (error) {
    console.error('Error fetching carousel recipes:', error)
    carouselRecipes.value = dummyRecipes
  } finally {
    isLoadingCarousel.value = false
  }
}

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

  // Fetch recipes for carousel
  fetchCarouselRecipes()
})

// Watch for changes and save to localStorage
watch(mealPlanList, (newValue) => {
  if (process.client) {
    localStorage.setItem('meal-plan-list', JSON.stringify(newValue))
  }
}, { deep: true })

// Track saved recipe IDs
const savedRecipes = ref<number[]>([])
// Excluded recipe IDs
const excludedIds = ref<number[]>([])

const isLoadingRecipes = ref(false)
// loading state for each recipe
const loadingStates = ref<boolean[]>([])
const showShoppingList = ref(false)

const setMealAmount = (value: number) => {
  mealAmount.value = value
}

const setServingSize = (value: number) => {
  servingSize.value = value
}

// Scale ingredient quantities based on serving size
function scaleRecipeIngredients(recipe: Recipe, targetServings: number): Recipe {
  if (!recipe.servings || recipe.servings === 0) return recipe

  console.log('=== SCALING RECIPE ===')
  console.log('Recipe name:', recipe.name)
  console.log('Recipe data:', JSON.stringify(recipe, null, 2))
  console.log('Has ingredients?', !!recipe.ingredients)
  console.log('Ingredients length:', recipe.ingredients?.length || 0)

  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    console.warn('Recipe has no ingredients array:', recipe.name)
    return recipe
  }

  const scale = targetServings / recipe.servings

  console.log('Original servings:', recipe.servings)
  console.log('Target servings:', targetServings)
  console.log('Scale factor:', scale)

  return {
    ...recipe,
    servings: targetServings,
    ingredients: recipe.ingredients.map(ingredient => {
      const originalQty = ingredient.qty
      const scaledQty = Number((ingredient.qty * scale).toFixed(2))
      console.log(`  ${ingredient.name}: ${originalQty} → ${scaledQty} ${ingredient.unit}`)
      return {
        ...ingredient,
        qty: scaledQty
      }
    })
  }
}

// Generate shopping list from meal plan
const shoppingList = computed(() => {
  console.log('=== GENERATING SHOPPING LIST ===')
  console.log('Current randomiser servingSize:', servingSize.value)
  console.log('Meal plan items:', mealPlanList.value.length)

  if (!mealPlanList.value.length) return []

  const ingredientMap = new Map<string, { name: string, qty: number, unit: string }>()

  // Use the current randomiser serving size for ALL recipes
  mealPlanList.value.forEach((mealPlanItem, index) => {
    console.log(`\nProcessing recipe ${index + 1}:`, mealPlanItem.recipe.name)
    console.log('  Stored customServings:', mealPlanItem.customServings)

    const scaledRecipe = scaleRecipeIngredients(mealPlanItem.recipe, servingSize.value)

    if (!scaledRecipe.ingredients || !Array.isArray(scaledRecipe.ingredients)) {
      console.warn('  Skipping recipe - no ingredients:', scaledRecipe.name)
      return
    }

    scaledRecipe.ingredients.forEach(ingredient => {
      const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!
        console.log(`  Adding to existing ${ingredient.name}: ${existing.qty} + ${ingredient.qty}`)
        existing.qty += ingredient.qty
      } else {
        console.log(`  New ingredient ${ingredient.name}: ${ingredient.qty} ${ingredient.unit}`)
        ingredientMap.set(key, {
          name: ingredient.name,
          qty: ingredient.qty,
          unit: ingredient.unit
        })
      }
    })
  })

  const result = Array.from(ingredientMap.values()).map(item => ({
    ...item,
    qty: Number(item.qty.toFixed(2))
  }))

  console.log('=== FINAL SHOPPING LIST ===')
  console.log('Total unique ingredients:', result.length)
  result.forEach(item => {
    console.log(`  ${item.name}: ${item.qty} ${item.unit}`)
  })

  return result
})

async function fetchRandomRecipes(limit: number, excludedIds: number[] = []): Promise<Recipe[]> {
  const recipes = await $fetch<Recipe[]>('/api/recipes/random', {
    query: {
      limit,
      ...(excludedIds.length > 0 && { excludedIds: excludedIds.join(',') }),
    },
  })

  return recipes || []
}

async function generateRandomRecipes() {
  // clear mealPlanList from the local storage
  mealPlanList.value = []

  try {
    isLoadingRecipes.value = true

    // fetch random recipes
    const randomRecipes = await fetchRandomRecipes(mealAmount.value)

    // set excludedIds with initial recipe IDs
    if (randomRecipes.length) {
      recipes.value = randomRecipes
      excludedIds.value = recipes.value.map(recipe => recipe.id)
    }
  }
  catch (error) {
    console.error('Error fetching random recipes:', error)
  }
  finally {
    isLoadingRecipes.value = false
  }
}

// Add a recipe to the meal plan and mark it as saved
function addToMealPlan(recipe: Recipe) {
  if (!savedRecipes.value.includes(recipe.id)) {
    mealPlanList.value.push({
      recipe,
      customServings: servingSize.value
    })
    savedRecipes.value.push(recipe.id)
  }
}

// Remove a recipe from the meal plan
function removeFromMealPlan(recipeId: number) {
  mealPlanList.value = mealPlanList.value.filter(item => item.recipe.id !== recipeId)
  savedRecipes.value = savedRecipes.value.filter(id => id !== recipeId)
}

// Handle discarding a recipe and replacing it
async function handleDiscardRecipe(index: number, id: number) {
  // Add the discarded recipe's ID to `excludedIds` immediately
  if (!excludedIds.value.includes(id)) {
    excludedIds.value.push(id)
  }

  try {
    loadingStates.value[index] = true

    // Fetch a new random recipe that is not in `excludedIds`
    const newRecipe = (await fetchRandomRecipes(1, excludedIds.value))[0] || null

    // If a unique recipe is fetched, replace the old one
    if (newRecipe && !excludedIds.value.includes(newRecipe.id)) {
      // Add the new recipe's ID to `excludedIds` to prevent re-fetching it
      excludedIds.value.push(newRecipe.id)

      // Replace the recipe at the specified index
      recipes.value = [
        ...recipes.value.slice(0, index),
        newRecipe,
        ...recipes.value.slice(index + 1),
      ]
    }
    else {
      console.warn('No unique recipe found for replacement')
    }
  }
  catch (error) {
    console.error('Error fetching a new recipe:', error)
  }
  finally {
    loadingStates.value[index] = false
  }
}

// Copy shopping list to clipboard
async function copyShoppingList() {
  const text = shoppingList.value
    .map(item => `${item.name}: ${item.qty} ${item.unit}`)
    .join('\n')

  try {
    await navigator.clipboard.writeText(text)
    const toast = useToast()
    toast.add({
      title: 'Copied!',
      description: 'Shopping list copied to clipboard',
      color: 'green'
    })
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

useSeoMeta({
  title: 'CookMate: Your ally in the Kitchen',
  ogTitle: 'CookMate: Your ally in the Kitchen',
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
      <!-- Navigation Tabs -->
      <div class="flex justify-center gap-2 mb-6 mt-4">
        <UButton
          size="lg"
          color="primary"
          variant="solid"
          :to="'/'"
        >
          Randomiser
        </UButton>
        <UButton
          size="lg"
          color="gray"
          variant="ghost"
          :to="'/recipes'"
        >
          All Recipes
        </UButton>
      </div>
      <template v-if="isLoadingRecipes">
        <h1 class="text-2xl font-semibold text-center my-8">
          Generating random recipes...
        </h1>
        <div class="grid lg:grid-cols-4 gap-8 items-stretch">
          <SkeletonListRecipes :items="mealAmount" />
        </div>
      </template>

      <!-- this could be a component randomiser-start.vue --->
      <template v-else-if="!recipes.length && !isLoadingRecipes">
        <h1 class="text-center text-2xl font-semibold mt-8 mb-6">
          Let fortune decide your meals this week
        </h1>
        <h2 class="text-center text-lg font-semibold mt-8">
          How many meals would you like ?
        </h2>
        <AmountMealSelector
          class="mb-8"
          @update:meal-amount="setMealAmount"
        />
        
        <!-- Recipe Carousel -->
        <UCarousel
          v-if="carouselRecipes.length"
          :items="carouselRecipes"
          :ui="{ item: 'basis-full sm:basis-1/2 md:basis-1/3' }"
          class="rounded-lg overflow-hidden mx-auto max-w-5xl"
          arrows
          :autoplay="{ delay: 5000 }"
        >
          <template #default="{ item }">
            <div class="p-2 w-full">
               <RecipeCard
                :recipe="item"
                :include-link="false"
              />
            </div>
          </template>
        </UCarousel>

        <div class="flex justify-center">
          <UButton
            :disabled="mealAmount < 1 || mealAmount > 7"
            class="text-center w-80 rounded-lg p-4 lg:w-1/4 justify-center generate-btn mt-8 rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all transform duration-200 ease-in-out mx-auto"
            size="lg"
            @click="generateRandomRecipes"
          >
            Try your luck
          </UButton>
        </div>
      </template>

      <template v-else>
        <!-- this could be a component randomiser-results.vue --->
        <h1 class="text-2xl font-semibold text-center my-8">
          Here are your random recipes!
        </h1>
        <div class="grid lg:grid-cols-4 gap-8 items-stretch">
          <template
            v-for="(recipe, index) in recipes"
            :key="recipe.id"
          >
            <SkeletonListRecipesCard v-show="loadingStates[index]" />
            <RecipeCard
              v-show="!loadingStates[index]"
              :recipe="recipe"
              :index="index"
              :is-saved="savedRecipes.includes(recipe.id)"
              @add-to-meal-plan="addToMealPlan"
              @remove-from-meal-plan="removeFromMealPlan"
              @discard="handleDiscardRecipe"
            />
          </template>
        </div>

        <!-- Meal Plan Button -->
        <div v-if="mealPlanList.length > 0" class="flex justify-center mt-8">
          <UButton
            icon="heroicons:calendar-20-solid"
            size="lg"
            color="primary"
            to="/meal-planner"
          >
            Take me to my Meal Plan
          </UButton>
        </div>
      </template>

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

          <div class="space-y-6">
            <div v-if="shoppingList.length === 0" class="text-center py-8 text-gray-500">
              Add recipes to your meal plan to generate a shopping list
            </div>
            <div v-else>
              <!-- Recipe list -->
              <div class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recipes</h4>
                <div class="space-y-1">
                  <div
                    v-for="(item, index) in mealPlanList"
                    :key="index"
                    class="text-sm text-gray-600 dark:text-gray-400"
                  >
                    • {{ item.recipe.name }}
                  </div>
                </div>
              </div>

              <!-- Ingredients list -->
              <div>
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ingredients</h4>
                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                  <div
                    v-for="(item, index) in shoppingList"
                    :key="index"
                    class="py-3 flex items-center justify-between"
                  >
                    <span class="text-gray-900 dark:text-white">{{ item.name }}</span>
                    <span class="font-medium text-gray-700 dark:text-gray-300">
                      {{ item.qty }} {{ item.unit }}
                    </span>
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

<style scoped>
.generate-btn {
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.generate-btn:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}
</style>
