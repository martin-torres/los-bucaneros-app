/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const orders = app.findCollectionByNameOrId("pbc_3527180448")
  orders.listRule = ""
  orders.updateRule = ""
  app.save(orders)
}, (app) => {
  const orders = app.findCollectionByNameOrId("pbc_3527180448")
  orders.listRule = null
  orders.updateRule = null
  app.save(orders)
})
