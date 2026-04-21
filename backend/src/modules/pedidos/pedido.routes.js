import { Router } from 'express'
import authMiddleware from '../../middlewares/authMiddleware.js'
import optionalAuth from '../../middlewares/optionalAuth.js'
import upload from '../../middlewares/upload.js'
import {
  getPedidos,
  getPedido,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
  cambiarEstado,
  registrarComprobante,
  registrarComprobantePublico,
  verificarComprobante,
  getPedidoPublico,
  marcarComprobanteWhatsapp,
  adminPublicComprobante,
  getInboxPagos,
  getInboxPagosCount,
} from './pedido.controller.js'
import {
  getDetallesPorPedido,
  agregarDetalle,
  actualizarDetalle,
  eliminarDetalle,
} from './detallePedido.controller.js'

const router = Router()

router.get('/', authMiddleware, getPedidos)
// Inbox de pagos (debe ir ANTES de /:id para que no matchee como id)
router.get('/inbox/pagos', authMiddleware, getInboxPagos)
router.get('/inbox/pagos/count', authMiddleware, getInboxPagosCount)
router.get('/:id', authMiddleware, getPedido)
router.post('/', crearPedido)                   // público — landing crea pedidos sin token
router.put('/:id', authMiddleware, actualizarPedido)
router.delete('/:id', authMiddleware, eliminarPedido)

router.patch('/:id/estado', authMiddleware, cambiarEstado)
router.post('/:id/comprobante/upload', authMiddleware, upload.single('comprobante'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, msg: 'No se recibió ningún archivo' })
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ ok: true, url })
})
router.post('/:id/comprobante', authMiddleware, registrarComprobante)
router.post('/:id/comprobante/verificar', authMiddleware, verificarComprobante)

// ── Endpoints públicos para que el cliente envíe el comprobante desde la landing ──
// Solo permiten operar sobre pedidos en estado "pendiente" sin comprobante verificado
router.post('/:id/comprobante/upload/public', upload.single('comprobante'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, msg: 'No se recibió ningún archivo' })
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ ok: true, url })
})
router.post('/:id/comprobante/public', registrarComprobantePublico)

// Vista pública del pedido por número (deep-link compartido por WhatsApp al admin).
// optionalAuth: si el visitante es admin (JWT válido) la vista lo detecta y le habilita acciones.
router.get('/public/:numero', optionalAuth, getPedidoPublico)
// Admin confirma desde móvil que recibió el comprobante por WhatsApp (protegido por token, fallback)
router.post('/public/:numero/comprobante-whatsapp', marcarComprobanteWhatsapp)
// Admin sube/verifica el comprobante desde la vista pública (requiere JWT)
router.post('/public/:numero/admin/comprobante/upload', authMiddleware, upload.single('comprobante'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, msg: 'No se recibió ningún archivo' })
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ ok: true, url })
})
router.post('/public/:numero/admin/comprobante', authMiddleware, adminPublicComprobante)

router.get('/:pedidoId/detalles', authMiddleware, getDetallesPorPedido)
router.post('/:pedidoId/detalles', authMiddleware, agregarDetalle)
router.put('/detalles/:id', authMiddleware, actualizarDetalle)
router.delete('/detalles/:id', authMiddleware, eliminarDetalle)

export default router
