import Rol from './rol.model.js'

// Crear un nuevo rol
export const createRol = async (req, res) => {
  try {
    const { nombre, estado, permisos } = req.body
    let rol = await Rol.findOne({ nombre })
    if (rol) return res.status(400).json({ msg: 'El rol ya existe' })
    rol = new Rol({
      nombre,
      estado: estado !== undefined ? estado : true,
      permisos: permisos || [],
    })
    await rol.save()
    res.status(201).json({ msg: 'Rol creado correctamente', rol })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error en el servidor')
  }
}

// Listar todos los roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Rol.find()
    res.json(roles)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error en el servidor')
  }
}

// Obtener un rol por ID
export const getRolById = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id)
    if (!rol) return res.status(404).json({ msg: 'Rol no encontrado' })
    res.json(rol)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error en el servidor')
  }
}

// Actualizar un rol
export const updateRol = async (req, res) => {
  try {
    const { id } = req.params
    const updatedData = req.body
    const rol = await Rol.findByIdAndUpdate(id, updatedData, { new: true })
    if (!rol) return res.status(404).json({ msg: 'Rol no encontrado' })
    res.json({ msg: 'Rol actualizado', rol })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error en el servidor')
  }
}

// Eliminar un rol
export const deleteRol = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id)
    if (!rol) return res.status(404).json({ msg: 'Rol no encontrado' })

    // Verificar si es el rol de administrador
    if (rol.nombre.toLowerCase() === 'administrador') {
      return res.status(403).json({ msg: 'El rol de administrador no puede ser eliminado' })
    }

    await Rol.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Rol eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error en el servidor')
  }
}
