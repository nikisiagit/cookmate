<script setup lang="ts">
const emit = defineEmits(['close'])
const { fetch: refreshSession } = useUserSession()
const { isSupported, isLoading: passkeyLoading, error: passkeyError, register, login, clearError } = usePasskeys()

const mode = ref<'login' | 'register'>('login')
const nickname = ref('')
const password = ref('')
const loading = ref(false)

const toast = useToast()

// Clear passkey error when switching modes
watch(mode, () => {
  clearError()
})

async function handlePasskeyLogin() {
  if (passkeyLoading.value) return
  clearError()

  const result = await login(nickname.value || undefined)

  if (result.success) {
    await refreshSession()
    toast.add({
      title: 'Welcome back!',
      description: `Signed in as ${result.user?.nickname}`,
      color: 'green',
    })
    emit('close')
  }
  else if (passkeyError.value) {
    toast.add({
      title: 'Login failed',
      description: passkeyError.value,
      color: 'red',
    })
  }
}

async function handlePasskeyRegister() {
  if (passkeyLoading.value || !nickname.value.trim()) return
  clearError()

  const result = await register(nickname.value.trim())

  if (result.success) {
    await refreshSession()
    toast.add({
      title: 'Account created!',
      description: `Welcome, ${result.user?.nickname}!`,
      color: 'green',
    })
    emit('close')
  }
  else if (passkeyError.value) {
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
    <form
      class="lg:w-1/2 w-full flex flex-col gap-y-4 px-6"
      @submit.prevent="mode === 'register' ? handlePasskeyRegister() : handlePasskeyLogin()"
    >
      <h1 class="text-lg text-gray-300 text-center font-bold">
        {{ mode === 'register' ? 'Create Account' : 'Sign In' }}
      </h1>

      <!-- Mode Toggle -->
      <div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        <button
          type="button"
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          :class="mode === 'login'
            ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
          @click="mode = 'login'"
        >
          Sign In
        </button>
        <button
          type="button"
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          :class="mode === 'register'
            ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
          @click="mode = 'register'"
        >
          Register
        </button>
      </div>

      <!-- Passkey Authentication -->
      <template v-if="isSupported">
        <div class="space-y-3">
          <!-- Nickname input for registration or optional for login -->
          <UInput
            v-model="nickname"
            type="text"
            :placeholder="mode === 'register' ? 'Choose a nickname' : 'Nickname (optional)'"
            icon="i-heroicons-user"
            size="lg"
            class="w-full"
            :required="mode === 'register'"
          />

          <UButton
            :loading="passkeyLoading"
            type="submit"
            block
            size="lg"
            :disabled="mode === 'register' && !nickname.trim()"
          >
            <template #leading>
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a5 5 0 0 1 5 5v3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2V7a5 5 0 0 1 5-5z" />
                <circle cx="12" cy="15" r="1" />
              </svg>
            </template>
            {{ mode === 'register' ? 'Create Passkey' : 'Sign in with Passkey' }}
          </UButton>

          <p class="text-xs text-center text-gray-500 dark:text-gray-400">
            {{ mode === 'register'
              ? 'Use Face ID, Touch ID, or Windows Hello to create your account'
              : 'Use your device\'s biometric authentication'
            }}
          </p>
        </div>
      </template>

      <!-- WebAuthn not supported fallback -->
      <template v-else>
        <div class="text-center py-4">
          <p class="text-amber-600 dark:text-amber-400 text-sm">
            Passkeys are not supported in this browser.
            Please use a modern browser or sign in as admin.
          </p>
        </div>
      </template>

      <!-- Divider -->
      <div class="relative">
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
      <UInput
        v-model="password"
        type="password"
        placeholder="Enter admin password"
        icon="i-heroicons-key"
        size="lg"
        class="w-full"
      />

      <UButton
        :loading="loading"
        type="button"
        label="Sign In as Admin"
        variant="outline"
        block
        class="px-4"
        size="lg"
        :disabled="!password"
        @click="loginAdmin"
      />

      <UButton
        :loading="loading || passkeyLoading"
        type="button"
        label="Close"
        variant="ghost"
        block
        class="px-4"
        size="lg"
        @click="$emit('close')"
      />

      <UButton
        icon="i-heroicons-x-mark"
        color="gray"
        variant="ghost"
        size="xs"
        class="absolute right-2 top-2"
        @click="$emit('close')"
      />
    </form>
  </div>
</template>
