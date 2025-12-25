import { nextTick, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { QInput } from 'quasar'
import { useTodoStore, type TodoItem } from 'src/stores/todo'
import { useNotify } from './useNotify'

/**
 * Composable for handling todo item actions.
 * Provides methods for adding, toggling, and deleting todos.
 *
 * @param listId - Reactive reference to the current list ID
 * @param todos - Reactive reference to the todos array (will be mutated on operations)
 * @param inputRef - Optional reference to the input element (for auto-focus after add)
 */
export function useTodoActions(
  listId: Ref<string | null>,
  todos: Ref<TodoItem[]>,
  inputRef?: Ref<QInput | null>,
) {
  const { t } = useI18n()
  const todoStore = useTodoStore()
  const notify = useNotify()

  /**
   * Add a new todo to the current list
   * @param text The text content of the new todo
   * @returns The created todo or null on error
   */
  const addTodo = async (text: string): Promise<TodoItem | null> => {
    if (!text || !listId.value) return null

    try {
      const newTodo = await todoStore.createTodo(listId.value, text)
      // Add locally immediately for instant feedback
      // The realtime event will also arrive, but deduplication will prevent duplicates
      if (newTodo && !todos.value.find((t) => t.id === newTodo.id)) {
        todos.value.unshift(newTodo)
      }

      // Refocus the input after adding a todo
      if (inputRef?.value) {
        await nextTick()
        inputRef.value.focus()
      }

      return newTodo
    } catch (error) {
      console.error(error)
      notify.error(t('notifications.failedToCreateTodo'))
      return null
    }
  }

  /**
   * Toggle the completion status of a todo
   * @param todo The todo to toggle
   * @param value The new completion status
   */
  const toggleTodo = async (todo: TodoItem, value: boolean | null): Promise<void> => {
    if (value === null) return

    const originalValue = todo.is_completed
    try {
      // Update locally immediately for instant feedback
      const todoItem = todos.value.find((t) => t.id === todo.id)
      if (todoItem) {
        todoItem.is_completed = value
      }

      await todoStore.updateTodo(todo.id, { is_completed: value })
      // Realtime will sync the update
    } catch (error) {
      console.error(error)
      notify.error(t('notifications.failedToUpdateTodo'))
      // Revert on error
      const todoItem = todos.value.find((t) => t.id === todo.id)
      if (todoItem) {
        todoItem.is_completed = originalValue
      }
    }
  }

  /**
   * Delete a todo
   * @param todo The todo to delete
   */
  const deleteTodo = async (todo: TodoItem): Promise<void> => {
    // Store for potential rollback
    const originalTodos = [...todos.value]
    try {
      // Remove locally immediately for instant feedback
      todos.value = todos.value.filter((t) => t.id !== todo.id)
      await todoStore.deleteTodo(todo.id)
      // Realtime will sync the delete
    } catch (error) {
      console.error(error)
      notify.error(t('notifications.failedToDeleteTodo'))
      // Revert on error
      todos.value = originalTodos
    }
  }

  return {
    addTodo,
    toggleTodo,
    deleteTodo,
  }
}
