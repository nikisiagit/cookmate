<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { Recipe } from '~~/types/recipes'

const route = useRoute()
const recipe = ref<Recipe>()

const isLoading = ref(false)

// Store recipes with their custom serving sizes
interface MealPlanItem {
  recipe: Recipe
  customServings: number
}

// Initialize meal plan list (client-side only)
const mealPlanList = ref<MealPlanItem[]>([])

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
  }
})

// Watch for changes and save to localStorage
watch(mealPlanList, (newValue) => {
  if (process.client) {
    localStorage.setItem('meal-plan-list', JSON.stringify(newValue))
  }
}, { deep: true })

watchEffect(async () => {
  isLoading.value = true
  const data = await $fetch<Recipe>(`/api/recipes/${route.params.id}`)
  recipe.value = data
  isLoading.value = false

  useSeoMeta({
    title: recipe.value?.name + ' - Cookmate',
    ogTitle: recipe.value?.name + ' - Cookmate',
    description: recipe.value?.description,
    ogDescription: recipe.value?.description,
    ogImage: recipe.value?.imageUrl,
  })

  // Load rating statistics
  await loadRatingStats()
})

const ratings = ref(0)
const ratingStats = ref({ averageRating: 0, totalRatings: 0 })
const isSubmittingRating = ref(false)
const measurementSystem = ref<'metric' | 'imperial'>('metric')
const customServingSize = ref(0)

// Initialize serving size when recipe loads
watch(() => recipe.value, (newRecipe) => {
  if (newRecipe && customServingSize.value === 0) {
    customServingSize.value = newRecipe.servings
  }
}, { immediate: true })

// Check if recipe is in meal plan
const isInMealPlan = computed(() => {
  if (!recipe.value) return false
  return mealPlanList.value.some(item => item.recipe.id === recipe.value?.id)
})

// Add recipe to meal plan
function addToMealPlan() {
  if (!recipe.value) return

  if (!isInMealPlan.value) {
    mealPlanList.value.push({
      recipe: recipe.value,
      customServings: customServingSize.value
    })

    const toast = useToast()
    toast.add({
      title: 'Added to Meal Plan!',
      description: `${recipe.value.name} has been added to your meal plan.`,
      color: 'green'
    })
  }
}

// Remove recipe from meal plan
function removeFromMealPlan() {
  if (!recipe.value) return

  mealPlanList.value = mealPlanList.value.filter(item => item.recipe.id !== recipe.value?.id)

  const toast = useToast()
  toast.add({
    title: 'Removed from Meal Plan',
    description: `${recipe.value.name} has been removed from your meal plan.`,
    color: 'orange'
  })
}

// Measurement conversion functions
function convertVolume(qty: number, unit: string, toSystem: 'metric' | 'imperial'): { qty: number, unit: string } {
  const lowerUnit = unit.toLowerCase()

  if (toSystem === 'imperial') {
    // Metric to Imperial
    if (lowerUnit === 'ml') {
      if (qty >= 236.588) return { qty: Number((qty / 236.588).toFixed(2)), unit: 'cup' }
      if (qty >= 14.787) return { qty: Number((qty / 14.787).toFixed(2)), unit: 'tbsp' }
      return { qty: Number((qty / 4.929).toFixed(2)), unit: 'tsp' }
    }
    if (lowerUnit === 'l') return { qty: Number((qty * 4.227).toFixed(2)), unit: 'cup' }
  } else {
    // Imperial to Metric
    if (lowerUnit === 'cup') return { qty: Number((qty * 236.588).toFixed(0)), unit: 'ml' }
    if (lowerUnit === 'tbsp') return { qty: Number((qty * 14.787).toFixed(0)), unit: 'ml' }
    if (lowerUnit === 'tsp') return { qty: Number((qty * 4.929).toFixed(0)), unit: 'ml' }
  }

  return { qty, unit }
}

function convertWeight(qty: number, unit: string, toSystem: 'metric' | 'imperial'): { qty: number, unit: string } {
  const lowerUnit = unit.toLowerCase()

  if (toSystem === 'imperial') {
    // Metric to Imperial
    if (lowerUnit === 'g') {
      if (qty >= 453.592) return { qty: Number((qty / 453.592).toFixed(2)), unit: 'lb' }
      return { qty: Number((qty / 28.35).toFixed(2)), unit: 'oz' }
    }
    if (lowerUnit === 'kg') return { qty: Number((qty * 2.205).toFixed(2)), unit: 'lb' }
  } else {
    // Imperial to Metric
    if (lowerUnit === 'oz') return { qty: Number((qty * 28.35).toFixed(0)), unit: 'g' }
    if (lowerUnit === 'lb') return { qty: Number((qty * 453.592).toFixed(0)), unit: 'g' }
  }

  return { qty, unit }
}

function convertMeasurement(qty: number, unit: string, toSystem: 'metric' | 'imperial'): { qty: number, unit: string } {
  const volumeUnits = ['ml', 'l', 'cup', 'tbsp', 'tsp']
  const weightUnits = ['g', 'kg', 'oz', 'lb']

  if (volumeUnits.includes(unit.toLowerCase())) {
    return convertVolume(qty, unit, toSystem)
  } else if (weightUnits.includes(unit.toLowerCase())) {
    return convertWeight(qty, unit, toSystem)
  }

  return { qty, unit }
}

const displayedIngredients = computed(() => {
  if (!recipe.value) return []

  const scale = customServingSize.value / recipe.value.servings

  return recipe.value.ingredients.map(ingredient => {
    const scaledQty = ingredient.qty * scale
    const converted = convertMeasurement(scaledQty, ingredient.unit, measurementSystem.value)
    return {
      ...ingredient,
      qty: converted.qty,
      unit: converted.unit
    }
  })
})

async function loadRatingStats() {
  try {
    const stats = await $fetch(`/api/recipes/${route.params.id}/ratings`)
    ratingStats.value = stats
  } catch (error) {
    console.error('Error loading rating statistics:', error)
  }
}

async function updateRating(value: number) {
  ratings.value = value
  isSubmittingRating.value = true

  try {
    await $fetch(`/api/recipes/${route.params.id}/ratings`, {
      method: 'POST',
      body: { rating: value }
    })

    // Reload rating statistics
    await loadRatingStats()

    // Show success message
    const toast = useToast()
    toast.add({
      title: 'Rating submitted!',
      description: 'Thank you for rating this recipe.',
      color: 'green'
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to submit rating. Please try again.',
      color: 'red'
    })
  } finally {
    isSubmittingRating.value = false
  }
}

const formattedDescription = computed(() => {
  return recipe.value && recipe.value.description.replace(/\n/g, '<br>') // Replace newline characters with <br> tags
})

// @TODO: move it to utils
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
  <div>
    <SkeletonRecipeDetails v-if="isLoading" />

    <div
      v-else-if="!isLoading && recipe"
      class="px-2 sm:px-6 lg:px-6 mt-4 lg:mt-12"
    >
      <div
        class="max-w-7xl min-h-screen flex flex-col mx-auto pb-20"
        style="width: 98%"
      >
        <div>
          <div>
            <div class="w-full grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-1 lg:gap-16">
              <div class="col-start-1 row-start-1 flex items-center">
                <div>
                  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start w-full gap-3 sm:gap-4">
                    <h1 class="text-2xl sm:text-3xl md:text-5xl leading-tight font-bold text-primary flex-1">
                      {{ recipe.name }}
                    </h1>
                    <div class="flex gap-2 flex-shrink-0">
                      <UButton
                        v-if="!isInMealPlan"
                        icon="i-heroicons-plus-circle"
                        size="md"
                        color="green"
                        @click="addToMealPlan"
                      >
                        <span class="hidden xs:inline">Add to Plan</span>
                      </UButton>
                      <UButton
                        v-else
                        icon="i-heroicons-check-circle"
                        size="md"
                        color="gray"
                        variant="soft"
                        @click="removeFromMealPlan"
                      >
                        <span class="hidden xs:inline">In Plan</span>
                      </UButton>
                      <UButton
                        :to="`/recipes/${recipe.id}/cook`"
                        icon="i-heroicons-fire"
                        size="md"
                        color="primary"
                      >
                        <span class="hidden xs:inline">Cook Mode</span>
                      </UButton>
                    </div>
                  </div>

                  <p class="recipe-description text-lg md:text-lg lg:text-lg leading-normal my-4 sm:mb-6">
                    {{ formattedDescription }}
                  </p>

                  <div class="mb-8 text-lg md:text-xl lg:text-2xl ">
                    <div class="flex items-center mb-2">
                      <UIcon
                        name="i-heroicons-clock"
                        size="24"
                      />
                      <p class="ml-2">
                        Takes about
                        <strong>
                          {{ recipe.hours ? recipe.hours + 'h' : '' }} {{ recipe.minutes ? recipe.minutes + 'm' : '' }}
                        </strong>
                        to make
                      </p>
                    </div>

                    <div class="flex items-center mb-2">
                      <UIcon
                        name="humbleicons:users"
                        size="24"
                      />
                      <p class="ml-2">
                        Recipe for
                        <strong>
                          {{ recipe.servings }}
                          servings
                        </strong>
                      </p>
                    </div>

                    <div class="flex items-center">
                      <template v-if="recipe.diet === 'vegan'">
                        <UIcon
                          class="mr-2"
                          name="lucide:vegan"
                          size="22"
                        /> Vegan
                      </template>

                      <template v-if="recipe.diet === 'meat'">
                        <UIcon
                          class="mr-2"
                          name="tabler:meat"
                          size="26"
                        /> Meat
                      </template>

                      <template v-if="recipe.diet === 'vegetarian'">
                        <UIcon
                          class="mr-2"
                          name="hugeicons:vegetarian-food"
                          size="26"
                        /> Vegetarian
                      </template>

                      <template v-if="recipe.diet === 'pescatarian'">
                        <UIcon
                          class="mr-2"
                          name="icon-park-outline:eggplant"
                          size="26"
                        /> Pescatarian
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1 max-h-96 ">
                <img
                  :src="recipe.imageUrl || '/recipe-placeholder.png'"
                  class="rounded-xl w-full h-full object-cover"
                >
              </div>
            </div>

            <div class="mt-12 mb-10 w-full text-center">
              <hr class="m-auto w-3/4">
            </div>

            <div class="flex w-full gap-8 lg:gap-16 flex-col sm:flex-row">
              <div class="sm:w-1/3 lg:w-1/3 w-full">
                <div class="p-6 block w-full h-fit rounded-xl overflow-hidden border border-gray-200">
                  <div class="flex items-center justify-between mb-3">
                    <p class="text-2xl font-bold text-primary">
                      Ingredients
                    </p>
                    <UButton
                      :icon="measurementSystem === 'metric' ? 'heroicons:beaker-20-solid' : 'heroicons:scale-20-solid'"
                      size="xs"
                      color="gray"
                      variant="ghost"
                      @click="measurementSystem = measurementSystem === 'metric' ? 'imperial' : 'metric'"
                    >
                      {{ measurementSystem === 'metric' ? 'Metric' : 'Imperial' }}
                    </UButton>
                  </div>

                  <!-- Serving Size Selector -->
                  <div class="mb-4 pb-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Servings</span>
                      <div class="flex items-center gap-2">
                        <UButton
                          icon="heroicons-solid:minus"
                          size="xs"
                          color="gray"
                          :disabled="customServingSize <= 1"
                          @click="customServingSize > 1 && customServingSize--"
                        />
                        <span class="text-lg font-semibold min-w-[2rem] text-center">{{ customServingSize }}</span>
                        <UButton
                          icon="heroicons-solid:plus"
                          size="xs"
                          color="gray"
                          :disabled="customServingSize >= 12"
                          @click="customServingSize < 12 && customServingSize++"
                        />
                      </div>
                    </div>
                  </div>
                  <ul
                    v-for="ingredient in displayedIngredients"
                    :key="ingredient.id"
                  >
                    <li class="text-lg lg:text-xl mb-1 lg:mb-2 flex  items-center">
                      <!-- <UCheckbox :id="ingredient.id" class="mr-2" /> -->
                      <label :for="ingredient.name">
                        {{ convertToRecipeFraction(ingredient.qty) }} {{ ingredient.unit }}
                        {{ ingredient.name }}
                      </label>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="sm:w-1/2 lg:w-1/2 w-full">
                <h2 class="text-2xl mb-3 font-bold text-primary">
                  Steps
                </h2>
                <ul class="flex flex-col text-lg gap-4">
                  <li
                    v-for="(step, index) in recipe.steps"
                    :key="step.id"
                    class="flex gap-2"
                  >
                    <span
                      class="flex items-center justify-center bg-neutral-300 dark:bg-gray-600 mt-1 w-5 h-5 rounded-full text-sm"
                    >
                      {{ index + 1 }}
                    </span>
                    <span class="flex-1">{{ step.description }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="mt-12">
              <div>
                <h2 class="font-bold text-3xl pb-4">
                  Nutritional Information
                </h2>
                <p>
                  The table below shows the nutritional information for this recipe per serving.
                </p>
                <div
                  class="mt-4 w-full flex sm:flex-row flex-col items-center gap-6 md:gap-10 py-8 px-6 md:px-12 border border-gray-200 rounded-xl"
                >
                  <div class="w-full">
                    <table class="w-full">
                      <tbody>
                        <tr class="border-b border-gray-200">
                          <td class="text-left pb-2 flex items-center">
                            <UIcon
                              name="lets-icons:calories"
                              size="26"
                            />
                            Calories
                          </td>
                          <td class="text-right font-bold">
                            {{ recipe.calories }}cal
                          </td>
                        </tr>
                        <tr class="border-b border-gray-200">
                          <td class="text-left py-2 flex items-center">
                            <UIcon
                              name="lets-icons:fat"
                              size="24"
                              class="mr-1"
                            />
                            Fat
                          </td>
                          <td class="text-right font-bold">
                            {{ recipe.fat }}g
                          </td>
                        </tr>
                        <tr class="border-b border-gray-200">
                          <td class="text-left py-2 flex items-center">
                            <UIcon
                              name="lets-icons:carbs"
                              size="24"
                              class="mr-1"
                            />
                            Carbs
                          </td>
                          <td class="text-right font-bold">
                            {{ recipe.carbs }}g
                          </td>
                        </tr>
                        <tr class="border-b border-gray-200">
                          <td class="text-left py-2 flex items-center">
                            <UIcon
                              name="lets-icons:protein"
                              size="24"
                              class="mr-1"
                            />
                            Protein
                          </td>
                          <td class="text-right font-bold">
                            {{ recipe.protein }}g
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="recipe.sourceUrl"
              class="mt-12"
            >
              <div>
                <div
                  class="w-full flex sm:flex-row flex-col gap-6 md:gap-10 py-6 lg:py-8 px-6 md:px-12 border border-gray-200 rounded-xl"
                >
                  <div class="shrink-1">
                    <h2 class="font-bold text-3xl pb-4">
                      Source
                    </h2>

                    <a
                      :href="recipe.sourceUrl"
                      target="_blank"
                      class="text-primary flex items-center"
                    >
                      <UIcon
                        class="mr-2"
                        name="i-heroicons-link-20-solid"
                        size="24"
                      />
                      View the original recipe
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-12 w-full text-center">
              <hr class="m-auto w-3/4">
            </div>

            <div class="mt-4 text-center">
              <div v-if="ratingStats.totalRatings > 0" class="mb-4">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ ratingStats.averageRating.toFixed(1) }} / 5
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  Based on {{ ratingStats.totalRatings }} {{ ratingStats.totalRatings === 1 ? 'rating' : 'ratings' }}
                </div>
              </div>
              <StarRating
                v-model="ratings"
                :max-stars="5"
                :disabled="isSubmittingRating"
                @rating-data="updateRating"
              />
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                {{ ratingStats.totalRatings === 0 ? 'Be the first to rate this recipe' : 'Rate this recipe' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
