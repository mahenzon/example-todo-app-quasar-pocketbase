import { defineStore } from 'pinia'
import { pb } from 'src/services/pocketbase'
import { ClientResponseError, type RecordModel } from 'pocketbase'
import { Collections } from 'src/config/collections'

// Helper to check if error is an auto-cancelled request
function isAutoCancelledError(error: unknown): boolean {
  return error instanceof ClientResponseError && error.isAbort
}

export interface TodoList extends RecordModel {
  title: string
  user: string
  is_public: boolean
}

export interface TodoItem extends RecordModel {
  text: string
  is_completed: boolean
  list: string
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    lists: [] as TodoList[],
    currentList: null as TodoList | null,
    todos: [] as TodoItem[],
  }),
  actions: {
    async fetchLists() {
      // Fetch user's lists - PocketBase listRule handles filtering:
      // "user = @request.auth.id || is_public = true"
      // So we only need to be authenticated, no additional filter needed
      if (!pb.authStore.isValid) return

      try {
        // Filter to only show user's own lists (not other users' public lists)
        // Sort by created descending (latest first)
        const userId = pb.authStore.record?.id
        const items = await pb.collection(Collections.TODO_LISTS).getFullList<TodoList>({
          filter: pb.filter('user = {:userId}', { userId }),
          sort: '-created',
        })
        this.lists = items
      } catch (error) {
        if (!isAutoCancelledError(error)) {
          console.error('Error fetching lists:', error)
        }
      }
    },
    async fetchList(id: string) {
      try {
        const record = await pb.collection(Collections.TODO_LISTS).getOne<TodoList>(id)
        return record
      } catch (error) {
        if (!isAutoCancelledError(error)) {
          console.error('Error fetching list:', error)
        }
        return null
      }
    },
    async createList(title: string, isPublic: boolean = false) {
      const record = await pb.collection(Collections.TODO_LISTS).create<TodoList>({
        title,
        is_public: isPublic,
        user: pb.authStore.record?.id,
      })
      this.lists.unshift(record)
      return record
    },
    async updateList(id: string, data: Partial<TodoList>) {
      const record = await pb.collection(Collections.TODO_LISTS).update<TodoList>(id, data)
      const index = this.lists.findIndex((l) => l.id === id)
      if (index !== -1) {
        this.lists[index] = record
      }
      if (this.currentList?.id === id) {
        this.currentList = record
      }
    },
    async deleteList(id: string) {
      await pb.collection(Collections.TODO_LISTS).delete(id)
      this.lists = this.lists.filter((l) => l.id !== id)
      if (this.currentList?.id === id) {
        this.currentList = null
        this.todos = []
      }
    },
    async fetchTodos(listId: string) {
      // Fetch todos for a list, sorted by created descending (latest first)
      const items = await pb.collection(Collections.TODOS).getFullList<TodoItem>({
        filter: `list = "${listId}"`,
        sort: '-created',
      })
      this.todos = items
    },
    async createTodo(listId: string, text: string): Promise<TodoItem> {
      const record = await pb.collection(Collections.TODOS).create<TodoItem>({
        text,
        list: listId,
        is_completed: false,
      })
      this.todos.unshift(record)
      return record
    },
    async updateTodo(id: string, data: Partial<TodoItem>) {
      const record = await pb.collection(Collections.TODOS).update<TodoItem>(id, data)
      const index = this.todos.findIndex((t) => t.id === id)
      if (index !== -1) {
        this.todos[index] = record
      }
    },
    async deleteTodo(id: string) {
      await pb.collection(Collections.TODOS).delete(id)
      this.todos = this.todos.filter((t) => t.id !== id)
    },
    setCurrentList(list: TodoList) {
      this.currentList = list
      this.todos = []
      void this.fetchTodos(list.id)
    },
  },
})
