export default {
  // App-wide
  app: {
    title: 'Todo App',
  },

  // Navigation
  nav: {
    about: 'About',
    logout: 'Logout',
  },

  // Auth
  auth: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    passwordConfirm: 'Confirm Password',
    loginFailed: 'Login failed. Please check your credentials.',
    registerFailed: 'Registration failed. Please try again.',
  },

  // Validation
  validation: {
    required: 'Please type something',
    passwordMin: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
  },

  // Lists
  lists: {
    myLists: 'My Lists',
    newList: 'New List',
    listTitle: 'List Title',
    makePublic: 'Make Public',
    public: 'Public',
    private: 'Private',
    copyLink: 'Copy Public Link',
    makePrivate: 'Make Private',
    deleteList: 'Delete List',
    selectList: 'Select a list to view todos',
    confirmDelete: 'Confirm',
    confirmDeleteMessage: 'Are you sure you want to delete this list?',
  },

  // Todos
  todos: {
    addTodo: 'Add a new todo',
    add: 'Add',
    noTodos: 'No todos in this list.',
  },

  // Actions
  actions: {
    cancel: 'Cancel',
    create: 'Create',
    confirm: 'Confirm',
  },

  // Notifications
  notifications: {
    linkCopied: 'Link copied to clipboard',
    failedToCreateList: 'Failed to create list',
    failedToDeleteList: 'Failed to delete list',
    failedToUpdateVisibility: 'Failed to update list visibility',
    failedToCopyLink: 'Failed to copy link',
    failedToCreateTodo: 'Failed to create todo',
    failedToUpdateTodo: 'Failed to update todo',
    failedToDeleteTodo: 'Failed to delete todo',
  },

  // About page
  about: {
    title: 'About',
    appName: 'Todo App',
    description:
      'A simple and elegant todo list application built with Quasar Framework and PocketBase. Create and manage your task lists, share them publicly, and enjoy real-time updates across all your devices.',
    links: 'Links',
    github: 'GitHub',
    githubCaption: 'Project source code',
    telegram: 'Telegram Channel',
    youtube: 'YouTube Channel',
    homepage: 'Homepage',
    webCourse: 'Web Development Course',
  },

  // Error pages
  errors: {
    notFound: 'Oops. Nothing here...',
    goHome: 'Go Home',
    accessDenied: 'Access Denied',
    loginPrompt: 'Please log in to access this list',
    listNotFound: 'List Not Found',
    listNotFoundMessage: "This list doesn't exist or you don't have access to it",
    goToMyLists: 'Go to My Lists',
  },

  // Public list view
  publicList: {
    badge: 'Public',
    loginToCreate: 'Login to create your own lists',
  },

}
