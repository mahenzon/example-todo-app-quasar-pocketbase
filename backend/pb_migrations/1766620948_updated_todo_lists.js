/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2076275622")

  // update collection data
  unmarshal({
    "listRule": "user = @request.auth.id || is_public = true",
    "viewRule": "user = @request.auth.id || is_public = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2076275622")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != '' && user = @request.auth.id || is_public = true",
    "viewRule": "@request.auth.id != '' && user = @request.auth.id || is_public = true"
  }, collection)

  return app.save(collection)
})
