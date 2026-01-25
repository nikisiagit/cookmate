<script setup lang="ts">
const emit = defineEmits(['close'])
const { fetch: refreshSession } = useUserSession()
const { isSupported, isLoading: passkeyLoading, error: passkeyError, register, login, clearError } = usePasskeys()

const view = ref<'login' | 'register'>('login')
const password = ref('')
const loading = ref(false)

const toast = useToast()

// Clear error when switching views
watch(view, () => {
  clearError()
})

async function handlePasskeyAuth() {
  if (passkeyLoading.value) return
  clearError()

  const result = await login()

  if (result.success) {
    await refreshSession()
    toast.add({
      title: 'Welcome back!',
      description: `Signed in as ${result.user?.nickname}`,
      color: 'green',
    })
    emit('close')
  }
  else if (passkeyError.value && !passkeyError.value.includes('cancelled')) {
    toast.add({
      title: 'Authentication failed',
      description: passkeyError.value,
      color: 'red',
    })
  }
}

async function handlePasskeyRegister() {
  if (passkeyLoading.value) return
  clearError()

  const result = await register()

  if (result.success) {
    await refreshSession()
    toast.add({
      title: 'Account created!',
      description: `Welcome, ${result.user?.nickname}! Your food-themed nickname has been assigned.`,
      color: 'green',
    })
    emit('close')
  }
  else if (passkeyError.value && !passkeyError.value.includes('cancelled')) {
    toast.add({
      title: 'Registration failed',
      description: passkeyError.value,
      color: 'red',
    })
  }
}

async function loginAdmin() {
  if (loading.value || !password.value) return
  loading.value = true
  await $fetch('/api/auth', {
    method: 'POST',
    body: { password: password.value },
  })
    .then(async () => {
      await refreshSession()
      emit('close')
    })
    .catch((err) => {
      toast.add({
        title: `Error ${err.statusCode}`,
        description: `${err.data?.message || err.message}. Please try again`,
        color: 'red',
      })
    })
  loading.value = false
}
</script>

<template>
  <div class="justify-center flex flex-col gap-y-4 items-center grow w-full">
    <div class="lg:w-1/2 w-full flex flex-col gap-y-4 px-6">
      <h1 class="text-xl text-gray-900 dark:text-gray-100 text-center font-bold">
        {{ view === 'login' ? 'Welcome Back' : 'Join CookMate' }}
      </h1>
      
      <p class="text-sm text-gray-500 dark:text-gray-400 text-center -mt-2">
        {{ view === 'login' ? 'Sign in to access your meal plans' : 'Create an account to save your recipes' }}
      </p>

      <!-- VIEW: LOGIN -->
      <template v-if="view === 'login'">
        <template v-if="isSupported">
          <UButton
            :loading="passkeyLoading"
            type="button"
            block
            size="xl"
            @click="handlePasskeyAuth"
          >
            <template #leading>
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a5 5 0 0 1 5 5v3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2V7a5 5 0 0 1 5-5z" />
                <circle cx="12" cy="15" r="1" />
              </svg>
            </template>
            Sign in with Passkey
          </UButton>
          
          <p class="text-xs text-center text-gray-500 dark:text-gray-400">
            Secure login with Face ID, Touch ID, or Windows Hello
          </p>
        </template>

        <template v-else>
           <div class="text-center py-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p class="text-amber-600 dark:text-amber-400 text-sm">
              Passkeys are not supported in this browser.
            </p>
          </div>
        </template>

        <!-- Switch to Register -->
        <div class="text-center mt-2">
          <span class="text-sm text-gray-500">New to CookMate?</span>
          <button 
            type="button" 
            class="ml-1 text-sm font-semibold text-primary-500 hover:underline focus:outline-none"
            @click="view = 'register'"
          >
            Create an account
          </button>
        </div>
      </template>

      <!-- VIEW: REGISTER -->
      <template v-if="view === 'register'">
        <template v-if="isSupported">
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center mb-2">
            <div class="text-3xl mb-2">🧑‍🍳</div>
            <h3 class="font-medium text-gray-900 dark:text-white">Fun Nicknames</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              We'll assign you a unique food-themed nickname automatically!
            </p>
          </div>
        
          <UButton
            :loading="passkeyLoading"
            type="button"
            block
            size="xl"
            @click="handlePasskeyRegister"
          >
            <template #leading>
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </template>
            Create Passkey Account
          </UButton>
        </template>

        <template v-else>
           <div class="text-center py-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p class="text-amber-600 dark:text-amber-400 text-sm">
              Passkeys are not supported in this browser.
            </p>
          </div>
        </template>

        <!-- Switch to Login -->
        <div class="text-center mt-2">
          <span class="text-sm text-gray-500">Already have an account?</span>
          <button 
            type="button" 
            class="ml-1 text-sm font-semibold text-primary-500 hover:underline focus:outline-none"
            @click="view = 'login'"
          >
            Sign in
          </button>
        </div>
      </template>

      <!-- Divider -->
      <div class="relative my-2">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">
            Admin access
          </span>
        </div>
      </div>

      <!-- Admin Password Login -->
      <form @submit.prevent="loginAdmin" class="w-full space-y-3">
        <UInput
          v-model="password"
          type="password"
          placeholder="Admin password"
          icon="i-heroicons-key"
          size="lg"
          class="w-full"
        />

        <UButton
          :loading="loading"
          type="submit"
          label="Sign In as Admin"
          variant="outline"
          block
          size="lg"
          :disabled="!password"
        />
      </form>

      <UButton
        icon="i-heroicons-x-mark"
        color="gray"
        variant="ghost"
        size="xs"
        class="absolute right-2 top-2"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
