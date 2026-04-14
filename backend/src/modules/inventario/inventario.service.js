import Producto from '../productos/producto.model.js'
import MovimientoInventario from './movimientoInventario.model.js'

/**
 * Descuenta stock de cada producto al confirmar un pedido.
 * Debe ejecutarse dentro de una sesión/transacción activa.
 *
 * @param {Object} pedido    - Documento Pedido ya guardado
 * @param {Array}  detalles  - Array de DetallePedido del pedido
 * @param {*}      usuarioId - ID del usuario que ejecuta la acción
 * @param {*}      session   - Sesión de Mongoose para la transacción
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
      [
        {
          productoId: producto._id,
          tipo: 'salida',
          cantidad: detalle.cantidad,
          unidad_medida: 'unidad',
          motivo: 'venta',
          referenciaId: pedido._id,
          usuarioId,
          fecha: new Date(),
        },
      ],
      { session }
    )
  }
}

/**
 * Devuelve stock de cada producto al cancelar un pedido confirmado.
 * Debe ejecutarse dentro de una sesión/transacción activa.
 *
 * @param {Object} pedido    - Documento Pedido
 * @param {Array}  detalles  - Array de DetallePedido del pedido
 * @param {*}      usuarioId - ID del usuario que ejecuta la acción
 * @param {*}      session   - Sesión de Mongoose para la transacción
 */
export const procesarEntradaPorCancelacion = async (pedido, detalles, usuarioId, session) => {
  for (const detalle of detalles) {
    const producto = await Producto.findById(detalle.producto).session(session)
    if (!producto) continue // si el producto fue eliminado, se omite silenciosamente

    producto.stock += detalle.cantidad
    await producto.save({ session })

    await MovimientoInventario.create(
      [
        {
          productoId: producto._id,
          tipo: 'entrada',
          cantidad: detalle.cantidad,
          unidad_medida: 'unidad',
          motivo: 'ajuste',
          referenciaId: pedido._id,
          usuarioId,
          fecha: new Date(),
        },
      ],
      { session }
    )
  }
}
