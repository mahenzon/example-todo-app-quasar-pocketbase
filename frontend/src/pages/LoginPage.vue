<template>
  <q-card style="width: 300px">
    <q-card-section>
      <div class="text-h6">{{ t('auth.login') }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          filled
          v-model="email"
          :label="t('auth.email')"
          type="email"
          autocomplete="off"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || t('validation.required')]"
        />

        <q-input
          filled
          v-model="password"
          :label="t('auth.password')"
          type="password"
          autocomplete="off"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || t('validation.required')]"
        />

        <div>
          <q-btn :label="t('auth.login')" type="submit" color="primary" />
          <q-btn :label="t('auth.register')" to="/register" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const onSubmit = async () => {
  try {
    await authStore.login(email.value, password.value)
    // Check if there's a redirect query parameter
    const redirectPath = route.query.redirect as string
    if (redirectPath) {
      await router.push(redirectPath)
    } else {
      await router.push('/')
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: t('auth.loginFailed'),
    })
    console.error(error)
  }
}
</script>
