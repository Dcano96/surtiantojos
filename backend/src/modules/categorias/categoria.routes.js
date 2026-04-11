import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import {
  getCategorias,
  getCategoria,
  crearCategoria,
  actualizarCategoria,
  cambiarEstadoCategoria,
  eliminarCategoria,
} from './categoria.controller.js'

const router = Router()

router.get('/', authMiddleware, getCategorias)
router.get('/:id', authMiddleware, getCategoria)
router.post('/', authMiddleware, crearCategoria)
router.put('/:id', authMiddleware, actualizarCategoria)
router.patch('/:id/estado', authMiddleware, cambiarEstadoCategoria)
router.delete('/:id', authMiddleware, eliminarCategoria)

export default router
