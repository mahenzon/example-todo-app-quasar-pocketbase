# Fix Empty Lists on Page Refresh

## Problem Analysis

After analyzing the codebase, I identified the root cause of the "empty list of todo lists" issue on page refresh:

### Root Cause
In [`IndexPage.vue`](frontend/src/pages/IndexPage.vue:129), the `onMounted` hook checks `authStore.user` to decide whether to fetch lists:

```typescript
onMounted(async () => {
  if (authStore.user) {
    await todoStore.fetchLists();
  } else {
    // Watch for auth changes if not ready
    const unwatch = authStore.$subscribe(...)
  }
});
```

The issue is that `authStore.user` is initialized from `pb.authStore.model` in [`auth.ts`](frontend/src/stores/auth.ts:7):
```typescript
user: pb.authStore.model as unknown as AuthModel | null,
```

However, PocketBase's `authStore.model` may not be immediately available on page load because PocketBase needs to parse the stored auth data from localStorage. The `authStore.init()` method is called in the router guard, but there's a race condition - the component may mount before the auth store is fully initialized.

### Additional Issues Found
1. The `SingleListPage.vue` route requires auth (`meta: { requiresAuth: true }`), but public lists should be accessible without authentication.
2. The `PublicListsPage.vue` is no longer needed since we're removing the public lists navigation.

## Solution

### 1. Fix Auth Initialization Race Condition
The auth store's `init()` method should be called synchronously at store creation time, not just in the router guard. We need to ensure `pb.authStore.model` is loaded before the component tries to use it.

### 2. Make SingleListPage Accessible Without Auth for Public Lists
Move the `/lists/:id` route outside the auth-protected section so public lists can be viewed by anyone.

### 3. Remove PublicListsPage
Delete the unused `PublicListsPage.vue` file.

### 4. Improve IndexPage Auth Handling
Use a more robust approach to wait for auth initialization before fetching lists.

## Implementation Steps

- [ ] 1. Update `frontend/src/stores/auth.ts` - Call `init()` immediately in the store definition
- [ ] 2. Update `frontend/src/router/routes.ts` - Move `/lists/:id` route to be accessible without auth
- [ ] 3. Update `frontend/src/pages/IndexPage.vue` - Improve auth waiting logic
- [ ] 4. Delete `frontend/src/pages/PublicListsPage.vue` - No longer needed
- [ ] 5. Run eslint and prettier
- [ ] 6. Test the fix
- [ ] 7. Create commits

## Files to Modify

1. `frontend/src/stores/auth.ts` - Auto-initialize on store creation
2. `frontend/src/router/routes.ts` - Restructure routes for public access
3. `frontend/src/pages/IndexPage.vue` - Fix auth waiting logic
4. `frontend/src/pages/PublicListsPage.vue` - Delete this file