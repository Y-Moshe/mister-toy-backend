const dbService = require('../../services/db.service')
const { ObjectId } = require('mongodb')

module.exports = {
  query,
  getById,
  remove,
  save,
  addReview,
  removeReview
}

async function query() {
  const collection = await dbService.getCollection('toy')
  const toys =  await collection.find({}).toArray()

  return toys.map(_mapToyObj)
}

async function getById(toyId) {
  const collection = await dbService.getCollection('toy')
  const toy = await collection.findOne({ _id: ObjectId(toyId) })
  if (!toy) return Promise.reject('invalid toy id')

  return _mapToyObj(toy)
}

async function save(toy) {
  const collection = await dbService.getCollection('toy')
  const { _id: toyId } = toy

  delete toy._id
  return await collection.updateOne(
    { _id: ObjectId(toyId) },
    { $set: toy },
    { upsert: true }
  )
}

async function addReview(toyId, review) {
  const collection = await dbService.getCollection('toy')
  const objectId = new ObjectId()
  const reviewToSave = {
    _id: objectId,
    txt: review
  }
  const results = await collection.updateOne(
    { _id: ObjectId(toyId) },
    { $push: { reviews: reviewToSave }}
  )

  return { ...results, _id: objectId }
}

async function removeReview(toyId, reviewId) {
  const collection = await dbService.getCollection('toy')
  return await collection.updateOne(
    { _id: ObjectId(toyId) },
    { $pull: { reviews: { _id: ObjectId(reviewId) }}}
  )
}

async function remove(toyId) {
  const collection = await dbService.getCollection('toy')
  return await collection.deleteOne({ _id: ObjectId(toyId) }) 
}

// Private

function _mapToyObj(toy) {
  return {
    ...toy,
    createdAt: ObjectId(toy._id).getTimestamp()
  }
}