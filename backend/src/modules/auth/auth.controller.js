import Usuario from '../usuarios/usuario.model.js'
import Rol from '../roles/rol.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

// ─── Validaciones ───────────────────────────────────────────────
const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_INVALIDO: /@\.com|@com\.|@\.|\.@|@-|-@|@.*@|\.\.|,,|@@/,
  SECUENCIAS_COMUNES: /123456|654321|password|qwerty|abc123|admin123|contraseña|usuario|admin/i,
  CARACTERES_REPETIDOS: /(.)\1{3,}/,
}

const validarEmail = (em) => {
  if (!em) return 'El correo electrónico es obligatorio'
  if (!REGEX.EMAIL.test(em)) return 'Formato de correo electrónico inválido'
  if (REGEX.EMAIL_INVALIDO.test(em)) return 'El correo contiene patrones inválidos'
  if (em.length < 6 || em.length > 50) return 'El correo debe tener entre 6 y 50 caracteres'
  const [localPart, domainPart] = em.split('@')
  if (!localPart || localPart.length < 1 || localPart.length > 64) return 'La parte local del correo no es válida'
  if (!domainPart || !domainPart.includes('.')) return 'El dominio debe incluir una extensión (.com, .net…)'
  const tld = domainPart.split('.').pop()
  if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-zA-Z]+$/.test(tld)) return 'La extensión del dominio no es válida'
  return ''
}

const validarPassword = (pass) => {
  if (!pass) return 'La contraseña es obligatoria'
  if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  if (pass.length > 15) return 'La contraseña no puede tener más de 15 caracteres'
  if (!/[a-z]/.test(pass)) return 'Debe contener al menos una letra minúscula'
  if (!/[A-Z]/.test(pass)) return 'Debe contener al menos una letra mayúscula'
  if (!/[0-9]/.test(pass)) return 'Debe contener al menos un número'
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) return 'Debe contener al menos un carácter especial'
  if (REGEX.SECUENCIAS_COMUNES.test(pass)) return 'La contraseña no puede contener secuencias comunes'
  if (REGEX.CARACTERES_REPETIDOS.test(pass)) return 'No puede contener más de 3 caracteres repetidos consecutivos'
  if (/qwert|asdfg|zxcvb|12345|09876/.test(pass.toLowerCase())) return 'No puede contener secuencias de teclado'
  return ''
}

// ─── LOGIN ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  let { email, password } = req.body
  email = email ? email.trim() : email
  if (password) password = password.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

  if (!email || !password) {
    return res.status(400).json({ msg: 'Por favor proporcione email y contraseña' })
  }

  try {
    const usuario = await Usuario.findOne({ email })
    if (!usuario) return res.status(400).json({ msg: 'Credenciales inválidas' })

    if (usuario.estado === false) {
      return res.status(403).json({ msg: 'Usuario inactivo. Contacte al administrador.' })
    }

    // Verificar rol
    if (usuario.rol && typeof usuario.rol === 'string') {
      const rol = await Rol.findOne({ nombre: usuario.rol })
      if (!rol) return res.status(403).json({ msg: 'Tu rol ha sido eliminado. Contacta al administrador.' })
      if (rol.estado === false) return res.status(403).json({ msg: 'Tu rol ha sido desactivado. Contacta al administrador.' })
    }

    const isMatch = await bcrypt.compare(password, usuario.password)
    if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' })

    // Obtener permisos del rol
    let permisos = []
    try {
      const rol = await Rol.findOne({ nombre: usuario.rol })
      if (rol) permisos = rol.permisos || []
    } catch (_) {}

    const payload = {
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        documento: usuario.documento,
        rol: usuario.rol,
        permisos,
      },
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => {
      if (err) throw err
      res.json({ token, usuario: payload.usuario })
    })
  } catch (error) {
    console.error('[LOGIN] Error:', error.message)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// ─── FORGOT PASSWORD ────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body
  const emailError = validarEmail(email)
  if (emailError) return res.status(400).json({ msg: emailError })

  try {
    const usuario = await Usuario.findOne({ email })

    // Respuesta genérica por seguridad
    if (!usuario || !usuario.estado) {
      return res.json({ msg: 'Si el correo existe en nuestra base de datos, recibirás instrucciones.' })
    }

    // Verificar rol
    if (usuario.rol) {
      const rol = await Rol.findOne({ nombre: usuario.rol })
      if (!rol || rol.estado === false) {
        return res.json({ msg: 'Si el correo existe en nuestra base de datos, recibirás instrucciones.' })
      }
    }

    // Generar contraseña temporal que cumple requisitos
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 8)}1!`
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(tempPassword, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()

    console.log(`[FORGOT PASSWORD] Contraseña temporal para ${email}: ${tempPassword}`)

    // Enviar correo
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false },
      })

      await transporter.sendMail({
        to: usuario.email,
        from: `"SurtiAntojos" <${process.env.EMAIL_USER}>`,
        subject: 'Contraseña temporal - SurtiAntojos',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
            <h2 style="color:#FF6B2B;">Contraseña Temporal</h2>
            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            <p>Tu contraseña temporal es:</p>
            <div style="text-align:center;margin:20px 0;padding:15px;background:#f7fafc;border-radius:8px;font-size:22px;font-weight:bold;letter-spacing:2px;">
              ${tempPassword}
            </div>
            <p>Por favor cámbiala después de iniciar sesión.</p>
            <p>Saludos,<br><strong>Equipo SurtiAntojos</strong></p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('[FORGOT PASSWORD] Error al enviar correo:', emailError)
    }

    return res.json({ msg: 'Si el correo existe en nuestra base de datos, recibirás instrucciones.' })
  } catch (error) {
    console.error('[FORGOT PASSWORD] Error:', error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// ─── RESET PASSWORD ─────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body
  const passwordError = validarPassword(newPassword)
  if (passwordError) return res.status(400).json({ msg: passwordError })

  try {
    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!usuario) return res.status(400).json({ msg: 'Token inválido o expirado' })
    if (!usuario.estado) return res.status(403).json({ msg: 'Usuario inactivo. Contacte al administrador.' })

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(newPassword, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()

    res.json({ msg: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// ─── GET USUARIO AUTENTICADO ────────────────────────────────────
export const getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password')
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })
    if (!usuario.estado) return res.status(403).json({ msg: 'Usuario inactivo. Contacte al administrador.' })

    if (usuario.rol) {
      const rol = await Rol.findOne({ nombre: usuario.rol })
      if (!rol) return res.status(403).json({ msg: 'Tu rol ha sido eliminado. Contacta al administrador.' })
      if (rol.estado === false) return res.status(403).json({ msg: 'Tu rol ha sido desactivado. Contacta al administrador.' })
    }

    res.json(usuario)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// ─── ADMIN RESET PASSWORD ────────────────────────────────────────
export const adminResetPassword = async (req, res) => {
  const { email, newPassword } = req.body
  const emailError = validarEmail(email)
  if (emailError) return res.status(400).json({ msg: emailError })
  const passwordError = validarPassword(newPassword)
  if (passwordError) return res.status(400).json({ msg: passwordError })

  try {
    const usuario = await Usuario.findOne({ email })
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(newPassword, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()

    res.json({ msg: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error en el servidor' })
  }
}

// ─── VERIFICAR ESTADO ROL ────────────────────────────────────────
export const verificarEstadoRol = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id)
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' })

    let rolEliminado = false
    let rolInactivo = false

    if (usuario.rol) {
      const rol = await Rol.findOne({ nombre: usuario.rol })
      if (!rol) rolEliminado = true
      else if (rol.estado === false) rolInactivo = true
    }

    res.json({ rolActivo: !rolEliminado && !rolInactivo, rolEliminado, rolInactivo })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error del servidor' })
  }
}