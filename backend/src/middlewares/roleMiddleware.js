import Rol from '../modules/roles/rol.model.js'

const roleMiddleware = (modulo) => {
  return async (req, res, next) => {
    try {
      const rolNombre = req.usuario?.rol
      if (!rolNombre) {
        return res.status(403).json({ msg: 'No tiene rol asignado' })
      }

      // Administrador siempre tiene acceso completo
      if (rolNombre.toLowerCase() === 'administrador') return next()

      const rol = await Rol.findOne({ nombre: rolNombre })
      if (!rol) return res.status(403).json({ msg: 'Rol no encontrado' })
      if (!rol.estado) return res.status(403).json({ msg: 'Tu rol está desactivado' })

      const permiso = rol.permisos.find(p => p.modulo === modulo)
      if (!permiso) return res.status(403).json({ msg: 'No tiene permisos para este módulo' })

      // Mapear método HTTP a acción del permiso
      const methodMap = {
        GET: 'leer',
        POST: 'crear',
        PUT: 'actualizar',
        PATCH: 'actualizar',
        DELETE: 'eliminar',
      }

      const accion = methodMap[req.method]
      if (!accion || !permiso.acciones[accion]) {
        return res.status(403).json({ msg: 'No tiene permisos para esta acción' })
      }

      next()
    } catch (error) {
      console.error(error)
      res.status(500).send('Error en el servidor')
    }
  }
}

export default roleMiddleware
