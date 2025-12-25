<template>
  <q-page class="q-pa-md">
    <div class="about-container">
      <h1 class="text-h4 q-mb-md">{{ t('about.title') }}</h1>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-sm">{{ t('about.appName') }}</div>
          <p class="text-body1">
            {{ t('about.description') }}
          </p>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('about.links') }}</div>

          <q-list>
            <template v-for="(link, index) in links" :key="link.href">
              <q-separator v-if="index > 0" />
              <q-item clickable tag="a" :href="link.href" target="_blank">
                <q-item-section avatar>
                  <q-icon :name="link.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ link.label }}</q-item-label>
                  <q-item-label caption>{{ link.caption }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="open_in_new" />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface AboutLink {
  href: string
  icon: string
  label: string
  caption: string
}

const links = computed<AboutLink[]>(() => [
  {
    href: 'https://github.com/mahenzon/example-todo-app-quasar-pocketbase',
    icon: 'code',
    label: t('about.github'),
    caption: t('about.githubCaption'),
  },
  {
    href: 'https://t.me/Khorenyan',
    icon: 'send',
    label: t('about.telegram'),
    caption: '@Khorenyan',
  },
  {
    href: 'https://www.youtube.com/@SurenKhorenyan/',
    icon: 'smart_display',
    label: t('about.youtube'),
    caption: '@SurenKhorenyan',
  },
  {
    href: 'https://mahenzon.ru/',
    icon: 'home',
    label: t('about.homepage'),
    caption: 'mahenzon.ru',
  },
  {
    href: 'https://web.mahenzon.ru/',
    icon: 'school',
    label: t('about.webCourse'),
    caption: 'web.mahenzon.ru',
  },
])

defineOptions({
  name: 'AboutPage',
})
</script>

<style scoped lang="scss">
.about-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
