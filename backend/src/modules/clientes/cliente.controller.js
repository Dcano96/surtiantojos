import Cliente from './cliente.model.js'

export const getClientes = async (req, res) => {
  try {
    const { estado, q } = req.query
    const filtro = {}
    if (estado === 'true') filtro.estado = true
    if (estado === 'false') filtro.estado = false
    if (q) {
      const rx = new RegExp(q, 'i')
      filtro.$or = [{ nombre: rx }, { apellido: rx }, { documento: rx }, { telefono: rx }, { email: rx }]
    }
    const clientes = await Cliente.find(filtro).sort({ createdAt: -1 })
    res.json(clientes)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener clientes', error: err.message })
  }
}

export const getCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' })
    res.json(cliente)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener cliente', error: err.message })
  }
}

export const crearCliente = async (req, res) => {
  try {
    const { documento, nombre, telefono } = req.body
    if (!documento?.trim()) return res.status(400).json({ msg: 'El documento es obligatorio' })
    if (!nombre?.trim()) return res.status(400).json({ msg: 'El nombre es obligatorio' })
    if (!telefono?.trim()) return res.status(400).json({ msg: 'El teléfono es obligatorio' })

    const existe = await Cliente.findOne({ documento: documento.trim() })
    if (existe) return res.status(400).json({ msg: `Ya existe un cliente con el documento ${documento}` })

    const cliente = new Cliente(req.body)
    await cliente.save()
    res.status(201).json(cliente)
  } catch (err) {
    res.status(400).json({ msg: 'Error al crear cliente', error: err.message })
  }
}

export const actualizarCliente = async (req, res) => {
  try {
    if (req.body.documento) {
      const duplicado = await Cliente.findOne({ documento: req.body.documento, _id: { $ne: req.params.id } })
      if (duplicado) return res.status(400).json({ msg: `Ya existe otro cliente con el documento ${req.body.documento}` })
    }
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' })
    res.json(cliente)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar cliente', error: err.message })
  }
}

export const cambiarEstado = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' })
    cliente.estado = !cliente.estado
    await cliente.save()
    res.json(cliente)
  } catch (err) {
    res.status(400).json({ msg: 'Error al cambiar estado', error: err.message })
  }
}

export const eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id)
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' })
    res.json({ msg: 'Cliente eliminado' })
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar cliente', error: err.message })
  }
}
