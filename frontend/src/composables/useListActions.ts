import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useTodoStore, type TodoList } from 'src/stores/todo'
import { useNotify } from './useNotify'

/**
 * Composable for handling todo list actions.
 * Provides methods for visibility toggle, sharing, creation, and deletion.
 */
export function useListActions() {
  const { t } = useI18n()
  const todoStore = useTodoStore()
  const router = useRouter()
  const $q = useQuasar()
  const notify = useNotify()

  /**
   * Toggle the public/private visibility of a list
   */
  const toggleVisibility = async (list: TodoList): Promise<void> => {
    try {
      await todoStore.updateList(list.id, { is_public: !list.is_public })
    } catch (error) {
      console.error(error)
      notify.error(t('notifications.failedToUpdateVisibility'))
    }
  }

  /**
   * Copy a public link to the list to clipboard
   */
  const copyPublicLink = (list: TodoList): void => {
    const resolved = router.resolve({ path: `/lists/${list.id}` })
    const url = `${window.location.origin}${resolved.href}`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        notify.success(t('notifications.linkCopied'))
      })
      .catch(() => {
        notify.error(t('notifications.failedToCopyLink'))
      })
  }

  /**
   * Create a new list with optional public visibility
   * @returns The created list or null on error
   */
  const createList = async (title: string, isPublic: boolean = false): Promise<TodoList | null> => {
    if (!title) return null
    try {
      const newList = await todoStore.createList(title, isPublic)
      return newList
    } catch (error) {
      console.error(error)
      notify.error(t('notifications.failedToCreateList'))
      return null
    }
  }

  /**
   * Show confirmation dialog and delete a list if confirmed
   * @param list The list to delete
   * @param onDeleted Optional callback called after successful deletion
   */
  const confirmDelete = (list: TodoList, onDeleted?: () => void): void => {
    $q.dialog({
      title: t('lists.confirmDelete'),
      message: t('lists.confirmDeleteMessage'),
      cancel: true,
    }).onOk(() => {
      void (async () => {
        try {
          await todoStore.deleteList(list.id)
          onDeleted?.()
        } catch (error) {
          console.error(error)
          notify.error(t('notifications.failedToDeleteList'))
        }
      })()
    })
  }

  return {
    toggleVisibility,
    copyPublicLink,
    createList,
    confirmDelete,
  }
}
