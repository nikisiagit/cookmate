<script setup lang="ts">
import type { Recipe } from '~~/types/recipes'

const props = defineProps<{
  recipe: Recipe
  index?: number
  isSaved?: boolean
  includeLink?: boolean
  showAddButton?: boolean
}>()

const emit = defineEmits(['addToMealPlan', 'removeFromMealPlan', 'discard'])

function onAddToMealPlan() {
  emit('addToMealPlan', props.recipe)
}

function onRemoveFromMealPlan() {
  emit('removeFromMealPlan', props.recipe.id)
}

function onDiscard() {
  emit('discard', props.index, props.recipe.id)
}

const ui = {
  footer: { base: 'flex justify-between rounded p-4 shadow dark:bg-neutral-800 transform border border-neutral-100 transition-all hover:shadow-md dark:border-neutral-700', padding: 'sm:px-2 p-2' },
  header: { padding: 'p-0 sm:px-0' },
  body: { padding: 'p-2 sm:px-2 sm:p-2' },
}
</script>

<template>
  <UCard
    class="relative h-full flex flex-col justify-between rounded-xl overflow-hidden"
    :ui="ui"
  >
    <template #header>
      <h3
        v-if="index !== undefined"
        class="text-xl font-medium text-center py-2"
      >
        Meal {{ index + 1 }}
      </h3>

      <NuxtLinkConditional
        :is-link="includeLink"
        :to="`/recipes/${recipe.id}`"
      >
        <NuxtImg
          height="300"
          width="400"
          class="h-44 w-full object-cover rounded-t-xl"
          :src="recipe.imageUrl"
          :alt="recipe.name"
        />
      </NuxtLinkConditional>
    </template>

    <NuxtLinkConditional
      :is-link="includeLink"
      :to="`/recipes/${recipe.id}`"
    >
      <div class="flex items-start">
        <div class="w-full">
          <div class="font-semibold text-primary">
            {{ recipe.name }}
          </div>
          <div class="dark:text-neutral-200 flex my-1 items-center">
            <UIcon
              class="mr-1"
              name="i-heroicons-clock"
              size="20"
            />
            {{ `${recipe.hours ? recipe.hours + 'h' : ''} ${recipe.minutes ? recipe.minutes + 'm' : ''}` }} |
            {{ recipe.servings }}
            <UIcon
              class="ml-1"
              name="humbleicons:users"
              size="20"
            />
          </div>
        </div>
      </div>

      <span
        v-if="index !== undefined"
        class="dark:text-neutral-200 line-clamp-2 text-sm font-serif tracking-wide text-base"
      >
        {{ recipe.description }}
      </span>
    </NuxtLinkConditional>

    <template
      v-if="index !== undefined || showAddButton"
      #footer
    >
      <!-- <div class="w-full flex justify-between p-4"> -->
      <UButton
        variant="ghost"
        :icon="isSaved ? 'i-heroicons-calendar' : 'i-heroicons-plus'"
        size="lg"
        class="w-5/12 justify-center"
        :disabled="isSaved"
        @click="onAddToMealPlan"
      >
        <span v-if="!isSaved">Keep</span>
        <span v-else>Saved</span>
      </UButton>

      <UButton
        v-if="isSaved"
        variant="ghost"
        icon="humbleicons:times"
        size="lg"
        color="red"
        class="w-5/12 ml-2 justify-center"
        @click="onRemoveFromMealPlan"
      >
        Remove
      </UButton>

      <UButton
        v-else-if="index !== undefined"
        variant="ghost"
        icon="i-heroicons-trash"
        size="lg"
        color="red"
        class="w-5/12 ml-2 justify-center"
        @click="onDiscard"
      >
        Discard
      </UButton>
      <!-- </div> -->
    </template>
  </UCard>
</template>

<style scoped>
.recipe-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.recipe-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>
