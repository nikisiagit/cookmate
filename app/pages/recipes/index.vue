<script setup lang="ts">
import type { Recipe } from '~~/types/recipes'

useSeoMeta({
  title: 'Recipes - CookMate',
  ogTitle: 'Recipes - CookMate',
  ogType: 'website',
  description: 'CookMate is a simple app that manage your recipes and plan your meals.',
  ogDescription: 'CookMate is a simple app that manage your recipes and plan your meals.',
  ogImage: '/logo.png',
  twitterCard: 'summary_large_image',
})

const { data: recipes, error, status, refresh } = useLazyFetch<Recipe[]>('/api/recipes')

const search = ref('')

const filteredRecipes = computed<Recipe[]>(() => {
  if (!search.value) {
    return recipes.value || []
  }

  return (recipes.value && recipes.value.filter((recipe) => {
    return recipe.name.toLowerCase().includes(search.value.toLowerCase())
  })) || []

})

// Meal Plan Logic
interface MealPlanItem {
  recipe: Recipe
  customServings: number
}

const { loggedIn } = useUserSession()
const mealPlanList = ref<MealPlanItem[]>([])
const savedRecipes = computed(() => mealPlanList.value.map(item => item.recipe.id))
const showSignupPrompt = ref(false)
const showAuthModal = ref(false)
const hasShownPrompt = ref(false)

onMounted(() => {
  if (process.client) {
    const stored = localStorage.getItem('meal-plan-list')
    if (stored) {
      try {
        mealPlanList.value = JSON.parse(stored)
      } catch (e) {
        console.error(e)
      }
    }
  }
})

function saveMealPlan() {
  if (process.client) {
    localStorage.setItem('meal-plan-list', JSON.stringify(mealPlanList.value))
  }
}

function addToMealPlan(recipe: Recipe) {
  if (!savedRecipes.value.includes(recipe.id)) {
    const isFirstItem = mealPlanList.value.length === 0
     
    mealPlanList.value.push({
      recipe,
      customServings: 2 // Default to 2
    })
    saveMealPlan()

    if (!loggedIn.value && isFirstItem && !hasShownPrompt.value) {
      showSignupPrompt.value = true
      hasShownPrompt.value = true
    }
  }
}

function removeFromMealPlan(recipeId: number) {
  mealPlanList.value = mealPlanList.value.filter(item => item.recipe.id !== recipeId)
  saveMealPlan()
}

function openAuthModal() {
  showSignupPrompt.value = false
  showAuthModal.value = true
}
</script>

<template>
  <UContainer>
    <main>
      <!-- Navigation Tabs -->
      <div class="flex justify-center gap-2 mb-6 mt-4">
        <UButton
          size="lg"
          color="gray"
          variant="ghost"
          :to="'/'"
        >
          Randomiser
        </UButton>
        <UButton
          size="lg"
          color="primary"
          variant="solid"
          :to="'/recipes'"
        >
          All Recipes
        </UButton>
      </div>
      <template v-if="status === 'pending'">
        <h1 class="text-2xl font-semibold text-center my-8">
          Loading...
        </h1>
        <div class="grid lg:grid-cols-4 gap-8 items-stretch">
          <SkeletonListRecipes :items="8" />
        </div>
      </template>

      <div
        v-else
        class="mx-auto w-full max-w-screen-2xl"
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="flex w-full flex-col gap-1 w-full">
              <UInput
                v-model="search"
                type="text"
                size="lg"
                class="w-full rounded"
                placeholder="Search any recipes..."
                icon="humbleicons:search"
              />
            </div>
          </div>

          <!-- ListRecipes.vue -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
            <RecipeCard
              v-for="recipe in filteredRecipes"
              :key="recipe.id"
              include-link
              :recipe="recipe"
              :is-saved="savedRecipes.includes(recipe.id)"
              :show-add-button="true"
              @add-to-meal-plan="addToMealPlan"
              @remove-from-meal-plan="removeFromMealPlan"
            />
          </div>
          <!-- end ListRecipes.vue -->
        </div>
      </div>
    </main>
  </UContainer>

  <!-- Signup Prompt Modal -->
  <SignupPromptModal 
    v-model="showSignupPrompt"
    @signup="openAuthModal" 
  />

  <!-- Auth Modal -->
  <UModal v-model="showAuthModal">
    <LoginForm @close="showAuthModal = false" />
  </UModal>
</template>
