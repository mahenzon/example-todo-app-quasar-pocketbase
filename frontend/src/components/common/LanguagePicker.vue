<template>
  <q-btn-dropdown flat :label="currentLanguageLabel">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, type MessageLanguages } from 'src/boot/i18n'

defineOptions({
  name: 'LanguagePicker',
})

const { locale } = useI18n()

const languages = [
  { value: 'en-US' as MessageLanguages, label: '🇬🇧' },
  { value: 'ru-RU' as MessageLanguages, label: '🇷🇺' },
]

const currentLocale = computed(() => locale.value as MessageLanguages)

const currentLanguageLabel = computed(() => {
  const lang = languages.find((l) => l.value === currentLocale.value)
  return lang?.label || '🇬🇧'
})

function changeLanguage(lang: MessageLanguages) {
  setLocale(lang)
}
</script>
