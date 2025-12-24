import { defineStore } from 'pinia';
import { pb } from 'src/services/pocketbase';

// Flag to track if auth listener is set up
let authListenerInitialized = false;

// Promise that resolves when auth is initialized
let initPromise: Promise<void> | null = null;
let initResolve: (() => void) | null = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: pb.authStore.model,
    isInitialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(email: string, pass: string) {
      const authData = await pb.collection('users').authWithPassword(email, pass);
      this.user = authData.record;
    },
    async register(email: string, pass: string, passConfirm: string) {
      await pb.collection('users').create({
        email,
        password: pass,
        passwordConfirm: passConfirm,
      });
      // Optional: auto login after register
      await this.login(email, pass);
    },
    logout() {
      pb.authStore.clear();
      this.user = null;
    },
    init() {
      // Sync state with PocketBase auth store on load
      this.user = pb.authStore.model;
      this.isInitialized = true;

      // Resolve the init promise if it exists
      if (initResolve) {
        initResolve();
        initResolve = null;
      }

      // Set up listener only once
      if (!authListenerInitialized) {
        authListenerInitialized = true;
        pb.authStore.onChange((_token, model) => {
          this.user = model;
        });
      }
    },
    /**
     * Wait for auth to be initialized.
     * Returns immediately if already initialized.
     */
    async waitForInit(): Promise<void> {
      if (this.isInitialized) {
        return;
      }

      // Create promise if it doesn't exist
      if (!initPromise) {
        initPromise = new Promise<void>((resolve) => {
          initResolve = resolve;
        });
      }

      return initPromise;
    },
  },
});
