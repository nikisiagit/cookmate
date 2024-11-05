<script setup lang="ts">
const ui = {
  footer: { base: 'flex justify-between rounded p-4 shadow dark:bg-neutral-800 transform border border-neutral-100 transition-all hover:shadow-md dark:border-neutral-700', padding: 'sm:px-2 p-2' },
  header: { padding: 'p-0 sm:px-0' },
  body: { padding: 'p-2 sm:px-2 sm:p-2' },
}
</script>

<template>
  <UCard
    class="relative h-full flex flex-col justify-between"
    :ui="ui"
  >
    <template #header>
      <USkeleton
        class="h-10 mb-4"
        :ui="{ rounded: 'rounded-none' }"
      />

      <USkeleton
        class="h-44 w-50"
        :ui="{ rounded: 'rounded-none' }"
      />
    </template>

    <div class="space-y-2 my-4">
      <USkeleton class="h-4 w-[250px]" />
      <USkeleton class="h-4 w-[200px]" />
    </div>

    <template #footer>
      <USkeleton class="h-10" />
    </template>
  </UCard>
</template>
