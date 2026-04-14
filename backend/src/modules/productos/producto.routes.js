import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
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

export default router
