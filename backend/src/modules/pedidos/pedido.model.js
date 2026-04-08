import mongoose from 'mongoose'

const PedidoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: { type: Number, required: true, min: 1 },
    precio: { type: Number, required: true, min: 0 },
  }],
  total: { type: Number, required: true, min: 0 },
  estado: { type: String, enum: ['pendiente', 'completado', 'cancelado'], default: 'pendiente' },
  direccion: { type: String, trim: true },
  notas: { type: String, trim: true },
}, { timestamps: true })

export default mongoose.model('Pedido', PedidoSchema)
