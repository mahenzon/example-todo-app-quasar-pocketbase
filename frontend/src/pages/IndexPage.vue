<template>
  <q-page class="row">
    <!-- Left Sidebar: Lists -->
    <div class="col-3 q-pa-md border-right">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">My Lists</div>
        <q-btn round color="primary" icon="add" size="sm" @click="showAddListDialog = true" />
      </div>

      <q-list separator>
        <q-item
          v-for="list in todoStore.lists"
          :key="list.id"
          clickable
          :active="route.path === `/lists/${list.id}`"
          @click="router.push(`/lists/${list.id}`)"
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
                @click.stop="toggleListVisibility(list)"
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
                @click.stop="copyPublicLink(list)"
              >
                <q-tooltip>Copy Public Link</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click.stop="confirmDeleteList(list)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Right Content: Todos -->
    <div class="col-9 q-pa-md">
      <div v-if="todoStore.currentList">
        <div class="text-h5 q-mb-md">{{ todoStore.currentList.title }}</div>

        <q-form @submit="addTodo" class="row q-mb-md">
          <q-input
            ref="todoInputRef"
            v-model="newTodoText"
            label="Add a new todo"
            class="col-grow q-mr-sm"
            outlined
            dense
            autocomplete="off"
          />
          <q-btn type="submit" color="primary" label="Add" />
        </q-form>

        <q-list separator bordered>
          <q-item v-for="todo in todoStore.todos" :key="todo.id">
            <q-item-section side>
              <q-checkbox
                :model-value="todo.is_completed"
                @update:model-value="(val) => toggleTodo(todo, val)"
              />
            </q-item-section>
            <q-item-section :class="{ 'text-strike': todo.is_completed }">
              {{ todo.text }}
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click="deleteTodo(todo)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div v-else class="flex flex-center full-height text-grey">Select a list to view todos</div>
    </div>

    <!-- Add List Dialog -->
    <q-dialog v-model="showAddListDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">New List</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="newListTitle"
            autofocus
            label="List Title"
            autocomplete="off"
            @keyup.enter="createList"
          />
          <q-checkbox v-model="newListPublic" label="Make Public" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Create" @click="createList" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTodoStore, type TodoList, type TodoItem } from 'src/stores/todo';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar, QInput } from 'quasar';

const route = useRoute();
const router = useRouter();
const todoStore = useTodoStore();
const authStore = useAuthStore();
const $q = useQuasar();

const showAddListDialog = ref(false);
const newListTitle = ref('');
const newListPublic = ref(false);
const newTodoText = ref('');
const todoInputRef = ref<QInput | null>(null);

// Initialize auth store on component mount
onMounted(() => {
  authStore.init();
});

// Watch for auth user changes and fetch lists when user is available
watch(
  () => authStore.user,
  async (user) => {
    if (user) {
      await todoStore.fetchLists();

      // Auto-select first list if user is on home page and lists exist
      if (route.path === '/' && todoStore.lists.length > 0) {
        const firstList = todoStore.lists[0];
        if (firstList) {
          await router.push(`/lists/${firstList.id}`);
        }
      }
    }
  },
  { immediate: true },
);

const toggleListVisibility = async (list: TodoList) => {
  try {
    await todoStore.updateList(list.id, { is_public: !list.is_public });
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Failed to update list visibility' });
  }
};

const copyPublicLink = (list: TodoList) => {
  const url = `${window.location.origin}/lists/${list.id}`;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Link copied to clipboard' });
    })
    .catch(() => {
      $q.notify({ type: 'negative', message: 'Failed to copy link' });
    });
};

const createList = async () => {
  if (!newListTitle.value) return;
  try {
    await todoStore.createList(newListTitle.value, newListPublic.value);
    newListTitle.value = '';
    newListPublic.value = false;
    showAddListDialog.value = false;
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Failed to create list' });
  }
};

const confirmDeleteList = (list: TodoList) => {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this list?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    todoStore.deleteList(list.id).catch((error) => {
      console.error(error);
      $q.notify({ type: 'negative', message: 'Failed to delete list' });
    });
  });
};

const addTodo = async () => {
  if (!newTodoText.value || !todoStore.currentList) return;
  try {
    await todoStore.createTodo(todoStore.currentList.id, newTodoText.value);
    newTodoText.value = '';
    // Refocus the input after adding a todo
    await nextTick();
    todoInputRef.value?.focus();
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Failed to create todo' });
  }
};

const toggleTodo = async (todo: TodoItem, val: boolean | null) => {
  if (val === null) return;
  try {
    await todoStore.updateTodo(todo.id, { is_completed: val });
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Failed to update todo' });
  }
};

const deleteTodo = async (todo: TodoItem) => {
  try {
    await todoStore.deleteTodo(todo.id);
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Failed to delete todo' });
  }
};
</script>

<style scoped>
.border-right {
  border-right: 1px solid #ddd;
}
</style>
