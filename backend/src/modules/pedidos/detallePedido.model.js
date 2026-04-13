import mongoose from 'mongoose'

const DetallePedidoSchema = new mongoose.Schema({
  pedido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido',
    required: true,
    index: true,
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true,
  },
  nombreProducto: { type: String, required: true, trim: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true, min: 0 },
  descuento: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  notas: { type: String, trim: true },
}, { timestamps: true })

DetallePedidoSchema.pre('validate', function (next) {
  const base = this.cantidad * this.precioUnitario
  this.subtotal = Math.max(0, base - (this.descuento || 0))
  next()
})

export default mongoose.model('DetallePedido', DetallePedidoSchema)
