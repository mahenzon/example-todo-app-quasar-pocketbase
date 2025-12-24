<template>
  <q-page class="row">
    <!-- Left Sidebar: Lists -->
    <ListsSidebar
      :lists="todoStore.lists"
      :active-list-id="currentListId"
      @add-list="showAddListDialog = true"
      @select-list="navigateToList"
      @toggle-visibility="listActions.toggleVisibility"
      @copy-link="listActions.copyPublicLink"
      @delete-list="listActions.confirmDelete"
    />

    <!-- Right Content: Todos -->
    <div class="col-9 q-pa-md">
      <div v-if="todoStore.currentList">
        <div class="text-h5 q-mb-md">{{ todoStore.currentList.title }}</div>

        <AddTodoForm ref="addTodoFormRef" @submit="handleAddTodo" />

        <q-list separator bordered>
          <TodoItem
            v-for="todo in todoStore.todos"
            :key="todo.id"
            :todo="todo"
            @toggle="handleToggleTodo"
            @delete="handleDeleteTodo"
          />
        </q-list>
      </div>
      <div v-else class="flex flex-center full-height text-grey">Select a list to view todos</div>
    </div>

    <!-- Add List Dialog -->
    <AddListDialog v-model="showAddListDialog" @create="handleCreateList" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTodoStore, type TodoItem as TodoItemType } from 'src/stores/todo'
import { useAuthStore } from 'src/stores/auth'
import { useListActions } from 'src/composables/useListActions'
import { useNotify } from 'src/composables/useNotify'
import ListsSidebar from 'src/components/lists/ListsSidebar.vue'
import AddListDialog from 'src/components/lists/AddListDialog.vue'
import TodoItem from 'src/components/todos/TodoItem.vue'
import AddTodoForm from 'src/components/todos/AddTodoForm.vue'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()
const authStore = useAuthStore()
const listActions = useListActions()
const notify = useNotify()

const showAddListDialog = ref(false)
const addTodoFormRef = ref<InstanceType<typeof AddTodoForm> | null>(null)

// Computed active list ID from route
const currentListId = computed(() => {
  const path = route.path
  const match = path.match(/^\/lists\/(.+)$/)
  return match ? match[1] : undefined
})

// Initialize auth store on component mount
onMounted(() => {
  authStore.init()
})

// Watch for auth user changes and fetch lists when user is available
watch(
  () => authStore.user,
  async (user) => {
    if (user) {
      await todoStore.fetchLists()

      // Auto-select first list if user is on home page and lists exist
      if (route.path === '/' && todoStore.lists.length > 0) {
        const firstList = todoStore.lists[0]
        if (firstList) {
          await router.push(`/lists/${firstList.id}`)
        }
      }
    }
  },
  { immediate: true },
)

const navigateToList = (listId: string) => {
  void router.push(`/lists/${listId}`)
}

const handleCreateList = async (data: { title: string; isPublic: boolean }) => {
  const newList = await listActions.createList(data.title, data.isPublic)
  if (newList) {
    showAddListDialog.value = false
  }
}

const handleAddTodo = async (text: string) => {
  if (!todoStore.currentList) return
  try {
    await todoStore.createTodo(todoStore.currentList.id, text)
    addTodoFormRef.value?.focus()
  } catch (error) {
    console.error(error)
    notify.error('Failed to create todo')
  }
}

const handleToggleTodo = async (data: { todo: TodoItemType; value: boolean | null }) => {
  if (data.value === null) return
  try {
    await todoStore.updateTodo(data.todo.id, { is_completed: data.value })
  } catch (error) {
    console.error(error)
    notify.error('Failed to update todo')
  }
}

const handleDeleteTodo = async (todo: TodoItemType) => {
  try {
    await todoStore.deleteTodo(todo.id)
  } catch (error) {
    console.error(error)
    notify.error('Failed to delete todo')
  }
}
</script>
