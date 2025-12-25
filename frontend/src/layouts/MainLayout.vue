<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat to="/" no-caps class="text-h6">{{ t('app.title') }}</q-btn>
        <q-space />

        <q-btn flat to="/about" :label="t('nav.about')" />

        <!-- Language Picker -->
        <q-btn-dropdown flat :label="currentLanguageLabel" class="q-ml-sm">
          <q-list>
            <q-item
              v-for="lang in languages"
              :key="lang.value"
              clickable
              v-close-popup
              @click="changeLanguage(lang.value)"
            >
              <q-item-section>
                <q-item-label>{{ lang.label }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="lang.value === currentLocale">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { setLocale, type MessageLanguages } from 'src/boot/i18n'

defineOptions({
  name: 'MainLayout',
})

const { t, locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const languages = [
  { value: 'en-US' as MessageLanguages, label: '🇬🇧' },
  { value: 'ru-RU' as MessageLanguages, label: '🇷🇺' },
]

const currentLocale = computed(() => locale.value as MessageLanguages)

const currentLanguageLabel = computed(() => {
  const lang = languages.find((l) => l.value === currentLocale.value)
  return lang?.label || 'English'
})

function changeLanguage(lang: MessageLanguages) {
  setLocale(lang)
}

async function logout() {
  authStore.logout()
  await router.push('/login')
}
</script>
