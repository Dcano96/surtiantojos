import mongoose from 'mongoose'

const DetalleVentaSchema = new mongoose.Schema({
  venta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venta',
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
}, { timestamps: true })

DetalleVentaSchema.pre('validate', function (next) {
  const base = this.cantidad * this.precioUnitario
  this.subtotal = Math.max(0, base - (this.descuento || 0))
  next()
})

export default mongoose.model('DetalleVenta', DetalleVentaSchema)
