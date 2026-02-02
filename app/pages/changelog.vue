<script setup lang="ts">
useSeoMeta({
  title: 'Changelog - CookMate',
  description: 'Latest updates and changes to CookMate.',
})

const changes = [
  {
    date: '2026-01-25',
    title: 'Passkey Authentication',
    description: 'Implemented WebAuthn passkey authentication using @simplewebauthn. Users can now register and sign in using Face ID, Touch ID, or Windows Hello. Removed Google and Apple OAuth options in favor of the more secure and privacy-focused passkey approach.',
  },
  {
    date: '2026-01-24',
    title: 'Carousel Improvements',
    description: 'Updated the homepage carousel to display separate recipe cards that move smoothly from left to right.',
  },
]
</script>

<template>
  <UContainer>
    <main class="py-8">
      <h1 class="text-3xl font-bold mb-8">
        Changelog
      </h1>

      <div class="space-y-8">
        <div
          v-for="(change, index) in changes"
          :key="index"
          class="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow border border-gray-200 dark:border-neutral-700"
        >
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-xl font-semibold">
              {{ change.title }}
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ change.date }}
            </span>
          </div>
          <p class="text-gray-700 dark:text-gray-300">
            {{ change.description }}
          </p>
        </div>
      </div>
    </main>
  </UContainer>
</template>
