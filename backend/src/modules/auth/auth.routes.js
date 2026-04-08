const express = require("express")
const router = express.Router()
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUsuario,
  adminResetPassword,
  verificarEstadoRol,
} = require("./auth.controller")
const authMiddleware = require("../../middlewares/authMiddleware")

// ─── Rutas públicas ─────────────────────────────────────────────
router.post("/register", register)
router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

// ─── Rutas protegidas ──────────────────────────────────────────
router.get("/me", authMiddleware, getUsuario)
router.get("/verificar-rol", authMiddleware, verificarEstadoRol)

// ─── Ruta solo para administradores ───────────────────────────
router.post("/admin-reset-password", authMiddleware, adminResetPassword)

module.exports = router