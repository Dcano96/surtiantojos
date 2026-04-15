import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import {
  getMovimientos,
  getStock,
  registrarEntrada,
  registrarAjuste,
} from './inventario.controller.js'

const router = Router()

router.get('/stock',       authMiddleware, getStock)
router.get('/movimientos', authMiddleware, getMovimientos)
router.post('/entrada',    authMiddleware, registrarEntrada)
router.post('/ajuste',     authMiddleware, registrarAjuste)

export default router
