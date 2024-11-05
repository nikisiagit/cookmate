<script setup lang="ts">
defineProps<{
  items?: number
}>()
</script>

<!-- this component could be static / ssr island component or similar. --->
<template>
  <SkeletonListRecipesCard
    v-for="(_, index) in Array.from({ length: items || 4 })"
    :key="index"
  />
</template>
