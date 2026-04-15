import mongoose from 'mongoose'

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  precio: { type: Number, required: true, min: 0 },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' },
  stock: { type: Number, default: 0, min: 0 },
  stockMinimo: { type: Number, default: 0, min: 0 },
  unidadMedida: {
    type: String,
    enum: ['unidad', 'paquete', 'caja', 'bolsa', 'litro', 'kilogramo', 'gramo', 'otro'],
    default: 'unidad',
    trim: true,
  },
  imagen: { type: String, trim: true },
  estado: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Producto', ProductoSchema)
