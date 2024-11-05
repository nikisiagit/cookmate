<script setup lang="ts">
defineProps<{
  imageUrl: string
  name: string
}>()
</script>

<template>
  <!-- TODO: change to NuxtImg -->
  <div class="recipe-card-blur max-w-xs rounded-lg overflow-hidden">
    <NuxtImg
      class="w-full h-48 object-cover opacity-50 blur-sm"
      :src="imageUrl"
      :alt="name"
    />
  </div>
</template>
