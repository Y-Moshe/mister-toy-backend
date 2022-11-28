const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const app = express()
const http = require('http').createServer(app)
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
    credentials: true
  }
  app.use(cors(corsOptions))
  app.use(express.static('public'))
}

app.use(cookieParser())
app.use(express.json())

// Delay middleware
const RESPONSE_DELAY = 1500
app.use((req, res, next) => setTimeout(next, RESPONSE_DELAY))

// Routes
const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')
const toyRoutes  = require('./api/toy/toy.routes')
const reviewRoutes  = require('./api/review/review.routes')
const setupAsyncLocalStorage = require('./middlewares/setupAls')
// require('./services/socket.service').setupSocketAPI(http)

app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy',  toyRoutes)
app.use('/api/review',  reviewRoutes)

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there
// app.get('/**', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'))
// })

http.listen(PORT, () => console.log(`Server ready at port: ${PORT}!`))