import { useQuasar } from 'quasar'

/**
 * Composable for standardized notification handling.
 * Provides a clean API for showing different types of notifications.
 */
export function useNotify() {
  const $q = useQuasar()

  return {
    /**
     * Show a success notification
     */
    success: (message: string) => {
      $q.notify({
        type: 'positive',
        message,
      })
    },

    /**
     * Show an error notification
     */
    error: (message: string) => {
      $q.notify({
        type: 'negative',
        message,
      })
    },

    /**
     * Show a warning notification
     */
    warning: (message: string) => {
      $q.notify({
        type: 'warning',
        message,
      })
    },

    /**
     * Show an info notification
     */
    info: (message: string) => {
      $q.notify({
        type: 'info',
        message,
      })
    },
  }
}
