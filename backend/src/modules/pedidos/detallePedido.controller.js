import mongoose from 'mongoose'
import DetallePedido from './detallePedido.model.js'
import Pedido from './pedido.model.js'
import Producto from '../productos/producto.model.js'

const ESTADOS_BLOQUEADOS = ['enviado', 'entregado', 'cancelado']

const recalcularPedido = async (pedidoId, session) => {
  const pedido = await Pedido.findById(pedidoId).session(session || null)
  if (!pedido) return
  const detalles = await DetallePedido.find({ pedido: pedidoId }).session(session || null)
  const subtotal = detalles.reduce((acc, d) => acc + d.subtotal, 0)
  pedido.subtotal = subtotal
  pedido.total = Math.max(0, subtotal - (pedido.descuento || 0) + (pedido.impuesto || 0))
  await pedido.save({ session: session || undefined })
}

export const getDetallesPorPedido = async (req, res) => {
  try {
    const detalles = await DetallePedido.find({ pedido: req.params.pedidoId })
      .populate('producto', 'nombre precio imagen')
    res.json(detalles)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener detalles', error: err.message })
  }
}

export const agregarDetalle = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const { pedidoId } = req.params
    const { producto, cantidad, precioUnitario, descuento = 0, notas } = req.body

    const pedido = await Pedido.findById(pedidoId)
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })
    if (ESTADOS_BLOQUEADOS.includes(pedido.estado)) {
      return res.status(400).json({ msg: `No se pueden agregar items a un pedido en estado "${pedido.estado}"` })
    }

    const prod = await Producto.findById(producto)
    if (!prod) return res.status(404).json({ msg: 'Producto no encontrado' })

    let creado
    await session.withTransaction(async () => {
      const [detalle] = await DetallePedido.create([{
        pedido: pedidoId,
        producto: prod._id,
        nombreProducto: prod.nombre,
        cantidad,
        precioUnitario: precioUnitario != null ? precioUnitario : prod.precio,
        descuento,
        notas,
      }], { session })
      creado = detalle
      await recalcularPedido(pedidoId, session)
    })

    res.status(201).json(creado)
  } catch (err) {
    res.status(400).json({ msg: 'Error al agregar detalle', error: err.message })
  } finally {
    session.endSession()
  }
}

export const actualizarDetalle = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const detalle = await DetallePedido.findById(req.params.id)
    if (!detalle) return res.status(404).json({ msg: 'Detalle no encontrado' })

    const pedido = await Pedido.findById(detalle.pedido)
    if (ESTADOS_BLOQUEADOS.includes(pedido?.estado)) {
      return res.status(400).json({ msg: `No se puede modificar un detalle de pedido en estado "${pedido.estado}"` })
    }

    const { cantidad, precioUnitario, descuento, notas } = req.body
    if (cantidad != null) detalle.cantidad = cantidad
    if (precioUnitario != null) detalle.precioUnitario = precioUnitario
    if (descuento != null) detalle.descuento = descuento
    if (notas != null) detalle.notas = notas

    await session.withTransaction(async () => {
      await detalle.save({ session })
      await recalcularPedido(detalle.pedido, session)
    })

    res.json(detalle)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar detalle', error: err.message })
  } finally {
    session.endSession()
  }
}

export const eliminarDetalle = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const detalle = await DetallePedido.findById(req.params.id)
    if (!detalle) return res.status(404).json({ msg: 'Detalle no encontrado' })

    const pedido = await Pedido.findById(detalle.pedido)
    if (ESTADOS_BLOQUEADOS.includes(pedido?.estado)) {
      return res.status(400).json({ msg: `No se puede eliminar un detalle de pedido en estado "${pedido.estado}"` })
    }

    const pedidoId = detalle.pedido
    await session.withTransaction(async () => {
      await detalle.deleteOne({ session })
      await recalcularPedido(pedidoId, session)
    })

    res.json({ msg: 'Detalle eliminado' })
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar detalle', error: err.message })
  } finally {
    session.endSession()
  }
}
