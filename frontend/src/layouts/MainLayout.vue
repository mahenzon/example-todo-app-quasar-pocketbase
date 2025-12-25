<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat to="/" no-caps class="text-h6">{{ t('app.title') }}</q-btn>
        <q-space />

        <q-btn flat to="/about" :label="t('nav.about')" />

        <LanguagePicker class="q-ml-sm" />

        <div v-if="authStore.user" class="q-ml-sm">
          {{ authStore.user.email }}
          <q-btn flat round icon="logout" @click="logout" :title="t('nav.logout')" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import LanguagePicker from 'src/components/common/LanguagePicker.vue'

defineOptions({
  name: 'MainLayout',
})

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

async function logout() {
  authStore.logout()
  await router.push('/login')
}
</script>
