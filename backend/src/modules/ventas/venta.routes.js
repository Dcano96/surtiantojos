import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import { getVentas, getVenta, crearVenta, actualizarVenta, eliminarVenta } from './venta.controller.js'

const router = Router()

router.get('/', authMiddleware, getVentas)
router.get('/:id', authMiddleware, getVenta)
router.post('/', authMiddleware, crearVenta)
router.put('/:id', authMiddleware, actualizarVenta)
router.delete('/:id', authMiddleware, eliminarVenta)

export default router
