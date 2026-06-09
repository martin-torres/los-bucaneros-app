/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2382559930")

  // add promoActive (bool) — marks item as a promo
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "bool3729104821",
    "name": "promoActive",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add promoPrice (number, optional) — discounted price
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number3729104822",
    "max": null,
    "min": 0,
    "name": "promoPrice",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add promoBundle (json, optional) — array of bundle items for combos
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "json3729104823",
    "maxSize": 0,
    "name": "promoBundle",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2382559930")

  collection.fields.removeById("bool3729104821")
  collection.fields.removeById("number3729104822")
  collection.fields.removeById("json3729104823")

  return app.save(collection)
})
