<template>
  <q-card style="width: 300px">
    <q-card-section>
      <div class="text-h6">{{ t('auth.register') }}</div>
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
          autocomplete="new-password"
          lazy-rules
          :rules="[(val) => (val && val.length >= 8) || t('validation.passwordMin')]"
        />

        <q-input
          filled
          v-model="passwordConfirm"
          :label="t('auth.passwordConfirm')"
          type="password"
          autocomplete="new-password"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || t('validation.required'),
            (val) => val === password || t('validation.passwordMismatch'),
          ]"
        />

        <div>
          <q-btn :label="t('auth.register')" type="submit" color="primary" />
          <q-btn :label="t('auth.login')" to="/login" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const onSubmit = async () => {
  try {
    await authStore.register(email.value, password.value, passwordConfirm.value)
    await router.push('/')
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: t('auth.registerFailed'),
    })
    console.error(error)
  }
}
</script>
