import mongoose from 'mongoose'

const RolSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  permisos: {
    type: [String],
    default: [],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  esDefault: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true })

export default mongoose.model('Rol', RolSchema)
