<template>
  <div class="col-3 q-pa-md border-right">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">My Lists</div>
      <q-btn
        v-if="showAddButton"
        round
        color="primary"
        icon="add"
        size="sm"
        @click="$emit('add-list')"
      />
    </div>

    <q-list separator>
      <q-item
        v-for="list in lists"
        :key="list.id"
        clickable
        :active="list.id === activeListId"
        @click="$emit('select-list', list.id)"
      >
        <q-item-section>
          <q-item-label>{{ list.title }}</q-item-label>
          <q-item-label caption>
            {{ list.is_public ? 'Public' : 'Private' }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row">
            <q-btn
              flat
              round
              :icon="list.is_public ? 'lock_open' : 'lock'"
              size="sm"
              :color="list.is_public ? 'positive' : 'grey'"
              @click.stop="$emit('toggle-visibility', list)"
            >
              <q-tooltip>{{ list.is_public ? 'Make Private' : 'Make Public' }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="list.is_public"
              flat
              round
              icon="share"
              size="sm"
              color="info"
              @click.stop="$emit('copy-link', list)"
            >
              <q-tooltip>Copy Public Link</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="delete"
              size="sm"
              color="negative"
              @click.stop="$emit('delete-list', list)"
            >
              <q-tooltip>Delete List</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import type { TodoList } from 'src/stores/todo'

interface Props {
  lists: TodoList[]
  activeListId?: string | undefined
  showAddButton?: boolean
}

withDefaults(defineProps<Props>(), {
  activeListId: undefined,
  showAddButton: true,
})

defineEmits<{
  'add-list': []
  'select-list': [listId: string]
  'toggle-visibility': [list: TodoList]
  'copy-link': [list: TodoList]
  'delete-list': [list: TodoList]
}>()

defineOptions({
  name: 'ListsSidebar',
})
</script>

<style scoped>
.border-right {
  border-right: 1px solid #ddd;
}
</style>
