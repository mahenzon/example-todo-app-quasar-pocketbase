import { defineStore } from 'pinia';
import { pb } from 'src/services/pocketbase';
import type { RecordModel } from 'pocketbase';

export interface TodoList extends RecordModel {
  title: string;
  user: string;
  is_public: boolean;
}

export interface TodoItem extends RecordModel {
  text: string;
  is_completed: boolean;
  list: string;
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    lists: [] as TodoList[],
    publicLists: [] as TodoList[],
    currentList: null as TodoList | null,
    todos: [] as TodoItem[],
  }),
  actions: {
    async fetchLists() {
      // Fetch user's lists - PocketBase listRule handles filtering:
      // "user = @request.auth.id || is_public = true"
      // So we only need to be authenticated, no additional filter needed
      if (!pb.authStore.isValid) return;

      try {
        // Use getList instead of getFullList to avoid skipTotal parameter
        // which causes 400 error in this PocketBase version
        // Note: sort by 'created' removed as the field doesn't exist in this schema
        const result = await pb.collection('todo_lists').getList<TodoList>(1, 500);
        // Filter to only show user's own lists (not other users' public lists)
        const userId = pb.authStore.model?.id;
        this.lists = result.items.filter((list) => list.user === userId);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    },
    async fetchList(id: string) {
      try {
        const record = await pb.collection('todo_lists').getOne<TodoList>(id);
        return record;
      } catch (error) {
        console.error('Error fetching list:', error);
        return null;
      }
    },
    async fetchPublicLists() {
      // Use getList instead of getFullList to avoid skipTotal parameter
      // Note: sort by 'created' removed as the field doesn't exist in this schema
      const result = await pb.collection('todo_lists').getList<TodoList>(1, 500, {
        filter: 'is_public = true',
      });
      this.publicLists = result.items;
    },
    async createList(title: string, isPublic: boolean = false) {
      const record = await pb.collection('todo_lists').create<TodoList>({
        title,
        is_public: isPublic,
        user: pb.authStore.model?.id,
      });
      this.lists.unshift(record);
      return record;
    },
    async updateList(id: string, data: Partial<TodoList>) {
      const record = await pb.collection('todo_lists').update<TodoList>(id, data);
      const index = this.lists.findIndex((l) => l.id === id);
      if (index !== -1) {
        this.lists[index] = record;
      }
      if (this.currentList?.id === id) {
        this.currentList = record;
      }
    },
    async deleteList(id: string) {
      await pb.collection('todo_lists').delete(id);
      this.lists = this.lists.filter((l) => l.id !== id);
      if (this.currentList?.id === id) {
        this.currentList = null;
        this.todos = [];
      }
    },
    async fetchTodos(listId: string) {
      // Use getList instead of getFullList to avoid skipTotal parameter
      // PocketBase requires double quotes for string values in filters
      // Note: sort by 'created' removed as the field doesn't exist in this schema
      const result = await pb.collection('todos').getList<TodoItem>(1, 500, {
        filter: `list = "${listId}"`,
      });
      this.todos = result.items;
    },
    async createTodo(listId: string, text: string): Promise<TodoItem> {
      const record = await pb.collection('todos').create<TodoItem>({
        text,
        list: listId,
        is_completed: false,
      });
      this.todos.unshift(record);
      return record;
    },
    async updateTodo(id: string, data: Partial<TodoItem>) {
      const record = await pb.collection('todos').update<TodoItem>(id, data);
      const index = this.todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.todos[index] = record;
      }
    },
    async deleteTodo(id: string) {
      await pb.collection('todos').delete(id);
      this.todos = this.todos.filter((t) => t.id !== id);
    },
    setCurrentList(list: TodoList) {
      this.currentList = list;
      this.todos = [];
      void this.fetchTodos(list.id);
    },
  },
});
