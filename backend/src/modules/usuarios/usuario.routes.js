import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import roleMiddleware from '../../middlewares/roleMiddleware.js'
import {
  getUsuarios, getUsuario, createUsuario,
  actualizarUsuario, eliminarUsuario, removeRol, cambiarPassword,
} from './usuario.controller.js'

const router = Router()

router.get('/', authMiddleware, roleMiddleware('usuarios'), getUsuarios)
router.get('/:id', authMiddleware, roleMiddleware('usuarios'), getUsuario)
router.post('/', authMiddleware, roleMiddleware('usuarios'), createUsuario)
router.put('/:id/remove-rol', authMiddleware, roleMiddleware('usuarios'), removeRol)
router.put('/:id', authMiddleware, roleMiddleware('usuarios'), actualizarUsuario)
router.delete('/:id', authMiddleware, roleMiddleware('usuarios'), eliminarUsuario)
router.post('/:id/cambiar-password', authMiddleware, cambiarPassword)

export default router
