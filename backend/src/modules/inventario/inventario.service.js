import Producto from '../productos/producto.model.js'
import MovimientoInventario from './movimientoInventario.model.js'

/**
 * Descuenta stock de cada producto al confirmar un pedido.
 * Debe ejecutarse dentro de una sesión/transacción activa.
 */
export const procesarSalidaPorVenta = async (pedido, detalles, usuarioId, session) => {
  for (const detalle of detalles) {
    const producto = await Producto.findById(detalle.producto).session(session)
    if (!producto) {
      throw new Error(`Producto no encontrado: ${detalle.producto}`)
    }

    if (producto.stock < detalle.cantidad) {
      throw new Error(
        `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, requerido: ${detalle.cantidad}`
      )
    }

    producto.stock -= detalle.cantidad
    await producto.save({ session })

    await MovimientoInventario.create(
      [{
        productoId: producto._id,
        tipo: 'salida',
        cantidad: detalle.cantidad,
        unidad_medida: producto.unidadMedida || 'unidad',
        motivo: 'venta',
        nota: `Pedido #${pedido.numero}`,
        referenciaId: pedido._id,
        usuarioId,
        fecha: new Date(),
      }],
      { session }
    )
  }
}

/**
 * Devuelve stock de cada producto al cancelar un pedido confirmado.
 * Debe ejecutarse dentro de una sesión/transacción activa.
 */
export const procesarEntradaPorCancelacion = async (pedido, detalles, usuarioId, session) => {
  for (const detalle of detalles) {
    const producto = await Producto.findById(detalle.producto).session(session)
    if (!producto) continue // si el producto fue eliminado, se omite silenciosamente

    producto.stock += detalle.cantidad
    await producto.save({ session })

    await MovimientoInventario.create(
      [{
        productoId: producto._id,
        tipo: 'entrada',
        cantidad: detalle.cantidad,
        unidad_medida: producto.unidadMedida || 'unidad',
        motivo: 'ajuste',
        nota: `Devolución por cancelación de pedido #${pedido.numero}`,
        referenciaId: pedido._id,
        usuarioId,
        fecha: new Date(),
      }],
      { session }
    )
  }
}

/**
 * Registra una entrada de mercancía (compra a proveedor).
 * Sube el stock del producto y deja trazabilidad.
 */
export const registrarEntrada = async ({ productoId, cantidad, nota, proveedor, usuarioId }) => {
  const producto = await Producto.findById(productoId)
  if (!producto) throw new Error('Producto no encontrado')
  if (!producto.estado) throw new Error('No se puede registrar entrada para un producto inactivo')

  const cantidadNum = Number(cantidad)
  if (!cantidadNum || cantidadNum < 1) throw new Error('La cantidad debe ser mayor a 0')

  producto.stock += cantidadNum
  await producto.save()

  const movimiento = await MovimientoInventario.create({
    productoId: producto._id,
    tipo: 'entrada',
    cantidad: cantidadNum,
    unidad_medida: producto.unidadMedida || 'unidad',
    motivo: 'compra',
    nota: nota || 'Entrada de mercancía',
    proveedor: proveedor || null,
    usuarioId: usuarioId || null,
    fecha: new Date(),
  })

  return { producto, movimiento }
}

/**
 * Registra un ajuste manual de inventario (corrección por conteo físico).
 * tipo: 'entrada' sube stock, 'salida' baja stock.
 * La nota es obligatoria para trazabilidad.
 */
export const registrarAjuste = async ({ productoId, tipo, cantidad, nota, usuarioId }) => {
  if (!['entrada', 'salida'].includes(tipo)) throw new Error('Tipo de ajuste inválido: debe ser entrada o salida')
  if (!nota || !nota.trim()) throw new Error('La nota es obligatoria en un ajuste manual')

  const producto = await Producto.findById(productoId)
  if (!producto) throw new Error('Producto no encontrado')

  const cantidadNum = Number(cantidad)
  if (!cantidadNum || cantidadNum < 1) throw new Error('La cantidad debe ser mayor a 0')

  if (tipo === 'salida' && producto.stock < cantidadNum) {
    throw new Error(`Stock insuficiente para ajuste. Disponible: ${producto.stock}, requerido: ${cantidadNum}`)
  }

  if (tipo === 'entrada') {
    producto.stock += cantidadNum
  } else {
    producto.stock -= cantidadNum
  }
  await producto.save()

  const movimiento = await MovimientoInventario.create({
    productoId: producto._id,
    tipo,
    cantidad: cantidadNum,
    unidad_medida: producto.unidadMedida || 'unidad',
    motivo: 'ajuste',
    nota: nota.trim(),
    usuarioId: usuarioId || null,
    fecha: new Date(),
  })

  return { producto, movimiento }
}
