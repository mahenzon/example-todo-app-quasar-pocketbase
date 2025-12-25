/// <reference path="../pb_data/types.d.ts" />

/**
 * Initial migration for Todo List application.
 * Creates todo_lists and todos collections with proper relations, access rules,
 * and autodate fields (created, updated).
 */
migrate((app) => {
  // Get the users collection to reference its ID
  const users = app.findCollectionByNameOrId("users");

  // 1. Create todo_lists collection
  const todoListsCollection = new Collection({
    name: "todo_lists",
    type: "base",
    // fields: [
    //   {
    //     name: "title",
    //     type: "text",
    //     required: true,
    //     min: 1,
    //   },
    //   {
    //     name: "user",
    //     type: "relation",
    //     required: true,
    //     collectionId: users.id,
    //     cascadeDelete: true,
    //     maxSelect: 1,
    //   },
    //   {
    //     name: "is_public",
    //     type: "bool",
    //   },
    // //   {
    // //     name: "created",
    // //     type: "Autodate",
    // //     onCreate: true,
    // //     onUpdate: false,
    // //   },
    // //   {
    // //     name: "updated",
    // //     type: "Autodate",
    // //     onCreate: true,
    // //     onUpdate: true,
    // //   },
    //   new AutodateField({
    //     name: "created",
    //     onCreate: true,
    //     onUpdate: false,
    //   }),
    //   new AutodateField({
    //     name: "updated",
    //     onCreate: true,
    //     onUpdate: true,
    //   }),
    // //   {
    // //     name: "created",
    // //     type: "Autodate",
    // //     onCreate: true,
    // //     onUpdate: false,
    // //   },
    // //   {
    // //     name: "updated",
    // //     type: "Autodate",
    // //     onCreate: true,
    // //     onUpdate: true,
    // //   },
    // ],
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

  todoListsCollection.fields.add(new TextField({
      name: "title",
      required: true,
      min: 1,
    })
  )
  todoListsCollection.fields.add(new RelationField({
      name: "user",
      required: true,
      collectionId: users.id,
      cascadeDelete: true,
      maxSelect: 1,
    })
  )
  todoListsCollection.fields.add(new BoolField({
      name: "is_public",
    })
  )
  // todoListsCollection.fields.add(new AutodateField({
  //     name: "created",
  //     onCreate: true,
  //   })
  // )
  // todoListsCollection.fields.add(new AutodateField({
  //     name: "updated",
  //     onCreate: true,
  //     onUpdate: true,
  //   })
  // )
  

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
    //   {
    //     name: "created",
    //     type: "autodate",
    //     onCreate: true,
    //     onUpdate: false,
    //   },
    //   {
    //     name: "updated",
    //     type: "autodate",
    //     onCreate: true,
    //     onUpdate: true,
    //   },
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
