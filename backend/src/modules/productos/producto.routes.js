import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import { getProductos, getProducto, crearProducto, actualizarProducto, eliminarProducto } from './producto.controller.js'

const router = Router()

router.get('/', authMiddleware, getProductos)
router.get('/:id', authMiddleware, getProducto)
router.post('/', authMiddleware, crearProducto)
router.put('/:id', authMiddleware, actualizarProducto)
router.delete('/:id', authMiddleware, eliminarProducto)

export default router
