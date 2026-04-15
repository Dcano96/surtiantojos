import mongoose from 'mongoose'

const MovimientoInventarioSchema = new mongoose.Schema(
  {
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: ['entrada', 'salida'],
      required: true,
      index: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    unidad_medida: {
      type: String,
      default: 'unidad',
      trim: true,
    },
    motivo: {
      type: String,
      enum: ['venta', 'compra', 'ajuste'],
      required: true,
    },
    nota: {
      type: String,
      trim: true,
    },
    proveedor: {
      type: String,
      trim: true,
    },
    referenciaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pedido',
      default: null,
    },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
    fecha: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model('MovimientoInventario', MovimientoInventarioSchema)
