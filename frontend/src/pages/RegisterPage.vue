<template>
  <q-card style="width: 300px">
    <q-card-section>
      <div class="text-h6">Register</div>
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
          autocomplete="new-password"
          lazy-rules
          :rules="[(val) => (val && val.length >= 8) || 'Password must be at least 8 characters']"
        />

        <q-input
          filled
          v-model="passwordConfirm"
          label="Confirm Password"
          type="password"
          autocomplete="new-password"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || 'Please type something',
            (val) => val === password || 'Passwords do not match',
          ]"
        />

        <div>
          <q-btn label="Register" type="submit" color="primary" />
          <q-btn label="Login" to="/login" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const onSubmit = async () => {
  try {
    await authStore.register(email.value, password.value, passwordConfirm.value);
    await router.push('/');
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Registration failed. Please try again.',
    });
    console.error(error);
  }
};
</script>
