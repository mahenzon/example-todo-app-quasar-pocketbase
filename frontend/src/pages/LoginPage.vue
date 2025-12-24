<template>
  <q-card style="width: 300px">
    <q-card-section>
      <div class="text-h6">Login</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          filled
          v-model="email"
          label="Email"
          type="email"
          autocomplete="off"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-input
          filled
          v-model="password"
          label="Password"
          type="password"
          autocomplete="off"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <div>
          <q-btn label="Login" type="submit" color="primary" />
          <q-btn label="Register" to="/register" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const onSubmit = async () => {
  try {
    await authStore.login(email.value, password.value);
    // Check if there's a redirect query parameter
    const redirectPath = route.query.redirect as string;
    if (redirectPath) {
      await router.push(redirectPath);
    } else {
      await router.push('/');
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Login failed. Please check your credentials.',
    });
    console.error(error);
  }
};
</script>
