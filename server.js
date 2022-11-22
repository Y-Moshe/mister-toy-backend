const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const toyService = require('./services/toy.service')
const userService = require('./services/user.service')

const app = express()
const PORT = process.env.PORT || 3030

if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: [
      'http://127.0.0.1:8080',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
  app.use(express.static('public'))
}

app.use(cookieParser())
app.use(express.json())

// DELAY MIDDLEWARE
const RESPONSE_DELAY = 1500
app.use((req, res, next) => setTimeout(next, RESPONSE_DELAY))

// Get toys
app.get('/api/toy', (req, res) => {
  const filterBy = req.query
  toyService.query(filterBy)
    .then((results) => res.status(200).send(results))
})

// Get toy
app.get('/api/toy/:toyId', (req, res) => {
  const { toyId } = req.params

  toyService
    .getById(toyId)
    .then(toy => res.status(200).send(toy))
    .catch(msg => res.status(400).send(msg))
})

// Add toy
app.post('/api/toy', (req, res) => {
  // const token = req.cookies.loginToken
  // const user = userService.validateToken(token)
  // if (!user) return res.status(401).send('You must be logged in')

  const toy = {
    _id: null,
    name: req.body.name,
    price: +req.body.price,
    labels: req.body.labels,
    createdAt: +req.body.createdAt,
    inStock: req.body.inStock
  }

  toyService.save(toy)
    .then(savedToy => res.status(201).send(savedToy))
})


// Update toy
app.put('/api/toy/:toyId', (req, res) => {
  // const token = req.cookies.loginToken
  // const user = userService.validateToken(token)
  // if (!user) return res.status(401).send('You must be logged in')

  const { toyId } = req.params

  const toy = {
    _id: toyId,
    name: req.body.name,
    price: +req.body.price,
    labels: req.body.labels,
    createdAt: +req.body.createdAt,
    inStock: req.body.inStock
  }

  toyService
    .save(toy)
    .then(updatedToy => res.status(201).send(updatedToy))
    .catch(msg => res.status(400).send(msg))
})


// Delete toy
app.delete('/api/toy/:toyId', (req, res) => {
  // const token = req.cookies.loginToken
  // const user = userService.validateToken(token)
  // if (!user) return res.status(401).send('You must be logged in')

  const { toyId } = req.params

  toyService
    .remove(toyId)
    .then(() => res.status(200).send('The toy is removed!'))
    .catch((msg) => res.status(400).send(msg))
})

// AUTH ROUTES

// LOGIN USER
app.post('/api/auth/login', (req, res) => {
  userService.checkLogin(req.body)
    .then(user => {
      console.log('user', user)
      const loginToken = userService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.status(200).send(user)

    }).catch(msg => res.status(401).send(msg))
})

// SIGNUP USER
app.post('/api/auth/signup', (req, res) => {
  userService.save(req.body)
    .then(user => {
      const loginToken = userService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.status(200).send(user)
    })
})

// LOGOUT USER
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.status(200).send('Logged out')
})

// USERS ROUTES

app.get('/api/user', (req, res) => {
  const token = req.cookies.loginToken
  const user = userService.validateToken(token)
  if (!user || !user.isAdmin) return res.status(401).send('You are not allowed!')

  userService.query()
    .then(users => res.status(200).send(users))
})

app.get('/api/user/:username', (req, res) => {
  const { username } = req.params
  userService.getByUsername(username)
    .then(user => res.status(200).send(user))
    .catch(msg => res.status(404).send(msg))
})

app.delete('/api/user/:userId', (req, res) => {
  const { userId } = req.params

  userService.remove(userId)
    .then(user => res.status(200).send(user))
    .catch(msg => res.status(401).send(msg))
})

app.listen(PORT, () => console.log('Server ready at port 3030!'))
