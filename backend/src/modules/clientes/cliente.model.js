import mongoose from 'mongoose'

const ClienteSchema = new mongoose.Schema({
  tipoDocumento: {
    type: String,
    enum: ['CC', 'CE', 'NIT', 'PAS', 'TI'],
    default: 'CC',
  },
  documento: { type: String, required: true, unique: true, trim: true, index: true },
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, trim: true },
  telefono: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  direccion: { type: String, trim: true },
  ciudad: { type: String, trim: true, default: 'Bogotá' },
  notas: { type: String, trim: true },
  estado: { type: Boolean, default: true },
}, { timestamps: true })

ClienteSchema.index({ nombre: 'text', documento: 'text', telefono: 'text' })

export default mongoose.model('Cliente', ClienteSchema)
