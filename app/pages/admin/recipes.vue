<script setup lang="ts">
useSeoMeta({
  title: 'Admin - Manage Recipes - Cookmate',
  ogTitle: 'Admin - Manage Recipes - Cookmate',
  description: 'Manage your recipes - edit and delete',
  ogDescription: 'Manage your recipes - edit and delete',
  ogImage: '/logo.png',
})

definePageMeta({
  middleware: 'auth',
})

const { loggedIn } = useUserSession()
const isOpen = ref(false)
const searchQuery = ref('')

const { data: recipes, pending, refresh } = await useFetch('/api/recipes/list')

const filteredRecipes = computed(() => {
  if (!recipes.value || !searchQuery.value) {
    return recipes.value
  }

  const query = searchQuery.value.toLowerCase()
  return recipes.value.filter(recipe =>
    recipe.name.toLowerCase().includes(query) ||
    recipe.diet.toLowerCase().includes(query) ||
    recipe.difficulty.toLowerCase().includes(query)
  )
})

const deleteRecipe = async (id: number) => {
  if (!confirm('Are you sure you want to delete this recipe?')) {
    return
  }

  try {
    await $fetch(`/api/recipes/${id}`, {
      method: 'DELETE',
    })

    // Refresh the list
    await refresh()
  }
  catch (error) {
    console.error('Error deleting recipe:', error)
    alert('Failed to delete recipe')
  }
}

const columns = [
  {
    key: 'id',
    label: 'ID',
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'difficulty',
    label: 'Difficulty',
  },
  {
    key: 'diet',
    label: 'Diet',
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]
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
        You must be signed in to manage recipes.
      </p>
    </div>

    <main
      v-else
    >
      <div class="flex flex-col gap-4 mb-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Recipes
          </h1>
          <UButton
            to="/recipes/new"
            icon="heroicons:plus-16-solid"
          >
            Create New Recipe
          </UButton>
        </div>

        <div class="w-full max-w-md">
          <UInput
            v-model="searchQuery"
            icon="heroicons:magnifying-glass-20-solid"
            placeholder="Search recipes by name, diet, or difficulty..."
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="searchQuery !== ''"
                color="gray"
                variant="link"
                icon="heroicons:x-mark-20-solid"
                :padded="false"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>
        </div>
      </div>

      <div
        v-if="pending"
        class="text-center py-8"
      >
        <p class="text-gray-500">Loading recipes...</p>
      </div>

      <div
        v-else-if="!recipes || recipes.length === 0"
        class="text-center py-8"
      >
        <p class="text-gray-500">No recipes found.</p>
        <UButton
          to="/recipes/new"
          class="mt-4"
        >
          Create your first recipe
        </UButton>
      </div>

      <div
        v-else-if="filteredRecipes && filteredRecipes.length === 0"
        class="text-center py-8"
      >
        <p class="text-gray-500">No recipes match your search.</p>
        <UButton
          color="gray"
          variant="ghost"
          class="mt-4"
          @click="searchQuery = ''"
        >
          Clear search
        </UButton>
      </div>

      <UTable
        v-else
        :rows="filteredRecipes"
        :columns="columns"
        class="w-full"
      >
        <template #name-data="{ row }">
          <div class="flex items-center gap-2">
            <NuxtImg
              v-if="row.imageUrl"
              :src="row.imageUrl"
              :alt="row.name"
              width="40"
              height="40"
              class="rounded object-cover"
            />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>

        <template #difficulty-data="{ row }">
          <UBadge
            :color="row.difficulty === 'easy' ? 'green' : row.difficulty === 'medium' ? 'yellow' : 'red'"
            variant="subtle"
          >
            {{ row.difficulty }}
          </UBadge>
        </template>

        <template #diet-data="{ row }">
          <UBadge
            :color="row.diet === 'vegan' ? 'green' : row.diet === 'vegetarian' ? 'blue' : 'gray'"
            variant="subtle"
          >
            {{ row.diet }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              :to="`/recipes/${row.id}`"
              icon="heroicons:eye-16-solid"
              size="xs"
              color="gray"
              variant="ghost"
              aria-label="View recipe"
            />
            <UButton
              :to="`/recipes/${row.id}/edit`"
              icon="heroicons:pencil-16-solid"
              size="xs"
              color="blue"
              variant="ghost"
              aria-label="Edit recipe"
            />
            <UButton
              icon="heroicons:trash-16-solid"
              size="xs"
              color="red"
              variant="ghost"
              aria-label="Delete recipe"
              @click="deleteRecipe(row.id)"
            />
          </div>
        </template>
      </UTable>
    </main>
  </UContainer>
</template>
