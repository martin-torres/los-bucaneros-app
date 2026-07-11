/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Lock down orders collection — only createRule stays open
  const orders = app.findCollectionByNameOrId("pbc_3527180448")
  orders.listRule = null
  orders.viewRule = null
  orders.updateRule = null
  orders.deleteRule = null
  // createRule stays "" (anyone can create)
  app.save(orders)

  // Lock down restaurant_settings — only accessible via custom public endpoint
  const settings = app.findCollectionByNameOrId("restaurant_settings")
  settings.listRule = null
  settings.viewRule = null
  settings.createRule = null
  settings.updateRule = null
  settings.deleteRule = null
  app.save(settings)
}, (app) => {
  // Restore previous rules
  const orders = app.findCollectionByNameOrId("pbc_3527180448")
  orders.listRule = ""
  orders.viewRule = ""
  orders.updateRule = ""
  orders.deleteRule = ""
  app.save(orders)

  const settings = app.findCollectionByNameOrId("restaurant_settings")
  settings.listRule = ""
  settings.viewRule = ""
  settings.createRule = null
  settings.updateRule = null
  settings.deleteRule = null
  app.save(settings)
})
