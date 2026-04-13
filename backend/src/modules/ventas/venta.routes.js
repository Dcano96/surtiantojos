import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import {
  getVentas, getVenta, crearVenta, actualizarVenta,
  anularVenta, eliminarVenta,
} from './venta.controller.js'
import { getDetalles, getDetallesPorVenta } from './detalleVenta.controller.js'

const router = Router()

router.get('/detalles', authMiddleware, getDetalles)
router.get('/:ventaId/detalles', authMiddleware, getDetallesPorVenta)

router.get('/', authMiddleware, getVentas)
router.get('/:id', authMiddleware, getVenta)
router.post('/', authMiddleware, crearVenta)
router.put('/:id', authMiddleware, actualizarVenta)
router.patch('/:id/anular', authMiddleware, anularVenta)
router.delete('/:id', authMiddleware, eliminarVenta)

export default router
