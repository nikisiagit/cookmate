<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { Recipe } from '~~/types/recipes'

const dummyRecipes = recipesDummyData()

const mealAmount = ref(1)
const recipes = ref<Recipe[]>([])
const mealPlanList = useStorage<Recipe[]>('meal-plan-list', [])
// Track saved recipe IDs
const savedRecipes = ref<number[]>([])
// Excluded recipe IDs
const excludedIds = ref<number[]>([])

const isLoadingRecipes = ref(false)
// loading state for each recipe
const loadingStates = ref<boolean[]>([])

const setMealAmount = (value: number) => {
  mealAmount.value = value
}

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
    mealPlanList.value.push(recipe)
    savedRecipes.value.push(recipe.id)
  }
}

// Remove a recipe from the meal plan
function removeFromMealPlan(recipeId: number) {
  mealPlanList.value = mealPlanList.value.filter(recipe => recipe.id !== recipeId)
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
    <main class="pb-[90px]">
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
        <h1 class="text-center text-2xl font-semibold mt-8">
          Let fortune decide your meals this week
        </h1>
        <h2 class="text-center text-lg font-semibold mt-8">
          How many meals would you like ?
        </h2>
        <AmountMealSelector
          class="mb-8"
          @update:meal-amount="setMealAmount"
        />
        <UCarousel
          v-if="dummyRecipes.length"
          :items="dummyRecipes"
          :ui="{ item: 'basis-full sm:basis-1/2 md:basis-1/3' }"
          class="rounded-lg overflow-hidden mx-auto max-w-5xl"
          arrows
          indicators
          :autoplay="{ delay: 3000 }"
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
      </template>
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
