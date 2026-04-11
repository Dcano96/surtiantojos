import mongoose from 'mongoose'

const CategoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    unique: true,
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede exceder 200 caracteres'],
  },
  estado: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true })

export default mongoose.model('Categoria', CategoriaSchema)
