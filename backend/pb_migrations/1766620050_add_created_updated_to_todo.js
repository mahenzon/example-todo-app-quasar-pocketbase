/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const todosCollection = app.findCollectionByNameOrId("todos");
  todosCollection.fields.add(new Field({
    name: "created",
    onCreate: true,
    onUpdate: false,
    hidden: false,
    presentable: false,
    system: false,
    type: "autodate",
  }));

  // {
  //   "hidden": false,
  //   "id": "autodate2990389176",
  //   "name": "created",
  //   "onCreate": true,
  //   "onUpdate": false,
  //   "presentable": false,
  //   "system": false,
  //   "type": "autodate"
  // }
  return app.save(todosCollection);

}, (app) => {
  // add down queries...
  const todosCollection = app.findCollectionByNameOrId("todos");
  todosCollection.fields.removeByName("created");
  app.save(todosCollection);
})
