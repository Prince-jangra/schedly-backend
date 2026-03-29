const jwt = require('jsonwebtoken')
const JWT_SECRET = require('../jwtSecret')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    return next()
  } catch (_err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
