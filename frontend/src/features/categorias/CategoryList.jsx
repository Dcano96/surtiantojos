import { useState, useEffect } from "react"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment, Tooltip,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, XCircle,
  ArrowLeft, ArrowRight, Plus, Tag, FileText,
} from "lucide-react"
import Swal from "sweetalert2"
import categoriasService from "./categorias.service.js"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Premium Soft-3D Neumorphic
   ═══════════════════════════════════════════════════════════════ */
const T = {
  o1: "#FF6B35", o2: "#FF3D00", o3: "#FF8F5E", o4: "#FFF0EB",
  r1: "#EF4444", y1: "#F59E0B", green: "#22C55E", green2: "#BBF7D0",
  t1: "#1A1A2E", t2: "#4A4A68", t3: "#9CA3AF", t4: "#C5C8D4",
  bg: "#F2F0EE", bg2: "#FFFFFF", bg3: "#FAF8F6",
  go: "linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)",
  border: "rgba(0,0,0,0.06)", border2: "rgba(255,107,53,0.22)",
  neu: "8px 8px 24px rgba(0,0,0,0.06), -8px -8px 24px rgba(255,255,255,0.95)",
  neuHover: "12px 12px 32px rgba(0,0,0,0.08), -12px -12px 32px rgba(255,255,255,1)",
  shCard: "0 8px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)",
  glow: "0 4px 20px rgba(255,107,53,0.25)",
  glow2: "0 8px 32px rgba(255,107,53,0.35)",
  font: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontH: "'Fraunces', serif",
  rad: "20px", rad2: "16px", rad3: "24px",
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION KEYFRAMES
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-cat-anims")) {
  const s = document.createElement("style"); s.id = "sa-cat-anims"
  s.textContent = `
    @keyframes sa-cat-bob    { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-5px) scale(1.04)} }
    @keyframes sa-cat-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes sa-cat-orb1   { 0%,100%{transform:translate(0,0)} 33%{transform:translate(5px,-8px)} 66%{transform:translate(-5px,3px)} }
    @keyframes sa-cat-orb2   { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-6px,5px)} 66%{transform:translate(4px,-6px)} }
    @keyframes sa-cat-orb3   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(3px,-4px) scale(1.12)} }
  `
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════════════════════════
   SWAL STYLE
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-cat-swal")) {
  const s = document.createElement("style"); s.id = "sa-cat-swal"
  s.textContent = `
    .swal2-icon.swal2-question{border-color:#FF6B35!important;color:#FF6B35!important}
    .swal2-icon.swal2-warning{border-color:#FF3D00!important;color:#FF3D00!important}
    .swal2-icon.swal2-success{border-color:#22C55E!important;color:#22C55E!important}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#22C55E!important}
    .swal2-icon.swal2-success .swal2-success-ring{border-color:rgba(34,197,94,.30)!important}
    .swal2-icon.swal2-error{border-color:#EF4444!important;color:#EF4444!important}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#EF4444!important}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#FF6B35,#FF3D00)!important}
    .swal2-popup{border-radius:20px!important;box-shadow:0 25px 60px rgba(0,0,0,0.15)!important}
    .swal2-backdrop-show{background:rgba(15,23,42,.25)!important;backdrop-filter:blur(8px)!important}
  `
  document.head.appendChild(s)
}

const SW = { customClass: { popup: "sa-dash-pop", title: "sa-dash-ttl", htmlContainer: "sa-dash-bod", confirmButton: "sa-dash-ok", cancelButton: "sa-dash-cn" }, buttonsStyling: false }
const swalFire = (options) => Swal.fire({ ...options, allowOutsideClick: options.showCancelButton ? true : false })

/* ═══════════════════════════════════════════════════════════════
   REUSABLE BUTTON STYLES
   ═══════════════════════════════════════════════════════════════ */
const actionBtn = {
  width: 36, height: 36, borderRadius: "12px", display: "flex", alignItems: "center",
  justifyContent: "center", border: "none", cursor: "pointer", transition: "all .25s ease",
  minWidth: "unset", p: 0, "&:hover": { transform: "translateY(-2px)" },
}
const btnEdit = { ...actionBtn, background: "rgba(34,197,94,0.10)", color: T.green, boxShadow: "0 2px 8px rgba(34,197,94,0.08)", "&:hover": { background: "rgba(34,197,94,0.18)", boxShadow: "0 6px 16px rgba(34,197,94,.20)", transform: "translateY(-2px)" } }
const btnView = { ...actionBtn, background: "rgba(255,107,53,0.10)", color: T.o1, boxShadow: "0 2px 8px rgba(255,107,53,0.08)", "&:hover": { background: "rgba(255,107,53,0.18)", boxShadow: "0 6px 16px rgba(255,107,53,.20)", transform: "translateY(-2px)" } }
const btnDel = { ...actionBtn, background: "rgba(239,68,68,0.08)", color: T.r1, boxShadow: "0 2px 8px rgba(239,68,68,0.06)", "&:hover": { background: "rgba(239,68,68,0.15)", boxShadow: "0 6px 16px rgba(239,68,68,.20)", transform: "translateY(-2px)" } }

const cancelBtnSx = {
  fontFamily: `${T.font} !important`, fontWeight: "600 !important",
  color: `${T.t2} !important`, borderRadius: "14px !important",
  padding: "10px 24px !important", border: `1.5px solid rgba(0,0,0,0.08) !important`,
  textTransform: "none !important", background: "#fff !important",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04) !important",
  "&:hover": { background: "#F9FAFB !important", boxShadow: "0 4px 12px rgba(0,0,0,0.06) !important" },
}
const submitBtnSx = {
  display: "flex !important", alignItems: "center !important", gap: "8px !important",
  background: `${T.go} !important`, color: "#fff !important",
  fontFamily: `${T.font} !important`, fontWeight: "700 !important",
  borderRadius: "14px !important", padding: "10px 26px !important",
  textTransform: "none !important", boxShadow: `${T.glow} !important`,
  "&:hover": { transform: "translateY(-2px)", boxShadow: `${T.glow2} !important` },
  "&:disabled": { background: "rgba(255,107,53,.15) !important", boxShadow: "none !important", transform: "none !important" },
}

const pageBtn = {
  width: 34, height: 34, borderRadius: "10px",
  background: "#fff", color: T.t3, border: "1px solid rgba(0,0,0,0.06)",
  fontFamily: T.font, fontSize: ".80rem", fontWeight: 600,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", minWidth: "unset", p: 0,
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)", transition: "all .2s ease",
  "&:hover": { background: T.go, color: "#fff", borderColor: "transparent", boxShadow: T.glow, transform: "translateY(-1px)" },
}
const pageBtnOn = {
  ...pageBtn,
  background: `${T.go} !important`, color: "#fff !important", borderColor: "transparent !important",
  boxShadow: `${T.glow} !important`, transform: "translateY(-1px) !important",
}

/* ═══════════════════════════════════════════════════════════════
   SVG — 3D Tag Icon for Header
   ═══════════════════════════════════════════════════════════════ */
const TagIcon3D = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tg3dGrad" x1="8" y1="4" x2="48" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF8F5E" />
        <stop offset="0.5" stopColor="#FF6B35" />
        <stop offset="1" stopColor="#FF3D00" />
      </linearGradient>
      <linearGradient id="tg3dInner" x1="14" y1="10" x2="42" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(255,255,255,0.35)" />
        <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
      </linearGradient>
      <filter id="tg3dShadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#FF6B35" floodOpacity="0.30" />
      </filter>
    </defs>
    <circle cx="28" cy="30" r="22" fill="#FF6B35" opacity="0.08" />
    <rect x="10" y="10" width="36" height="36" rx="10" fill="url(#tg3dGrad)" filter="url(#tg3dShadow)" />
    <rect x="14" y="14" width="28" height="28" rx="7" fill="url(#tg3dInner)" />
    <circle cx="22" cy="22" r="3" fill="white" opacity="0.9" />
    <path d="M22 34L34 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="44" cy="12" r="4" fill="#FF8F5E" opacity="0.6" />
    <circle cx="10" cy="44" r="3" fill="#FFB088" opacity="0.5" />
  </svg>
)

/* Floating Orb */
const FloatingOrb = ({ size, color, top, left, right, bottom, delay = "0s", anim = "sa-cat-orb1" }) => (
  <Box sx={{
    position: "absolute", top, left, right, bottom,
    width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 35% 35%, ${color}88, ${color})`,
    boxShadow: `0 4px 12px ${color}44`,
    animation: `${anim} ${3 + Math.random() * 2}s ease-in-out infinite ${delay}`,
    zIndex: 1,
  }} />
)

/* 3D Pie Chart */
const PieChart3D = ({ total, active, inactive }) => {
  const t = total || 1
  const activeDeg = (active / t) * 360
  const inactiveDeg = (inactive / t) * 360
  return (
    <Box sx={{ position: "relative", width: 180, height: 155, flexShrink: 0 }}>
      <Box sx={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", width: 110, height: 18, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)" }} />
      <Box sx={{
        position: "absolute", top: 30, left: "50%",
        width: 128, height: 128, borderRadius: "50%",
        background: `conic-gradient(#D85A2A 0deg, #D85A2A ${activeDeg}deg, #16803B ${activeDeg}deg, #16803B ${activeDeg + inactiveDeg}deg, #C9A94E ${activeDeg + inactiveDeg}deg, #C9A94E 360deg)`,
        transform: "translateX(-50%) perspective(500px) rotateX(55deg) translateY(8px)",
        opacity: 0.45, filter: "blur(1px)",
      }} />
      <Box sx={{
        position: "absolute", top: 18, left: "50%", transform: "translateX(-50%) perspective(500px) rotateX(55deg)",
        width: 128, height: 128, borderRadius: "50%",
        background: `conic-gradient(#FF8F5E 0deg, #FF6B35 ${activeDeg}deg, #86EFAC ${activeDeg}deg, #22C55E ${activeDeg + inactiveDeg}deg, #FDE68A ${activeDeg + inactiveDeg}deg, #FEF3C7 360deg)`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.10), inset 0 -4px 12px rgba(0,0,0,0.06), inset 0 4px 8px rgba(255,255,255,0.3)",
        "&::after": {
          content: '""', position: "absolute", top: "25%", left: "25%", width: "50%", height: "50%",
          borderRadius: "50%", background: T.bg3,
          boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.8)",
        },
      }} />
      <FloatingOrb size={16} color="#FF6B35" top={5} right={8} delay="0s" anim="sa-cat-orb1" />
      <FloatingOrb size={10} color="#22C55E" top={15} left={10} delay="0.6s" anim="sa-cat-orb2" />
      <FloatingOrb size={8} color="#F59E0B" bottom={15} right={2} delay="1.2s" anim="sa-cat-orb3" />
    </Box>
  )
}

/* Empty State Illustration */
const EmptyIllustration = () => (
  <Box sx={{ position: "relative", width: 200, height: 140, mx: "auto", mb: 2 }}>
    <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,60,0.10) 0%, transparent 70%)", filter: "blur(18px)", pointerEvents: "none" }} />
    <Box sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -55%)", animation: "sa-cat-bob 4s ease-in-out infinite", zIndex: 2, filter: "drop-shadow(0 14px 28px rgba(255,107,53,0.35))" }}>
      <svg width="100" height="110" viewBox="0 0 100 110" fill="none">
        <defs>
          <linearGradient id="emCat1" x1="10" y1="5" x2="90" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD4A8" /><stop offset="0.55" stopColor="#FF8F5E" /><stop offset="1" stopColor="#E85D0A" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="103" rx="32" ry="6" fill="rgba(0,0,0,0.08)" />
        <rect x="15" y="10" width="70" height="80" rx="16" fill="url(#emCat1)" />
        <rect x="25" y="25" width="30" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
        <rect x="25" y="36" width="50" height="3.5" rx="1.8" fill="rgba(255,255,255,0.25)" />
        <rect x="25" y="44" width="40" height="3.5" rx="1.8" fill="rgba(255,255,255,0.20)" />
        <circle cx="50" cy="68" r="14" fill="rgba(255,255,255,0.2)" />
        <path d="M44 68L48 72L56 64" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  </Box>
)

/* ═══════════════════════════════════════════════════════════════
   COMPONENT — CategoriasList
   ═══════════════════════════════════════════════════════════════ */
const CategoriasList = () => {
  const [categorias, setCategorias] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", estado: true })
  const [formErrors, setFormErrors] = useState({ nombre: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Cargar categorías
  const fetchCategorias = async () => {
    const data = await categoriasService.getCategorias()
    setCategorias(Array.isArray(data) ? data : [])
  }
  useEffect(() => { fetchCategorias() }, [])

  // Verificar duplicados
  const checkExists = (name, excludeId = null) =>
    categorias.some(c => c.nombre.toLowerCase() === name.toLowerCase() && c._id !== excludeId)

  // Abrir modal crear/editar
  const handleOpen = (cat) => {
    setFormErrors({ nombre: "" })
    if (cat) {
      setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || "", estado: cat.estado })
      setEditingId(cat._id)
    } else {
      setFormData({ nombre: "", descripcion: "", estado: true })
      setEditingId(null)
    }
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false); setEditingId(null)
    setFormData({ nombre: "", descripcion: "", estado: true }); setFormErrors({ nombre: "" })
  }

  // Abrir detalle
  const handleDetails = (cat) => { setSelectedCat(cat); setDetailsOpen(true) }

  // Manejo de cambios
  const handleChange = (e) => {
    const { name, value } = e.target
    const parsed = name === "estado" ? value === "true" || value === true : value
    setFormData(prev => ({ ...prev, [name]: parsed }))
    if (name === "nombre") validateNombre(value)
  }

  const validateNombre = (value) => {
    let err = ""
    if (!value || !value.trim()) err = "El nombre es obligatorio"
    else if (value.length < 3) err = "Mínimo 3 caracteres"
    else if (value.length > 50) err = "Máximo 50 caracteres"
    else if (checkExists(value.trim(), editingId)) err = "Ya existe una categoría con este nombre"
    setFormErrors(prev => ({ ...prev, nombre: err }))
    return !err
  }

  // Guardar
  const handleSubmit = async () => {
    if (!validateNombre(formData.nombre)) return
    const isEditing = !!editingId
    try {
      if (isEditing) {
        await categoriasService.updateCategoria(editingId, formData)
      } else {
        await categoriasService.createCategoria(formData)
      }
      handleClose()
      await fetchCategorias()
      setTimeout(() => {
        swalFire({ ...SW, icon: "success", title: isEditing ? "Categoría actualizada" : "Categoría creada", text: isEditing ? "Los cambios se guardaron correctamente." : "La nueva categoría se registró correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      }, 300)
    } catch (e) {
      const msg = e.response?.data?.message || "Error al guardar la categoría."
      await swalFire({ ...SW, icon: "error", title: "Error al guardar", text: msg })
    }
  }

  // Cambiar estado
  const handleToggleEstado = async (cat) => {
    const nuevoEstado = cat.estado ? "desactivar" : "activar"
    const r = await swalFire({
      ...SW, title: `¿${cat.estado ? "Desactivar" : "Activar"} categoría?`,
      text: `Se va a ${nuevoEstado} la categoría "${cat.nombre}"`,
      icon: "question", showCancelButton: true,
      confirmButtonText: `Sí, ${nuevoEstado}`, cancelButtonText: "Cancelar",
    })
    if (r.isConfirmed) {
      try {
        await categoriasService.cambiarEstadoCategoria(cat._id)
        await fetchCategorias()
        setTimeout(() => {
          swalFire({ ...SW, icon: "success", title: "Estado actualizado", text: `Categoría ${cat.estado ? "desactivada" : "activada"} correctamente.`, timer: 2000, timerProgressBar: true, showConfirmButton: false })
        }, 300)
      } catch (e) {
        await swalFire({ ...SW, icon: "error", title: "Error", text: e.response?.data?.message || "Error al cambiar estado." })
      }
    }
  }

  // Eliminar
  const handleDelete = async (cat) => {
    if (cat.estado) {
      await swalFire({ ...SW, icon: "warning", title: "Categoría activa", text: "No puedes eliminar una categoría activa. Desactívala primero." })
      return
    }
    const r = await swalFire({
      ...SW, title: "¿Eliminar categoría?", text: `Se eliminará permanentemente "${cat.nombre}". Esta acción no se puede deshacer.`,
      icon: "question", showCancelButton: true,
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    })
    if (r.isConfirmed) {
      try {
        await categoriasService.deleteCategoria(cat._id)
        await fetchCategorias()
        setTimeout(() => {
          swalFire({ ...SW, icon: "success", title: "Eliminada", text: "La categoría se eliminó correctamente.", timer: 2000, timerProgressBar: true, showConfirmButton: false })
        }, 300)
      } catch (e) {
        await swalFire({ ...SW, icon: "error", title: "Error", text: e.response?.data?.message || "Error al eliminar." })
      }
    }
  }

  // Helpers
  const getInitials = (name) => name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2)
  const AVATAR_COLORS = [
    "linear-gradient(135deg, #FF6B35, #FF3D00)",
    "linear-gradient(135deg, #6366F1, #4F46E5)",
    "linear-gradient(135deg, #22C55E, #059669)",
    "linear-gradient(135deg, #F59E0B, #D97706)",
    "linear-gradient(135deg, #EC4899, #DB2777)",
    "linear-gradient(135deg, #06B6D4, #0891B2)",
  ]
  const avGrad = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length]

  const totalActive = categorias.filter(c => c.estado).length
  const totalInactive = categorias.filter(c => !c.estado).length
  const filtered = categorias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  /* ─── Dialog Header ─── */
  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box sx={{
      background: T.go, p: "20px 26px", display: "flex", alignItems: "center", gap: "14px",
      position: "relative", overflow: "hidden",
    }}>
      <Box sx={{ position: "absolute", top: -10, right: 30, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <Box sx={{
        width: 42, height: 42, borderRadius: "14px", background: "rgba(255,255,255,.18)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        backdropFilter: "blur(8px)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2)",
      }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontFamily: `${T.fontH} !important`, fontWeight: "800 !important", fontSize: "1.10rem !important", color: "#fff !important", lineHeight: 1.2 }}>{title}</Typography>
        <Typography sx={{ fontSize: ".75rem", color: "rgba(255,255,255,.65)", mt: "4px", fontFamily: T.font }}>{sub}</Typography>
      </Box>
      <button style={{
        width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.15)",
        backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.12)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", flexShrink: 0, transition: "all .2s",
      }} onClick={onClose}><X size={14} strokeWidth={2.5} /></button>
    </Box>
  )

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden" }}>

      {/* ═══ HERO HEADER ═══ */}
      <Box sx={{
        background: "#fff", borderRadius: T.rad3, p: "26px 30px",
        mb: "18px", display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: T.shCard, border: "1px solid rgba(0,0,0,0.03)",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -30, right: 200, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,107,53,0.03)", filter: "blur(20px)" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: "18px", position: "relative", zIndex: 2 }}>
          <Box sx={{ animation: "sa-cat-bob 4s ease-in-out infinite" }}><TagIcon3D /></Box>
          <Box>
            <Typography sx={{ fontFamily: `${T.fontH} !important`, fontSize: "1.40rem !important", fontWeight: "800 !important", color: `${T.t1} !important`, lineHeight: 1.2 }}>
              Gestión de Categorías
            </Typography>
            <Typography sx={{ fontSize: ".86rem", color: T.t3, mt: "5px", fontFamily: T.font }}>
              Administra las categorías de productos del sistema
            </Typography>
          </Box>
        </Box>
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <PieChart3D total={categorias.length} active={totalActive} inactive={totalInactive} />
        </Box>
      </Box>

      {/* ═══ STATS CARDS ═══ */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px", mb: "18px" }}>
        {[
          { label: "TOTAL", value: categorias.length, desc: "registradas", color: T.o1, gradBg: "linear-gradient(135deg, rgba(255,107,53,0.06), rgba(255,61,0,0.02))", icon: <Tag size={18} /> },
          { label: "ACTIVAS", value: totalActive, desc: "habilitadas", color: T.green, gradBg: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(22,163,74,0.02))", icon: <CheckCircle size={18} /> },
          { label: "INACTIVAS", value: totalInactive, desc: "desactivadas", color: T.r1, gradBg: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(220,38,38,0.02))", icon: <XCircle size={18} /> },
        ].map((stat, i) => (
          <Box key={i} sx={{
            background: stat.gradBg, borderRadius: T.rad, p: "20px 22px",
            boxShadow: T.neu, border: "1px solid rgba(255,255,255,0.8)",
            transition: "all .3s ease", position: "relative", overflow: "hidden",
            "&:hover": { boxShadow: T.neuHover, transform: "translateY(-3px)" },
            "&::before": {
              content: '""', position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: `linear-gradient(90deg, ${stat.color}66, ${stat.color})`,
              borderRadius: "20px 20px 0 0",
            },
          }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px" }}>
              <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: stat.color }}>{stat.label}</Typography>
              <Box sx={{ width: 38, height: 38, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, background: `${stat.color}12`, boxShadow: `0 4px 12px ${stat.color}15` }}>{stat.icon}</Box>
            </Box>
            <Typography sx={{ fontFamily: T.font, fontSize: "1.80rem", fontWeight: 800, lineHeight: 1, color: T.t1, mb: "5px" }}>{stat.value}</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", fontWeight: 500, color: T.t3 }}>{stat.desc}</Typography>
          </Box>
        ))}
        <Box sx={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.80))",
          borderRadius: T.rad, p: "20px 22px", boxShadow: T.neu, border: "1px solid rgba(255,255,255,0.8)",
          transition: "all .3s ease", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px",
          "&:hover": { boxShadow: T.neuHover, transform: "translateY(-3px)" },
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.o1, boxShadow: `0 2px 6px ${T.o1}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>Registradas</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>{categorias.length > 0 ? 100 : 0} %</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.green, boxShadow: `0 2px 6px ${T.green}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>Habilitadas</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>{categorias.length > 0 ? Math.round((totalActive / categorias.length) * 100) : 0} %</Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══ TOOLBAR ═══ */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "18px", gap: "14px", flexWrap: "wrap" }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "#fff", border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: "14px", p: "10px 16px", minWidth: 260,
          boxShadow: T.neu, transition: "all .25s",
          "&:focus-within": { borderColor: T.o1, boxShadow: `${T.neu}, 0 0 0 3px rgba(255,107,53,.08)` },
        }}>
          <Search size={17} color={T.t3} strokeWidth={2} />
          <input style={{
            border: "none", outline: "none", background: "transparent",
            fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%",
          }} placeholder="Buscar categoría..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0) }} />
        </Box>
        <button onClick={() => handleOpen(null)} style={{
          display: "flex", alignItems: "center", gap: 9,
          background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
          color: "#fff", fontFamily: T.font, fontWeight: 700,
          fontSize: ".84rem", padding: "11px 26px", borderRadius: 14,
          border: "none", cursor: "pointer",
          boxShadow: "0 6px 20px rgba(255,107,53,.30)", transition: "all .25s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,107,53,.40)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,107,53,.30)" }}
        >
          + Nueva Categoría
        </button>
      </Box>

      {/* ═══ TABLE ═══ */}
      <Box sx={{
        background: "#fff", borderRadius: T.rad3, p: "6px",
        boxShadow: T.shCard, border: "1px solid rgba(0,0,0,0.03)", mb: "18px",
      }}>
        {paginated.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 2.5fr 1fr 140px", px: "24px", py: "14px" }}>
            {["CATEGORÍA", "DESCRIPCIÓN", "ESTADO", "ACCIONES"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.2px", textTransform: "uppercase", color: T.t4,
                ...(h === "ESTADO" || h === "ACCIONES" ? { textAlign: "center" } : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", p: paginated.length > 0 ? "0 6px 6px" : "0" }}>
          {paginated.map((cat, i) => (
            <Box key={cat._id} sx={{
              display: "grid", gridTemplateColumns: "2fr 2.5fr 1fr 140px",
              alignItems: "center", p: "16px 22px", borderRadius: T.rad2,
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(250,248,246,0.95))",
              border: "1px solid rgba(0,0,0,0.03)",
              boxShadow: "4px 4px 16px rgba(0,0,0,0.03), -2px -2px 10px rgba(255,255,255,0.8)",
              transition: "all .3s ease",
              animation: `sa-cat-fadeUp 0.4s ease ${i * 0.05}s both`,
              "&:hover": {
                boxShadow: "6px 6px 24px rgba(0,0,0,0.06), -4px -4px 16px rgba(255,255,255,0.9), 0 0 0 1px rgba(255,107,53,0.08)",
                transform: "translateY(-2px)",
              },
            }}>
              {/* Nombre */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <Box sx={{
                  width: 42, height: 42, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, background: avGrad(i),
                  fontFamily: T.font, fontWeight: 700, fontSize: ".82rem", color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,.12), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)",
                }}>
                  {getInitials(cat.nombre)}
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".90rem", color: T.t1, lineHeight: 1.3 }}>{cat.nombre}</Typography>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4 }}>#{cat._id?.slice(-6).toUpperCase()}</Typography>
                </Box>
              </Box>

              {/* Descripción */}
              <Tooltip title={cat.descripcion || "Sin descripción"} placement="top">
                <Typography sx={{
                  fontFamily: T.font, fontSize: ".82rem", color: T.t3,
                  maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {cat.descripcion || "Sin descripción"}
                </Typography>
              </Tooltip>

              {/* Estado — clickable toggle */}
              <Box sx={{ textAlign: "center" }}>
                <Tooltip title={cat.estado ? "Click para desactivar" : "Click para activar"} placement="top">
                  <Box component="span" onClick={() => handleToggleEstado(cat)} sx={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "5px 14px", borderRadius: "22px", cursor: "pointer",
                    fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                    transition: "all .25s ease",
                    ...(cat.estado
                      ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "inset 0 1px 3px rgba(34,197,94,0.06)", "&:hover": { background: "rgba(34,197,94,0.15)" } }
                      : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "inset 0 1px 3px rgba(239,68,68,0.06)", "&:hover": { background: "rgba(239,68,68,0.12)" } }),
                  }}>
                    <Box sx={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: cat.estado ? "#22C55E" : "#EF4444",
                      boxShadow: cat.estado ? "0 0 6px rgba(34,197,94,0.5)" : "0 0 6px rgba(239,68,68,0.5)",
                    }} />
                    {cat.estado ? "Activa" : "Inactiva"}
                  </Box>
                </Tooltip>
              </Box>

              {/* Acciones */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: "7px" }}>
                <Tooltip title="Editar" placement="top">
                  <Button sx={btnEdit} onClick={() => handleOpen(cat)}><Edit2 size={15} strokeWidth={2} /></Button>
                </Tooltip>
                <Tooltip title="Ver detalles" placement="top">
                  <Button sx={btnView} onClick={() => handleDetails(cat)}><Eye size={15} strokeWidth={2} /></Button>
                </Tooltip>
                <Tooltip title={cat.estado ? "Desactiva primero para eliminar" : "Eliminar"} placement="top">
                  <Button sx={{ ...btnDel, ...(cat.estado ? { opacity: 0.35, cursor: "not-allowed" } : {}) }}
                    onClick={() => handleDelete(cat)}>
                    <Trash2 size={15} strokeWidth={2} />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Empty state */}
        {paginated.length === 0 && (
          <Box sx={{
            borderRadius: T.rad, p: "40px 30px 50px",
            background: "radial-gradient(ellipse at 35% 55%, rgba(255,160,80,0.10), rgba(255,107,53,0.04) 35%, rgba(255,255,255,0.3) 65%, rgba(250,248,246,0.6) 100%)",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: 300, flexDirection: "column",
          }}>
            <EmptyIllustration />
            <Typography sx={{ fontFamily: T.fontH, fontSize: "1.20rem", fontWeight: 800, color: T.t1, mb: "10px" }}>
              {categorias.length === 0 ? "No hay categorías registradas" : "Sin resultados"}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t3, maxWidth: 380, mx: "auto", mb: "24px", lineHeight: 1.6, textAlign: "center" }}>
              {categorias.length === 0 ? "Crea una nueva categoría para organizar los productos del sistema." : "No se encontraron categorías que coincidan con la búsqueda."}
            </Typography>
            {categorias.length === 0 && (
              <button onClick={() => handleOpen(null)} style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
                color: "#fff", fontFamily: T.font, fontWeight: 700,
                fontSize: ".84rem", padding: "12px 28px", borderRadius: 14,
                border: "none", cursor: "pointer",
                boxShadow: "0 6px 20px rgba(255,107,53,.30)", transition: "all .25s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,107,53,.40)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,107,53,.30)" }}
              >
                + Nueva Categoría
              </button>
            )}
          </Box>
        )}
      </Box>

      {/* ═══ PAGINATION ═══ */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
          Mostrando {filtered.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length} categorías
        </Typography>
        <Box sx={{ display: "flex", gap: "5px" }}>
          <Button sx={pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ opacity: page === 0 ? .35 : 1 }}><ArrowLeft size={14} /></Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} sx={page === i ? pageBtnOn : pageBtn} onClick={() => setPage(i)}>{i + 1}</Button>
          ))}
          <Button sx={pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ opacity: page >= totalPages - 1 ? .35 : 1 }}><ArrowRight size={14} /></Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>Filas:</Typography>
          <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0) }}
            style={{
              border: "1px solid rgba(0,0,0,0.06)", borderRadius: 10, padding: "5px 10px",
              fontFamily: T.font, fontSize: ".82rem", color: T.t2, background: "#fff", outline: "none",
              cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}>
            {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ═══ MODAL CREAR / EDITAR ═══ */}
      <Dialog key={editingId || "new"} open={open} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") handleClose() }}
        fullWidth maxWidth="sm"
        sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(12px)", background: "rgba(15,23,42,.20)" } }}
        slotProps={{ paper: { sx: {
          borderRadius: "22px !important",
          boxShadow: "0 30px 70px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.1) !important",
          border: "1px solid rgba(255,255,255,0.15)",
          width: "90%", maxWidth: 540,
          background: "rgba(255,255,255,0.96) !important",
          backdropFilter: "blur(20px) saturate(180%)", overflow: "hidden",
        } } }}>

        <DlgHdr
          icon={editingId ? <Edit2 size={18} color="#fff" /> : <Tag size={18} color="#fff" />}
          title={editingId ? "Editar Categoría" : "Nueva Categoría"}
          sub={editingId ? "Modifica los datos de la categoría" : "Completa los campos para registrar una nueva categoría"}
          onClose={handleClose}
        />

        <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
          <TextField margin="dense" label="Nombre" name="nombre"
            value={formData.nombre} onChange={handleChange}
            onBlur={e => validateNombre(e.target.value)}
            fullWidth variant="outlined" size="small"
            placeholder="Ej. Snacks, Bebidas, Dulces..."
            error={!!formErrors.nombre}
            helperText={formErrors.nombre || "Nombre único para la categoría"}
            required
            inputProps={{ maxLength: 50 }}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Tag size={14} color={T.t3} /></InputAdornment> } }}
          />

          <TextField margin="dense" label="Descripción" name="descripcion"
            value={formData.descripcion} onChange={handleChange}
            fullWidth variant="outlined" size="small"
            placeholder="Breve descripción de la categoría..."
            multiline rows={3}
            inputProps={{ maxLength: 200 }}
            helperText={`${(formData.descripcion || "").length}/200 caracteres`}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: "10px" }}><FileText size={14} color={T.t3} /></InputAdornment> } }}
          />

          {editingId && (
            <TextField select margin="dense" label="Estado" name="estado"
              value={formData.estado} onChange={handleChange}
              fullWidth variant="outlined" size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">{formData.estado ? <CheckCircle size={14} color={T.green} /> : <XCircle size={14} color={T.r1} />}</InputAdornment> } }}
            >
              <MenuItem value={true}>Activa</MenuItem>
              <MenuItem value={false}>Inactiva</MenuItem>
            </TextField>
          )}
        </DialogContent>

        <DialogActions sx={{ p: "14px 26px 20px !important", gap: "10px" }}>
          <Button onClick={handleClose} sx={cancelBtnSx}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!!formErrors.nombre || !formData.nombre.trim()} sx={submitBtnSx}>
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Box component="span" sx={{ display: "inline-flex" }}>
                {editingId
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                }
              </Box>
              <span>{editingId ? "Guardar Cambios" : "Crear Categoría"}</span>
            </Box>
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ MODAL DETALLE ═══ */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)}
        fullWidth maxWidth="sm"
        sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(12px)", background: "rgba(15,23,42,.20)" } }}
        slotProps={{ paper: { sx: {
          borderRadius: "22px !important",
          boxShadow: "0 30px 70px rgba(0,0,0,0.18) !important",
          border: "1px solid rgba(255,255,255,0.15)",
          width: "90%", maxWidth: 540,
          background: "rgba(255,255,255,0.96) !important",
          backdropFilter: "blur(20px) saturate(180%)", overflow: "hidden",
        } } }}>

        <DlgHdr
          icon={<Eye size={18} color="#fff" />}
          title="Detalles de Categoría"
          sub={selectedCat?.nombre || ""}
          onClose={() => setDetailsOpen(false)}
        />

        <DialogContent sx={{ p: "22px 26px !important", background: "transparent" }}>
          {selectedCat && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Nombre", value: selectedCat.nombre, icon: <Tag size={14} color={T.o1} /> },
                { label: "Descripción", value: selectedCat.descripcion || "Sin descripción", icon: <FileText size={14} color={T.o1} /> },
                { label: "Estado", value: selectedCat.estado ? "Activa" : "Inactiva", icon: selectedCat.estado ? <CheckCircle size={14} color={T.green} /> : <XCircle size={14} color={T.r1} /> },
                { label: "Fecha de Creación", value: selectedCat.createdAt ? new Date(selectedCat.createdAt).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A", icon: <FileText size={14} color={T.o1} /> },
                { label: "Última Actualización", value: selectedCat.updatedAt ? new Date(selectedCat.updatedAt).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A", icon: <Edit2 size={14} color={T.o1} /> },
              ].map((field, i) => (
                <Box key={i} sx={{
                  borderRadius: "14px", p: "14px 18px",
                  background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.6)",
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "6px" }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.06)" }}>{field.icon}</Box>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: "0.8px" }}>{field.label}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".90rem", fontWeight: 600, color: T.t1, pl: "32px" }}>{field.value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: "14px 26px 20px !important" }}>
          <Button onClick={() => setDetailsOpen(false)} sx={cancelBtnSx}>Cerrar</Button>
          <Button onClick={() => { setDetailsOpen(false); handleOpen(selectedCat) }} sx={submitBtnSx}>
            <Edit2 size={14} /> Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export { CategoriasList }
export default CategoriasList
