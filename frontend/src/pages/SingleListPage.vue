<template>
  <q-page class="row">
    <!-- Left Sidebar: Lists (only for authenticated users) -->
    <ListsSidebar
      v-if="authStore.isAuthenticated"
      :lists="todoStore.lists"
      :active-list-id="list?.id"
      @add-list="showAddListDialog = true"
      @select-list="navigateToList"
      @toggle-visibility="handleToggleVisibility"
      @copy-link="listActions.copyPublicLink"
      @delete-list="handleDeleteList"
    />

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
        <AddTodoForm v-if="isOwner" ref="addTodoFormRef" @submit="handleAddTodo" />

        <q-list separator bordered>
          <TodoItem
            v-for="todo in todos"
            :key="todo.id"
            :todo="todo"
            :readonly="!isOwner"
            @toggle="handleToggleTodo"
            @delete="handleDeleteTodo"
          />
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
    <AddListDialog v-model="showAddListDialog" @create="handleCreateList" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTodoStore, type TodoList, type TodoItem as TodoItemType } from 'src/stores/todo'
import { useAuthStore } from 'src/stores/auth'
import { useTodosRealtime } from 'src/composables/useTodosRealtime'
import { useListActions } from 'src/composables/useListActions'
import { useTodoActions } from 'src/composables/useTodoActions'
import ListsSidebar from 'src/components/lists/ListsSidebar.vue'
import AddListDialog from 'src/components/lists/AddListDialog.vue'
import TodoItem from 'src/components/todos/TodoItem.vue'
import AddTodoForm from 'src/components/todos/AddTodoForm.vue'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()
const authStore = useAuthStore()
const listActions = useListActions()

const list = ref<TodoList | null>(null)
const todos = ref<TodoItemType[]>([])
const loading = ref(true)
const error = ref('')
const errorType = ref<'access_denied' | 'not_found' | 'general'>('general')
const showAddListDialog = ref(false)
const addTodoFormRef = ref<InstanceType<typeof AddTodoForm> | null>(null)

// Computed property for the current list ID (for realtime subscription and todo actions)
const currentListId = computed(() => list.value?.id ?? null)

// Enable realtime subscriptions for todos
useTodosRealtime(currentListId, todos)

// Use todo actions composable
const todoActions = useTodoActions(currentListId, todos)

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
      if (authStore.isAuthenticated) {
        error.value = 'List not found'
        errorType.value = 'not_found'
      } else {
        error.value = 'List not found or access denied'
        errorType.value = 'access_denied'
      }
    } else {
      const canAccess = fetchedList.is_public || fetchedList.user === authStore.user?.id
      if (!canAccess) {
        error.value = 'This list is private'
        errorType.value = 'access_denied'
      } else {
        list.value = fetchedList
        await todoStore.fetchTodos(listId)
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
  await authStore.waitForInit()
  await loadList()

  if (authStore.isAuthenticated) {
    await todoStore.fetchLists()
  }
})

watch(
  () => authStore.user,
  async (user, oldUser) => {
    if (user !== oldUser) {
      if (user) {
        await todoStore.fetchLists()
        await loadList()
      }
    }
  },
)

watch(
  () => route.params.id,
  async () => {
    await loadList()
  },
)

const navigateToList = (listId: string) => {
  void router.push(`/lists/${listId}`)
}

const handleToggleVisibility = async (userList: TodoList) => {
  await listActions.toggleVisibility(userList)
  if (list.value?.id === userList.id) {
    await loadList()
  }
}

const handleDeleteList = (userList: TodoList) => {
  listActions.confirmDelete(userList, () => {
    if (list.value?.id === userList.id) {
      void router.push('/')
    }
  })
}

const handleCreateList = async (data: { title: string; isPublic: boolean }) => {
  const newList = await listActions.createList(data.title, data.isPublic)
  if (newList) {
    showAddListDialog.value = false
    await router.push(`/lists/${newList.id}`)
  }
}

const handleAddTodo = async (text: string) => {
  const newTodo = await todoActions.addTodo(text)
  if (newTodo) {
    addTodoFormRef.value?.focus()
  }
}

const handleToggleTodo = async (data: { todo: TodoItemType; value: boolean | null }) => {
  if (!isOwner.value) return
  await todoActions.toggleTodo(data.todo, data.value)
}

const handleDeleteTodo = async (todo: TodoItemType) => {
  await todoActions.deleteTodo(todo)
}

const goToLogin = () => {
  const listId = route.params.id as string
  void router.push({
    path: '/login',
    query: { redirect: `/lists/${listId}` },
  })
}
</script>
