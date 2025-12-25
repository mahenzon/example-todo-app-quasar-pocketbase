/**
 * PocketBase collection names
 * Centralized config to avoid hardcoding collection names throughout the codebase
 */
export const Collections = {
  USERS: 'users',
  TODO_LISTS: 'todo_lists',
  TODOS: 'todos',
} as const

export type CollectionName = (typeof Collections)[keyof typeof Collections]
