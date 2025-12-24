# Refactoring Plan: Eliminate Code Repetition

## Overview

This document outlines a refactoring plan to eliminate code repetition in the Vue.js frontend codebase. The analysis identified several patterns of duplicated code that can be extracted into reusable components and composables.

## Identified Code Repetition Patterns

### 1. Sidebar Lists Component (HIGH PRIORITY)

**Files affected:** [`IndexPage.vue`](frontend/src/pages/IndexPage.vue:4-58), [`SingleListPage.vue`](frontend/src/pages/SingleListPage.vue:4-61)

**Problem:** Both pages contain nearly identical sidebar code (~55 lines each) for displaying "My Lists" with:
- Header with "My Lists" title and add button
- List of items with title, public/private caption
- Action buttons (visibility toggle, share, delete)

**Solution:** Create `ListsSidebar.vue` component

```vue
<!-- Props -->
interface Props {
  lists: TodoList[]
  activeListId?: string
  showAddButton?: boolean
}

<!-- Emits -->
emit('add-list')
emit('select-list', listId: string)
emit('toggle-visibility', list: TodoList)
emit('copy-link', list: TodoList)
emit('delete-list', list: TodoList)
```

---

### 2. Add List Dialog Component (HIGH PRIORITY)

**Files affected:** [`IndexPage.vue`](frontend/src/pages/IndexPage.vue:107-130), [`SingleListPage.vue`](frontend/src/pages/SingleListPage.vue:154-177)

**Problem:** Identical dialog code (24 lines) duplicated in both files for creating new lists.

**Solution:** Create `AddListDialog.vue` component

```vue
<!-- Props -->
interface Props {
  modelValue: boolean  // v-model for dialog visibility
}

<!-- Emits -->
emit('update:modelValue', value: boolean)
emit('create', { title: string, isPublic: boolean })
```

---

### 3. Todo List Item Component (MEDIUM PRIORITY)

**Files affected:** [`IndexPage.vue`](frontend/src/pages/IndexPage.vue:80-100), [`SingleListPage.vue`](frontend/src/pages/SingleListPage.vue:113-136)

**Problem:** Similar todo item rendering with checkbox, text, and delete button. SingleListPage has additional `isOwner` logic.

**Solution:** Create `TodoItem.vue` component

```vue
<!-- Props -->
interface Props {
  todo: TodoItem
  readonly?: boolean  // disables checkbox and hides delete
}

<!-- Emits -->
emit('toggle', { todo: TodoItem, value: boolean })
emit('delete', todo: TodoItem)
```

---

### 4. Todo Add Form Component (MEDIUM PRIORITY)

**Files affected:** [`IndexPage.vue`](frontend/src/pages/IndexPage.vue:66-77), [`SingleListPage.vue`](frontend/src/pages/SingleListPage.vue:100-111)

**Problem:** Similar form for adding new todos with input and submit button.

**Solution:** Create `AddTodoForm.vue` component

```vue
<!-- Props -->
interface Props {
  disabled?: boolean
}

<!-- Emits -->
emit('submit', text: string)
```

---

### 5. List Item Actions (Button Group) (MEDIUM PRIORITY)

**Files affected:** [`IndexPage.vue`](frontend/src/pages/IndexPage.vue:25-55), [`SingleListPage.vue`](frontend/src/pages/SingleListPage.vue:25-57)

**Problem:** Similar button groups for list actions (visibility toggle, share, delete) with slight ordering differences.

**Solution:** Create `ListItemActions.vue` component

```vue
<!-- Props -->
interface Props {
  list: TodoList
  showShare?: boolean
  showVisibilityToggle?: boolean
  showDelete?: boolean
}

<!-- Emits -->
emit('toggle-visibility')
emit('copy-link')
emit('delete')
```

---

### 6. Auth Form Layout (LOW PRIORITY)

**Files affected:** [`LoginPage.vue`](frontend/src/pages/LoginPage.vue:1-35), [`RegisterPage.vue`](frontend/src/pages/RegisterPage.vue:1-48)

**Problem:** Similar card layout structure with form, though content differs enough to make extraction less beneficial.

**Solution:** Consider creating `AuthFormCard.vue` wrapper component (optional)

```vue
<!-- Props -->
interface Props {
  title: string
}

<!-- Slots -->
<slot name="fields" />
<slot name="actions" />
```

---

### 7. Email Input with Validation (LOW PRIORITY)

**Files affected:** [`LoginPage.vue`](frontend/src/pages/LoginPage.vue:9-17), [`RegisterPage.vue`](frontend/src/pages/RegisterPage.vue:9-17)

**Problem:** Identical email input configuration.

**Solution:** Create `EmailInput.vue` component or use a data-driven approach like [`AboutPage.vue`](frontend/src/pages/AboutPage.vue:22-36) with form field definitions.

---

## Composables to Extract

### 1. useNotify Composable (HIGH PRIORITY)

**Files affected:** All pages with `$q.notify()` calls

**Problem:** Repeated notification patterns throughout the codebase:
```typescript
$q.notify({ type: 'negative', message: 'Failed to...' })
$q.notify({ type: 'positive', message: 'Success...' })
```

**Solution:** Create `useNotify.ts` composable

```typescript
// frontend/src/composables/useNotify.ts
export function useNotify() {
  const $q = useQuasar()
  
  return {
    success: (message: string) => $q.notify({ type: 'positive', message }),
    error: (message: string) => $q.notify({ type: 'negative', message }),
    warning: (message: string) => $q.notify({ type: 'warning', message }),
    info: (message: string) => $q.notify({ type: 'info', message }),
  }
}
```

---

### 2. useListActions Composable (HIGH PRIORITY)

**Files affected:** [`IndexPage.vue`](frontend/src/pages/IndexPage.vue:177-224), [`SingleListPage.vue`](frontend/src/pages/SingleListPage.vue:301-364)

**Problem:** Duplicated list action methods:
- `toggleListVisibility()`
- `copyPublicLink()`
- `createList()`
- `confirmDeleteList()`

**Solution:** Create `useListActions.ts` composable

```typescript
// frontend/src/composables/useListActions.ts
export function useListActions() {
  const todoStore = useTodoStore()
  const router = useRouter()
  const notify = useNotify()
  const $q = useQuasar()

  return {
    toggleVisibility: async (list: TodoList) => { ... },
    copyPublicLink: (list: TodoList) => { ... },
    createList: async (title: string, isPublic: boolean) => { ... },
    confirmDelete: (list: TodoList, onDeleted?: () => void) => { ... },
  }
}
```

---

### 3. useTodoActions Composable (MEDIUM PRIORITY)

**Files affected:** [`IndexPage.vue`](frontend/src/pages/IndexPage.vue:226-256), [`SingleListPage.vue`](frontend/src/pages/SingleListPage.vue:366-420)

**Problem:** Duplicated todo action methods:
- `addTodo()`
- `toggleTodo()`
- `deleteTodo()`

**Solution:** Create `useTodoActions.ts` composable

```typescript
// frontend/src/composables/useTodoActions.ts
export function useTodoActions(
  listId: Ref<string | null>,
  todos: Ref<TodoItem[]>,
  inputRef?: Ref<QInput | null>
) {
  const todoStore = useTodoStore()
  const notify = useNotify()

  return {
    addTodo: async (text: string) => { ... },
    toggleTodo: async (todo: TodoItem, value: boolean) => { ... },
    deleteTodo: async (todo: TodoItem) => { ... },
  }
}
```

---

## Implementation Order

### Phase 1: Foundation (Composables)
1. Create `useNotify.ts` composable
2. Create `useListActions.ts` composable
3. Create `useTodoActions.ts` composable

### Phase 2: Core Components
4. Create `ListsSidebar.vue` component
5. Create `AddListDialog.vue` component
6. Create `TodoItem.vue` component
7. Create `AddTodoForm.vue` component

### Phase 3: Refactor Pages
8. Refactor `IndexPage.vue` to use new components/composables
9. Refactor `SingleListPage.vue` to use new components/composables

### Phase 4: Optional Improvements
10. Create `ListItemActions.vue` component
11. Consider auth form improvements

---

## File Structure After Refactoring

```
frontend/src/
├── components/
│   ├── ExampleComponent.vue (existing)
│   ├── lists/
│   │   ├── ListsSidebar.vue        # NEW
│   │   ├── ListItemActions.vue     # NEW
│   │   └── AddListDialog.vue       # NEW
│   └── todos/
│       ├── TodoItem.vue            # NEW
│       └── AddTodoForm.vue         # NEW
├── composables/
│   ├── useTodosRealtime.ts (existing)
│   ├── useNotify.ts                # NEW
│   ├── useListActions.ts           # NEW
│   └── useTodoActions.ts           # NEW
└── pages/
    ├── IndexPage.vue               # REFACTORED (~130 lines reduced)
    └── SingleListPage.vue          # REFACTORED (~150 lines reduced)
```

---

## Expected Benefits

1. **Reduced Code Duplication:** ~200-300 lines of duplicated code eliminated
2. **Better Maintainability:** Changes to list/todo rendering only need to be made in one place
3. **Consistent Behavior:** All list actions will behave identically across pages
4. **Easier Testing:** Components and composables can be unit tested independently
5. **Improved Readability:** Pages become cleaner with high-level component composition

---

## Example: AboutPage.vue Pattern

The [`AboutPage.vue`](frontend/src/pages/AboutPage.vue:22-36) demonstrates the recommended pattern of using data arrays with `v-for` instead of repeating similar HTML structures:

```vue
<template v-for="(link, index) in links" :key="link.href">
  <q-separator v-if="index > 0" />
  <q-item clickable tag="a" :href="link.href" target="_blank">
    <!-- ... -->
  </q-item>
</template>
```

This pattern should be applied wherever multiple similar elements are rendered.

---

## Todo List for Implementation

- [ ] Create `useNotify.ts` composable
- [ ] Create `useListActions.ts` composable
- [ ] Create `useTodoActions.ts` composable
- [ ] Create `ListsSidebar.vue` component
- [ ] Create `AddListDialog.vue` component
- [ ] Create `TodoItem.vue` component
- [ ] Create `AddTodoForm.vue` component
- [ ] Refactor `IndexPage.vue`
- [ ] Refactor `SingleListPage.vue`
- [ ] Run eslint and prettier
- [ ] Test all functionality