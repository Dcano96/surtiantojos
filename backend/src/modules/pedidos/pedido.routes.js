import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import upload from '../../middlewares/upload.js'
import {
  getPedidos,
  getPedido,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
  cambiarEstado,
  registrarComprobante,
  verificarComprobante,
} from './pedido.controller.js'
import {
  getDetallesPorPedido,
  agregarDetalle,
  actualizarDetalle,
  eliminarDetalle,
} from './detallePedido.controller.js'

const router = Router()

router.get('/', authMiddleware, getPedidos)
router.get('/:id', authMiddleware, getPedido)
router.post('/', crearPedido)                   // público — landing crea pedidos sin token
router.put('/:id', authMiddleware, actualizarPedido)
router.delete('/:id', authMiddleware, eliminarPedido)

router.patch('/:id/estado', authMiddleware, cambiarEstado)
router.post('/:id/comprobante/upload', authMiddleware, upload.single('comprobante'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, msg: 'No se recibió ningún archivo' })
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ ok: true, url })
})
router.post('/:id/comprobante', authMiddleware, registrarComprobante)
router.post('/:id/comprobante/verificar', authMiddleware, verificarComprobante)

router.get('/:pedidoId/detalles', authMiddleware, getDetallesPorPedido)
router.post('/:pedidoId/detalles', authMiddleware, agregarDetalle)
router.put('/detalles/:id', authMiddleware, actualizarDetalle)
router.delete('/detalles/:id', authMiddleware, eliminarDetalle)

export default router
