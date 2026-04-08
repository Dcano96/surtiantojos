import Usuario from './usuario.model.js'

export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password')
    res.json(usuarios)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener usuarios', error: err.message })
  }
}

export const getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password')
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })
    res.json(usuario)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener usuario', error: err.message })
  }
}

export const actualizarUsuario = async (req, res) => {
  try {
    const { password, ...data } = req.body
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).select('-password')
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })
    res.json(usuario)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar usuario', error: err.message })
  }
}

export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id)
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })
    res.json({ msg: 'Usuario eliminado' })
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar usuario', error: err.message })
  }
}
