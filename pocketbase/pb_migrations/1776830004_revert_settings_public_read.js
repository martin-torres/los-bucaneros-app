/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Revert restaurant_settings to public read (hook reads it, strips secrets before sending)
  const settings = app.findCollectionByNameOrId("restaurant_settings")
  settings.listRule = ""
  settings.viewRule = ""
  app.save(settings)
}, (app) => {
  const settings = app.findCollectionByNameOrId("restaurant_settings")
  settings.listRule = null
  settings.viewRule = null
  app.save(settings)
})
