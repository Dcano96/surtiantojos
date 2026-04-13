import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
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
router.post('/', authMiddleware, crearPedido)
router.put('/:id', authMiddleware, actualizarPedido)
router.delete('/:id', authMiddleware, eliminarPedido)

router.patch('/:id/estado', authMiddleware, cambiarEstado)
router.post('/:id/comprobante', authMiddleware, registrarComprobante)
router.post('/:id/comprobante/verificar', authMiddleware, verificarComprobante)

router.get('/:pedidoId/detalles', authMiddleware, getDetallesPorPedido)
router.post('/:pedidoId/detalles', authMiddleware, agregarDetalle)
router.put('/detalles/:id', authMiddleware, actualizarDetalle)
router.delete('/detalles/:id', authMiddleware, eliminarDetalle)

export default router
