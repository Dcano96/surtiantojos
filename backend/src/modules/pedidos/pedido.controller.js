import mongoose from 'mongoose'
import Pedido from './pedido.model.js'
import DetallePedido from './detallePedido.model.js'
import Producto from '../productos/producto.model.js'
import Cliente from '../clientes/cliente.model.js'
import {
  procesarSalidaPorVenta,
  procesarEntradaPorCancelacion,
} from '../inventario/inventario.service.js'

// Crea o actualiza un cliente a partir de los datos recibidos en el pedido.
// Si el cliente ya existe (mismo documento), actualiza sus datos.
const upsertClienteDesdePedido = async (clienteData, session) => {
  const documento = String(clienteData?.documento || '').trim()
  if (!documento) {
    throw new Error('El documento del cliente es obligatorio')
  }

  const datos = {
    tipoDocumento: clienteData.tipoDocumento || 'CC',
    documento,
    nombre: (clienteData.nombre || '').trim(),
    apellido: (clienteData.apellido || '').trim(),
    telefono: (clienteData.telefono || '').trim(),
    email: (clienteData.email || '').trim().toLowerCase(),
    direccion: (clienteData.direccion || '').trim(),
    ciudad: (clienteData.ciudad || 'Bogotá').trim(),
  }

  const opts = session ? { session, new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
                       : { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  const cliente = await Cliente.findOneAndUpdate({ documento }, { $set: datos }, opts)
  return cliente
}

const calcularTotales = (detalles, descuento = 0, impuesto = 0) => {
  const subtotal = detalles.reduce((acc, d) => acc + d.subtotal, 0)
  const total = Math.max(0, subtotal - descuento + impuesto)
  return { subtotal, total }
}

const construirDetalles = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('El pedido debe tener al menos un producto')
  }
  const ids = items.map((i) => i.producto)
  const productos = await Producto.find({ _id: { $in: ids } }).lean()
  const mapa = new Map(productos.map((p) => [String(p._id), p]))

  return items.map((item) => {
    const p = mapa.get(String(item.producto))
    if (!p) throw new Error(`Producto no encontrado: ${item.producto}`)
    if (!p.estado) throw new Error(`El producto "${p.nombre}" está inactivo y no puede ser pedido`)

    const cantidad = Number(item.cantidad) || 0
    if (cantidad < 1) throw new Error(`Cantidad inválida para "${p.nombre}"`)

    // Validar stock disponible al momento de crear el pedido
    if (p.stock < cantidad) {
      throw new Error(
        `Stock insuficiente para "${p.nombre}". Disponible: ${p.stock} ${p.unidadMedida || 'unidad'}(s), solicitado: ${cantidad}`
      )
    }

    const precioUnitario = item.precioUnitario != null ? Number(item.precioUnitario) : p.precio
    const descuento = Number(item.descuento) || 0
    const subtotal = Math.max(0, cantidad * precioUnitario - descuento)
    return {
      producto: p._id,
      nombreProducto: p.nombre,
      cantidad,
      precioUnitario,
      descuento,
      subtotal,
      notas: item.notas,
    }
  })
}

export const getPedidos = async (req, res) => {
  try {
    const { estado } = req.query
    const filtro = estado ? { estado } : {}
    const pedidos = await Pedido.find(filtro)
      .populate('usuario', 'nombre email')
      .populate('atendidoPor', 'nombre email')
      .populate('clienteId')
      .populate('detalles')
      .sort({ createdAt: -1 })
    res.json(pedidos)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener pedidos', error: err.message })
  }
}

export const getPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('usuario', 'nombre email')
      .populate('atendidoPor', 'nombre email')
      .populate('clienteId')
      .populate('comprobantePago.verificadoPor', 'nombre email')
      .populate({ path: 'detalles', populate: { path: 'producto', select: 'nombre precio imagen' } })
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })
    res.json(pedido)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener pedido', error: err.message })
  }
}

export const crearPedido = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const { cliente, items, descuento = 0, impuesto = 0, notas, fechaEntrega, comprobantePago } = req.body
    if (!cliente?.nombre || !cliente?.telefono || !cliente?.direccion) {
      return res.status(400).json({ msg: 'Datos del cliente incompletos (nombre, teléfono, dirección)' })
    }
    if (!cliente?.documento?.trim()) {
      return res.status(400).json({ msg: 'El documento del cliente es obligatorio' })
    }

    const detallesPlanos = await construirDetalles(items)
    const { subtotal, total } = calcularTotales(detallesPlanos, descuento, impuesto)

    const userId = req.usuario?.id
    let pedidoCreado
    await session.withTransaction(async () => {
      // Registrar/actualizar cliente en la tabla Clientes
      const clienteDoc = await upsertClienteDesdePedido(cliente, session)

      // Preparar snapshot del cliente para guardar embebido en el pedido
      const clienteSnap = {
        nombre: clienteDoc.nombre,
        apellido: clienteDoc.apellido,
        tipoDocumento: clienteDoc.tipoDocumento,
        documento: clienteDoc.documento,
        telefono: clienteDoc.telefono,
        email: clienteDoc.email,
        direccion: clienteDoc.direccion,
        ciudad: clienteDoc.ciudad,
      }

      const [pedido] = await Pedido.create([{
        cliente: clienteSnap,
        clienteId: clienteDoc._id,
        usuario: userId,
        atendidoPor: userId,
        subtotal,
        descuento,
        impuesto,
        total,
        estado: 'pendiente',
        historialEstados: [{ estado: 'pendiente', usuario: userId, nota: 'Pedido creado, esperando comprobante de pago' }],
        comprobantePago: comprobantePago || {},
        fechaEntrega,
        notas,
      }], { session })

      const detallesConPedido = detallesPlanos.map((d) => ({ ...d, pedido: pedido._id }))
      await DetallePedido.insertMany(detallesConPedido, { session })
      pedidoCreado = pedido
    })

    const completo = await Pedido.findById(pedidoCreado._id)
      .populate('usuario', 'nombre email')
      .populate('clienteId')
      .populate('detalles')
    res.status(201).json(completo)
  } catch (err) {
    res.status(400).json({ msg: 'Error al crear pedido', error: err.message })
  } finally {
    session.endSession()
  }
}

export const actualizarPedido = async (req, res) => {
  try {
    const { cliente, descuento, impuesto, notas, fechaEntrega } = req.body
    const pedido = await Pedido.findById(req.params.id)
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })

    if (['entregado', 'cancelado'].includes(pedido.estado)) {
      return res.status(400).json({ msg: `No se puede editar un pedido en estado "${pedido.estado}"` })
    }

    if (cliente) pedido.cliente = { ...pedido.cliente.toObject?.() ?? pedido.cliente, ...cliente }
    if (descuento != null) pedido.descuento = descuento
    if (impuesto != null) pedido.impuesto = impuesto
    if (notas != null) pedido.notas = notas
    if (fechaEntrega != null) pedido.fechaEntrega = fechaEntrega

    const detalles = await DetallePedido.find({ pedido: pedido._id })
    const { subtotal, total } = calcularTotales(detalles, pedido.descuento, pedido.impuesto)
    pedido.subtotal = subtotal
    pedido.total = total

    await pedido.save()
    res.json(pedido)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar pedido', error: err.message })
  }
}

export const cambiarEstado = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const { estado, nota } = req.body
    const pedido = await Pedido.findById(req.params.id)
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })

    const estadoAnterior = pedido.estado
    const { ok, msg } = Pedido.validarTransicion(estadoAnterior, estado, pedido)
    if (!ok) return res.status(400).json({ msg })

    const usuarioId = req.usuario?.id

    // ── Detectar si hay que mover inventario ──────────────────────────────────
    // El stock se descuenta al pasar a pago_verificado (comprobante aprobado)
    const pasaAPagoVerificado = estado === 'pago_verificado' && estadoAnterior !== 'pago_verificado'
    const pasaACancelado = estado === 'cancelado'
    // Solo devolver stock si ya fue descontado (pago_verificado o despachado)
    const estabaConStockDescontado = ['pago_verificado', 'despachado'].includes(estadoAnterior)

    if (pasaAPagoVerificado || (pasaACancelado && estabaConStockDescontado)) {
      await session.withTransaction(async () => {
        const detalles = await DetallePedido.find({ pedido: pedido._id }).session(session)

        if (pasaAPagoVerificado) {
          await procesarSalidaPorVenta(pedido, detalles, usuarioId, session)
        } else if (pasaACancelado && estabaConStockDescontado) {
          await procesarEntradaPorCancelacion(pedido, detalles, usuarioId, session)
        }

        pedido.estado = estado
        pedido.historialEstados.push({ estado, usuario: usuarioId, nota })
        await pedido.save({ session })
      })
    } else {
      pedido.estado = estado
      pedido.historialEstados.push({ estado, usuario: usuarioId, nota })
      await pedido.save()
    }

    res.json(pedido)
  } catch (err) {
    res.status(400).json({ msg: 'Error al cambiar estado', error: err.message })
  } finally {
    session.endSession()
  }
}

export const registrarComprobante = async (req, res) => {
  try {
    const { url, metodoPago, referencia, fechaEnvio } = req.body
    const pedido = await Pedido.findById(req.params.id)
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })

    pedido.comprobantePago = {
      ...pedido.comprobantePago?.toObject?.() ?? {},
      url,
      metodoPago,
      referencia,
      fechaEnvio: fechaEnvio || new Date(),
      verificado: false,
      verificadoPor: undefined,
      fechaVerificacion: undefined,
      notasVerificacion: undefined,
    }

    if (pedido.estado === 'pendiente') {
      pedido.historialEstados.push({
        estado: 'pendiente',
        usuario: req.usuario?.id,
        nota: 'Comprobante de pago registrado, pendiente de verificación por el administrador',
      })
    }

    await pedido.save()
    res.json(pedido)
  } catch (err) {
    res.status(400).json({ msg: 'Error al registrar comprobante', error: err.message })
  }
}

export const verificarComprobante = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const { aprobado, notas } = req.body
    const pedido = await Pedido.findById(req.params.id)
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })

    if (!pedido.comprobantePago?.url) {
      return res.status(400).json({ msg: 'No hay comprobante registrado para este pedido' })
    }

    const userId = req.usuario?.id

    if (aprobado) {
      // Marcar comprobante como verificado ANTES de validar transición
      pedido.comprobantePago.verificado = true
      pedido.comprobantePago.verificadoPor = userId
      pedido.comprobantePago.fechaVerificacion = new Date()
      pedido.comprobantePago.notasVerificacion = notas

      const { ok, msg } = Pedido.validarTransicion(pedido.estado, 'pago_verificado', pedido)
      if (!ok) return res.status(400).json({ msg })

      // Descontar stock dentro de la transacción
      await session.withTransaction(async () => {
        const detalles = await DetallePedido.find({ pedido: pedido._id }).session(session)
        await procesarSalidaPorVenta(pedido, detalles, userId, session)

        pedido.estado = 'pago_verificado'
        pedido.historialEstados.push({
          estado: 'pago_verificado',
          usuario: userId,
          nota: notas || 'Comprobante verificado y aprobado — pedido listo para despachar',
        })
        await pedido.save({ session })
      })
    } else {
      // Comprobante rechazado — pedido permanece pendiente, se limpia el comprobante
      pedido.comprobantePago.verificado = false
      pedido.comprobantePago.verificadoPor = userId
      pedido.comprobantePago.fechaVerificacion = new Date()
      pedido.comprobantePago.notasVerificacion = notas
      pedido.comprobantePago.url = undefined
      pedido.comprobantePago.referencia = undefined

      pedido.historialEstados.push({
        estado: 'pendiente',
        usuario: userId,
        nota: notas || 'Comprobante rechazado — se solicitó nuevo comprobante al cliente',
      })
      await pedido.save()
    }

    res.json(pedido)
  } catch (err) {
    res.status(400).json({ msg: 'Error al verificar comprobante', error: err.message })
  } finally {
    session.endSession()
  }
}

export const eliminarPedido = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const pedido = await Pedido.findByIdAndDelete(req.params.id, { session })
      if (!pedido) throw new Error('Pedido no encontrado')
      await DetallePedido.deleteMany({ pedido: pedido._id }, { session })
    })
    res.json({ msg: 'Pedido eliminado' })
  } catch (err) {
    const code = err.message === 'Pedido no encontrado' ? 404 : 500
    res.status(code).json({ msg: 'Error al eliminar pedido', error: err.message })
  } finally {
    session.endSession()
  }
}
