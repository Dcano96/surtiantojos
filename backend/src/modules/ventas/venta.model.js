import mongoose from 'mongoose'

const VentaSchema = new mongoose.Schema({
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: { type: Number, required: true, min: 1 },
    precio: { type: Number, required: true, min: 0 },
  }],
  total: { type: Number, required: true, min: 0 },
  metodoPago: { type: String, enum: ['efectivo', 'tarjeta', 'transferencia', 'otro'], default: 'efectivo' },
  estado: { type: String, enum: ['completada', 'anulada'], default: 'completada' },
  notas: { type: String, trim: true },
}, { timestamps: true })

export default mongoose.model('Venta', VentaSchema)
