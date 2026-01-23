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
            />
          </div>
          <!-- end ListRecipes.vue -->
        </div>
      </div>
    </main>
  </UContainer>
</template>
