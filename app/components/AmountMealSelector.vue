<template>
  <form class="max-w-xs mx-auto flex justify-center my-4">
    <div class="relative flex items-center max-w-[8rem]">
      <UButton
        icon="heroicons-solid:minus"
        @click.prevent="decrease"
      />
      <span class="mx-4 text-2xl font-semibold text-center">{{ count }}</span>
      <UButton
        icon="heroicons-solid:plus"
        @click.prevent="increase"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:mealAmount'])
const count = ref(1)

const increase = () => {
  if (count.value < 7) {
    count.value++
    emit('update:mealAmount', count.value)
  }
}

const decrease = () => {
  if (count.value > 1) {
    count.value--
    emit('update:mealAmount', count.value)
  }
}
</script>
