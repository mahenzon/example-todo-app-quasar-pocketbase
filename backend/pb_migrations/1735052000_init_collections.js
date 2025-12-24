/// <reference path="../pb_data/types.d.ts" />

/**
 * Initial migration for Todo List application.
 * Creates todo_lists and todos collections with proper relations and access rules.
 */
migrate((app) => {
  // Get the users collection to reference its ID
  const users = app.findCollectionByNameOrId("users");

  // 1. Create todo_lists collection
  const todoListsCollection = new Collection({
    name: "todo_lists",
    type: "base",
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
        min: 1,
      },
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: users.id,
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        name: "is_public",
        type: "bool",
      },
    ],
    // Access rules:
    // - Authenticated users can see their own lists
    // - Anyone (including anonymous) can see public lists
    listRule: "@request.auth.id != '' && user = @request.auth.id || is_public = true",
    viewRule: "@request.auth.id != '' && user = @request.auth.id || is_public = true",
    // Only authenticated users can create lists
    createRule: "@request.auth.id != ''",
    // Only the owner can update/delete their lists
    updateRule: "user = @request.auth.id",
    deleteRule: "user = @request.auth.id",
  });

  app.save(todoListsCollection);

  // 2. Create todos collection
  const todosCollection = new Collection({
    name: "todos",
    type: "base",
    fields: [
      {
        name: "text",
        type: "text",
        required: true,
        min: 1,
      },
      {
        name: "is_completed",
        type: "bool",
      },
      {
        name: "list",
        type: "relation",
        required: true,
        collectionId: todoListsCollection.id,
        cascadeDelete: true,
        maxSelect: 1,
      },
    ],
    // Access rules:
    // - Authenticated users can see todos in their own lists
    // - Anyone (including anonymous) can see todos in public lists
    listRule: "@request.auth.id != '' && list.user = @request.auth.id || list.is_public = true",
    viewRule: "@request.auth.id != '' && list.user = @request.auth.id || list.is_public = true",
    // Only the list owner can create/update/delete todos
    createRule: "list.user = @request.auth.id",
    updateRule: "list.user = @request.auth.id",
    deleteRule: "list.user = @request.auth.id",
  });

  app.save(todosCollection);

}, (app) => {
  // Rollback: delete collections in reverse order
  try {
    const todos = app.findCollectionByNameOrId("todos");
    app.delete(todos);
  } catch (_) {}

  try {
    const todoLists = app.findCollectionByNameOrId("todo_lists");
    app.delete(todoLists);
  } catch (_) {}
});