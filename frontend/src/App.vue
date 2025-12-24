<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth'

defineOptions({
  name: 'App',
})

const authStore = useAuthStore()

// Initialize auth store immediately
authStore.init()
</script>
