import mongoose from 'mongoose'

const VentaSchema = new mongoose.Schema({
  numero: { type: String, unique: true, index: true },
  fechaVenta: { type: Date, default: Date.now },

  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  clienteSnapshot: {
    nombre: String,
    documento: String,
    telefono: String,
  },

  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },

  subtotal: { type: Number, default: 0, min: 0 },
  descuento: { type: Number, default: 0, min: 0 },
  impuesto: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },

  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'nequi', 'daviplata', 'bancolombia', 'otro'],
    default: 'efectivo',
  },
  referenciaPago: { type: String, trim: true },

  estado: { type: String, enum: ['completada', 'anulada'], default: 'completada' },
  motivoAnulacion: { type: String, trim: true },

  notas: { type: String, trim: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

VentaSchema.virtual('detalles', {
  ref: 'DetalleVenta',
  localField: '_id',
  foreignField: 'venta',
})

VentaSchema.pre('validate', async function (next) {
  if (this.isNew && !this.numero) {
    const ultimo = await this.constructor.findOne({}, { numero: 1 }).sort({ createdAt: -1 }).lean()
    let siguiente = 1
    if (ultimo?.numero) {
      const n = parseInt(String(ultimo.numero).replace(/\D/g, ''), 10)
      if (!Number.isNaN(n)) siguiente = n + 1
    }
    this.numero = `VEN-${String(siguiente).padStart(6, '0')}`
  }
  next()
})

export default mongoose.model('Venta', VentaSchema)
