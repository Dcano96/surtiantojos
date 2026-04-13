import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import {
  getClientes, getCliente, crearCliente,
  actualizarCliente, cambiarEstado, eliminarCliente,
} from './cliente.controller.js'

const router = Router()

router.get('/', authMiddleware, getClientes)
router.get('/:id', authMiddleware, getCliente)
router.post('/', authMiddleware, crearCliente)
router.put('/:id', authMiddleware, actualizarCliente)
router.patch('/:id/estado', authMiddleware, cambiarEstado)
router.delete('/:id', authMiddleware, eliminarCliente)

export default router
