const router = require('express').Router()
const db = require('../db')

router.get('/:id', (req, res) => {
  const eventId = req.params.id

  db.query(
    `SELECT e.id, e.title, e.duration, e.slug, u.name AS host_name
     FROM event_types e
     INNER JOIN users u ON u.id = e.user_id
     WHERE e.id = ?
     LIMIT 1`,
    [eventId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Could not fetch event type' })
      if (!rows.length) return res.status(404).json({ message: 'Event type not found' })
      return res.json(rows[0])
    }
  )
})

module.exports = router
