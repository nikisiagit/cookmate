<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  to: RouteLocationRaw
  isLink?: boolean
}>()
</script>

<template>
  <NuxtLink
    v-if="isLink"
    :to
  >
    <slot />
  </NuxtLink>
  <template v-else>
    <slot />
  </template>
</template>
