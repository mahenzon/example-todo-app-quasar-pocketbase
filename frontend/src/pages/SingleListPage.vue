<template>
  <q-page class="row">
    <!-- Left Sidebar: Lists (only for authenticated users) -->
    <div v-if="authStore.isAuthenticated" class="col-3 q-pa-md border-right">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">My Lists</div>
        <q-btn round color="primary" icon="add" size="sm" @click="showAddListDialog = true" />
      </div>

      <q-list separator>
        <q-item
          v-for="userList in todoStore.lists"
          :key="userList.id"
          clickable
          :active="userList.id === list?.id"
          @click="$router.push(`/lists/${userList.id}`)"
        >
          <q-item-section>
            <q-item-label>{{ userList.title }}</q-item-label>
            <q-item-label caption>
              {{ userList.is_public ? 'Public' : 'Private' }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row">
              <q-btn
                v-if="userList.is_public"
                flat
                round
                icon="share"
                size="sm"
                color="info"
                @click.stop="copyPublicLink(userList)"
              >
                <q-tooltip>Copy Public Link</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                :icon="userList.is_public ? 'lock_open' : 'lock'"
                size="sm"
                :color="userList.is_public ? 'positive' : 'grey'"
                @click.stop="toggleListVisibility(userList)"
              >
                <q-tooltip>{{ userList.is_public ? 'Make Private' : 'Make Public' }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click.stop="confirmDeleteList(userList)"
              >
                <q-tooltip>Delete List</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Main Content -->
    <div :class="authStore.isAuthenticated ? 'col-9' : 'col-12'" class="q-pa-md">
      <div v-if="loading" class="flex flex-center full-height">
        <q-spinner color="primary" size="3em" />
      </div>

      <div v-else-if="error" class="flex flex-center full-height">
        <div class="text-center">
          <q-icon name="error_outline" size="4em" color="negative" class="q-mb-md" />
          <div class="text-h6 text-negative q-mb-md">{{ error }}</div>

          <!-- Login prompt for unauthenticated users -->
          <div v-if="!authStore.isAuthenticated && errorType === 'access_denied'">
            <p class="text-body2 text-grey-7 q-mb-md">Please log in to access this list</p>
            <q-btn color="primary" label="Login" @click="goToLogin" class="q-mr-sm" />
            <q-btn color="secondary" outline label="Register" @click="$router.push('/register')" />
          </div>

          <!-- Go to My Lists button for authenticated users -->
          <div v-else-if="authStore.isAuthenticated && errorType === 'not_found'">
            <p class="text-body2 text-grey-7 q-mb-md">
              This list doesn't exist or you don't have access to it
            </p>
            <q-btn color="primary" label="Go to My Lists" @click="$router.push('/')" />
          </div>
        </div>
      </div>

      <div v-else-if="list">
        <div class="row items-center q-mb-md">
          <div class="text-h5">
            {{ list.title }}
            <q-badge v-if="!isOwner" color="secondary">Public</q-badge>
          </div>
        </div>

        <!-- Add Todo Form (only for owner) -->
        <q-form v-if="isOwner" @submit="addTodo" class="row q-mb-md">
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
          <q-item v-for="todo in todos" :key="todo.id">
            <q-item-section side>
              <q-checkbox
                :model-value="todo.is_completed"
                :disable="!isOwner"
                @update:model-value="(val) => isOwner && toggleTodo(todo, val)"
              />
            </q-item-section>
            <q-item-section :class="{ 'text-strike': todo.is_completed }">
              {{ todo.text }}
            </q-item-section>
            <q-item-section v-if="isOwner" side>
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

        <div v-if="todos.length === 0" class="text-grey q-mt-md text-center">
          No todos in this list.
        </div>

        <!-- Login prompt for anonymous users -->
        <div v-if="!authStore.isAuthenticated" class="q-mt-lg text-center">
          <q-btn
            color="primary"
            label="Login to create your own lists"
            @click="$router.push('/login')"
          />
        </div>
      </div>
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
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTodoStore, type TodoList, type TodoItem } from 'src/stores/todo'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar, QInput } from 'quasar'
import { useTodosRealtime } from 'src/composables/useTodosRealtime'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()
const authStore = useAuthStore()
const $q = useQuasar()

const list = ref<TodoList | null>(null)
const todos = ref<TodoItem[]>([])
const loading = ref(true)
const error = ref('')
const errorType = ref<'access_denied' | 'not_found' | 'general'>('general')
const newTodoText = ref('')
const todoInputRef = ref<QInput | null>(null)
const showAddListDialog = ref(false)
const newListTitle = ref('')
const newListPublic = ref(false)

// Computed property for the current list ID (for realtime subscription)
const currentListId = computed(() => list.value?.id ?? null)

// Enable realtime subscriptions for todos
// This will automatically subscribe when the list changes and unsubscribe on unmount
useTodosRealtime(currentListId, todos)

const isOwner = computed(() => {
  return list.value?.user === authStore.user?.id
})

const loadList = async () => {
  loading.value = true
  error.value = ''
  errorType.value = 'general'

  const listId = route.params.id as string
  if (!listId) {
    error.value = 'Invalid list ID'
    errorType.value = 'general'
    loading.value = false
    return
  }

  try {
    const fetchedList = await todoStore.fetchList(listId)
    if (!fetchedList) {
      // List not found - could be because it doesn't exist or user doesn't have access
      if (authStore.isAuthenticated) {
        error.value = 'List not found'
        errorType.value = 'not_found'
      } else {
        error.value = 'List not found or access denied'
        errorType.value = 'access_denied'
      }
    } else {
      // Check if list is accessible: must be public OR user is the owner
      const canAccess = fetchedList.is_public || fetchedList.user === authStore.user?.id
      if (!canAccess) {
        // Private list - user needs to login
        error.value = 'This list is private'
        errorType.value = 'access_denied'
      } else {
        list.value = fetchedList
        await todoStore.fetchTodos(listId)
        // Create a copy so realtime updates don't conflict with store updates
        todos.value = [...todoStore.todos]
      }
    }
  } catch (e) {
    console.error(e)
    error.value = 'Error loading list'
    errorType.value = 'general'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Wait for auth to be fully initialized before loading the list
  // This ensures we have the correct user state from PocketBase's localStorage
  await authStore.waitForInit()

  // Load the list
  await loadList()

  // Fetch user's lists if authenticated
  if (authStore.isAuthenticated) {
    await todoStore.fetchLists()
  }
})

// Watch for auth changes and fetch user's lists if authenticated
watch(
  () => authStore.user,
  async (user, oldUser) => {
    // Only reload if user actually changed (login/logout)
    if (user !== oldUser) {
      if (user) {
        await todoStore.fetchLists()
        // Reload the current list when user logs in to check if they now have access
        await loadList()
      }
    }
  },
)

// Watch for route changes to reload the list
watch(
  () => route.params.id,
  async () => {
    await loadList()
  },
)

const toggleListVisibility = async (userList: TodoList) => {
  try {
    await todoStore.updateList(userList.id, { is_public: !userList.is_public })
    // Reload current list if it's the one being toggled
    if (list.value?.id === userList.id) {
      await loadList()
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Failed to update list visibility' })
  }
}

const copyPublicLink = (userList: TodoList) => {
  const resolved = router.resolve({ path: `/lists/${userList.id}` })
  const url = `${window.location.origin}${resolved.href}`
  navigator.clipboard
    .writeText(url)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Link copied to clipboard' })
    })
    .catch(() => {
      $q.notify({ type: 'negative', message: 'Failed to copy link' })
    })
}

const createList = async () => {
  if (!newListTitle.value) return
  try {
    const newList = await todoStore.createList(newListTitle.value, newListPublic.value)
    newListTitle.value = ''
    newListPublic.value = false
    showAddListDialog.value = false
    // Navigate to the new list
    if (newList) {
      await router.push(`/lists/${newList.id}`)
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Failed to create list' })
  }
}

const confirmDeleteList = (userList: TodoList) => {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this list?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await todoStore.deleteList(userList.id)
        // If we deleted the current list, redirect to home
        if (list.value?.id === userList.id) {
          await router.push('/')
        }
      } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Failed to delete list' })
      }
    })()
  })
}

const addTodo = async () => {
  if (!newTodoText.value || !list.value) return
  try {
    const newTodo = await todoStore.createTodo(list.value.id, newTodoText.value)
    // Add locally immediately for instant feedback
    // The realtime event will also arrive, but deduplication will prevent duplicates
    if (newTodo && !todos.value.find((t) => t.id === newTodo.id)) {
      todos.value.unshift(newTodo)
    }
    newTodoText.value = ''
    // Refocus the input after adding a todo
    await nextTick()
    todoInputRef.value?.focus()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Failed to create todo' })
  }
}

const toggleTodo = async (todo: TodoItem, val: boolean | null) => {
  if (val === null) return
  const originalValue = todo.is_completed
  try {
    // Update locally immediately for instant feedback
    const todoItem = todos.value.find((t) => t.id === todo.id)
    if (todoItem) {
      todoItem.is_completed = val
    }
    await todoStore.updateTodo(todo.id, { is_completed: val })
    // Realtime will sync the update
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Failed to update todo' })
    // Revert on error
    const todoItem = todos.value.find((t) => t.id === todo.id)
    if (todoItem) {
      todoItem.is_completed = originalValue
    }
  }
}

const deleteTodo = async (todo: TodoItem) => {
  // Store for potential rollback
  const originalTodos = [...todos.value]
  try {
    // Remove locally immediately for instant feedback
    todos.value = todos.value.filter((t) => t.id !== todo.id)
    await todoStore.deleteTodo(todo.id)
    // Realtime will sync the delete
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Failed to delete todo' })
    // Revert on error
    todos.value = originalTodos
  }
}

const goToLogin = () => {
  // Store the current list ID to redirect back after login
  const listId = route.params.id as string
  void router.push({
    path: '/login',
    query: { redirect: `/lists/${listId}` },
  })
}
</script>

<style scoped>
.border-right {
  border-right: 1px solid #ddd;
}
</style>
