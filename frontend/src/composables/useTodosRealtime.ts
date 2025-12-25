import { ref, onUnmounted, watch, type Ref } from 'vue'
import { pb } from 'src/services/pocketbase'
import type { TodoItem } from 'src/stores/todo'
import type { RecordSubscription } from 'pocketbase'
import { Collections } from 'src/config/collections'

/**
 * Composable for managing realtime subscriptions to todos in a specific list.
 * Automatically subscribes when listId changes and unsubscribes on unmount.
 *
 * @param listId - Reactive reference to the current list ID
 * @param todos - Reactive reference to the todos array (will be mutated on events)
 * @returns Object with connection status and manual unsubscribe function
 */
export function useTodosRealtime(listId: Ref<string | null>, todos: Ref<TodoItem[]>) {
  const isConnected = ref(false)
  let currentSubscriptionListId: string | null = null

  const handleEvent = (e: RecordSubscription<TodoItem>) => {
    // Only process events for the current list
    if (e.record.list !== listId.value) {
      return
    }

    switch (e.action) {
      case 'create':
        // Add new todo if it doesn't already exist (avoid duplicates from own actions)
        if (!todos.value.find((t) => t.id === e.record.id)) {
          todos.value.unshift(e.record)
        }
        break

      case 'update': {
        const updateIndex = todos.value.findIndex((t) => t.id === e.record.id)
        if (updateIndex !== -1) {
          todos.value[updateIndex] = e.record
        }
        break
      }

      case 'delete':
        todos.value = todos.value.filter((t) => t.id !== e.record.id)
        break
    }
  }

  const subscribe = async (newListId: string) => {
    // Skip if already subscribed to this list
    if (currentSubscriptionListId === newListId) {
      return
    }

    // Unsubscribe from previous subscription if exists
    await unsubscribeAll()

    try {
      // Subscribe to all todos changes, filtered by list
      // The filter ensures we only receive events for todos in this specific list
      await pb.collection(Collections.TODOS).subscribe<TodoItem>('*', handleEvent, {
        filter: `list = "${newListId}"`,
      })
      currentSubscriptionListId = newListId
      isConnected.value = true
      console.log(`[Realtime] Subscribed to todos for list: ${newListId}`)
    } catch (error) {
      console.error('[Realtime] Failed to subscribe to realtime updates:', error)
      isConnected.value = false
    }
  }

  const unsubscribeAll = async () => {
    if (currentSubscriptionListId) {
      try {
        await pb.collection(Collections.TODOS).unsubscribe('*')
        console.log(`[Realtime] Unsubscribed from todos for list: ${currentSubscriptionListId}`)
      } catch (error) {
        console.error('[Realtime] Failed to unsubscribe:', error)
      }
      currentSubscriptionListId = null
    }
    isConnected.value = false
  }

  // Watch for list changes and re-subscribe
  watch(
    listId,
    async (newId) => {
      if (newId) {
        await subscribe(newId)
      } else {
        await unsubscribeAll()
      }
    },
    { immediate: true },
  )

  // Cleanup on unmount
  onUnmounted(() => {
    void unsubscribeAll()
  })

  return {
    isConnected,
    unsubscribe: unsubscribeAll,
  }
}
