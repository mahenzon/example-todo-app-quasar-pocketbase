# Plan 006: Internationalization (i18n) Implementation

## Overview

Implement i18n (internationalization) support for the Todo App with English and Russian translations.
The app should detect the user's preferred language from browser settings and allow manual language switching via a picker in the navbar.

## Goals

1. Restore vue-i18n and @intlify/unplugin-vue-i18n packages
2. Create comprehensive translation files for English and Russian
3. Auto-detect user's preferred locale from browser
4. Add language picker between "About" and user email in navbar
5. Translate all UI strings in components, pages, and composables

## Architecture

### Directory Structure

```
frontend/src/
├── boot/
│   └── i18n.ts              # i18n initialization and locale detection
├── i18n/
│   ├── index.ts             # Export all locales
│   ├── en-US/
│   │   └── index.ts         # English translations
│   └── ru-RU/
│       └── index.ts         # Russian translations
```

### Translation Key Categories

```typescript
interface TranslationSchema {
  // App-wide
  app: {
    title: string
  }
  
  // Navigation
  nav: {
    about: string
    logout: string
  }
  
  // Auth
  auth: {
    login: string
    register: string
    email: string
    password: string
    passwordConfirm: string
    loginFailed: string
    registerFailed: string
  }
  
  // Validation
  validation: {
    required: string
    passwordMin: string
    passwordMismatch: string
  }
  
  // Lists
  lists: {
    myLists: string
    newList: string
    listTitle: string
    makePublic: string
    public: string
    private: string
    copyLink: string
    makePrivate: string
    deleteList: string
    selectList: string
    confirmDelete: string
    confirmDeleteMessage: string
  }
  
  // Todos
  todos: {
    addTodo: string
    add: string
    noTodos: string
  }
  
  // Actions & Notifications
  actions: {
    cancel: string
    create: string
    confirm: string
  }
  
  notifications: {
    linkCopied: string
    failedToCreateList: string
    failedToDeleteList: string
    failedToUpdateVisibility: string
    failedToCopyLink: string
    failedToCreateTodo: string
    failedToUpdateTodo: string
    failedToDeleteTodo: string
  }
  
  // About page
  about: {
    title: string
    description: string
    links: string
    github: string
    githubCaption: string
    telegram: string
    youtube: string
    homepage: string
    webCourse: string
  }
  
  // Error page
  errors: {
    notFound: string
    goHome: string
    accessDenied: string
    loginPrompt: string
    listNotFound: string
    listNotFoundMessage: string
    goToMyLists: string
  }
  
  // Public list view
  publicList: {
    badge: string
    loginToCreate: string
  }
  
  // Language picker
  language: {
    label: string
    en: string
    ru: string
  }
}
```

### Locale Detection Strategy

1. Check `localStorage` for saved language preference
2. Fall back to browser's `navigator.language` or `navigator.languages`
3. Map browser language to supported locales (en-US, ru-RU)
4. Default to 'en-US' if no match found

### Language Picker Component

- Located in MainLayout.vue navbar between "About" button and user email
- QSelect dropdown with flag icons or language codes
- Saves preference to localStorage
- Updates i18n locale reactively

## Todo List

- [x] Create plan file
- [ ] Install vue-i18n and @intlify/unplugin-vue-i18n packages
- [ ] Create i18n/en-US/index.ts with English translations
- [ ] Create i18n/ru-RU/index.ts with Russian translations
- [ ] Create i18n/index.ts to export locales
- [ ] Create boot/i18n.ts with locale detection
- [ ] Update quasar.config.ts to enable i18n boot and plugin
- [ ] Update AuthLayout.vue with i18n
- [ ] Update MainLayout.vue with i18n and language picker
- [ ] Update LoginPage.vue with i18n
- [ ] Update RegisterPage.vue with i18n
- [ ] Update AboutPage.vue with i18n
- [ ] Update ErrorNotFound.vue with i18n
- [ ] Update IndexPage.vue with i18n
- [ ] Update SingleListPage.vue with i18n
- [ ] Update ListsSidebar.vue with i18n
- [ ] Update AddListDialog.vue with i18n
- [ ] Update TodoItem.vue with i18n
- [ ] Update AddTodoForm.vue with i18n
- [ ] Update useListActions.ts with i18n
- [ ] Update useTodoActions.ts with i18n
- [ ] Run eslint and prettier
- [ ] Test the implementation

## Files to Modify

### New Files
- `frontend/src/i18n/index.ts`
- `frontend/src/i18n/en-US/index.ts`
- `frontend/src/i18n/ru-RU/index.ts`
- `frontend/src/boot/i18n.ts`

### Existing Files to Modify
- `frontend/package.json` (add dependencies)
- `frontend/quasar.config.ts` (enable boot file and plugin)
- `frontend/src/layouts/AuthLayout.vue`
- `frontend/src/layouts/MainLayout.vue`
- `frontend/src/pages/LoginPage.vue`
- `frontend/src/pages/RegisterPage.vue`
- `frontend/src/pages/AboutPage.vue`
- `frontend/src/pages/ErrorNotFound.vue`
- `frontend/src/pages/IndexPage.vue`
- `frontend/src/pages/SingleListPage.vue`
- `frontend/src/components/lists/ListsSidebar.vue`
- `frontend/src/components/lists/AddListDialog.vue`
- `frontend/src/components/todos/TodoItem.vue`
- `frontend/src/components/todos/AddTodoForm.vue`
- `frontend/src/composables/useListActions.ts`
- `frontend/src/composables/useTodoActions.ts`