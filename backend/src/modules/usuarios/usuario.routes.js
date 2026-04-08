import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import { getUsuarios, getUsuario, actualizarUsuario, eliminarUsuario } from './usuario.controller.js'

const router = Router()

router.get('/', authMiddleware, getUsuarios)
router.get('/:id', authMiddleware, getUsuario)
router.put('/:id', authMiddleware, actualizarUsuario)
router.delete('/:id', authMiddleware, eliminarUsuario)

export default router
