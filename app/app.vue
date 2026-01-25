<script setup lang="ts">
import type { Recipe } from '~~/types/recipes'

// Store recipes with their custom serving sizes
interface MealPlanItem {
  recipe: Recipe
  customServings: number
}

// Initialize meal plan list (client-side only)
const mealPlanList = ref<MealPlanItem[]>([])

// Animation for pot icon on first load
const isAnimating = ref(false)

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
        mealPlanList.value = oldData.map((recipe: Recipe) => ({
          recipe,
          customServings: recipe.servings || 2
        }))
      }
    }
  }

  // Trigger animation on mount
  isAnimating.value = true

  // Stop animation after 2 seconds
  setTimeout(() => {
    isAnimating.value = false
  }, 2000)
})

// Watch for changes and save to localStorage
watch(mealPlanList, (newValue) => {
  if (process.client) {
    localStorage.setItem('meal-plan-list', JSON.stringify(newValue))
  }
}, { deep: true })
</script>

<template>
  <VitePwaManifest />
  <NuxtLoadingIndicator
    :throttle="0"
    color="violet"
  />
  <UNotifications />
  <div>
    <header
      class="bg-white dark:bg-neutral-900 py-1 border-b -mb-px sticky top-0 z-20 border-gray-200 dark:border-neutral-700"
    >
      <div class="mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 h-12">
        <div class="lg:flex-1 flex items-center gap-1.5 min-w-0">
          <div class="font-bold text-xl min-w-0">
            <NuxtLink
              class="flex items-center gap-2"
              to="/"
            >
              <img
                src="/cookmate-logo.png"
                alt="CookMate Logo"
                class="h-10 w-auto dark:invert-0 invert"
                :class="{ 'cooking-animation': isAnimating }"
              />
              <span class="truncate">
                cookmate
              </span>
            </NuxtLink>
          </div>
        </div>

        <div class="flex items-center justify-end lg:flex-1 gap-1.5">
          <ProfileDropdown />
        </div>
      </div>
    </header>

    <main class="mt-4">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>
  </div>
</template>

<style scoped>
.cooking-animation {
  animation: cooking 0.5s ease-in-out infinite;
  transform-origin: center bottom;
}

@keyframes cooking {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-3px) rotate(-2deg);
  }
  50% {
    transform: translateY(-5px) rotate(0deg);
  }
  75% {
    transform: translateY(-3px) rotate(2deg);
  }
}
</style>
