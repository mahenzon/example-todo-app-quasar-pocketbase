<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>{{ t('app.title') }}</q-toolbar-title>
        <q-space />

        <q-btn flat to="/about" :label="t('nav.about')" />

        <LanguagePicker class="q-ml-sm" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex flex-center">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguagePicker from 'src/components/common/LanguagePicker.vue'

defineOptions({
  name: 'AuthLayout',
})

const { t } = useI18n()
</script>
