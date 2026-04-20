import jwt from 'jsonwebtoken'

// Igual que authMiddleware pero NO bloquea: si hay token válido, popula req.usuario.
// Si no hay token o es inválido, deja seguir como request anónimo.
const optionalAuth = (req, _res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return next()
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded.usuario
  } catch (_e) {
    // token inválido / expirado — seguimos como anónimo
  }
  next()
}

export default optionalAuth
