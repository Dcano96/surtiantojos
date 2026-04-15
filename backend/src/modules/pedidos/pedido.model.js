import mongoose from 'mongoose'

const ESTADOS_PEDIDO = [
  'pendiente_pago',
  'comprobante_recibido',
  'confirmado',
  'en_preparacion',
  'enviado',
  'entregado',
  'cancelado',
]

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, trim: true },
  tipoDocumento: { type: String, enum: ['CC', 'CE', 'NIT', 'PAS', 'TI'], default: 'CC' },
  documento: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  direccion: { type: String, required: true, trim: true },
  ciudad: { type: String, trim: true, default: 'Bogotá' },
}, { _id: false })

const ComprobantePagoSchema = new mongoose.Schema({
  url: { type: String, trim: true },
  metodoPago: {
    type: String,
    enum: ['transferencia', 'nequi', 'daviplata', 'bancolombia', 'efectivo', 'otro'],
    default: 'transferencia',
  },
  referencia: { type: String, trim: true },
  fechaEnvio: { type: Date },
  verificado: { type: Boolean, default: false },
  verificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaVerificacion: { type: Date },
  notasVerificacion: { type: String, trim: true },
}, { _id: false })

const PedidoSchema = new mongoose.Schema({
  numero: { type: String, unique: true, index: true },
  cliente: { type: ClienteSchema, required: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', index: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  atendidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },

  subtotal: { type: Number, default: 0, min: 0 },
  descuento: { type: Number, default: 0, min: 0 },
  impuesto: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },

  estado: { type: String, enum: ESTADOS_PEDIDO, default: 'pendiente_pago', index: true },
  historialEstados: [{
    estado: { type: String, enum: ESTADOS_PEDIDO },
    fecha: { type: Date, default: Date.now },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    nota: { type: String, trim: true },
  }],

  comprobantePago: { type: ComprobantePagoSchema, default: () => ({}) },

  fechaEntrega: { type: Date },
  notas: { type: String, trim: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

PedidoSchema.virtual('detalles', {
  ref: 'DetallePedido',
  localField: '_id',
  foreignField: 'pedido',
})

PedidoSchema.pre('validate', async function (next) {
  if (this.isNew && !this.numero) {
    const ultimo = await this.constructor.findOne({}, { numero: 1 }).sort({ createdAt: -1 }).lean()
    let siguiente = 1
    if (ultimo?.numero) {
      const n = parseInt(String(ultimo.numero).replace(/\D/g, ''), 10)
      if (!Number.isNaN(n)) siguiente = n + 1
    }
    this.numero = `PED-${String(siguiente).padStart(6, '0')}`
  }
  next()
})

PedidoSchema.statics.ESTADOS = ESTADOS_PEDIDO

PedidoSchema.statics.validarTransicion = function (estadoActual, nuevoEstado, pedido) {
  if (estadoActual === nuevoEstado) return { ok: true }

  const transiciones = {
    pendiente_pago: ['comprobante_recibido', 'cancelado'],
    comprobante_recibido: ['confirmado', 'pendiente_pago', 'cancelado'],
    confirmado: ['en_preparacion', 'cancelado'],
    en_preparacion: ['enviado', 'cancelado'],
    enviado: ['entregado', 'cancelado'],
    entregado: [],
    cancelado: [],
  }

  const permitidos = transiciones[estadoActual] || []
  if (!permitidos.includes(nuevoEstado)) {
    return { ok: false, msg: `Transición inválida: ${estadoActual} → ${nuevoEstado}` }
  }

  if (nuevoEstado === 'confirmado') {
    if (!pedido?.comprobantePago?.verificado) {
      return {
        ok: false,
        msg: 'No se puede confirmar el pedido: el comprobante de pago enviado por WhatsApp debe ser revisado y verificado primero.',
      }
    }
  }

  return { ok: true }
}

export default mongoose.model('Pedido', PedidoSchema)
