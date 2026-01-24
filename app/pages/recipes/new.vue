<script setup lang="ts">
import type { RecipeState, IngredientState, StepState } from '~~/types/recipes'

useSeoMeta({
  title: 'Create a new recipe - Cookmate',
  ogTitle: 'Create a new recipe - Cookmate',
  description: 'Cookmate is a simple app that manage your recipes and plan your meals.',
  ogDescription: 'Cookmate is a simple app that manage your recipes and plan your meals.',
  ogImage: '/logo.png',
})

const difficultyOptions = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
]

const difficulty = ref('easy')
const ingredientsOptions = [
  { label: 'Custom', value: ' ' },
  { label: 'Bottle', value: 'bottle' },
  { label: 'Bunch', value: 'bunch' },
  { label: 'Can', value: 'can' },
  { label: 'Centimeter', value: 'cm' },
  { label: 'Clove', value: 'clove' },
  { label: 'Cup', value: 'cup' },
  { label: 'Dash', value: 'dash' },
  { label: 'Fluid ounce', value: 'fl oz' },
  { label: 'Gram', value: 'g' },
  { label: 'Gallon', value: 'gal' },
  { label: 'Inch', value: 'in' },
  { label: 'Jar', value: 'jar' },
  { label: 'Kilogram', value: 'kg' },
  { label: 'Leaf', value: 'leaf' },
  { label: 'Liter', value: 'l' },
  { label: 'Milliliter', value: 'ml' },
  { label: 'Ounce', value: 'oz' },
  { label: 'Pack', value: 'pack' },
  { label: 'Piece', value: 'piece' },
  { label: 'Pinch', value: 'pinch' },
  { label: 'Pint', value: 'pt' },
  { label: 'Pound', value: 'lb' },
  { label: 'Quart', value: 'qt' },
  { label: 'Slice', value: 'slice' },
  { label: 'Sprig', value: 'sprig' },
  { label: 'Stalk', value: 'stalk' },
  { label: 'Tablespoon', value: 'tbsp' },
  { label: 'Teaspoon', value: 'tsp' },
]

const ingredients = ref('cup')

const recipe = ref<RecipeState>({
  name: '',
  description: '',
  difficulty: 'easy',
  hours: 0,
  minutes: 0,
  servings: 0,
  imageUrl: 'https://koshereveryday.com/wp-content/plugins/whisk-recipes/assets/images/recipe-placeholder.svg',
  sourceUrl: '',
  ratings: 0,
  diet: 'meat',
  calories: 0,
  fat: 0,
  protein: 0,
  carbs: 0,
  sugar: 0,
  ingredients: [
    {
      name: '',
      qty: 1,
      unit: '',
    },
  ],
  steps: [
    {
      description: '',
    },
  ],
})

function addIngredient() {
  recipe.value.ingredients.push({
    name: '',
    qty: 1,
    unit: 'tsp',
  })
}

function removeIngredient(index: number) {
  recipe.value.ingredients.splice(index, 1)
}

function moveUp(index: number, list: any[]) {
  if (index > 0) {
    const item = list.splice(index, 1)[0]
    list.splice(index - 1, 0, item)
  }
}

function moveDown(index: number, list: any[]) {
  if (index < list.length - 1) {
    const item = list.splice(index, 1)[0]
    list.splice(index + 1, 0, item)
  }
}

function addStep() {
  recipe.value.steps.push({
    description: '',
  })
}

function removeStep(index: number) {
  recipe.value.steps.splice(index, 1)
}

const loading = ref(false)
const error = ref()
const extractUrl = ref('')
const extracting = ref(false)
const extractError = ref('')

const extractRecipeFromUrl = async () => {
  if (!extractUrl.value) return

  try {
    extracting.value = true
    extractError.value = ''

    const data = await $fetch('/api/recipes/extract', {
      method: 'POST',
      body: { url: extractUrl.value },
    })

    // Populate the form with extracted data
    recipe.value = {
      ...recipe.value,
      name: data.name || recipe.value.name,
      description: data.description || recipe.value.description,
      servings: data.servings || recipe.value.servings,
      hours: data.hours || recipe.value.hours,
      minutes: data.minutes || recipe.value.minutes,
      difficulty: data.difficulty || recipe.value.difficulty,
      diet: data.diet || recipe.value.diet,
      calories: data.calories || recipe.value.calories,
      fat: data.fat || recipe.value.fat,
      protein: data.protein || recipe.value.protein,
      carbs: data.carbs || recipe.value.carbs,
      sugar: data.sugar || recipe.value.sugar,
      sourceUrl: data.sourceUrl || recipe.value.sourceUrl,
      ingredients: data.ingredients && data.ingredients.length > 0 ? data.ingredients : recipe.value.ingredients,
      steps: data.steps && data.steps.length > 0 ? data.steps : recipe.value.steps,
    }

    const toast = useToast()
    toast.add({
      title: 'Success!',
      description: 'Recipe data extracted. Please review and edit as needed.',
      color: 'green'
    })
  } catch (e: any) {
    extractError.value = e.data?.message || 'Failed to extract recipe data'
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: extractError.value,
      color: 'red'
    })
  } finally {
    extracting.value = false
  }
}

const onSubmit = async (e: Event): Promise<any> => {
  e.preventDefault()

  // validate the form
  if (!canSubmit.value) {
    return
  }

  try {
    loading.value = true

    const response = await $fetch('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe.value),
    })

    console.log(response, 'response')

    navigateTo('/recipes/' + response.id)
  }
  catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error(errorMessage, 'error')

    error.value = errorMessage
  }
  finally {
    loading.value = false
  }
}

const canSubmit = computed(() => {
  return recipe.value.name.length > 0
    && recipe.value.description.length > 0
    && (recipe.value.hours > 0 || recipe.value.minutes > 0)
    && recipe.value.servings > 0
    && recipe.value.imageUrl.length > 0
    && recipe.value.ingredients.length > 0
    && recipe.value.steps.length > 0
    && recipe.value.calories > 0
    && recipe.value.fat > 0
    && recipe.value.protein > 0
    && recipe.value.carbs > 0
  // && recipe.value.sourceUrl.length > 0
})

const dietOptions = [
  {
    label: 'Meat',
    value: 'meat',
  },
  {
    label: 'Vegetarian',
    value: 'vegetarian',
  },
  {
    label: 'Vegan',
    value: 'vegan',
  },
  {
    label: 'Pescatarian',
    value: 'pescatarian',
  },
]

const dietIcon = computed(() => {
  switch (recipe.value.diet) {
    case 'meat':
      return 'tabler:meat'
    case 'vegetarian':
      return 'hugeicons:vegetarian-food'
    case 'vegan':
      return 'lucide:vegan'
    case 'pescatarian':
      return 'icon-park-outline:eggplant'
  }
})

const imageToUpload = ref()
const uploadingImg = ref(false)

async function uploadImage(e?: Event) {
  if (!imageToUpload.value) {
    return
  }

  uploadingImg.value = true

  try {
    console.log(imageToUpload.value, 'image to upload')

    const upload = useUpload('/api/images', { multiple: false })
    const uploadedFile = await upload(imageToUpload.value as HTMLInputElement)
    uploadingImg.value = false

    console.log(uploadedFile, 'uploaded file')
    recipe.value.imageUrl = window.location.origin + '/api/images/' + uploadedFile.pathname
  }
  catch (e) {
    console.error(e, 'error')
    uploadingImg.value = false
  }
  finally {
    uploadingImg.value = false
  }

  // form.reset()
}

async function fileSelection(event: Event) {
  const target = event.target as HTMLInputElement

  if (target.files?.[0]) {
    const compressedImage = await compressImage(target.files[0])

    // Check if the compressed file size exceeds 1MB
    const maxSize = 1048576 // 1MB in bytes

    if (compressedImage.size > maxSize) {
      console.error('The file size is too large, please select a smaller image.')
      return // Exit if the file size is too large
    }

    imageToUpload.value = compressedImage

    // Automatically upload the image (client-side only)
    if (process.client) {
      await uploadImage()
    }
  }
}

async function compressImage(file: File, maxWidth = 600, maxHeight = 600, quality = 0.4): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width
            width = maxWidth
          }
          else {
            width *= maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw the resized image onto the canvas
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert canvas to a Blob and then to a File object
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg', // Adjust type as needed
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            }
            else {
              reject(new Error('Compression failed.'))
            }
          },
          'image/jpeg',
          quality, // Adjust quality (0 to 1) as needed
        )
      }

      img.onerror = () => reject(new Error('Image load error.'))
    }

    reader.onerror = () => reject(new Error('File read error.'))
    reader.readAsDataURL(file)
  })
}

const isOpen = ref(false)
const { loggedIn } = useUserSession()
</script>

<template>
  <UContainer>
    <UModal
      v-model="isOpen"
      class="flex items-center justify-center relative"
      side="left"
      fullscreen
    >
      <LoginForm
        class="z-50 bg-gray-800 rounded-md"
        @close="isOpen = false"
      />
    </UModal>

    <BottomMenu
      v-show="!isOpen && !loggedIn"
      class="bottom-menu"
    >
      <template #logo>
        <img
          src="/logo.png"
          width="29"
          height="20"
        >
      </template>
      <template #description>
        <div class="flex gap-x-4">
          <p class="bottom-menu-description text-sm sm:text-base leading-tight sm:leading-normal">
            Cookmate Admin
          </p>
        </div>
      </template>
      <template #buttons>
        <div class="flex gap-x-2">
          <UButton
            label="Sign in"
            color="green"
            variant="ghost"
            aria-label="Sign in"
            class="mr-4 sm:mr-0"
            @click="isOpen = true"
          />
        </div>
      </template>
    </BottomMenu>

    <div
      v-if="!loggedIn"
      class="mt-2 lg:mt-8 text-white flex flex-col gap-y-4 items-center justify-center h-full w-full pb-8"
    >
      <h1 class="font-medium text-3xl">
        Welcome back, chef!
      </h1>
      <p class="text-gray-400">
        You must be signed in to create a new recipe.
      </p>
    </div>
    <main
      v-else
    >
      <h1 class="flex text-xl font-bold leading-7 text-gray-900 dark:text-white">
        Create a new recipe
      </h1>

      <!-- URL Extraction Card -->
      <div class="mx-auto w-full max-w-screen-2xl py-4">
        <div class="mb-6 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="heroicons:link-20-solid" size="20" class="text-primary-600 dark:text-primary-400" />
            <h2 class="text-lg font-semibold text-primary-900 dark:text-primary-100">Import from URL</h2>
          </div>
          <p class="text-sm text-primary-700 dark:text-primary-300 mb-4">
            Paste a recipe URL and we'll extract the details for you. You can review and edit everything before saving.
          </p>
          <div class="flex gap-2">
            <UInput
              v-model="extractUrl"
              placeholder="https://www.example.com/recipe..."
              class="flex-1"
              size="lg"
              icon="heroicons:globe-alt-20-solid"
              :disabled="extracting"
            />
            <UButton
              :loading="extracting"
              :disabled="!extractUrl || extracting"
              size="lg"
              color="primary"
              @click="extractRecipeFromUrl"
            >
              {{ extracting ? 'Extracting...' : 'Extract' }}
            </UButton>
          </div>
        </div>

        <form @submit="(e) => onSubmit(e)">
          <div class="grid md:grid-cols-4 lg:grid-cols-4">
            <div class="pt-2 pb-3 md:px-4 flex flex-col gap-2 col-span-4 md:col-span-4 lg:col-span-2">
              <span class="dark:text-neutral-200 text-lg font-semibold">Details</span>

              <div class="flex w-full flex-col gap-1 w-full">
                <label for="name"><span class="dark:text-neutral-200 ">Name</span></label>
                <UInput
                  v-model="recipe.name"
                  type="text"
                  class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                  name="name"
                  placeholder="Name"
                />
              </div>
              <div class="flex w-full flex-col gap-1">
                <label for="description"><span class="dark:text-neutral-200 ">Description</span></label>
                <div>
                  <UTextarea
                    v-model="recipe.description"
                    placeholder="Add a description here"
                    class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                    :rows="2"
                    resize
                    name="description"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex items-start gap-2">
                  <div class="flex w-full flex-col gap-1">
                    <label for="cookingTime"><span class="dark:text-neutral-200 ">Hours</span></label>
                    <UInput
                      v-model="recipe.hours"
                      type="number"
                      class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                      name="cookingTimeHours"
                      placeholder="Hours"
                      pattern="[0-9]*"
                      inputmode="numeric"
                    />
                  </div>

                  <div class="flex w-full flex-col gap-1">
                    <label for="cookingTime"><span class="dark:text-neutral-200 ">Minutes</span></label>
                    <UInput
                      v-model="recipe.minutes"
                      type="number"
                      class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                      name="cookingTimeMinutes"
                      placeholder="Minutes"
                      pattern="[0-9]*"
                      inputmode="numeric"
                    />
                  </div>

                  <div class="flex w-full flex-col gap-1 w-full">
                    <label for="servings"><span class="dark:text-neutral-200 ">Servings</span></label>
                    <UInput
                      v-model="recipe.servings"
                      type="number"
                      class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                      name="servings"
                      placeholder="Servings"
                      min="1"
                      pattern="[0-9]*"
                      inputmode="numeric"
                    />
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex items-start gap-2">
                  <div class="flex w-full flex-col gap-1">
                    <label for="difficulty"><span class="dark:text-neutral-200 ">Difficulty</span></label>
                    <USelect
                      v-model="recipe.difficulty"
                      name="difficulty"
                      class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                      :options="difficultyOptions"
                    />
                  </div>

                  <div class="flex w-full flex-col gap-1">
                    <label
                      class="items-center"
                      for="diet"
                    >
                      <span class="dark:text-neutral-200 ml-1">
                        Diet
                      </span>
                    </label>
                    <USelect
                      v-model="recipe.diet"
                      name="diet"
                      class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                      :options="dietOptions"
                    />
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <div class="flex flex-col gap-2">
                  <div class="flex items-start gap-2">
                    <div class="flex w-full flex-col gap-1">
                      <label for="calories">
                        <span class="dark:text-neutral-200 ">
                          Calories
                        </span>
                      </label>

                      <UInput
                        v-model="recipe.calories"
                        type="number"
                        class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                        name="calories"
                        placeholder="Calories"
                        min="0"
                        step="0.1"
                        icon="lets-icons:calories"
                        inputmode="decimal"
                      />
                    </div>

                    <div class="flex w-full flex-col gap-1">
                      <label for="calories">
                        <span class="dark:text-neutral-200 ">
                          Fat
                        </span>
                      </label>

                      <UInput
                        v-model="recipe.fat"
                        type="number"
                        class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                        name="fat"
                        placeholder="Fat"
                        min="0"
                        step="0.1"
                        icon="lets-icons:fat"
                        inputmode="decimal"
                      />
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <div class="flex w-full flex-col gap-1">
                      <label for="calories">
                        <span class="dark:text-neutral-200 ">
                          Protein
                        </span>
                      </label>

                      <UInput
                        v-model="recipe.protein"
                        type="number"
                        class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                        name="protein"
                        placeholder="Protein"
                        min="0"
                        step="0.1"
                        icon="lets-icons:protein"
                        inputmode="decimal"
                      />
                    </div>

                    <div class="flex w-full flex-col gap-1">
                      <label for="calories">
                        <span class="dark:text-neutral-200 ">
                          Carbs
                        </span>
                      </label>

                      <UInput
                        v-model="recipe.carbs"
                        type="number"
                        class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                        name="carbs"
                        placeholder="Carbs"
                        min="0"
                        step="0.1"
                        icon="lets-icons:carbs"
                        inputmode="decimal"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label><span class="dark:text-neutral-200 ">Source URL</span></label>

                <UInput
                  v-model="recipe.sourceUrl"
                  type="text"
                  class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                  name="source_url"
                  placeholder="Enter the url of the recipe"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label><span class="dark:text-neutral-200 ">Image</span></label>

                <input
                  type="file"
                  accept="image/*"
                  name="file"
                  @change="fileSelection"
                >

                <UButton
                  class="my-2"
                  type="button"
                  icon="heroicons:arrow-up-tray-16-solid"
                  :disabled="!imageToUpload"
                  @click="uploadImage"
                >
                  Upload Image
                </UButton>
              </div>

              <div class="flex flex-col gap-1">
                <label><span class="dark:text-neutral-200 ">Image Preview</span></label>

                <div>
                  <NuxtImg
                    :src="recipe.imageUrl"
                    width="80"
                  />
                </div>
              </div>
            </div>

            <div class="py-2 md:px-4 flex flex-col gap-2 col-span-4 md:col-span-4 lg:col-span-2">
              <span class="dark:text-neutral-200 text-lg font-semibold">
                Ingredients
              </span>

              <div
                class="flex flex-col gap-6"
                style="position: relative;"
              >
                <div
                  v-for="(ingredient, index) in recipe.ingredients"
                  :key="index"
                  class="flex flex-col gap-2"
                >
                  <div class="flex items-start gap-2">
                    <div class="flex w-full flex-col gap-1">
                      <UInput
                        v-model="ingredient.qty"
                        type="number"
                        class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                        :name="`ingredients.${index}.qty`"
                        placeholder="Qty"
                        inputmode="decimal"
                      />
                    </div>
                    <div class="flex min-w-fit flex-col gap-1">
                      <USelect
                        v-model="ingredient.unit"
                        :name="`ingredients.${index}.unit`"
                        class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                        :options="ingredientsOptions"
                      />
                    </div>
                    <div class="flex gap-2">
                      <UButton
                        type="button"
                        :disabled="index === 0"
                        icon="heroicons:arrow-up-16-solid"
                        @click="moveUp(index, recipe.ingredients)"
                      />
                      <UButton
                        type="button"
                        :disabled="index === recipe.ingredients.length - 1"
                        icon="heroicons:arrow-down-16-solid"
                        @click="moveDown(index, recipe.ingredients)"
                      />
                      <UButton
                        type="button"
                        icon="heroicons:trash-16-solid"
                        @click="removeIngredient(index)"
                      />
                    </div>
                  </div>
                  <div class="flex w-full flex-col gap-1">
                    <UInput
                      v-model="ingredient.name"
                      type="text"
                      class="text-sm sm:text-base w-full rounded border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                      :name="`ingredients.${index}.name`"
                      placeholder="Ingredient"
                    />
                  </div>
                </div>
                <div class="text-right">
                  <UButton
                    block
                    type="button"
                    icon="heroicons:plus-16-solid"
                    @click="addIngredient"
                  >
                    Add Ingredient
                  </UButton>
                </div>
              </div>
            </div>
            <div class="pt-2 pb-3 md:px-4 flex flex-col gap-2 col-span-4 md:col-span-4 lg:col-span-4">
              <span class="dark:text-neutral-200 text-lg font-semibold">
                Steps
              </span>

              <div
                class="flex flex-col gap-6"
                style="position: relative;"
              >
                <div
                  v-for="(step, index) in recipe.steps"
                  :key="index"
                  class="flex items-start gap-2"
                >
                  <span class="dark:text-neutral-200 pr-2">{{ index + 1 }}.</span>
                  <div class="flex w-full flex-col gap-1">
                    <UTextarea
                      v-model="step.description"
                      placeholder="Step"
                      :rows="3"
                      :name="`steps.${index}.description`"
                      resize
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <UButton
                      type="button"
                      icon="heroicons:trash-16-solid"
                      @click="removeStep(index)"
                    />
                    <UButton
                      type="button"
                      :disabled="index === 0"
                      icon="heroicons:arrow-up-16-solid"
                      @click="moveUp(index, recipe.steps)"
                    />
                    <UButton
                      type="button"
                      :disabled="index === recipe.steps.length - 1"
                      icon="heroicons:arrow-down-16-solid"
                      @click="moveDown(index, recipe.steps)"
                    />
                  </div>
                </div>

                <div class="text-right">
                  <UButton
                    block
                    type="button"
                    icon="heroicons:plus-16-solid"
                    @click="addStep"
                  >
                    Add Step
                  </UButton>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <UButton
              block
              type="submit"
              size="lg"
              :disabled="!canSubmit"
              :loading="loading"
            >
              Create Recipe
            </UButton>
          </div>
        </form>
      </div>
    </main>
  </UContainer>
</template>
