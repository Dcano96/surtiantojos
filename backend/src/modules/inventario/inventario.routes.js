import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import { getMovimientos } from './inventario.controller.js'

const router = Router()

router.get('/movimientos', authMiddleware, getMovimientos)

export default router
