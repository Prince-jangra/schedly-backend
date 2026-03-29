require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const eventRoutes = require('./routes/events')
const bookingRoutes = require('./routes/bookings')
const eventTypeRoutes = require('./routes/eventTypes')

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/auth', authRoutes)
app.use('/events', eventRoutes)
app.use('/bookings', bookingRoutes)
app.use('/event-types', eventTypeRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const port = Number(process.env.PORT) || 5000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
