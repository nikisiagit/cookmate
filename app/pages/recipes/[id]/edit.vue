<script setup lang="ts">
import type { RecipeState } from '~~/types/recipes'

useSeoMeta({
  title: 'Edit Recipe - Cookmate',
  ogTitle: 'Edit Recipe - Cookmate',
  description: 'Edit your recipe',
  ogDescription: 'Edit your recipe',
  ogImage: '/logo.png',
})

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const recipeId = route.params.id

// Fetch existing recipe data
const { data: existingRecipe, pending } = await useFetch(`/api/recipes/${recipeId}`)

const difficultyOptions = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
]

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

const recipe = ref<RecipeState>({
  name: '',
  description: '',
  difficulty: 'easy',
  hours: 0,
  minutes: 0,
  servings: 0,
  imageUrl: '',
  sourceUrl: '',
  ratings: 0,
  diet: 'meat',
  calories: 0,
  fat: 0,
  protein: 0,
  carbs: 0,
  sugar: 0,
  ingredients: [],
  steps: [],
})

// Populate form with existing data
watch(existingRecipe, (data) => {
  if (data) {
    recipe.value = {
      name: data.name || '',
      description: data.description || '',
      difficulty: data.difficulty || 'easy',
      hours: data.hours || 0,
      minutes: data.minutes || 0,
      servings: data.servings || 0,
      imageUrl: data.imageUrl || '',
      sourceUrl: data.sourceUrl || '',
      ratings: data.ratings || 0,
      diet: data.diet || 'meat',
      calories: data.calories || 0,
      fat: data.fat || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      sugar: data.sugar || 0,
      ingredients: data.ingredients || [],
      steps: data.steps || [],
    }
  }
}, { immediate: true })

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

const onSubmit = async (e: Event): Promise<any> => {
  e.preventDefault()

  if (!canSubmit.value) {
    return
  }

  try {
    loading.value = true

    const response = await $fetch(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe.value),
    })

    console.log(response, 'response')

    navigateTo('/recipes/' + recipeId)
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

const imageToUpload = ref()
const uploadingImg = ref(false)

async function uploadImage(e?: Event) {
  if (!imageToUpload.value) {
    return
  }

  uploadingImg.value = true

  try {
    const upload = useUpload('/api/images', { multiple: false })
    const uploadedFile = await upload(imageToUpload.value as HTMLInputElement)
    uploadingImg.value = false

    recipe.value.imageUrl = window.location.origin + '/api/images/' + uploadedFile.pathname
  }
  catch (e) {
    console.error(e, 'error')
    uploadingImg.value = false
  }
  finally {
    uploadingImg.value = false
  }
}

async function fileSelection(event: Event) {
  const target = event.target as HTMLInputElement

  if (target.files?.[0]) {
    const compressedImage = await compressImage(target.files[0])

    const maxSize = 1048576 // 1MB in bytes

    if (compressedImage.size > maxSize) {
      console.error('The file size is too large, please select a smaller image.')
      return
    }

    imageToUpload.value = compressedImage

    // Automatically upload the image
    await uploadImage()
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

        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            }
            else {
              reject(new Error('Compression failed.'))
            }
          },
          'image/jpeg',
          quality,
        )
      }

      img.onerror = () => reject(new Error('Image load error.'))
    }

    reader.onerror = () => reject(new Error('File read error.'))
    reader.readAsDataURL(file)
  })
}

const { loggedIn } = useUserSession()
const isOpen = ref(false)
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
        You must be signed in to edit recipes.
      </p>
    </div>

    <div
      v-else-if="pending"
      class="text-center py-8"
    >
      <p class="text-gray-500">Loading recipe...</p>
    </div>

    <main
      v-else
    >
      <div class="flex items-center gap-4 mb-6">
        <UButton
          icon="heroicons:arrow-left-16-solid"
          variant="ghost"
          @click="$router.back()"
        >
          Back
        </UButton>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Edit Recipe
        </h1>
      </div>

      <div class="mx-auto w-full max-w-screen-2xl py-4">
        <form @submit="(e) => onSubmit(e)">
          <div class="grid md:grid-cols-4 lg:grid-cols-4">
            <div class="pt-2 pb-3 md:px-4 flex flex-col gap-2 col-span-4 md:col-span-4 lg:col-span-2">
              <span class="dark:text-neutral-200 text-lg font-semibold">Details</span>

              <div class="flex w-full flex-col gap-1 w-full">
                <label for="name"><span class="dark:text-neutral-200 ">Name</span></label>
                <UInput
                  v-model="recipe.name"
                  type="text"
                  class="text-sm sm:text-base w-full"
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
                    class="text-sm sm:text-base w-full"
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
                      class="text-sm sm:text-base w-full"
                      name="cookingTimeHours"
                      placeholder="Hours"
                    />
                  </div>

                  <div class="flex w-full flex-col gap-1">
                    <label for="cookingTime"><span class="dark:text-neutral-200 ">Minutes</span></label>
                    <UInput
                      v-model="recipe.minutes"
                      type="number"
                      class="text-sm sm:text-base w-full"
                      name="cookingTimeMinutes"
                      placeholder="Minutes"
                    />
                  </div>

                  <div class="flex w-full flex-col gap-1 w-full">
                    <label for="servings"><span class="dark:text-neutral-200 ">Servings</span></label>
                    <UInput
                      v-model="recipe.servings"
                      type="number"
                      class="text-sm sm:text-base w-full"
                      name="servings"
                      placeholder="Servings"
                      min="1"
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
                      class="text-sm sm:text-base w-full"
                      :options="difficultyOptions"
                    />
                  </div>

                  <div class="flex w-full flex-col gap-1">
                    <label for="diet">
                      <span class="dark:text-neutral-200 ml-1">
                        Diet
                      </span>
                    </label>
                    <USelect
                      v-model="recipe.diet"
                      name="diet"
                      class="text-sm sm:text-base w-full"
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
                        class="text-sm sm:text-base w-full"
                        name="calories"
                        placeholder="Calories"
                        min="0"
                        step="0.1"
                        icon="lets-icons:calories"
                        inputmode="decimal"
                      />
                    </div>

                    <div class="flex w-full flex-col gap-1">
                      <label for="fat">
                        <span class="dark:text-neutral-200 ">
                          Fat
                        </span>
                      </label>

                      <UInput
                        v-model="recipe.fat"
                        type="number"
                        class="text-sm sm:text-base w-full"
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
                      <label for="protein">
                        <span class="dark:text-neutral-200 ">
                          Protein
                        </span>
                      </label>

                      <UInput
                        v-model="recipe.protein"
                        type="number"
                        class="text-sm sm:text-base w-full"
                        name="protein"
                        placeholder="Protein"
                        min="0"
                        step="0.1"
                        icon="lets-icons:protein"
                        inputmode="decimal"
                      />
                    </div>

                    <div class="flex w-full flex-col gap-1">
                      <label for="carbs">
                        <span class="dark:text-neutral-200 ">
                          Carbs
                        </span>
                      </label>

                      <UInput
                        v-model="recipe.carbs"
                        type="number"
                        class="text-sm sm:text-base w-full"
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
                  class="text-sm sm:text-base w-full"
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
                        class="text-sm sm:text-base w-full"
                        :name="`ingredients.${index}.qty`"
                        placeholder="Qty"
                        inputmode="decimal"
                      />
                    </div>
                    <div class="flex min-w-fit flex-col gap-1">
                      <USelect
                        v-model="ingredient.unit"
                        :name="`ingredients.${index}.unit`"
                        class="text-sm sm:text-base w-full"
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
                      class="text-sm sm:text-base w-full"
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
              Update Recipe
            </UButton>
          </div>
        </form>
      </div>
    </main>
  </UContainer>
</template>
