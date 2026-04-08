import { Router } from 'express'
import {
  login,
  forgotPassword,
  resetPassword,
  getUsuario,
  adminResetPassword,
  verificarEstadoRol,
} from './auth.controller.js'
import authMiddleware from '../../middlewares/authMiddleware.js'

const router = Router()

// Rutas públicas
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Rutas protegidas
router.get('/me', authMiddleware, getUsuario)
router.get('/verificar-rol', authMiddleware, verificarEstadoRol)
router.post('/admin-reset-password', authMiddleware, adminResetPassword)

export default router
