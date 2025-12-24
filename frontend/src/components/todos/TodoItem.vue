<template>
  <q-item>
    <q-item-section side>
      <q-checkbox
        :model-value="todo.is_completed"
        :disable="readonly"
        @update:model-value="(val) => !readonly && $emit('toggle', { todo, value: val })"
      />
    </q-item-section>
    <q-item-section :class="{ 'text-strike': todo.is_completed }">
      {{ todo.text }}
    </q-item-section>
    <q-item-section v-if="!readonly" side>
      <q-btn flat round icon="delete" size="sm" color="negative" @click="$emit('delete', todo)" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { TodoItem as TodoItemType } from 'src/stores/todo'

interface Props {
  todo: TodoItemType
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  readonly: false,
})

defineEmits<{
  toggle: [data: { todo: TodoItemType; value: boolean | null }]
  delete: [todo: TodoItemType]
}>()

defineOptions({
  name: 'TodoItem',
})
</script>
