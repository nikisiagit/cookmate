<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { Recipe } from '~~/types/recipes'

// Store recipes with their custom serving sizes
interface MealPlanItem {
  recipe: Recipe
  customServings: number
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const onToggleColorMode = () => {
  colorMode.value === 'light' ? colorMode.preference = 'dark' : colorMode.preference = 'light'
}

const disconnect = ref(false)
const { loggedIn, clear } = useUserSession()

async function clearSession() {
  disconnect.value = true

  await clear().finally(() => disconnect.value = false)
}

const mealPlanList = useStorage<MealPlanItem[]>('meal-plan-list', [])

// Animation for pot icon on first load
const isAnimating = ref(false)

onMounted(() => {
  // Trigger animation on mount
  isAnimating.value = true

  // Stop animation after 2 seconds
  setTimeout(() => {
    isAnimating.value = false
  }, 2000)
})
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
              <UIcon
                name="noto:pot-of-food"
                size="28"
                :class="{ 'cooking-animation': isAnimating }"
              />
              <span class="truncate">
                cookmate
              </span>
            </NuxtLink>
          </div>
        </div>

        <div class="flex items-center justify-end lg:flex-1 gap-1.5">
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
              color="gray"
              variant="ghost"
              aria-label="Theme"
              @click="onToggleColorMode"
            />

            <UButton
              icon="streamline:food-kitchenware-chef-toque-hat-cook-gear-chef-cooking-nutrition-tools-clothes-hat-clothing-food"
              color="primary"
              variant="ghost"
              aria-label="Admin"
              class="ml-2"
              to="/admin/recipes"
            />
            <UButton
              v-if="loggedIn"
              :loading="disconnect"
              icon="i-heroicons-power-20-solid"
              class="ml-2"
              color="red"
              variant="ghost"
              @click="clearSession"
            />
          </ClientOnly>
        </div>
      </div>
    </header>

    <main class="mt-4">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>

    <ClientOnly>
      <div
        class="bg-white dark:bg-neutral-900 fixed bottom-0 left-0 z-10 w-full h-12 border-t border-gray-200 dark:border-neutral-700"
      >
        <div class="grid h-full max-w-lg grid-cols-2 mx-auto">
          <UButton
            icon="heroicons-outline:home"
            color="primary"
            variant="ghost"
            aria-label="Home"
            class="inline-flex flex-col items-center justify-center"
            to="/"
          />

          <UButton
            color="primary"
            variant="ghost"
            aria-label="Meal Planner"
            class="inline-flex flex-col items-center justify-center"
            to="/meal-planner"
          >
            <span class="relative inline-block mt-1">
              <UIcon
                name="humbleicons:calendar"
                size="20"
              />
              <div
                v-if="mealPlanList.length"
                class="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-normal text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-3 dark:border-gray-900"
              >
                {{ mealPlanList.length }}
              </div>
            </span>
          </UButton>
        </div>
      </div>
    </ClientOnly>
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
