import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import upload from '../../middlewares/upload.js'
import {
  getProductos,
  getProducto,
  crearProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  eliminarProducto,
} from './producto.controller.js'

const router = Router()

router.get('/', getProductos)          // público — landing lo necesita sin token
router.get('/:id', getProducto)        // público
router.post('/', authMiddleware, crearProducto)
router.put('/:id', authMiddleware, actualizarProducto)
router.patch('/:id/estado', authMiddleware, cambiarEstadoProducto)
router.delete('/:id', authMiddleware, eliminarProducto)

router.post('/:id/imagen/upload', authMiddleware, upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, msg: 'No se recibió ningún archivo' })
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ ok: true, url })
})

export default router
