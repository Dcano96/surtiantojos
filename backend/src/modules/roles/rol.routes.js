import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import roleMiddleware from '../../middlewares/roleMiddleware.js'
import { createRol, getRoles, getRolById, updateRol, deleteRol } from './rol.controller.js'

const router = Router()

// Rutas protegidas: se requiere el permiso "roles" para gestionarlas
router.post('/', authMiddleware, roleMiddleware('roles'), createRol)
router.get('/', authMiddleware, roleMiddleware('roles'), getRoles)
router.get('/:id', authMiddleware, roleMiddleware('roles'), getRolById)
router.put('/:id', authMiddleware, roleMiddleware('roles'), updateRol)
router.delete('/:id', authMiddleware, roleMiddleware('roles'), deleteRol)

export default router
