<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const colorMode = useColorMode()

// Use the same storage key as app.vue for meal plan list
interface MealPlanItem {
  recipe: any
  customServings: number
}

// Initialize meal plan list (client-side only)
const mealPlanList = ref<MealPlanItem[]>([])
const disconnect = ref(false)

onMounted(() => {
  // Load from localStorage on client side only
  if (process.client) {
    const stored = localStorage.getItem('meal-plan-list')
    if (stored) {
      try {
        mealPlanList.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse meal plan list:', e)
      }
    }
  }
})

// Watch for changes and save to localStorage
watch(mealPlanList, (newValue) => {
  if (process.client) {
    localStorage.setItem('meal-plan-list', JSON.stringify(newValue))
  }
}, { deep: true })

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})

const isOpen = ref(false)

async function clearSession() {
  disconnect.value = true
  await clear()
  disconnect.value = false
  isOpen.value = false
  navigateTo('/')
}

function onToggleColorMode() {
  isDark.value = !isDark.value
}

const items = computed(() => {
  const menuItems = []

  if (loggedIn.value && user.value) {
    menuItems.push([
      {
        slot: 'account',
        label: 'Account',
        disabled: true,
      },
    ])
  }

  menuItems.push([
    {
      label: 'Meal Planner',
      icon: 'humbleicons:calendar',
      to: '/meal-planner',
      badge: mealPlanList.value.length || undefined,
      click: () => {
        isOpen.value = false
      },
    },
    {
      label: isDark.value ? 'Light Mode' : 'Dark Mode',
      icon: isDark.value ? 'i-heroicons-sun-20-solid' : 'i-heroicons-moon-20-solid',
      click: () => {
        onToggleColorMode()
      },
    },
    {
      label: 'Changelog',
      icon: 'i-heroicons-document-text',
      to: '/changelog',
      click: () => {
        isOpen.value = false
      },
    },
  ])

  if (loggedIn.value && user.value?.role === 'admin') {
    menuItems.push([
      {
        label: 'Admin Panel',
        icon: 'streamline:food-kitchenware-chef-toque-hat-cook-gear-chef-cooking-nutrition-tools-clothes-hat-clothing-food',
        to: '/admin/recipes',
        click: () => {
          isOpen.value = false
        },
      },
    ])
  }

  if (loggedIn.value) {
    menuItems.push([
      {
        label: 'Sign Out',
        icon: 'i-heroicons-power-20-solid',
        click: clearSession,
      },
    ])
  }
  else {
    menuItems.push([
      {
        slot: 'login',
        label: 'Sign In',
      },
    ])
  }

  return menuItems
})

const loginModalOpen = ref(false)

function openLoginModal() {
  isOpen.value = false
  loginModalOpen.value = true
}

// Get user initials for avatar fallback
const userInitials = computed(() => {
  if (!user.value?.nickname) return '?'
  const words = user.value.nickname.split(/(?=[A-Z])/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return user.value.nickname.substring(0, 2).toUpperCase()
})
</script>

<template>
  <ClientOnly>
    <UDropdown
      v-model:open="isOpen"
      :items="items"
      :ui="{ width: 'w-64', item: { disabled: 'cursor-text select-text' } }"
      :popper="{ placement: 'bottom-end' }"
    >
      <UButton
        color="gray"
        variant="ghost"
        aria-label="Profile"
        class="relative"
      >
        <UAvatar
          v-if="loggedIn && user"
          :src="user.avatarUrl"
          :alt="user.nickname"
          size="sm"
        >
          <template v-if="!user.avatarUrl" #fallback>
            {{ userInitials }}
          </template>
        </UAvatar>
        <UIcon
          v-else
          name="i-heroicons-user-circle"
          size="24"
        />
        <span
          v-if="mealPlanList.length"
          class="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-normal text-white bg-red-500 border-2 border-white rounded-full -top-1 -right-1 dark:border-gray-900"
        >
          {{ mealPlanList.length }}
        </span>
      </UButton>

      <template #account>
        <div class="text-left p-2">
          <p class="font-semibold text-gray-900 dark:text-white truncate">
            {{ user?.nickname || 'User' }}
          </p>
          <p v-if="user?.email" class="text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ user.email }}
          </p>
          <p v-if="user?.role === 'admin'" class="text-xs text-primary-500 font-medium mt-1">
            Admin
          </p>
        </div>
      </template>

      <template #login>
        <UButton
          label="Sign In / Sign Up"
          color="primary"
          variant="solid"
          block
          class="m-2"
          @click="openLoginModal"
        />
      </template>

      <template #item="{ item }">
        <span class="truncate">{{ item.label }}</span>
        <UBadge
          v-if="item.badge"
          :label="item.badge"
          color="red"
          variant="solid"
          size="xs"
          class="ml-auto"
        />
        <UIcon
          v-if="item.icon && !item.badge"
          :name="item.icon"
          class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ml-auto"
        />
      </template>
    </UDropdown>

    <!-- Login Modal -->
    <UModal v-model="loginModalOpen">
      <LoginForm @close="loginModalOpen = false" />
    </UModal>
  </ClientOnly>
</template>
