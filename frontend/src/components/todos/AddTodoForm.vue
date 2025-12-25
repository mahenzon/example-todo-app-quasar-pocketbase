<template>
  <q-form @submit="handleSubmit" class="row q-mb-md">
    <q-input
      ref="inputRef"
      v-model="text"
      :label="t('todos.addTodo')"
      class="col-grow q-mr-sm"
      outlined
      dense
      autocomplete="off"
      :disable="disabled"
    />
    <q-btn type="submit" color="primary" :label="t('todos.add')" :disable="disabled" />
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { QInput } from 'quasar'

const { t } = useI18n()

interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  submit: [text: string]
}>()

const text = ref('')
const inputRef = ref<QInput | null>(null)

const handleSubmit = () => {
  if (!text.value) return
  emit('submit', text.value)
  text.value = ''
}

/**
 * Focus the input field.
 * Can be called from parent component via template ref.
 */
const focus = () => {
  inputRef.value?.focus()
}

defineExpose({
  focus,
})

defineOptions({
  name: 'AddTodoForm',
})
</script>
