<script setup lang="ts">
useSeoMeta
({
  title: 'Recipes - CookMate',
  ogTitle: 'Recipes - CookMate',
  ogType: 'website',
  description: 'CookMate is a simple app that manage your recipes and plan your meals.',
  ogDescription: 'CookMate is a simple app that manage your recipes and plan your meals.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})

const { data: recipes, error, status, refresh } = useLazyFetch('/api/recipes')

const search = ref('')

const filteredRecipes = computed(() => {
  if (!search.value) {
    return recipes.value
  }

  return recipes.value && recipes.value.filter((recipe) => {
    return recipe.name.toLowerCase().includes(search.value.toLowerCase())
  })
})
const loading = ref(true)
</script>

<template>
  <UContainer>
    <main class="pb-[90px]">
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

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <NuxtLink
              v-for="recipe in filteredRecipes"
              :key="recipe.id"
              :to="`/recipes/${recipe.id}`"
            >
              <div
                class="rounded p-4 shadow dark:bg-neutral-800 transform border border-neutral-100 transition-all hover:shadow-md dark:border-neutral-700"
              >
                <div class="flex h-80 flex-col gap-4">
                  <div class="-m-4 mb-0 h-48">
                    <NuxtImg
                      class="h-48 w-full rounded-t object-cover"
                      :src="recipe.imageUrl || '/recipe-placeholder.png'"
                      :alt="recipe.name + 'image'"
                      height="300"
                      width="400"
                    />
                  </div>
                  <div class="flex items-start gap-2">
                    <div class="w-full">
                      <div class="text-xl font-semibold text-primary">
                        {{ recipe.name }}
                      </div>
                      <div class=" dark:text-neutral-200 flex mt-1 items-center">
                        <!-- {{ recipe.difficulty }} | -->
                        <UIcon
                          class="mr-1"
                          name="i-heroicons-clock"
                          size="20"
                        />
                        {{ `${recipe.hours ? recipe.hours + 'h' : ''} ${recipe.minutes ? recipe.minutes + 'm' : ''}` }}
                        |
                        {{ recipe.servings }}
                        <UIcon
                          class="ml-1"
                          name="humbleicons:users"
                          size="20"
                        />
                      </div>
                    </div>
                  </div>
                  <span class="dark:text-neutral-200 line-clamp-2 text-sm">
                    {{ recipe.description }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </UContainer>
</template>
