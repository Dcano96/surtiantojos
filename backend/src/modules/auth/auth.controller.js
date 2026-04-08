const Usuario = require("../usuarios/usuario.model")
const Rol = require("../roles/rol.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")

// ─── Regex de validación ─────────────────────────────────────────
const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_INVALIDO: /@\.com|@com\.|@\.|\.@|@-|-@|@.*@|\.\.|,,|@@/,
  SECUENCIAS_COMUNES:
    /123456|654321|password|qwerty|abc123|admin123|contraseña|usuario|admin/i,
  CARACTERES_REPETIDOS: /(.)\1{3,}/,
}

const validarEmail = (em) => {
  if (!em || em.trim() === "") return "El correo electrónico es obligatorio"
  if (!REGEX.EMAIL.test(em)) return "Formato de correo electrónico inválido"
  if (REGEX.EMAIL_INVALIDO.test(em)) return "El correo contiene patrones inválidos"
  if (em.length < 6) return "El correo debe tener al menos 6 caracteres"
  if (em.length > 50) return "El correo no puede tener más de 50 caracteres"
  const [localPart, domainPart] = em.split("@")
  if (!localPart || localPart.length < 1) return "La parte local no puede estar vacía"
  if (localPart.length > 64) return "La parte local del correo es demasiado larga"
  if (/^[.-]|[.-]$/.test(localPart)) return "La parte local no puede comenzar ni terminar con puntos o guiones"
  if (!domainPart || !domainPart.includes(".")) return "El dominio debe incluir una extensión (ej: .com)"
  const domainParts = domainPart.split(".")
  for (const part of domainParts) {
    if (!part || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part))
      return "El dominio contiene partes inválidas"
  }
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-zA-Z]+$/.test(tld))
    return "La extensión del dominio no es válida"
  const noRecomendados = ["tempmail", "mailinator", "guerrillamail", "10minutemail", "yopmail"]
  if (noRecomendados.some((d) => domainPart.toLowerCase().includes(d)))
    return "No se permiten correos de servicios temporales"
  return ""
}

const validarPassword = (pass) => {
  if (!pass) return "La contraseña es obligatoria"
  if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres"
  if (pass.length > 15) return "La contraseña no puede tener más de 15 caracteres"
  if (!/[a-z]/.test(pass)) return "Debe contener al menos una letra minúscula"
  if (!/[A-Z]/.test(pass)) return "Debe contener al menos una letra mayúscula"
  if (!/[0-9]/.test(pass)) return "Debe contener al menos un número"
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass))
    return "Debe contener al menos un carácter especial"
  if (REGEX.SECUENCIAS_COMUNES.test(pass)) return "La contraseña contiene secuencias comunes"
  if (REGEX.CARACTERES_REPETIDOS.test(pass)) return "No se permiten más de 3 caracteres repetidos seguidos"
  if (/qwert|asdfg|zxcvb|12345|09876/.test(pass.toLowerCase()))
    return "La contraseña no puede contener secuencias de teclado"
  return ""
}

// ─── Helper: verificar rol ──────────────────────────────────────
const checkRol = async (rolNombre) => {
  if (!rolNombre) return { ok: false, msg: "Usuario sin rol asignado" }
  const rol = await Rol.findOne({ nombre: rolNombre })
  if (!rol) return { ok: false, msg: "Tu rol ha sido eliminado. Contacta al administrador." }
  if (rol.estado === false) return { ok: false, msg: "Tu rol ha sido desactivado. Contacta al administrador." }
  return { ok: true, permisos: rol.permisos || [] }
}

// ─── REGISTER ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { nombre, documento, email, telefono, password } = req.body

  const emailErr = validarEmail(email)
  if (emailErr) return res.status(400).json({ msg: emailErr })
  const passErr = validarPassword(password)
  if (passErr) return res.status(400).json({ msg: passErr })

  try {
    const existe = await Usuario.findOne({ email: email.trim().toLowerCase() })
    if (existe) return res.status(400).json({ msg: "Ya existe un usuario con ese correo" })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await new Usuario({
      nombre,
      documento,
      email: email.trim().toLowerCase(),
      telefono,
      password: hashedPassword,
      rol: "cliente",
      estado: true,
    }).save()

    res.status(201).json({ msg: "Usuario registrado correctamente" })
  } catch (error) {
    console.error("[REGISTER]", error.message)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// ─── LOGIN ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  let { email, password } = req.body
  email = email ? email.trim().toLowerCase() : ""
  if (password) password = password.replace(/[\x00-\x1F\x7F-\x9F]/g, "")

  if (!email || !password)
    return res.status(400).json({ msg: "Por favor proporciona email y contraseña" })

  try {
    const usuario = await Usuario.findOne({ email })
    if (!usuario) return res.status(400).json({ msg: "Credenciales inválidas" })
    if (!usuario.estado) return res.status(403).json({ msg: "Usuario inactivo. Contacta al administrador." })

    const rolCheck = await checkRol(usuario.rol)
    if (!rolCheck.ok) return res.status(403).json({ msg: rolCheck.msg })

    if (!usuario.password?.startsWith("$2"))
      return res.status(400).json({ msg: "Credenciales inválidas" })

    const isMatch = await bcrypt.compare(password, usuario.password)
    if (!isMatch) return res.status(400).json({ msg: "Credenciales inválidas" })

    const payload = {
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        documento: usuario.documento,
        rol: usuario.rol,
        permisos: rolCheck.permisos,
      },
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" }, (err, token) => {
      if (err) throw err
      res.json({ token, usuario: payload.usuario })
    })
  } catch (error) {
    console.error("[LOGIN]", error.message)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// ─── FORGOT PASSWORD ───────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body
  const emailErr = validarEmail(email)
  if (emailErr) return res.status(400).json({ msg: emailErr })

  const GENERIC = "Si el correo existe, recibirás instrucciones para recuperar tu cuenta"

  try {
    const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() })
    if (!usuario || !usuario.estado) return res.json({ msg: GENERIC })

    const rolCheck = await checkRol(usuario.rol)
    if (!rolCheck.ok) return res.json({ msg: GENERIC })

    const tempPassword = `Tmp${Math.random().toString(36).substring(2, 8)}1!`
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(tempPassword, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()

    console.log(`[FORGOT] Temporal para ${email}: ${tempPassword}`)

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false },
      })
      await transporter.sendMail({
        to: usuario.email,
        from: `"SurtiAntojos" <${process.env.EMAIL_USER}>`,
        subject: "Contraseña temporal — SurtiAntojos",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;
            border:1px solid #e0e0e0;border-radius:8px;">
            <h2 style="color:#e64a19;margin-bottom:8px;">SurtiAntojos</h2>
            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            <p>Tu contraseña temporal es:</p>
            <div style="text-align:center;margin:20px 0;padding:16px;background:#fafafa;
              border-radius:6px;font-size:22px;font-weight:bold;letter-spacing:3px;">
              ${tempPassword}
            </div>
            <p>Cámbiala después de iniciar sesión.</p>
            <p style="color:#888;font-size:12px;">— Equipo SurtiAntojos</p>
          </div>`,
      })
    } catch (mailErr) {
      console.error("[FORGOT] Error de correo:", mailErr.message)
    }

    return res.json({ msg: GENERIC })
  } catch (error) {
    console.error("[FORGOT]", error.message)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// ─── RESET PASSWORD ────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body
  const passErr = validarPassword(newPassword)
  if (passErr) return res.status(400).json({ msg: passErr })

  try {
    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!usuario) return res.status(400).json({ msg: "Token inválido o expirado" })
    if (!usuario.estado) return res.status(403).json({ msg: "Usuario inactivo." })

    const rolCheck = await checkRol(usuario.rol)
    if (!rolCheck.ok) return res.status(403).json({ msg: rolCheck.msg })

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(newPassword, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()

    res.json({ msg: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("[RESET]", error.message)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// ─── GET USUARIO AUTENTICADO ────────────────────────────────────
exports.getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select("-password")
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" })
    if (!usuario.estado) return res.status(403).json({ msg: "Usuario inactivo." })
    const rolCheck = await checkRol(usuario.rol)
    if (!rolCheck.ok) return res.status(403).json({ msg: rolCheck.msg })
    res.json(usuario)
  } catch (error) {
    console.error("[GET_USUARIO]", error.message)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// ─── ADMIN RESET PASSWORD ──────────────────────────────────────
exports.adminResetPassword = async (req, res) => {
  const { email, newPassword } = req.body
  const emailErr = validarEmail(email)
  if (emailErr) return res.status(400).json({ msg: emailErr })
  const passErr = validarPassword(newPassword)
  if (passErr) return res.status(400).json({ msg: passErr })

  try {
    const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() })
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" })
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(newPassword, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()
    res.json({ msg: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("[ADMIN_RESET]", error.message)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// ─── VERIFICAR ESTADO ROL ──────────────────────────────────────
exports.verificarEstadoRol = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id)
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" })
    const rolCheck = await checkRol(usuario.rol)
    res.json({ rolActivo: rolCheck.ok, msg: rolCheck.ok ? "Rol activo" : rolCheck.msg })
  } catch (error) {
    console.error("[VERIFICAR_ROL]", error.message)
    res.status(500).json({ msg: "Error del servidor" })
  }
}