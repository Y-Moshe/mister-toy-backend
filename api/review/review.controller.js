const logger = require('../../services/logger.service')
const toyService = require('../toy/toy.service')
const socketService = require('../../services/socket.service')
const reviewService = require('./review.service')

async function getReviews(req, res) {
  try {
    const reviews = await reviewService.query(req.query)
    res.send(reviews)
  } catch (err) {
    logger.error('Cannot get reviews', err)
    res.status(500).send({ err: 'Failed to get reviews' })
  }
}

async function deleteReview(req, res) {
  const { id: reviewId } = req.params
  const { loggedinUser } = req

  try {
    const { deletedCount, toyId } = await reviewService.remove(reviewId)
    if (deletedCount === 1) {
      await toyService.removeReview(toyId, reviewId)

      socketService.broadcast({
        type: socketService.emits.SOCKET_EMIT_REVIEW_REMOVED,
        data: reviewId,
        room: toyId.toString(),
        userId: loggedinUser._id
      })

      res.send({ msg: 'Deleted successfully' })
    } else {
      res.status(400).send({ err: 'Cannot remove review' })
    }
  } catch (err) {
    logger.error('Failed to delete review', err)
    res.status(500).send({ err: 'Failed to delete review' })
  }
}


async function addReview(req, res) {
  const { loggedinUser } = req

  try {
    let review = req.body
    review.userId = loggedinUser._id
    review = await reviewService.add(review)

    await toyService.addReview(review.toyId, review)

    socketService.broadcast({
      type: socketService.emits.SOCKET_EMIT_REVIEW_ADDED,
      data: review,
      room: review.toyId.toString(),
      userId: loggedinUser._id
    })

    res.send(review)

  } catch (err) {
    logger.error('Failed to add review', err)
    res.status(500).send({ err: 'Failed to add review' })
  }
}

module.exports = {
  getReviews,
  deleteReview,
  addReview
}