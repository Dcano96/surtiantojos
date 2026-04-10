import Usuario from './usuario.model.js'
import bcrypt from 'bcryptjs'

// Helper para verificar si es el usuario administrador protegido
const isAdminUser = (u) =>
  u.documento === '1152458310' && u.nombre === 'David Andres Goez Cano'

// Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    const { nombre, documento, email, telefono, password, rol } = req.body
    const existente = await Usuario.findOne({ email })
    if (existente) return res.status(400).json({ msg: 'El usuario ya existe' })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const usuario = new Usuario({
      nombre, documento, email, telefono,
      password: hashedPassword,
      rol: rol || '',
    })
    await usuario.save()
    const { password: _, ...userData } = usuario.toObject()
    res.status(201).json({ msg: 'Usuario creado correctamente', usuario: userData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// Listar todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password')
    res.json(usuarios)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// Obtener un usuario por ID
export const getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password')
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })
    res.json(usuario)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// Actualizar un usuario
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const updatedData = { ...req.body }

    const usuario = await Usuario.findById(id)
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })

    // Proteger al usuario administrador
    if (isAdminUser(usuario)) {
      if (updatedData.estado === false)
        return res.status(403).json({ msg: 'No se puede desactivar al usuario administrador' })
      if (updatedData.rol === '')
        return res.status(403).json({ msg: 'No se puede quitar el rol al usuario administrador' })
    }

    if (updatedData.password) {
      const salt = await bcrypt.genSalt(10)
      updatedData.password = await bcrypt.hash(updatedData.password, salt)
    } else {
      delete updatedData.password
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, updatedData, {
      new: true, runValidators: true,
    }).select('-password')
    res.json({ msg: 'Usuario actualizado', usuario: usuarioActualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// Eliminar un usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })

    if (isAdminUser(usuario))
      return res.status(403).json({ msg: 'No se puede eliminar al usuario administrador' })

    if (usuario.rol && usuario.rol !== '')
      return res.status(400).json({ msg: 'Debe quitar el rol del usuario antes de eliminarlo' })

    await Usuario.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Usuario eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// Quitar rol a un usuario
export const removeRol = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = await Usuario.findById(id)
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })

    if (isAdminUser(usuario))
      return res.status(403).json({ msg: 'No se puede quitar el rol al usuario administrador' })

    usuario.rol = ''
    await usuario.save()
    const { password: _, ...userData } = usuario.toObject()
    res.json({ msg: 'Rol eliminado correctamente', usuario: userData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// Cambiar contraseña de usuario
export const cambiarPassword = async (req, res) => {
  try {
    const usuarioId = req.params.id || req.usuario?._id || req.usuario?.id
    const { passwordActual, nuevoPassword } = req.body

    const usuario = await Usuario.findById(usuarioId)
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })

    const validPassword = await bcrypt.compare(passwordActual, usuario.password)
    if (!validPassword)
      return res.status(400).json({ msg: 'La contraseña actual es incorrecta' })

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(nuevoPassword, salt)
    await usuario.save()

    res.json({ ok: true, msg: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor al cambiar la contraseña' })
  }
}
