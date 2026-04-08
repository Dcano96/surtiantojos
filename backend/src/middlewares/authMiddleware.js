import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded.usuario
    next()
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' })
  }
}

export default authMiddleware
