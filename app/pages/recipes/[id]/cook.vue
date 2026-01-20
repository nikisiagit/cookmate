<script setup lang="ts">
import type { Recipe } from '~~/types/recipes'

const route = useRoute()
const recipe = ref<Recipe>()
const currentStepIndex = ref(0)
const showIngredients = ref(true)

const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  const data = await $fetch<Recipe>(`/api/recipes/${route.params.id}`)
  recipe.value = data
  isLoading.value = false

  useSeoMeta({
    title: recipe.value?.name + ' - Cook Mode - Cookmate',
    ogTitle: recipe.value?.name + ' - Cook Mode - Cookmate',
    description: 'Cook mode for ' + recipe.value?.name,
  })

  // Prevent screen from sleeping (Web API)
  if ('wakeLock' in navigator) {
    try {
      await (navigator as any).wakeLock.request('screen')
    } catch (err) {
      console.log('Wake Lock error:', err)
    }
  }
})

const currentStep = computed(() => {
  return recipe.value?.steps[currentStepIndex.value]
})

const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === (recipe.value?.steps.length || 1) - 1)

function nextStep() {
  if (!isLastStep.value) {
    currentStepIndex.value++
  }
}

function previousStep() {
  if (!isFirstStep.value) {
    currentStepIndex.value--
  }
}

function toggleIngredients() {
  showIngredients.value = !showIngredients.value
}

function exitCookMode() {
  navigateTo(`/recipes/${route.params.id}`)
}
</script>

<template>
  <UContainer v-if="recipe">
    <div class="min-h-screen bg-white dark:bg-neutral-900 pb-32">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 p-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white truncate flex-1">
            {{ recipe.name }}
          </h1>
          <UButton
            icon="heroicons:x-mark-20-solid"
            color="gray"
            variant="ghost"
            aria-label="Exit cook mode"
            @click="exitCookMode"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-6">
        <!-- Ingredients Panel (Collapsible) -->
        <div class="mb-6">
          <button
            class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg"
            @click="toggleIngredients"
          >
            <span class="font-semibold text-lg text-gray-900 dark:text-white">
              Ingredients ({{ recipe.ingredients?.length || 0 }})
            </span>
            <UIcon
              :name="showIngredients ? 'heroicons:chevron-up-20-solid' : 'heroicons:chevron-down-20-solid'"
              size="20"
            />
          </button>
          <div
            v-if="showIngredients"
            class="mt-2 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg"
          >
            <ul class="space-y-2">
              <li
                v-for="ingredient in recipe.ingredients"
                :key="ingredient.id"
                class="text-gray-700 dark:text-gray-300"
              >
                <span class="font-medium">{{ ingredient.qty }} {{ ingredient.unit }}</span>
                {{ ingredient.name }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Step Counter -->
        <div class="text-center mb-4">
          <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Step {{ currentStepIndex + 1 }} of {{ recipe.steps?.length || 0 }}
          </div>
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
            <div
              class="bg-primary-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentStepIndex + 1) / (recipe.steps?.length || 1)) * 100}%` }"
            />
          </div>
        </div>

        <!-- Current Step -->
        <div class="mb-8">
          <div class="bg-white dark:bg-neutral-800 border-2 border-primary-500 rounded-xl p-6 min-h-[200px]">
            <p class="text-2xl leading-relaxed text-gray-900 dark:text-white">
              {{ currentStep?.description }}
            </p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 p-4">
          <div class="max-w-4xl mx-auto flex gap-4">
            <UButton
              :disabled="isFirstStep"
              icon="heroicons:chevron-left-20-solid"
              size="xl"
              color="gray"
              variant="outline"
              class="flex-1"
              @click="previousStep"
            >
              Previous
            </UButton>
            <UButton
              v-if="!isLastStep"
              icon="heroicons:chevron-right-20-solid"
              size="xl"
              color="primary"
              class="flex-1"
              trailing
              @click="nextStep"
            >
              Next Step
            </UButton>
            <UButton
              v-else
              icon="heroicons:check-20-solid"
              size="xl"
              color="green"
              class="flex-1"
              @click="exitCookMode"
            >
              Finish
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
