const toyService = require('./toy.service')
const logger = require('../../services/logger.service')

// Get toys
async function getToys(req, res) {
  try {
    const toys = await toyService.query()
    res.status(200).json(toys)

  } catch (err) {
    logger.error(`Failed to get toys`, err)
    res.status(500).json({ err: `Failed to get toys` })
  }
}

// Get toy
async function getToyById(req, res) {
  const { id: toyId } = req.params
  try {
    const toy = await toyService.getById(toyId)
    res.status(200).json(toy)

  } catch (err) {
    logger.error(`Failed to get toy ${toyId}`, err)
    res.status(500).json({ err: `Failed to get toy ${toyId}` })
  }
}

// Add toy
async function addToy(req, res) {
  try {
    const toy = {
      _id: null,
      name: req.body.name,
      price: +req.body.price,
      imgUrl: req.body.imgUrl,
      tags: req.body.tags,
      inStock: req.body.inStock,
      reviews: []
    }
  
    const result = await toyService.save(toy)
    res.status(201).json(result)
  } catch (err) {
    logger.error(`Failed to add toy`, err)
    res.status(500).json({ err: `Failed to add toy` })
  }
}


// Update toy
async function updateToy(req, res) {
  const { id: toyId } = req.params
  try {
    const toy = {
      _id: toyId,
      name: req.body.name,
      price: +req.body.price,
      imgUrl: req.body.imgUrl,
      tags: req.body.tags,
      inStock: req.body.inStock
    }
  
    const result = await toyService.save(toy)
    res.status(200).json(result)
  } catch (err) {
    logger.error(`Failed to update toy ${toyId}`, err)
    res.status(500).json({ err: `Failed to update toy ${toyId}` })
  }
}

// Add review

async function addReview(req, res) {
  const { id: toyId } = req.params
  try {
    const { review } = req.body
    const result = await toyService.addReview(toyId, review)

    res.status(200).json(result)
  } catch (err) {
    logger.error(`Failed to add a toy review to ${toyId}`, err)
    res.status(500).json({ err: `Failed to add a toy review to ${toyId}` })
  }
}

async function removeReview(req, res) {
  const { id: toyId, reviewId } = req.params
  try {
    const result = await toyService.removeReview(toyId, reviewId)
    res.status(200).json(result)
  } catch (err) {
    logger.error(`Failed to remove toy review to ${toyId}`, err)
    res.status(500).json({ err: `Failed to remove toy review to ${toyId}` })
  }
}

// Remove toy
async function removeToy(req, res) {
  const { id: toyId } = req.params
  try {
    await toyService.remove(toyId)
    res.status(200).send('The toy is removed!')
    
  } catch (err) {
    logger.error(`Failed to remove toy ${toyId}`, err)
    res.status(500).json({ err: `Failed to remove toy ${toyId}` })
  }
}

module.exports = {
  getToys,
  getToyById,
  addToy,
  updateToy,
  removeToy,
  addReview,
  removeReview
}