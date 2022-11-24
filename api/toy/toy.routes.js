const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth')
const controller = require('./toy.controller')
const router = express.Router()

router.get('/', controller.getToys)

router.get('/:id', controller.getToyById)

router.post('/', requireAuth, requireAdmin, controller.addToy)

router.put('/:id', requireAuth, requireAdmin, controller.updateToy)

router.post('/:id/review', requireAuth, controller.addReview)

router.delete('/:id/review/:reviewId', requireAuth, controller.removeReview)

router.delete('/:id', requireAuth, requireAdmin, controller.removeToy)

module.exports = router