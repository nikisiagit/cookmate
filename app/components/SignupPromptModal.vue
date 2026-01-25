<script setup lang="ts">
const emit = defineEmits(['close', 'signup'])
const isOpen = defineModel<boolean>('modelValue', { default: false })

function handleSignup() {
  isOpen.value = false
  emit('signup')
}

function handleClose() {
  isOpen.value = false
  emit('close')
}
</script>

<template>
  <UModal v-model="isOpen">
    <UCard>
      <div class="text-center p-4">
        <div class="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300">
          <UIcon name="i-heroicons-bookmark-square" class="w-8 h-8" />
        </div>
        
        <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Save your Meal Plan?</h3>
        
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Create a free account to keep your meal plan safe and accessible anywhere!
        </p>

        <div class="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-3">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-green-500" />
            <span class="text-sm">Takes less than 10 seconds (Passkey)</span>
          </div>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 text-green-500" />
            <span class="text-sm">It's completely free</span>
          </div>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-clock-arrow-path" class="w-5 h-5 text-green-500" />
            <span class="text-sm">Access meal plan history</span>
          </div>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-document-duplicate" class="w-5 h-5 text-green-500" />
            <span class="text-sm">Duplicate previous plans easily</span>
          </div>
        </div>

        <div class="space-y-3">
          <UButton
            block
            size="xl"
            color="primary"
            variant="solid"
            label="Create My Free Account"
            @click="handleSignup"
          />
          
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            @click="handleClose"
          >
            I'll risk losing my plan
          </button>
        </div>
      </div>
    </UCard>
  </UModal>
</template>
