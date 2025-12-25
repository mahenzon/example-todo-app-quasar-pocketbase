/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_113564862")

  // update collection data
  unmarshal({
    "listRule": "list.user = @request.auth.id || list.is_public = true",
    "viewRule": "list.user = @request.auth.id || list.is_public = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_113564862")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != '' && list.user = @request.auth.id || list.is_public = true",
    "viewRule": "@request.auth.id != '' && list.user = @request.auth.id || list.is_public = true"
  }, collection)

  return app.save(collection)
})
