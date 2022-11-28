const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('review')
    let reviews = await collection.aggregate([
      {
        $match: criteria
      },
      {
        $lookup:
        {
          localField: 'userId',
          from: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup:
        {
          localField: 'toyId',
          from: 'toy',
          foreignField: '_id',
          as: 'toy'
        }
      },
      {
        $unwind: '$toy'
      }
    ]).toArray()
    console.log('reviews', reviews)

    // reviews = reviews.map(review => {
    //   review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname }
    //   review.aboutUser = { _id: review.aboutUser._id, fullname: review.aboutUser.fullname }
    //   delete review.byUserId
    //   delete review.aboutUserId
    //   return review
    // })

    return reviews
  } catch (err) {
    logger.error('cannot find reviews', err)
    throw err
  }
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    const collection = await dbService.getCollection('review')
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(reviewId) }
    if (!loggedinUser.isAdmin) criteria.userId = ObjectId(loggedinUser._id)
    const review = await collection.findOne(criteria)
    const { deletedCount } = await collection.deleteOne(criteria)
    return { deletedCount, toyId: review.toyId }
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err)
    throw err
  }
}

async function add({ userId, toyId, txt }) {
  try {
    const reviewToAdd = {
      userId: userId ? ObjectId(userId) : userId,
      toyId: ObjectId(toyId),
      txt
    }

    const collection = await dbService.getCollection('review')
    await collection.insertOne(reviewToAdd)
    return reviewToAdd
  } catch (err) {
    logger.error('cannot insert review', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.userId) criteria.userId = filterBy.userId
  if (filterBy.toyId) criteria.toyId = filterBy.toyId
  return criteria
}

module.exports = {
  query,
  remove,
  add
}