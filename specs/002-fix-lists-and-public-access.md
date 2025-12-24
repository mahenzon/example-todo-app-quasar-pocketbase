# Fix Lists and Public Access

## Problem
1. When adding a new list and refreshing the page, the user reports getting an empty list of todo lists.
2. The user wants to filter lists to show only their own lists, not all accessible lists (which might include public lists from others).
3. "Public todo lists" should be removed from the main navigation.
4. Public todo lists should be read-only and available by URL (e.g., `/lists/:id`).

## Solution

### 1. Server-side Filtering
Instead of fetching all lists and filtering client-side, we will use PocketBase's filter parameter to fetch only the lists belonging to the current user.

```typescript
// frontend/src/stores/todo.ts
const records = await pb.collection('todo_lists').getFullList<TodoList>({
  filter: `user = "${userId}"`,
  sort: '-created',
});
```

### 2. Remove Public Lists from Navigation
We will remove the "Public Lists" link from `frontend/src/layouts/MainLayout.vue`.

### 3. Public List Access by URL
We will create a new page `frontend/src/pages/SingleListPage.vue` (or reuse/refactor `PublicListsPage.vue` or `IndexPage.vue`) to handle displaying a single list by ID.
The route will be `/lists/:id`.
This page will fetch the specific list and its todos.
If the list is public and not owned by the user, it will be read-only.
If the list is owned by the user, it should probably redirect to the main dashboard or allow editing (but the requirement says "public todo should be read only and available by url", implying this view is for sharing).

### 4. Fix "Empty List" Issue
The empty list issue might be due to `userId` being undefined during fetch or the client-side filter failing. Server-side filtering with a valid `userId` check should resolve this. We need to ensure `fetchLists` is only called when `userId` is available.

## Implementation Steps
1.  Update `frontend/src/stores/todo.ts`:
    *   Modify `fetchLists` to use server-side filtering: `user = "${userId}"`.
    *   Add `fetchList(id: string)` action to fetch a single list (for the public view).
2.  Update `frontend/src/layouts/MainLayout.vue`:
    *   Remove "Public Lists" from `linksList`.
3.  Create `frontend/src/pages/SingleListPage.vue`:
    *   Fetch list details on mount using route param.
    *   Display todos.
    *   Read-only view.
4.  Update `frontend/src/router/routes.ts`:
    *   Add route `/lists/:id` pointing to `SingleListPage.vue`.
    *   Remove `/public` route if it's no longer needed (or keep it if "Public Lists" page is still desired but just not in nav? User said "completely remove 'public todo lists' from navigation", usually implies the page isn't reachable via UI, but maybe the page itself should be gone. "public todo should be read only and available by url" suggests we access specific lists, not a directory of all public lists). I will assume the "Public Lists" directory page is to be removed or at least hidden. The requirement "available by url" likely refers to specific lists.

## Todo List
- [ ] Update `frontend/src/stores/todo.ts`
- [ ] Remove Public Lists link from `MainLayout.vue`
- [ ] Create `frontend/src/pages/SingleListPage.vue`
- [ ] Update router
- [ ] Verify fix