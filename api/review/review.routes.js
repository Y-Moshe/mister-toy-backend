const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth')
const { addReview, getReviews, deleteReview } = require('./review.controller')
const router = express.Router()

router.get('/', getReviews)

router.post('/', requireAuth, addReview)

router.delete('/:id', requireAuth, deleteReview)

module.exports = router