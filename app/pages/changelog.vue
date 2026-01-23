<script setup lang="ts">
useSeoMeta({
  title: 'Changelog | CookMate',
  description: 'Track all updates and improvements made to CookMate',
})

interface ChangelogEntry {
  date: string
  version?: string
  changes: string[]
}

const changelog: ChangelogEntry[] = [
  {
    date: '2026-01-23',
    changes: [
      'Improved carousel with blurred side images showing 3 recipes at once',
      'Left image smoothly unblurs as it moves to center position',
      'Smaller, more compact carousel images (center 550px, sides 300px)',
      'Hide side images on mobile for better responsiveness',
      'Updated icon colors to green for better visibility',
    ]
  },
  {
    date: '2026-01-23',
    changes: [
      'Redesigned carousel to show single recipe with detailed information',
      'Display recipe name, cooking time, servings, and difficulty on carousel',
      'Smooth horizontal slide transition from right to left',
      'Auto-rotating carousel fetches real recipes from database',
    ]
  },
  {
    date: '2026-01-23',
    changes: [
      'Moved meal plan navigation to top header',
      'Removed bottom navigation bar for cleaner interface',
      'Added meal plan badge showing recipe count',
      'Removed excess bottom padding from all pages',
    ]
  },
  {
    date: '2026-01-23',
    changes: [
      'Added recipe URL extraction feature',
      'Extract recipe data from websites using JSON-LD structured data',
      'Keyword-based nutrition extraction from HTML',
      'Auto-populate recipe form with extracted data',
      'Support for various recipe website formats',
    ]
  },
  {
    date: '2026-01-23',
    changes: [
      'Fixed shopping list to calculate based on randomiser serving size',
      'Shopping list properly scales all ingredients uniformly',
      'Removed shopping list tab from meal planner',
      'Added shopping list button with modal view',
      'Added ability to reorder and remove recipes from meal plan',
    ]
  },
]
</script>

<template>
  <UContainer>
    <main class="py-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Changelog
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Track all the updates and improvements we've made to CookMate
          </p>
        </div>

        <div class="space-y-8">
          <div
            v-for="(entry, index) in changelog"
            :key="index"
            class="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-neutral-700"
          >
            <div class="flex items-center gap-3 mb-4">
              <UIcon
                name="i-heroicons-calendar"
                size="24"
                class="text-primary"
              />
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ new Date(entry.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) }}
                </h2>
                <p
                  v-if="entry.version"
                  class="text-sm text-gray-500 dark:text-gray-400"
                >
                  Version {{ entry.version }}
                </p>
              </div>
            </div>

            <ul class="space-y-2">
              <li
                v-for="(change, changeIndex) in entry.changes"
                :key="changeIndex"
                class="flex items-start gap-3"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  size="20"
                  class="text-green-500 flex-shrink-0 mt-0.5"
                />
                <span class="text-gray-700 dark:text-gray-300">{{ change }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 text-center">
          <UButton
            to="/"
            size="lg"
            variant="outline"
          >
            <UIcon name="i-heroicons-arrow-left" />
            Back to Home
          </UButton>
        </div>
      </div>
    </main>
  </UContainer>
</template>
