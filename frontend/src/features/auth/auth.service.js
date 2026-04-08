import axios from "axios"

// ─── URL base ───────────────────────────────────────────────────
// Vite expone las variables de entorno con import.meta.env (prefijo VITE_)
const BASE = import.meta.env.VITE_API_URL || ""
const API_URL = BASE ? `${BASE}/api/auth` : "/api/auth"

// ─── LOGIN ──────────────────────────────────────────────────────
const login = async (email, password) => {
  if (!email || !password) throw new Error("El email y la contraseña son obligatorios")

  try {
    const res = await axios.post(`${API_URL}/login`, {
      email: email.trim(),
      password,
    })

    if (res.data?.token) {
      localStorage.setItem("token", res.data.token)
      if (res.data.usuario) {
        localStorage.setItem("usuario", JSON.stringify(res.data.usuario))
      }
    }

    return res.data
  } catch (error) {
    const msg =
      error.response?.data?.msg ||
      error.response?.data?.message ||
      "No se pudo conectar con el servidor"
    throw new Error(msg)
  }
}

// ─── REGISTER ───────────────────────────────────────────────────
const register = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.msg || "Error al registrar usuario"
    throw new Error(msg)
  }
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────
const forgotPassword = async (email) => {
  try {
    const res = await axios.post(`${API_URL}/forgot-password`, { email })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.msg || "Error al conectar con el servidor"
    throw new Error(msg)
  }
}

// ─── RESET PASSWORD ──────────────────────────────────────────────
const resetPassword = async (token, newPassword) => {
  try {
    const res = await axios.post(`${API_URL}/reset-password`, { token, newPassword })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.msg || "Error al restablecer contraseña"
    throw new Error(msg)
  }
}

// ─── VERIFICAR ROL ───────────────────────────────────────────────
const verificarEstadoRol = async () => {
  try {
    const token = localStorage.getItem("token")
    if (!token) return { rolActivo: false }
    const res = await axios.get(`${API_URL}/verificar-rol`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (error) {
    return { rolActivo: false, error: error.message }
  }
}

// ─── LOGOUT ──────────────────────────────────────────────────────
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("usuario")
}

// ─── GET USUARIO ACTUAL ──────────────────────────────────────────
const getUsuarioActual = () => {
  try {
    const raw = localStorage.getItem("usuario")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const authService = {
  login,
  register,
  forgotPassword,
  resetPassword,
  verificarEstadoRol,
  logout,
  getUsuarioActual,
}

export default authService