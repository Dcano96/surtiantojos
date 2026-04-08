import mongoose from 'mongoose'

const CategoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  descripcion: { type: String, trim: true },
  estado: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Categoria', CategoriaSchema)
