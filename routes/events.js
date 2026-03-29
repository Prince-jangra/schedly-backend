const router = require('express').Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const auth = require('../middleware/auth')

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

router.get('/', auth, (req, res) => {
  db.query(
    'SELECT id, title, duration, slug, created_at FROM event_types WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Could not fetch events' })
      return res.json(rows)
    }
  )
})

router.post('/', auth, (req, res) => {
  const title = String(req.body.title || '').trim()
  const duration = Number(req.body.duration)

  if (!title || !Number.isFinite(duration) || duration <= 0) {
    return res.status(400).json({ message: 'Valid title and duration are required' })
  }

  const id = uuidv4()
  const baseSlug = slugify(title) || 'event'
  const slug = `${baseSlug}-${id.slice(0, 8)}`

  db.query(
    'INSERT INTO event_types (id, user_id, title, duration, slug, created_at) VALUES (?,?,?,?,?,NOW())',
    [id, req.userId, title, duration, slug],
    (err) => {
      if (err) return res.status(500).json({ message: 'Could not create event' })
      return res.status(201).json({ id, title, duration, slug })
    }
  )
})

router.delete('/:id', auth, (req, res) => {
  const eventId = req.params.id

  db.query('DELETE FROM event_types WHERE id = ? AND user_id = ?', [eventId, req.userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Could not delete event' })
    if (!result.affectedRows) return res.status(404).json({ message: 'Event not found' })
    return res.json({ message: 'Event deleted' })
  })
})

module.exports = router
