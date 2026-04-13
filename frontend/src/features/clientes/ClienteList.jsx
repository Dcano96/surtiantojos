import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment, Tooltip,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, XCircle, UserCheck, Users,
  ArrowLeft, ArrowRight, Plus, User, Phone, Mail, MapPin, FileText,
  ToggleLeft, ToggleRight,
} from "lucide-react"
import Swal from "sweetalert2"
import clientesService from "./clientes.service.js"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Warm Glassmorphism 3D (igual a Usuarios)
   ═══════════════════════════════════════════════════════════════ */
const T = {
  o1: "#FF6B35", o2: "#FF3D00", o3: "#FF8F5E", o4: "#FFF0EB",
  r1: "#EF4444", y1: "#F59E0B", green: "#22C55E", green2: "#BBF7D0",
  t1: "#1A1A2E", t2: "#4A4A68", t3: "#9CA3AF", t4: "#C5C8D4",
  bg: "#FFF8F5", bg2: "#FFFFFF", bg3: "#FAF8F6",
  go: "linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)",
  go2: "linear-gradient(135deg, #FF8F5E, #FF6B35)",
  border: "rgba(255,255,255,0.50)",
  border2: "rgba(255,107,53,0.22)",
  glass: "rgba(255,255,255,0.55)",
  glass2: "rgba(255,255,255,0.72)",
  blur: "blur(40px) saturate(180%)",
  neu: "0 8px 32px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
  neuHover: "0 20px 50px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.95)",
  glow: "0 6px 24px rgba(255,107,53,0.30)",
  glow2: "0 12px 40px rgba(255,107,53,0.45)",
  font: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontH: "'Fraunces', serif",
  rad: "20px", rad2: "16px", rad3: "28px",
}

const AVATAR_COLORS = [
  "linear-gradient(135deg, #FF6B35, #FF3D00)",
  "linear-gradient(135deg, #6366F1, #4F46E5)",
  "linear-gradient(135deg, #22C55E, #059669)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #EC4899, #DB2777)",
  "linear-gradient(135deg, #06B6D4, #0891B2)",
]
const avGrad = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length]

/* ─── Animation keyframes (compartidas con Usuarios) ─── */
if (typeof document !== "undefined" && !document.getElementById("sa-user-anims3d")) {
  const s = document.createElement("style"); s.id = "sa-user-anims3d"
  s.textContent = `
    @keyframes sa-aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes sa-float1{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}25%{transform:translate(14px,-22px) scale(1.06) rotate(6deg)}50%{transform:translate(-10px,-38px) scale(0.96) rotate(-4deg)}75%{transform:translate(18px,-12px) scale(1.04) rotate(3deg)}}
    @keyframes sa-float2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-18px,14px) scale(1.1)}66%{transform:translate(14px,-12px) scale(0.94)}}
    @keyframes sa-float3{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-22px,-18px) rotate(180deg)}}
    @keyframes sa-breathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.07) translateY(-6px)}}
    @keyframes sa-glow-pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.75;transform:scale(1.18)}}
    @keyframes sa-shimmer{from{background-position:-200% center}to{background-position:200% center}}
    @keyframes sa-border-glow{0%,100%{border-color:rgba(255,107,53,.15)}50%{border-color:rgba(255,107,53,.35)}}
    @keyframes sa-card-enter{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes sa-pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2);opacity:0}}
  `
  document.head.appendChild(s)
}

/* ─── SWAL STYLE ─── */
if (typeof document !== "undefined" && !document.getElementById("sa-swal-u")) {
  const s = document.createElement("style"); s.id = "sa-swal-u"
  s.textContent = `
    .swal2-icon.swal2-question{border-color:#FF6B35!important;color:#FF6B35!important}
    .swal2-icon.swal2-warning{border-color:#FF3D00!important;color:#FF3D00!important}
    .swal2-icon.swal2-success{border-color:#22C55E!important;color:#22C55E!important}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#22C55E!important}
    .swal2-icon.swal2-success .swal2-success-ring{border-color:rgba(34,197,94,.30)!important}
    .swal2-icon.swal2-error{border-color:#EF4444!important;color:#EF4444!important}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#EF4444!important}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#FF6B35,#FF3D00)!important}
    .swal2-container{z-index:99999!important}
    .swal2-popup{z-index:100000!important;border-radius:22px!important;box-shadow:0 30px 70px rgba(0,0,0,0.18)!important;backdrop-filter:blur(12px)!important}
    .swal2-backdrop-show{z-index:99998!important;background:rgba(15,23,42,.18)!important;backdrop-filter:blur(10px)!important}
  `
  document.head.appendChild(s)
}
const SW = { customClass: { popup: "sa-dash-pop" }, buttonsStyling: false }
const swalFire = (opts) => Swal.fire({ ...opts, ...SW, allowOutsideClick: opts.showCancelButton ? true : false })

/* ─── REUSABLE STYLES ─── */
const glassCard = {
  background: T.glass2, backdropFilter: T.blur, WebkitBackdropFilter: T.blur,
  border: `1px solid ${T.border}`, boxShadow: T.neu,
}
const actionBtn = {
  width: 36, height: 36, borderRadius: "12px", display: "flex", alignItems: "center",
  justifyContent: "center", border: "none", cursor: "pointer",
  transition: "all .3s cubic-bezier(.25,.46,.45,.94)", minWidth: "unset", p: 0,
  "&:hover": { transform: "translateY(-3px) scale(1.08)" },
}
const btnEdit = {
  ...actionBtn, background: "rgba(34,197,94,0.10)", color: T.green,
  boxShadow: "0 2px 10px rgba(34,197,94,0.10)",
  "&:hover": { ...actionBtn["&:hover"], background: "rgba(34,197,94,0.20)", boxShadow: "0 8px 24px rgba(34,197,94,.25)" },
}
const btnView = {
  ...actionBtn, background: "rgba(255,107,53,0.10)", color: T.o1,
  boxShadow: "0 2px 10px rgba(255,107,53,0.10)",
  "&:hover": { ...actionBtn["&:hover"], background: "rgba(255,107,53,0.20)", boxShadow: "0 8px 24px rgba(255,107,53,.25)" },
}
const btnDel = {
  ...actionBtn, background: "rgba(239,68,68,0.08)", color: T.r1,
  boxShadow: "0 2px 10px rgba(239,68,68,0.08)",
  "&:hover": { ...actionBtn["&:hover"], background: "rgba(239,68,68,0.18)", boxShadow: "0 8px 24px rgba(239,68,68,.25)" },
}
const btnTog = {
  ...actionBtn, background: "rgba(245,158,11,0.10)", color: T.y1,
  boxShadow: "0 2px 10px rgba(245,158,11,0.10)",
  "&:hover": { ...actionBtn["&:hover"], background: "rgba(245,158,11,0.20)", boxShadow: "0 8px 24px rgba(245,158,11,.25)" },
}
const cancelBtnSx = {
  fontFamily: `${T.font} !important`, fontWeight: "600 !important",
  color: `${T.t2} !important`, borderRadius: "16px !important",
  padding: "11px 26px !important", border: "1.5px solid rgba(0,0,0,0.06) !important",
  textTransform: "none !important", background: "rgba(255,255,255,0.75) !important",
  backdropFilter: "blur(16px) !important", transition: "all .25s ease !important",
  "&:hover": { background: "rgba(255,255,255,0.95) !important", boxShadow: "0 4px 16px rgba(0,0,0,0.06) !important", transform: "translateY(-1px)" },
}
const submitBtnSx = {
  display: "flex !important", alignItems: "center !important", gap: "8px !important",
  background: `${T.go} !important`, color: "#fff !important",
  fontFamily: `${T.font} !important`, fontWeight: "700 !important",
  borderRadius: "16px !important", padding: "11px 28px !important",
  textTransform: "none !important", boxShadow: `${T.glow} !important`,
  transition: "all .3s cubic-bezier(.25,.46,.45,.94) !important",
  "&:hover": { transform: "translateY(-3px) scale(1.02)", boxShadow: `${T.glow2} !important` },
}
const pageBtn = {
  width: 36, height: 36, borderRadius: "12px",
  background: "rgba(255,255,255,0.65)", color: T.t3,
  border: `1px solid ${T.border}`, backdropFilter: "blur(16px)",
  fontFamily: T.font, fontSize: ".80rem", fontWeight: 600,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", minWidth: "unset", p: 0,
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  transition: "all .25s cubic-bezier(.25,.46,.45,.94)",
  "&:hover": { background: T.go, color: "#fff", borderColor: "transparent", boxShadow: T.glow, transform: "translateY(-2px)" },
}
const pageBtnOn = {
  ...pageBtn,
  background: `${T.go} !important`, color: "#fff !important", borderColor: "transparent !important",
  boxShadow: `${T.glow} !important`, transform: "translateY(-2px) !important",
}
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem",
    background: "#fff", backdropFilter: "blur(12px)",
    "& fieldset": { borderColor: "rgba(0,0,0,0.10)" },
    "&:hover fieldset": { borderColor: T.o1 },
    "&.Mui-focused fieldset": { borderColor: T.o1, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontFamily: T.font, color: T.t2, "&.Mui-focused": { color: T.o1 } },
}

/* ─── 3D ICON (UserCheck temático Clientes) ─── */
const ClientIcon3D = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(255,107,53,0.35))" }}>
    <defs>
      <linearGradient id="cl3d" x1="8" y1="4" x2="56" y2="60">
        <stop offset="0%" stopColor="#FFB088" />
        <stop offset="40%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#E83D00" />
      </linearGradient>
      <linearGradient id="cl3dSpec" x1="20%" y1="0%" x2="70%" y2="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <circle cx="32" cy="32" r="28" fill="url(#cl3d)" />
    <circle cx="32" cy="32" r="22" fill="url(#cl3dSpec)" />
    <circle cx="32" cy="26" r="8" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.95" />
    <path d="M18 46c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.95" />
    <path d="M42 24l4 4 7-7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const GlassOrb = ({ size, top, left, right, bottom, color = "rgba(255,140,80,0.5)", delay = 0, dur = 10, anim = "sa-float1" }) => (
  <Box sx={{
    position: "fixed", width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5) 0%, ${color} 45%, rgba(200,60,0,0.15) 100%)`,
    boxShadow: `0 ${size * 0.12}px ${size * 0.4}px ${color.replace(/[\d.]+\)$/, "0.2)")}, inset 0 -${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.08), inset 0 ${size * 0.1}px ${size * 0.15}px rgba(255,255,255,0.5)`,
    top, left, right, bottom, zIndex: -1, pointerEvents: "none",
    animation: `${anim} ${dur}s ease-in-out ${delay}s infinite`,
  }} />
)

/* ─── FRAMER MOTION ─── */
const MotionBox = motion.create(Box)
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const itemV = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }
const scaleV = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } } }

/* ─── Constantes de negocio ─── */
const TIPOS_DOC = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PAS", label: "Pasaporte" },
  { value: "TI", label: "Tarjeta de Identidad" },
]

const emptyForm = {
  tipoDocumento: "CC", documento: "", nombre: "", apellido: "",
  telefono: "", email: "", direccion: "", ciudad: "Bogotá", notas: "", estado: true,
}

const getInitials = (n, a) => `${(n?.[0] || "").toUpperCase()}${(a?.[0] || "").toUpperCase()}` || "?"

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE
   ═══════════════════════════════════════════════════════════════ */
const ClienteList = () => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 8

  const [openForm, setOpenForm] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [current, setCurrent] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await clientesService.getClientes()
      setClientes(data)
    } catch {
      swalFire({ icon: "error", title: "Error", text: "No se pudieron cargar los clientes" })
    } finally { setLoading(false) }
  }

  const filtered = clientes.filter((c) => {
    const q = search.trim().toLowerCase()
    const matchQ = !q ||
      c.nombre?.toLowerCase().includes(q) ||
      c.apellido?.toLowerCase().includes(q) ||
      c.documento?.includes(q) ||
      c.telefono?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    const matchE = filterEstado === "" || String(c.estado) === filterEstado
    return matchQ && matchE
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage)

  const totalActivos = clientes.filter((c) => c.estado).length
  const totalInactivos = clientes.filter((c) => !c.estado).length

  const openNew = () => { setEditing(false); setCurrent(null); setForm(emptyForm); setOpenForm(true) }
  const openEdit = (c) => { setEditing(true); setCurrent(c); setForm({ ...emptyForm, ...c }); setOpenForm(true) }
  const openView = (c) => { setCurrent(c); setOpenDetail(true) }

  const validate = () => {
    if (!form.documento?.trim()) return "El documento es obligatorio"
    if (!form.nombre?.trim()) return "El nombre es obligatorio"
    if (!form.telefono?.trim()) return "El teléfono es obligatorio"
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Email inválido"
    return null
  }

  const save = async () => {
    const err = validate()
    if (err) return swalFire({ icon: "warning", title: "Datos inválidos", text: err })
    try {
      if (editing) await clientesService.updateCliente(current._id, form)
      else await clientesService.createCliente(form)
      setOpenForm(false)
      await load()
      swalFire({
        icon: "success", title: editing ? "Cliente actualizado" : "Cliente creado",
        timer: 1800, timerProgressBar: true, showConfirmButton: false,
      })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo guardar" })
    }
  }

  const toggleEstado = async (c) => {
    try {
      await clientesService.cambiarEstadoCliente(c._id)
      await load()
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo cambiar el estado" })
    }
  }

  const remove = async (c) => {
    const res = await swalFire({
      icon: "question", title: "¿Eliminar cliente?",
      text: `Se eliminará ${c.nombre}. Esta acción no se puede deshacer.`,
      showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    })
    if (!res.isConfirmed) return
    try {
      await clientesService.deleteCliente(c._id)
      await load()
      swalFire({ icon: "success", title: "Eliminado", timer: 1500, showConfirmButton: false, timerProgressBar: true })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo eliminar" })
    }
  }

  /* ─── Dialog Header (igual a Usuarios) ─── */
  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box sx={{
      background: T.go, p: "22px 28px", display: "flex", alignItems: "center", gap: "16px",
      position: "relative", overflow: "hidden",
    }}>
      <Box sx={{ position: "absolute", top: -15, right: 25, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.07)", animation: "sa-float1 8s ease-in-out infinite" }} />
      <Box sx={{ position: "absolute", bottom: -10, right: 90, width: 35, height: 35, borderRadius: "50%", background: "rgba(255,255,255,0.05)", animation: "sa-float2 6s ease-in-out 1s infinite" }} />
      <Box sx={{ position: "absolute", top: 8, left: "40%", width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.04)", animation: "sa-float3 7s ease-in-out 0.5s infinite" }} />
      <Box sx={{
        width: 44, height: 44, borderRadius: "14px", background: "rgba(255,255,255,.18)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        backdropFilter: "blur(12px)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.1)",
      }}>{icon}</Box>
      <Box sx={{ flex: 1, zIndex: 1 }}>
        <Typography sx={{ fontFamily: `${T.fontH} !important`, fontWeight: "800 !important", fontSize: "1.12rem !important", color: "#fff !important", lineHeight: 1.2 }}>{title}</Typography>
        <Typography sx={{ fontSize: ".76rem", color: "rgba(255,255,255,.65)", mt: "4px", fontFamily: T.font }}>{sub}</Typography>
      </Box>
      <button style={{
        width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.15)",
        backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.12)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", flexShrink: 0, transition: "all .25s",
      }} onClick={onClose}><X size={14} strokeWidth={2.5} /></button>
    </Box>
  )

  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative", minHeight: "calc(100vh - 100px)" }}>

      {/* ═══ BACKGROUND ═══ */}
      <Box sx={{ position: "fixed", inset: 0, zIndex: -3, pointerEvents: "none", background: "#F5F7FA" }} />
      <Box sx={{
        position: "fixed", inset: 0, zIndex: -2, pointerEvents: "none", opacity: 0.025,
        backgroundImage: "radial-gradient(circle, #FF6B35 1px, transparent 1px)", backgroundSize: "32px 32px",
      }} />

      {/* ═══ FLOATING ORBS ═══ */}
      <GlassOrb size={75} top="3%" left="6%" color="rgba(255,107,53,0.18)" delay={0} dur={14} anim="sa-float1" />
      <GlassOrb size={45} top="12%" right="10%" color="rgba(255,143,94,0.15)" delay={2} dur={11} anim="sa-float2" />
      <GlassOrb size={28} top="25%" right="25%" color="rgba(255,107,53,0.12)" delay={0.5} dur={9} anim="sa-float3" />
      <GlassOrb size={55} bottom="18%" left="4%" color="rgba(255,80,20,0.14)" delay={3} dur={13} anim="sa-float2" />
      <GlassOrb size={20} top="8%" left="45%" color="rgba(255,160,100,0.12)" delay={1.5} dur={8} anim="sa-float3" />
      <GlassOrb size={35} bottom="30%" right="6%" color="rgba(255,107,53,0.10)" delay={4} dur={12} anim="sa-float1" />

      {/* ═══ HERO HEADER ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        ...glassCard, borderRadius: T.rad3, p: "30px 34px", mb: "22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.06), transparent 70%)", pointerEvents: "none" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1 }}>
          <Box sx={{ animation: "sa-breathe 4s ease-in-out infinite", position: "relative" }}>
            <ClientIcon3D />
            <Box sx={{
              position: "absolute", top: "50%", left: "50%", width: 90, height: 90,
              borderRadius: "50%", pointerEvents: "none", zIndex: -1,
              background: "radial-gradient(circle, rgba(255,107,53,0.12), transparent 70%)",
              animation: "sa-glow-pulse 3s ease-in-out infinite", transform: "translate(-50%,-50%)",
            }} />
          </Box>
          <Box>
            <Typography sx={{
              fontFamily: `${T.fontH} !important`, fontSize: "1.50rem !important",
              fontWeight: "800 !important", lineHeight: 1.2,
              background: T.go, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Gestión de Clientes
            </Typography>
            <Typography sx={{ fontSize: ".88rem", color: T.t3, mt: "6px", fontFamily: T.font }}>
              Administra la base de datos de clientes
            </Typography>
          </Box>
        </Box>
      </MotionBox>

      {/* ═══ STATS ═══ */}
      <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", mb: "22px" }}>
        {[
          { label: "TOTAL", value: clientes.length, desc: "registrados", color: T.o1, icon: <Users size={18} /> },
          { label: "ACTIVOS", value: totalActivos, desc: "habilitados", color: T.green, icon: <CheckCircle size={18} /> },
          { label: "INACTIVOS", value: totalInactivos, desc: "desactivados", color: T.r1, icon: <XCircle size={18} /> },
        ].map((stat, i) => (
          <MotionBox key={i} variants={itemV}
            whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 20 } }}
            sx={{
              ...glassCard, borderRadius: "22px", p: "22px 24px",
              position: "relative", overflow: "hidden", cursor: "default",
              "&::before": {
                content: '""', position: "absolute", top: 0, left: 0, right: 0, height: "3.5px",
                background: `linear-gradient(90deg, ${stat.color}66, ${stat.color})`,
                borderRadius: "22px 22px 0 0",
              },
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px" }}>
              <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: stat.color }}>
                {stat.label}
              </Typography>
              <Box sx={{
                width: 40, height: 40, borderRadius: "13px", display: "flex", alignItems: "center", justifyContent: "center",
                color: stat.color, background: `${stat.color}12`,
                boxShadow: `0 4px 14px ${stat.color}18, inset 0 1px 2px rgba(255,255,255,0.6)`,
              }}>{stat.icon}</Box>
            </Box>
            <Typography sx={{ fontFamily: T.font, fontSize: "1.85rem", fontWeight: 800, lineHeight: 1, color: T.t1, mb: "5px" }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", fontWeight: 500, color: T.t3 }}>{stat.desc}</Typography>
          </MotionBox>
        ))}
      </MotionBox>

      {/* ═══ TOOLBAR ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between", mb: "22px", gap: "14px", flexWrap: "wrap",
      }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          ...glassCard, borderRadius: "18px", p: "12px 18px", minWidth: 260, flex: 1,
          transition: "all .3s cubic-bezier(.25,.46,.45,.94)",
          "&:focus-within": { borderColor: "rgba(255,107,53,0.25)", boxShadow: `${T.neu}, 0 0 0 4px rgba(255,107,53,.06)` },
        }}>
          <Search size={17} color={T.t3} strokeWidth={2} />
          <input style={{
            border: "none", outline: "none", background: "transparent",
            fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%",
          }} placeholder="Buscar por nombre, documento, teléfono..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </Box>
        <TextField select size="small" value={filterEstado}
          onChange={(e) => { setFilterEstado(e.target.value); setPage(1) }}
          sx={{ ...fieldSx, minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="true">Activos</MenuItem>
          <MenuItem value="false">Inactivos</MenuItem>
        </TextField>
        <motion.button
          whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={openNew}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
            color: "#fff", fontFamily: T.font, fontWeight: 700,
            fontSize: ".85rem", padding: "13px 28px", borderRadius: 16,
            border: "none", cursor: "pointer",
            boxShadow: "0 8px 28px rgba(255,107,53,.30)",
            position: "relative", overflow: "hidden",
          }}>
          <Plus size={16} strokeWidth={2.5} /> Nuevo Cliente
          <span style={{
            position: "absolute", inset: 0, borderRadius: 16,
            border: "2px solid rgba(255,255,255,0.3)",
            animation: "sa-pulse-ring 2s ease-out infinite", pointerEvents: "none",
          }} />
        </motion.button>
      </MotionBox>

      {/* ═══ TABLE ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{ ...glassCard, borderRadius: T.rad3, p: "8px", mb: "22px" }}>
        {pageItems.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1.2fr 1.6fr 1fr 1fr 160px", px: "26px", py: "16px" }}>
            {["CLIENTE", "DOCUMENTO", "TELÉFONO", "EMAIL", "CIUDAD", "ESTADO", "ACCIONES"].map((h) => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.4px", textTransform: "uppercase", color: T.t4,
                ...(["ESTADO", "ACCIONES"].includes(h) ? { textAlign: "center" } : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        <AnimatePresence mode="wait">
          <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "flex", flexDirection: "column", gap: "8px", p: pageItems.length > 0 ? "0 8px 8px" : "0" }}>
            {loading && (
              <Box sx={{ textAlign: "center", p: 5, color: T.t3, fontFamily: T.font }}>Cargando clientes...</Box>
            )}

            {!loading && pageItems.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6, fontFamily: T.font }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 88, height: 88, borderRadius: "50%", background: "rgba(255,107,53,0.08)", mb: 2 }}>
                  <UserCheck size={42} color={T.o1} />
                </Box>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, fontSize: "1.1rem" }}>No hay clientes</Typography>
                <Typography sx={{ color: T.t3, fontSize: ".88rem", mt: .5 }}>Empieza creando tu primer cliente</Typography>
              </Box>
            )}

            {!loading && pageItems.map((c, i) => (
              <MotionBox key={c._id} variants={itemV}
                whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                sx={{
                  display: "grid", gridTemplateColumns: "2fr 1.4fr 1.2fr 1.6fr 1fr 1fr 160px",
                  alignItems: "center", p: "18px 22px", borderRadius: "18px",
                  background: "rgba(255,255,255,0.68)", backdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)",
                  cursor: "default", transition: "background .3s, border-color .3s",
                  "&:hover": { borderColor: "rgba(255,107,53,0.12)", background: "rgba(255,255,255,0.82)" },
                }}>

                {/* Avatar + Nombre */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, background: avGrad(i),
                    fontFamily: T.font, fontWeight: 800, fontSize: ".82rem", color: "#fff",
                    boxShadow: "0 6px 18px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.25)",
                    position: "relative",
                    "&::after": {
                      content: '""', position: "absolute", top: 2, left: "15%", width: "50%", height: "30%",
                      borderRadius: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                    },
                  }}>{getInitials(c.nombre, c.apellido)}</Box>
                  <Box>
                    <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".90rem", color: T.t1, lineHeight: 1.3 }}>
                      {c.nombre} {c.apellido}
                    </Typography>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4 }}>
                      #{c._id?.slice(-6).toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                {/* Documento */}
                <Box>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".64rem", color: T.t3, textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 700 }}>
                    {c.tipoDocumento}
                  </Typography>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".85rem", color: T.t1, fontWeight: 700 }}>
                    {c.documento}
                  </Typography>
                </Box>

                {/* Teléfono */}
                <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>{c.telefono || "—"}</Typography>

                {/* Email */}
                <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.email || "—"}
                </Typography>

                {/* Ciudad */}
                <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>{c.ciudad || "—"}</Typography>

                {/* Estado */}
                <Box sx={{ textAlign: "center" }}>
                  <Box component="span" sx={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    padding: "6px 16px", borderRadius: "24px",
                    fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                    backdropFilter: "blur(8px)", transition: "all .25s",
                    ...(c.estado
                      ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "0 2px 8px rgba(34,197,94,0.06)" }
                      : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "0 2px 8px rgba(239,68,68,0.06)" }),
                  }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: c.estado ? "#22C55E" : "#EF4444",
                      boxShadow: c.estado ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)",
                    }} />
                    {c.estado ? "Activo" : "Inactivo"}
                  </Box>
                </Box>

                {/* Acciones */}
                <Box sx={{ display: "flex", gap: .8, justifyContent: "center" }}>
                  <Tooltip title="Ver"><Button sx={btnView} onClick={() => openView(c)}><Eye size={16} /></Button></Tooltip>
                  <Tooltip title="Editar"><Button sx={btnEdit} onClick={() => openEdit(c)}><Edit2 size={16} /></Button></Tooltip>
                  <Tooltip title={c.estado ? "Desactivar" : "Activar"}>
                    <Button sx={btnTog} onClick={() => toggleEstado(c)}>
                      {c.estado ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Eliminar"><Button sx={btnDel} onClick={() => remove(c)}><Trash2 size={16} /></Button></Tooltip>
                </Box>
              </MotionBox>
            ))}
          </MotionBox>
        </AnimatePresence>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, p: 2 }}>
            <Button sx={pageBtn} disabled={pageSafe === 1} onClick={() => setPage(pageSafe - 1)}><ArrowLeft size={14} /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button key={n} sx={n === pageSafe ? pageBtnOn : pageBtn} onClick={() => setPage(n)}>{n}</Button>
            ))}
            <Button sx={pageBtn} disabled={pageSafe === totalPages} onClick={() => setPage(pageSafe + 1)}><ArrowRight size={14} /></Button>
          </Box>
        )}
      </MotionBox>

      {/* ═══ FORM DIALOG ═══ */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: T.rad, fontFamily: T.font, overflow: "hidden" } }}>
        <DlgHdr
          icon={<UserCheck size={20} color="#fff" />}
          title={editing ? "Editar Cliente" : "Nuevo Cliente"}
          sub={editing ? "Actualiza los datos del cliente" : "Registra un nuevo cliente en el sistema"}
          onClose={() => setOpenForm(false)}
        />
        <DialogContent sx={{ p: 3, background: T.bg }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "140px 1fr" }, gap: 2, mb: 2 }}>
            <TextField select label="Tipo doc." size="small" sx={fieldSx}
              value={form.tipoDocumento}
              onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })}>
              {TIPOS_DOC.map((t) => <MenuItem key={t.value} value={t.value}>{t.value}</MenuItem>)}
            </TextField>
            <TextField label="Documento *" size="small" sx={fieldSx}
              value={form.documento}
              onChange={(e) => setForm({ ...form, documento: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={15} /></InputAdornment> }} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField label="Nombre *" size="small" sx={fieldSx}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><User size={15} /></InputAdornment> }} />
            <TextField label="Apellido" size="small" sx={fieldSx}
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField label="Teléfono *" size="small" sx={fieldSx}
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={15} /></InputAdornment> }} />
            <TextField label="Email" size="small" sx={fieldSx}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={15} /></InputAdornment> }} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField label="Dirección" size="small" sx={fieldSx}
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={15} /></InputAdornment> }} />
            <TextField label="Ciudad" size="small" sx={fieldSx}
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
          </Box>
          <TextField label="Notas" size="small" fullWidth multiline rows={2} sx={fieldSx}
            value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: "18px 24px", background: T.bg, borderTop: "1px solid rgba(0,0,0,0.04)", gap: "10px" }}>
          <Button onClick={() => setOpenForm(false)} sx={cancelBtnSx}>Cancelar</Button>
          <Button onClick={save} sx={submitBtnSx}>{editing ? "Actualizar" : "Crear Cliente"}</Button>
        </DialogActions>
      </Dialog>

      {/* ═══ DETAIL DIALOG ═══ */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: T.rad, fontFamily: T.font, overflow: "hidden" } }}>
        {current && (
          <>
            <DlgHdr
              icon={<Eye size={20} color="#fff" />}
              title={`${current.nombre} ${current.apellido || ""}`.trim()}
              sub={`${current.tipoDocumento} ${current.documento}`}
              onClose={() => setOpenDetail(false)}
            />
            <DialogContent sx={{ p: 3, background: T.bg }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <Box sx={{ ...glassCard, borderRadius: T.rad2, p: 2 }}>
                  <Typography sx={{ fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Teléfono</Typography>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.t1 }}>{current.telefono || "—"}</Typography>
                </Box>
                <Box sx={{ ...glassCard, borderRadius: T.rad2, p: 2 }}>
                  <Typography sx={{ fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Email</Typography>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.t1, overflow: "hidden", textOverflow: "ellipsis" }}>{current.email || "—"}</Typography>
                </Box>
                <Box sx={{ ...glassCard, borderRadius: T.rad2, p: 2 }}>
                  <Typography sx={{ fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Dirección</Typography>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.t1 }}>{current.direccion || "—"}</Typography>
                </Box>
                <Box sx={{ ...glassCard, borderRadius: T.rad2, p: 2 }}>
                  <Typography sx={{ fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Ciudad</Typography>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.t1 }}>{current.ciudad || "—"}</Typography>
                </Box>
              </Box>
              {current.notas && (
                <Box sx={{ mt: 2, p: 2, ...glassCard, borderRadius: T.rad2 }}>
                  <Typography sx={{ fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Notas</Typography>
                  <Typography sx={{ fontFamily: T.font, color: T.t2 }}>{current.notas}</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: "18px 24px", background: T.bg, borderTop: "1px solid rgba(0,0,0,0.04)" }}>
              <Button onClick={() => setOpenDetail(false)} sx={cancelBtnSx}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default ClienteList
export { ClienteList as ClientesList }
