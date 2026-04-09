import mongoose from 'mongoose'

// Esquema para definir permisos CRUD por módulo
const permisoSchema = new mongoose.Schema(
  {
    modulo: { type: String, required: true },
    acciones: {
      crear: { type: Boolean, default: false },
      leer: { type: Boolean, default: false },
      actualizar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false },
    },
  },
  { _id: false }
)

const RolSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true },
    estado: { type: Boolean, default: true },
    // Permisos en formato granular: array de objetos { modulo, acciones }
    permisos: { type: [permisoSchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('Rol', RolSchema)
