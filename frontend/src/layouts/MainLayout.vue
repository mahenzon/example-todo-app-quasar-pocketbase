<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Todo App </q-toolbar-title>

        <div v-if="authStore.user">
          {{ authStore.user.email }}
          <q-btn flat round icon="logout" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'MainLayout',
});

const authStore = useAuthStore();
const router = useRouter();

async function logout() {
  authStore.logout();
  await router.push('/login');
}
</script>
