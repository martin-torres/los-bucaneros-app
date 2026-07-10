/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  // add customerColonia (text) — neighborhood/colonia for Mexican addresses
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4129376850",
    "max": 0,
    "min": 0,
    "name": "customerColonia",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add customerDetails (text) — apartment, house color, landmarks
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text5738294160",
    "max": 0,
    "min": 0,
    "name": "customerDetails",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add changeAmount (number) — change to return for cash payments
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number6849305271",
    "max": null,
    "min": 0,
    "name": "changeAmount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  collection.fields.removeById("text4129376850")
  collection.fields.removeById("text5738294160")
  collection.fields.removeById("number6849305271")

  return app.save(collection)
})
