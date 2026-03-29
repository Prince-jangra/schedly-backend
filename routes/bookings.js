const router = require('express').Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const auth = require('../middleware/auth')

router.get('/event/:eventId', (req, res) => {
  const eventId = req.params.eventId

  db.query(
    'SELECT id, event_type_id, date, start_time, end_time, status FROM bookings WHERE event_type_id = ? ORDER BY date ASC, start_time ASC',
    [eventId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Could not fetch bookings' })
      return res.json(rows)
    }
  )
})

router.post('/', (req, res) => {
  const { event_type_id, name, email, date, start_time, end_time } = req.body

  if (!event_type_id || !name || !email || !date || !start_time || !end_time) {
    return res.status(400).json({ message: 'All booking fields are required' })
  }

  db.query('SELECT id FROM event_types WHERE id = ?', [event_type_id], (eventErr, eventRows) => {
    if (eventErr) return res.status(500).json({ message: 'Could not verify event type' })
    if (!eventRows.length) return res.status(404).json({ message: 'Event type not found' })

    db.query(
      'SELECT id FROM bookings WHERE event_type_id = ? AND date = ? AND start_time = ? AND status = ? LIMIT 1',
      [event_type_id, date, start_time, 'booked'],
      (conflictErr, conflictRows) => {
        if (conflictErr) return res.status(500).json({ message: 'Could not validate booking slot' })
        if (conflictRows.length) {
          return res.status(409).json({ message: 'This time slot is already booked' })
        }

        const bookingId = uuidv4()
        db.query(
          'INSERT INTO bookings (id, event_type_id, name, email, date, start_time, end_time, status, created_at) VALUES (?,?,?,?,?,?,?,?,NOW())',
          [bookingId, event_type_id, name, email, date, start_time, end_time, 'booked'],
          (insertErr) => {
            if (insertErr) return res.status(500).json({ message: 'Could not create booking' })
            return res.status(201).json({ id: bookingId, message: 'Booking confirmed' })
          }
        )
      }
    )
  })
})

router.get('/', auth, (req, res) => {
  db.query(
    `SELECT b.id, b.event_type_id, b.name, b.email, b.date, b.start_time, b.end_time, b.status, b.created_at
     FROM bookings b
     INNER JOIN event_types e ON e.id = b.event_type_id
     WHERE e.user_id = ?
     ORDER BY b.date DESC, b.start_time DESC`,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Could not fetch host bookings' })
      return res.json(rows)
    }
  )
})

module.exports = router
