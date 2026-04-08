import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import { getPedidos, getPedido, crearPedido, actualizarPedido, eliminarPedido } from './pedido.controller.js'

const router = Router()

router.get('/', authMiddleware, getPedidos)
router.get('/:id', authMiddleware, getPedido)
router.post('/', authMiddleware, crearPedido)
router.put('/:id', authMiddleware, actualizarPedido)
router.delete('/:id', authMiddleware, eliminarPedido)

export default router
