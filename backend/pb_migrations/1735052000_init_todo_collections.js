/// <reference path="../pb_data/types.d.ts" />

/**
 * Initial migration for Todo List application.
 * Creates todo_lists and todos collections with:
 * - Proper relations to users collection
 * - Autodate fields (created, updated)
 * - Access rules allowing:
 *   - Authenticated users to see their own lists
 *   - Anyone (including anonymous) to see public lists
 *   - Only owners to create/update/delete their data
 */
migrate((app) => {
  // Get the users collection to reference its ID
  const users = app.findCollectionByNameOrId("users");

  // 1. Create todo_lists collection
  const todoListsCollection = new Collection({
    name: "todo_lists",
    type: "base",
    // Access rules:
    // - Authenticated users can see their own lists
    // - Anyone (including anonymous) can see public lists
    listRule: "user = @request.auth.id || is_public = true",
    viewRule: "user = @request.auth.id || is_public = true",
    // Only authenticated users can create lists
    createRule: "@request.auth.id != ''",
    // Only the owner can update/delete their lists
    updateRule: "user = @request.auth.id",
    deleteRule: "user = @request.auth.id",
  });

  // Add fields to todo_lists
  todoListsCollection.fields.add(new TextField({
    name: "title",
    required: true,
    min: 1,
  }));

  todoListsCollection.fields.add(new RelationField({
    name: "user",
    required: true,
    collectionId: users.id,
    cascadeDelete: true,
    maxSelect: 1,
  }));

  todoListsCollection.fields.add(new BoolField({
    name: "is_public",
  }));

  todoListsCollection.fields.add(new AutodateField({
    name: "created",
    onCreate: true,
    onUpdate: false,
  }));

  todoListsCollection.fields.add(new AutodateField({
    name: "updated",
    onCreate: true,
    onUpdate: true,
  }));

  app.save(todoListsCollection);

  // 2. Create todos collection
  const todosCollection = new Collection({
    name: "todos",
    type: "base",
    // Access rules:
    // - Authenticated users can see todos in their own lists
    // - Anyone (including anonymous) can see todos in public lists
    listRule: "list.user = @request.auth.id || list.is_public = true",
    viewRule: "list.user = @request.auth.id || list.is_public = true",
    // Only the list owner can create/update/delete todos
    createRule: "list.user = @request.auth.id",
    updateRule: "list.user = @request.auth.id",
    deleteRule: "list.user = @request.auth.id",
  });

  // Add fields to todos
  todosCollection.fields.add(new TextField({
    name: "text",
    required: true,
    min: 1,
  }));

  todosCollection.fields.add(new BoolField({
    name: "is_completed",
  }));

  todosCollection.fields.add(new RelationField({
    name: "list",
    required: true,
    collectionId: todoListsCollection.id,
    cascadeDelete: true,
    maxSelect: 1,
  }));

  todosCollection.fields.add(new AutodateField({
    name: "created",
    onCreate: true,
    onUpdate: false,
  }));

  todosCollection.fields.add(new AutodateField({
    name: "updated",
    onCreate: true,
    onUpdate: true,
  }));

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
