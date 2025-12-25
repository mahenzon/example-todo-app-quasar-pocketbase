export default {
  // App-wide
  app: {
    title: 'Todo App',
  },

  // Navigation
  nav: {
    about: 'О приложении',
    logout: 'Выйти',
  },

  // Auth
  auth: {
    login: 'Войти',
    register: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    passwordConfirm: 'Подтверждение пароля',
    loginFailed: 'Ошибка входа. Проверьте учётные данные.',
    registerFailed: 'Ошибка регистрации. Попробуйте ещё раз.',
  },

  // Validation
  validation: {
    required: 'Пожалуйста, введите значение',
    passwordMin: 'Пароль должен содержать минимум 8 символов',
    passwordMismatch: 'Пароли не совпадают',
  },

  // Lists
  lists: {
    myLists: 'Мои списки',
    newList: 'Новый список',
    listTitle: 'Название списка',
    makePublic: 'Сделать публичным',
    public: 'Публичный',
    private: 'Приватный',
    copyLink: 'Скопировать ссылку',
    makePrivate: 'Сделать приватным',
    deleteList: 'Удалить список',
    selectList: 'Выберите список для просмотра задач',
    confirmDelete: 'Подтверждение',
    confirmDeleteMessage: 'Вы уверены, что хотите удалить этот список?',
  },

  // Todos
  todos: {
    addTodo: 'Добавить новую задачу',
    add: 'Добавить',
    noTodos: 'В этом списке нет задач.',
  },

  // Actions
  actions: {
    cancel: 'Отмена',
    create: 'Создать',
    confirm: 'Подтвердить',
  },

  // Notifications
  notifications: {
    linkCopied: 'Ссылка скопирована в буфер обмена',
    failedToCreateList: 'Не удалось создать список',
    failedToDeleteList: 'Не удалось удалить список',
    failedToUpdateVisibility: 'Не удалось изменить видимость списка',
    failedToCopyLink: 'Не удалось скопировать ссылку',
    failedToCreateTodo: 'Не удалось создать задачу',
    failedToUpdateTodo: 'Не удалось обновить задачу',
    failedToDeleteTodo: 'Не удалось удалить задачу',
  },

  // About page
  about: {
    title: 'О приложении',
    appName: 'Todo App',
    description:
      'Простое и элегантное приложение для управления списками задач, созданное на Quasar Framework и PocketBase. Создавайте и управляйте своими списками задач, делитесь ими публично и наслаждайтесь обновлениями в реальном времени на всех ваших устройствах.',
    links: 'Ссылки',
    github: 'GitHub',
    githubCaption: 'Исходный код проекта',
    telegram: 'Telegram канал',
    youtube: 'YouTube канал',
    homepage: 'Домашняя страница',
    webCourse: 'Курс веб-разработки',
  },

  // Error pages
  errors: {
    notFound: 'Упс. Здесь ничего нет...',
    goHome: 'На главную',
    accessDenied: 'Доступ запрещён',
    loginPrompt: 'Пожалуйста, войдите для доступа к этому списку',
    listNotFound: 'Список не найден',
    listNotFoundMessage: 'Этот список не существует или у вас нет к нему доступа',
    goToMyLists: 'К моим спискам',
  },

  // Public list view
  publicList: {
    badge: 'Публичный',
    loginToCreate: 'Войдите, чтобы создать свои списки',
  },

}
