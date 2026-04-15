import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment, Divider, Tooltip, Switch, FormControlLabel,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, Users, User,
  XCircle, ArrowLeft, ArrowRight, Plus, Mail, Phone, FileText,
  Lock, Key, Shield, AlertTriangle, UserMinus,
  Check as CheckIcon,
} from "lucide-react"
import Swal from "sweetalert2"
import api from "../../services/api.js"

/* ═══════════════════════════════════════════════════════════════
   ADMIN PROTEGIDO
   ═══════════════════════════════════════════════════════════════ */
const ADMIN_DOC  = "1152458310"
const ADMIN_NAME = "David Andres Goez Cano"
const isAdminUser = u => u?.documento === ADMIN_DOC && u?.nombre === ADMIN_NAME

/* ═══════════════════════════════════════════════════════════════
   VALIDACIONES
   ═══════════════════════════════════════════════════════════════ */
const REGEX = {
  nombre:    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  documento: /^[0-9]+$/,
  email:     /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono:  /^[0-9]+$/,
  password:  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
}
const V = {
  nombre:    { min: 3, max: 50, msg: "Solo letras y espacios" },
  documento: { min: 6, max: 15, msg: "Solo números" },
  email:     { msg: "Email inválido" },
  telefono:  { min: 7, max: 15, msg: "Solo números" },
  password:  { min: 8, msg: "Mín 8 caracteres, 1 mayúscula, 1 minúscula, 1 número" },
}

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Warm Glassmorphism 3D
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
const avGrad = i => AVATAR_COLORS[i % AVATAR_COLORS.length]

/* ═══════════════════════════════════════════════════════════════
   ANIMATION KEYFRAMES
   ═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   SWAL STYLE INJECTION
   ═══════════════════════════════════════════════════════════════ */
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

const SW = { customClass:{ popup:"sa-dash-pop", title:"sa-dash-ttl", htmlContainer:"sa-dash-bod", confirmButton:"sa-dash-ok", cancelButton:"sa-dash-cn" }, buttonsStyling:false }
const swalFire = opts => Swal.fire({ ...opts, ...SW, allowOutsideClick: opts.showCancelButton ? true : false })

/* ═══════════════════════════════════════════════════════════════
   REUSABLE STYLES
   ═══════════════════════════════════════════════════════════════ */
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
const btnRemoveRol = {
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
  "&:disabled": { background: "rgba(255,107,53,.12) !important", boxShadow: "none !important", transform: "none !important", color: "rgba(255,107,53,.35) !important" },
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
const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: T.o1 },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: T.o2, opacity: 1 },
  "& .MuiSwitch-track": { backgroundColor: "rgba(0,0,0,.10)", opacity: 1 },
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem",
    background: "#fff", backdropFilter: "blur(12px)",
  },
}

/* ═══════════════════════════════════════════════════════════════
   3D DECORATIVE ELEMENTS
   ═══════════════════════════════════════════════════════════════ */
const UserIcon3D = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(255,107,53,0.35))" }}>
    <defs>
      <linearGradient id="us3d" x1="8" y1="4" x2="56" y2="60">
        <stop offset="0%" stopColor="#FFB088" />
        <stop offset="40%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#E83D00" />
      </linearGradient>
      <linearGradient id="us3dSpec" x1="20%" y1="0%" x2="70%" y2="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <circle cx="32" cy="32" r="28" fill="url(#us3d)" />
    <circle cx="32" cy="32" r="22" fill="url(#us3dSpec)" />
    <circle cx="32" cy="26" r="8" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.95" />
    <path d="M18 46c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.95" />
  </svg>
)

const GlassOrb = ({ size, top, left, right, bottom, color = "rgba(255,140,80,0.5)", delay = 0, dur = 10, anim = "sa-float1" }) => (
  <Box sx={{
    position: "fixed", width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5) 0%, ${color} 45%, rgba(200,60,0,0.15) 100%)`,
    boxShadow: `0 ${size * 0.12}px ${size * 0.4}px ${color.replace(/[\d.]+\)$/, "0.2)")}, inset 0 -${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.08), inset 0 ${size * 0.1}px ${size * 0.15}px rgba(255,255,255,0.5)`,
    top, left, right, bottom, zIndex: -1, pointerEvents: "none",
    animation: `${anim} ${dur}s ease-in-out ${delay}s infinite`,
    "&::before": {
      content: '""', position: "absolute", top: "10%", left: "20%", width: "30%", height: "22%",
      borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)",
      transform: "rotate(-20deg)",
    },
  }} />
)

const PieChart3D = ({ total, active, inactive }) => {
  const t = total || 1
  const activeDeg = (active / t) * 360
  const inactiveDeg = (inactive / t) * 360
  return (
    <Box sx={{ position: "relative", width: 170, height: 145, flexShrink: 0 }}>
      <Box sx={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 110, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)" }} />
      <Box sx={{
        position: "absolute", top: 28, left: "50%",
        transform: "translateX(-50%) perspective(500px) rotateX(55deg) translateY(8px)",
        width: 120, height: 120, borderRadius: "50%",
        background: `conic-gradient(#D85A2A 0deg, #D85A2A ${activeDeg}deg, #16803B ${activeDeg}deg, #16803B ${activeDeg + inactiveDeg}deg, #C9A94E ${activeDeg + inactiveDeg}deg, #C9A94E 360deg)`,
        opacity: 0.35, filter: "blur(1px)",
      }} />
      <Box sx={{
        position: "absolute", top: 16, left: "50%",
        transform: "translateX(-50%) perspective(500px) rotateX(55deg)",
        width: 120, height: 120, borderRadius: "50%",
        background: `conic-gradient(#FF8F5E 0deg, #FF6B35 ${activeDeg}deg, #86EFAC ${activeDeg}deg, #22C55E ${activeDeg + inactiveDeg}deg, #FDE68A ${activeDeg + inactiveDeg}deg, #FEF3C7 360deg)`,
        boxShadow: "0 16px 40px rgba(0,0,0,0.10), inset 0 -4px 12px rgba(0,0,0,0.06), inset 0 4px 8px rgba(255,255,255,0.35)",
        "&::after": {
          content: '""', position: "absolute", top: "25%", left: "25%", width: "50%", height: "50%",
          borderRadius: "50%", background: "rgba(255,255,255,0.85)",
          boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.04), inset -2px -2px 6px rgba(255,255,255,0.8)",
        },
      }} />
      <Box sx={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%) perspective(500px) rotateX(55deg)", width: 120, height: 120, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.25)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: 4, right: 12, width: 14, height: 14, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(255,107,53,0.5))", boxShadow: "0 3px 8px rgba(255,107,53,0.2)", animation: "sa-float1 5s ease-in-out infinite" }} />
      <Box sx={{ position: "absolute", top: 18, left: 8, width: 9, height: 9, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(34,197,94,0.5))", boxShadow: "0 2px 6px rgba(34,197,94,0.2)", animation: "sa-float2 4s ease-in-out 0.5s infinite" }} />
      <Box sx={{ position: "absolute", bottom: 12, right: 5, width: 7, height: 7, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(245,158,11,0.5))", boxShadow: "0 2px 6px rgba(245,158,11,0.2)", animation: "sa-float3 6s ease-in-out 1s infinite" }} />
    </Box>
  )
}

const EmptyIllustration = () => (
  <Box sx={{ position: "relative", width: 240, height: 200, mx: "auto", mb: 3 }}>
    <Box sx={{ position: "absolute", left: 22, top: 28, width: 88, height: 105, borderRadius: "16px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)", transform: "rotate(-10deg)" }}>
      <Box sx={{ p: "12px 10px" }}>
        <Box sx={{ height: 6, borderRadius: 4, background: "rgba(255,107,53,0.12)", mb: "7px", width: "80%" }} />
        <Box sx={{ height: 5, borderRadius: 3, background: "rgba(0,0,0,0.04)", mb: "5px", width: "65%" }} />
        <Box sx={{ height: 5, borderRadius: 3, background: "rgba(0,0,0,0.03)", width: "50%" }} />
      </Box>
    </Box>
    <Box sx={{ position: "absolute", right: 22, top: 20, width: 82, height: 100, borderRadius: "14px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)", transform: "rotate(8deg)" }}>
      <Box sx={{ p: "10px 8px" }}>
        <Box sx={{ height: 5, borderRadius: 3, background: "rgba(255,107,53,0.10)", mb: "6px", width: "75%" }} />
        <Box sx={{ height: 4, borderRadius: 3, background: "rgba(0,0,0,0.03)", mb: "4px", width: "55%" }} />
      </Box>
    </Box>
    <Box sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-55%)", zIndex: 2, animation: "sa-breathe 4s ease-in-out infinite" }}>
      <svg width="90" height="100" viewBox="0 0 100 110" fill="none">
        <defs>
          <linearGradient id="emUsG" x1="10" y1="5" x2="90" y2="100"><stop stopColor="#FFB088" /><stop offset="0.4" stopColor="#FF6B35" /><stop offset="1" stopColor="#E84D0E" /></linearGradient>
          <filter id="emUsS"><feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#FF6B35" floodOpacity="0.30" /></filter>
        </defs>
        <circle cx="50" cy="42" r="38" fill="url(#emUsG)" filter="url(#emUsS)" />
        <circle cx="50" cy="36" r="12" stroke="white" strokeWidth="3.5" fill="none" />
        <path d="M28 65c0-12 10-22 22-22s22 10 22 22" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>
    </Box>
    <Box sx={{ position: "absolute", right: 30, bottom: 30, zIndex: 3, width: 32, height: 32, borderRadius: "50%", background: T.go, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: T.glow, animation: "sa-breathe 3s ease-in-out 0.3s infinite" }}>
      <Plus size={15} color="#fff" strokeWidth={3} />
    </Box>
    <GlassOrb size={12} top={6} right={32} color="rgba(255,107,53,0.4)" delay={0} dur={5} anim="sa-float1" />
    <GlassOrb size={8} top={18} left={3} color="rgba(34,197,94,0.4)" delay={0.8} dur={4} anim="sa-float2" />
  </Box>
)

/* ═══════════════════════════════════════════════════════════════
   FRAMER MOTION VARIANTS
   ═══════════════════════════════════════════════════════════════ */
const MotionBox = motion.create(Box)
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const itemV = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }
const scaleV = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } } }

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const emptyForm = { nombre: "", documento: "", email: "", telefono: "", password: "", confirmarPassword: "", rol: "", estado: true }
  const [formData, setFormData] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  /* ─── Fetch data ─── */
  const fetchUsuarios = async () => {
    try {
      const r = await api.get("/api/usuarios")
      setUsuarios(Array.isArray(r.data) ? r.data : [])
    } catch { setUsuarios([]) }
  }
  const fetchRoles = async () => {
    try {
      const r = await api.get("/api/roles")
      const data = Array.isArray(r.data) ? r.data : []
      setRoles(data.filter(r => r.estado))
    } catch { setRoles([]) }
  }
  useEffect(() => { fetchUsuarios(); fetchRoles() }, [])

  /* ─── Validation helpers ─── */
  const validateField = (name, value) => {
    let err = ""
    if (name === "nombre") {
      if (!value?.trim()) err = "El nombre es obligatorio"
      else if (value.length < V.nombre.min) err = `Mínimo ${V.nombre.min} caracteres`
      else if (value.length > V.nombre.max) err = `Máximo ${V.nombre.max} caracteres`
      else if (!REGEX.nombre.test(value)) err = V.nombre.msg
    } else if (name === "documento") {
      if (!value?.trim()) err = "El documento es obligatorio"
      else if (!REGEX.documento.test(value)) err = V.documento.msg
      else if (value.length < V.documento.min) err = `Mínimo ${V.documento.min} dígitos`
      else if (value.length > V.documento.max) err = `Máximo ${V.documento.max} dígitos`
    } else if (name === "email") {
      if (!value?.trim()) err = "El email es obligatorio"
      else if (!REGEX.email.test(value)) err = V.email.msg
    } else if (name === "telefono") {
      if (value && !REGEX.telefono.test(value)) err = V.telefono.msg
      else if (value && value.length < V.telefono.min) err = `Mínimo ${V.telefono.min} dígitos`
      else if (value && value.length > V.telefono.max) err = `Máximo ${V.telefono.max} dígitos`
    } else if (name === "password") {
      if (!editingId && !value) err = "La contraseña es obligatoria"
      else if (value && !REGEX.password.test(value)) err = V.password.msg
    } else if (name === "confirmarPassword") {
      if (!editingId && !value) err = "Confirma la contraseña"
      else if (value && value !== formData.password) err = "Las contraseñas no coinciden"
    } else if (name === "rol") {
      if (!editingId && !value) err = "El rol es obligatorio"
    }
    setFormErrors(prev => ({ ...prev, [name]: err }))
    return !err
  }

  const validateForm = (data) => {
    const d = data || formData
    const requiredFields = ["nombre", "documento", "email"]
    if (!editingId) requiredFields.push("password", "confirmarPassword", "rol")
    const valid = requiredFields.every(f => {
      const v = d[f]
      if (!v || !String(v).trim()) return false
      if (f === "nombre" && (!REGEX.nombre.test(v) || v.length < V.nombre.min)) return false
      if (f === "documento" && (!REGEX.documento.test(v) || v.length < V.documento.min)) return false
      if (f === "email" && !REGEX.email.test(v)) return false
      if (f === "password" && !REGEX.password.test(v)) return false
      if (f === "confirmarPassword" && v !== d.password) return false
      return true
    })
    setIsFormValid(valid)
  }

  /* ─── Handlers ─── */
  const handleOpen = (user) => {
    setFormErrors({})
    if (user) {
      setFormData({
        nombre: user.nombre, documento: user.documento || "", email: user.email,
        telefono: user.telefono || "", password: "", confirmarPassword: "",
        rol: user.rol || "", estado: user.estado,
      })
      setEditingId(user._id)
      setIsFormValid(true)
    } else {
      setFormData(emptyForm)
      setEditingId(null)
      setIsFormValid(false)
    }
    setOpen(true)
    setShowPassword(false)
  }
  const handleClose = () => {
    setOpen(false); setEditingId(null); setFormData(emptyForm); setFormErrors({}); setIsFormValid(false)
  }
  const handleDetails = user => { setSelectedUser(user); setDetailsOpen(true) }
  const handleCloseDetails = () => setDetailsOpen(false)

  const handleChange = e => {
    const { name, value, checked } = e.target
    const v = name === "estado" ? checked : value
    const next = { ...formData, [name]: v }
    setFormData(next)
    validateField(name, v)
    setTimeout(() => validateForm(next), 0)
  }

  const handleSubmit = async () => {
    const fields = ["nombre", "documento", "email", "rol"]
    if (!editingId) fields.push("password", "confirmarPassword")
    let hasError = false
    fields.forEach(f => { if (!validateField(f, formData[f])) hasError = true })
    if (hasError) return

    // Check duplicates
    const dup = usuarios.find(u =>
      u.email.toLowerCase() === formData.email.toLowerCase() && u._id !== editingId
    )
    if (dup) {
      setFormErrors(prev => ({ ...prev, email: "Ya existe un usuario con este email" }))
      await swalFire({ icon: "error", title: "Email duplicado", text: "Ya existe un usuario con ese email." })
      return
    }

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        documento: formData.documento.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
        rol: formData.rol,
        estado: formData.estado,
      }
      if (formData.password) payload.password = formData.password
      const wasEditing = !!editingId

      if (wasEditing) {
        // Admin protection
        const current = usuarios.find(u => u._id === editingId)
        if (current && isAdminUser(current)) {
          if (payload.estado === false) {
            await swalFire({ icon: "error", title: "Acción no permitida", text: "No se puede desactivar al usuario administrador." })
            return
          }
          if (!payload.rol) {
            await swalFire({ icon: "error", title: "Acción no permitida", text: "No se puede quitar el rol al usuario administrador." })
            return
          }
        }
        await api.put(`/api/usuarios/${editingId}`, payload)
      } else {
        await api.post("/api/usuarios", payload)
      }

      handleClose()
      await fetchUsuarios()
      setTimeout(() => {
        swalFire({
          icon: "success",
          title: wasEditing ? "Usuario actualizado" : "Usuario creado",
          text: wasEditing ? "Los cambios se guardaron correctamente." : "El nuevo usuario se registró correctamente.",
          timer: 2200, timerProgressBar: true, showConfirmButton: false,
        })
      }, 300)
    } catch (e) {
      const msg = e.response?.data?.msg || "Error al guardar el usuario."
      await swalFire({ icon: "error", title: "Error", text: msg })
    }
  }

  const handleDelete = async id => {
    const user = usuarios.find(u => u._id === id)
    if (!user) return

    if (isAdminUser(user)) {
      await swalFire({ icon: "error", title: "Acción no permitida", text: "El usuario administrador no puede ser eliminado." })
      return
    }
    if (user.rol && user.rol !== "") {
      await swalFire({ icon: "warning", title: "Tiene rol asignado", text: "Debes quitar el rol del usuario antes de eliminarlo." })
      return
    }
    if (user.estado) {
      await swalFire({ icon: "warning", title: "Usuario activo", text: "No puedes eliminar un usuario activo. Desactívalo primero." })
      return
    }
    const r = await swalFire({ title: "¿Eliminar usuario?", text: "Esta acción no se puede deshacer", icon: "question", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" })
    if (r.isConfirmed) {
      try {
        await api.delete(`/api/usuarios/${id}`)
        await fetchUsuarios()
        setTimeout(() => swalFire({ icon: "success", title: "Eliminado", text: "El usuario se eliminó correctamente.", timer: 2000, timerProgressBar: true, showConfirmButton: false }), 300)
      } catch (e) {
        await swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "Error al eliminar." })
      }
    }
  }

  const handleRemoveRol = async (user) => {
    if (isAdminUser(user)) {
      await swalFire({ icon: "error", title: "Acción no permitida", text: "No se puede quitar el rol al usuario administrador." })
      return
    }
    const r = await swalFire({ title: "¿Quitar rol?", text: `Se le quitará el rol "${user.rol}" a ${user.nombre}`, icon: "question", showCancelButton: true, confirmButtonText: "Sí, quitar", cancelButtonText: "Cancelar" })
    if (r.isConfirmed) {
      try {
        await api.put(`/api/usuarios/${user._id}/remove-rol`)
        await fetchUsuarios()
        setTimeout(() => swalFire({ icon: "success", title: "Rol eliminado", text: "Se quitó el rol correctamente.", timer: 2000, timerProgressBar: true, showConfirmButton: false }), 300)
      } catch (e) {
        await swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "Error al quitar el rol." })
      }
    }
  }

  /* ─── Helpers ─── */
  const getInitials = name => name?.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2) || "?"
  const totalActive = usuarios.filter(u => u.estado).length
  const totalInactive = usuarios.filter(u => !u.estado).length
  const withRol = usuarios.filter(u => u.rol && u.rol !== "").length
  const filtered = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.documento?.includes(searchTerm)
  )
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const pctRegistered = usuarios.length > 0 ? 100 : 0
  const pctActive = usuarios.length > 0 ? Math.round((totalActive / usuarios.length) * 100) : 0

  /* ─── Dialog Header ─── */
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

  /* ══════════════════════════════════════════════════════════════
     RENDER — Warm Glassmorphism 3D
     ══════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative", minHeight: "calc(100vh - 100px)" }}>

      {/* ═══ ANIMATED BACKGROUND ═══ */}
      <Box sx={{
        position: "fixed", inset: 0, zIndex: -3, pointerEvents: "none",
        background: "#F5F7FA",
      }} />
      <Box sx={{
        position: "fixed", inset: 0, zIndex: -2, pointerEvents: "none", opacity: 0.025,
        backgroundImage: "radial-gradient(circle, #FF6B35 1px, transparent 1px)", backgroundSize: "32px 32px",
      }} />

      {/* ═══ FLOATING 3D GLASS ORBS ═══ */}
      <GlassOrb size={75} top="3%" left="6%" color="rgba(255,107,53,0.18)" delay={0} dur={14} anim="sa-float1" />
      <GlassOrb size={45} top="12%" right="10%" color="rgba(255,143,94,0.15)" delay={2} dur={11} anim="sa-float2" />
      <GlassOrb size={28} top="25%" right="25%" color="rgba(255,107,53,0.12)" delay={0.5} dur={9} anim="sa-float3" />
      <GlassOrb size={55} bottom="18%" left="4%" color="rgba(255,80,20,0.14)" delay={3} dur={13} anim="sa-float2" />
      <GlassOrb size={20} top="8%" left="45%" color="rgba(255,160,100,0.12)" delay={1.5} dur={8} anim="sa-float3" />
      <GlassOrb size={35} bottom="30%" right="6%" color="rgba(255,107,53,0.10)" delay={4} dur={12} anim="sa-float1" />
      <GlassOrb size={16} top="40%" left="15%" color="rgba(34,197,94,0.12)" delay={2.5} dur={10} anim="sa-float2" />
      <GlassOrb size={22} bottom="10%" right="35%" color="rgba(245,158,11,0.10)" delay={1} dur={9} anim="sa-float3" />

      {/* ═══ HERO HEADER ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        ...glassCard, borderRadius: T.rad3, p: "30px 34px", mb: "22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.06), transparent 70%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -30, left: 120, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.04), transparent 70%)", pointerEvents: "none" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1 }}>
          <Box sx={{ animation: "sa-breathe 4s ease-in-out infinite", position: "relative" }}>
            <UserIcon3D />
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
              Gestión de Usuarios
            </Typography>
            <Typography sx={{ fontSize: ".88rem", color: T.t3, mt: "6px", fontFamily: T.font }}>
              Administra los usuarios y sus roles en el sistema
            </Typography>
          </Box>
        </Box>
        <Box sx={{ zIndex: 1 }}>
          <PieChart3D total={usuarios.length} active={totalActive} inactive={totalInactive} />
        </Box>
      </MotionBox>

      {/* ═══ STATS CARDS ═══ */}
      <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", mb: "22px" }}>
        {[
          { label: "TOTAL", value: usuarios.length, desc: "registrados", color: T.o1, icon: <Users size={18} /> },
          { label: "ACTIVOS", value: totalActive, desc: "habilitados", color: T.green, icon: <CheckCircle size={18} /> },
          { label: "INACTIVOS", value: totalInactive, desc: "desactivados", color: T.r1, icon: <XCircle size={18} /> },
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
              }}>
                {stat.icon}
              </Box>
            </Box>
            <Typography sx={{ fontFamily: T.font, fontSize: "1.85rem", fontWeight: 800, lineHeight: 1, color: T.t1, mb: "5px" }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", fontWeight: 500, color: T.t3 }}>
              {stat.desc}
            </Typography>
          </MotionBox>
        ))}

        <MotionBox variants={itemV}
          whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 20 } }}
          sx={{ ...glassCard, borderRadius: "22px", p: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px", cursor: "default" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.o1, boxShadow: `0 2px 8px ${T.o1}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>Registrados</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>{pctRegistered} %</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.green, boxShadow: `0 2px 8px ${T.green}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>Con Rol</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>{withRol}</Typography>
          </Box>
        </MotionBox>
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
          }} placeholder="Buscar usuario..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0) }} />
        </Box>
        <motion.button
          whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => handleOpen(null)}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
            color: "#fff", fontFamily: T.font, fontWeight: 700,
            fontSize: ".85rem", padding: "13px 28px", borderRadius: 16,
            border: "none", cursor: "pointer",
            boxShadow: "0 8px 28px rgba(255,107,53,.30)",
            position: "relative", overflow: "hidden",
          }}>
          <Plus size={16} strokeWidth={2.5} /> Crear Usuario
          <span style={{
            position: "absolute", inset: 0, borderRadius: 16,
            border: "2px solid rgba(255,255,255,0.3)",
            animation: "sa-pulse-ring 2s ease-out infinite", pointerEvents: "none",
          }} />
        </motion.button>
      </MotionBox>

      {/* ═══ TABLE CONTAINER ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{ ...glassCard, borderRadius: T.rad3, p: "8px", mb: "22px" }}>
        {paginated.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2fr 1fr 1fr 1fr 160px", px: "26px", py: "16px" }}>
            {["USUARIO", "DOCUMENTO", "EMAIL", "TELÉFONO", "ROL", "ESTADO", "ACCIONES"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.4px", textTransform: "uppercase", color: T.t4,
                ...(["ESTADO", "ACCIONES"].includes(h) ? { textAlign: "center" } : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        <AnimatePresence mode="wait">
          <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "flex", flexDirection: "column", gap: "8px", p: paginated.length > 0 ? "0 8px 8px" : "0" }}>
            {paginated.map((user, i) => {
              const admin = isAdminUser(user)
              return (
                <MotionBox key={user._id} variants={itemV}
                  whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  sx={{
                    display: "grid", gridTemplateColumns: "2fr 1.2fr 2fr 1fr 1fr 1fr 160px",
                    alignItems: "center", p: "18px 22px", borderRadius: "18px",
                    background: "rgba(255,255,255,0.68)", backdropFilter: "blur(24px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)",
                    cursor: "default", transition: "background .3s, border-color .3s",
                    "&:hover": { borderColor: "rgba(255,107,53,0.12)", background: "rgba(255,255,255,0.82)" },
                  }}>

                  {/* Nombre + Avatar */}
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
                    }}>
                      {getInitials(user.nombre)}
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".90rem", color: T.t1, lineHeight: 1.3 }}>
                        {user.nombre}
                      </Typography>
                      <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4 }}>
                        #{user._id?.slice(-6).toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Documento */}
                  <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>
                    {user.documento || "—"}
                  </Typography>

                  {/* Email */}
                  <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.email}
                  </Typography>

                  {/* Teléfono */}
                  <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>
                    {user.telefono || "—"}
                  </Typography>

                  {/* Rol */}
                  <Box>
                    {user.rol ? (
                      <Box sx={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        background: "rgba(255,107,53,0.06)", borderRadius: "10px", padding: "5px 12px",
                        backdropFilter: "blur(8px)",
                      }}>
                        <Shield size={12} color={T.o1} />
                        <Typography sx={{ fontFamily: T.font, fontSize: ".73rem", fontWeight: 700, color: T.o1 }}>
                          {user.rol}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontFamily: T.font, fontSize: ".73rem", fontWeight: 600, color: T.t4 }}>Sin rol</Typography>
                    )}
                  </Box>

                  {/* Estado */}
                  <Box sx={{ textAlign: "center" }}>
                    <Box component="span" sx={{
                      display: "inline-flex", alignItems: "center", gap: "7px",
                      padding: "6px 16px", borderRadius: "24px",
                      fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                      backdropFilter: "blur(8px)", transition: "all .25s",
                      ...(user.estado
                        ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "0 2px 8px rgba(34,197,94,0.06)" }
                        : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "0 2px 8px rgba(239,68,68,0.06)" }),
                    }}>
                      <Box sx={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: user.estado ? "#22C55E" : "#EF4444",
                        boxShadow: user.estado ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)",
                      }} />
                      {user.estado ? "Activo" : "Inactivo"}
                    </Box>
                  </Box>

                  {/* Acciones */}
                  <Box sx={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                    <Tooltip title="Editar" placement="top">
                      <Button sx={btnEdit} onClick={() => handleOpen(user)}><Edit2 size={15} strokeWidth={2} /></Button>
                    </Tooltip>
                    <Tooltip title="Ver detalles" placement="top">
                      <Button sx={btnView} onClick={() => handleDetails(user)}><Eye size={15} strokeWidth={2} /></Button>
                    </Tooltip>
                    {!admin && user.rol && user.rol !== "" && (
                      <Tooltip title="Quitar rol" placement="top">
                        <Button sx={btnRemoveRol} onClick={() => handleRemoveRol(user)}><UserMinus size={15} strokeWidth={2} /></Button>
                      </Tooltip>
                    )}
                    {!admin && (
                      <Tooltip title={user.estado ? "Desactiva para eliminar" : user.rol ? "Quita el rol primero" : "Eliminar"} placement="top">
                        <Button sx={{ ...btnDel, ...((user.estado || (user.rol && user.rol !== "")) ? { opacity: 0.35, cursor: "not-allowed" } : {}) }}
                          onClick={() => handleDelete(user._id)}>
                          <Trash2 size={15} strokeWidth={2} />
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                </MotionBox>
              )
            })}
          </MotionBox>
        </AnimatePresence>

        {/* Empty state */}
        {paginated.length === 0 && (
          <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
            borderRadius: T.rad, p: "50px 20px 60px", textAlign: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,248,245,0.7) 100%)",
          }}>
            <EmptyIllustration />
            <Typography sx={{ fontFamily: T.fontH, fontSize: "1.20rem", fontWeight: 800, color: T.t1, mb: "10px" }}>
              {usuarios.length === 0 ? "No hay usuarios registrados" : "Sin resultados"}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t3, maxWidth: 380, mx: "auto", mb: "24px", lineHeight: 1.6 }}>
              {usuarios.length === 0
                ? "Crea un nuevo usuario para administrar el sistema"
                : "No se encontraron usuarios que coincidan con la búsqueda."}
            </Typography>
            {usuarios.length === 0 && (
              <motion.button whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleOpen(null)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 9,
                  background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
                  color: "#fff", fontFamily: T.font, fontWeight: 700,
                  fontSize: ".85rem", padding: "13px 28px", borderRadius: 16,
                  border: "none", cursor: "pointer", boxShadow: "0 8px 28px rgba(255,107,53,.30)",
                }}>
                <Plus size={16} strokeWidth={2.5} /> Crear Usuario
              </motion.button>
            )}
          </MotionBox>
        )}
      </MotionBox>

      {/* ═══ PAGINATION ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
      }}>
        <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
          Mostrando {filtered.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length} usuarios
        </Typography>
        <Box sx={{ display: "flex", gap: "6px" }}>
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
              border: "1px solid rgba(255,255,255,0.5)", borderRadius: 12, padding: "5px 12px",
              fontFamily: T.font, fontSize: ".82rem", color: T.t2, background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(12px)", outline: "none", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}>
            {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </MotionBox>

      {/* ═══ MODAL CREAR / EDITAR ═══ */}
      <Dialog key={editingId || '__create__'} open={open} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") handleClose() }}
            fullWidth maxWidth="sm"
            sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(14px)", background: "rgba(15,23,42,.15)" } }}
            slotProps={{ paper: { sx: {
              borderRadius: "24px !important",
              boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
              border: "1px solid rgba(255,255,255,0.20)",
              width: "90%", maxWidth: 580,
              background: "rgba(255,255,255,0.92) !important",
              backdropFilter: "blur(32px) saturate(200%)", overflow: "hidden",
              animation: "sa-border-glow 3s ease-in-out infinite",
            } } }}>

            <DlgHdr
              icon={editingId ? <Edit2 size={18} color="#fff" /> : <User size={18} color="#fff" />}
              title={editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}
              sub={editingId ? "Modifica los datos del usuario seleccionado" : "Completa los campos para registrar un nuevo usuario"}
              onClose={handleClose}
            />

            <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
              {/* ─── Información Personal ─── */}
              <Box sx={{
                display: "flex", alignItems: "center", gap: "10px",
                fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
                color: T.t1, mb: "14px", pb: "10px",
                borderBottom: "1.5px solid rgba(0,0,0,0.05)",
              }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,107,53,.08)", boxShadow: "0 3px 8px rgba(255,107,53,0.08)",
                }}>
                  <User size={13} color={T.o1} />
                </Box>
                Información Personal
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: 2 }}>
                <TextField margin="dense" label="Nombre completo" name="nombre"
                  value={formData.nombre} onChange={handleChange}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  fullWidth variant="outlined" size="small" required
                  autoComplete="off"
                  error={!!formErrors.nombre} helperText={formErrors.nombre}
                  inputProps={{ maxLength: 50 }} sx={fieldSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><User size={14} color={T.t3} /></InputAdornment> } }}
                />
                <TextField margin="dense" label="Documento" name="documento"
                  value={formData.documento} onChange={handleChange}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  fullWidth variant="outlined" size="small" required
                  autoComplete="off"
                  error={!!formErrors.documento} helperText={formErrors.documento}
                  inputProps={{ maxLength: 15 }} sx={fieldSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><FileText size={14} color={T.t3} /></InputAdornment> } }}
                />
              </Box>

              {/* ─── Contacto ─── */}
              <Box sx={{
                display: "flex", alignItems: "center", gap: "10px",
                fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
                color: T.t1, mb: "14px", pb: "10px",
                borderBottom: "1.5px solid rgba(0,0,0,0.05)",
              }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(34,197,94,.08)", boxShadow: "0 2px 8px rgba(34,197,94,0.06)",
                }}>
                  <Mail size={13} color={T.green} />
                </Box>
                Contacto
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: 2 }}>
                <TextField margin="dense" label="Email" name="email"
                  value={formData.email} onChange={handleChange}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  fullWidth variant="outlined" size="small" required
                  autoComplete="off"
                  error={!!formErrors.email} helperText={formErrors.email}
                  sx={fieldSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={14} color={T.t3} /></InputAdornment> } }}
                />
                <TextField margin="dense" label="Teléfono" name="telefono"
                  value={formData.telefono} onChange={handleChange}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  fullWidth variant="outlined" size="small"
                  autoComplete="off"
                  error={!!formErrors.telefono} helperText={formErrors.telefono}
                  inputProps={{ maxLength: 15 }} sx={fieldSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone size={14} color={T.t3} /></InputAdornment> } }}
                />
              </Box>

              {/* ─── Seguridad & Rol ─── */}
              <Box sx={{
                display: "flex", alignItems: "center", gap: "10px",
                fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
                color: T.t1, mb: "14px", pb: "10px",
                borderBottom: "1.5px solid rgba(0,0,0,0.05)",
              }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(99,102,241,.08)", boxShadow: "0 2px 8px rgba(99,102,241,0.06)",
                }}>
                  <Lock size={13} color="#6366F1" />
                </Box>
                Seguridad & Rol
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: 2 }}>
                <TextField margin="dense" label={editingId ? "Nueva contraseña (opcional)" : "Contraseña"} name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password} onChange={handleChange}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  fullWidth variant="outlined" size="small"
                  required={!editingId}
                  autoComplete="new-password"
                  error={!!formErrors.password} helperText={formErrors.password || (editingId ? "Dejar vacío para mantener" : V.password.msg)}
                  sx={fieldSx}
                  slotProps={{ input: {
                    startAdornment: <InputAdornment position="start"><Lock size={14} color={T.t3} /></InputAdornment>,
                    endAdornment: <InputAdornment position="end">
                      <Box sx={{ cursor: "pointer", color: T.t3, display: "flex" }} onClick={() => setShowPassword(!showPassword)}>
                        <Eye size={14} />
                      </Box>
                    </InputAdornment>,
                  } }}
                />
                <TextField margin="dense" label="Confirmar contraseña" name="confirmarPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmarPassword} onChange={handleChange}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  fullWidth variant="outlined" size="small"
                  required={!editingId}
                  autoComplete="new-password"
                  error={!!formErrors.confirmarPassword} helperText={formErrors.confirmarPassword}
                  sx={fieldSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Key size={14} color={T.t3} /></InputAdornment> } }}
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: 1 }}>
                <TextField select margin="dense" label="Rol" name="rol"
                  value={formData.rol} onChange={handleChange}
                  onBlur={e => validateField(e.target.name, e.target.value)}
                  fullWidth variant="outlined" size="small" required={!editingId}
                  autoComplete="off"
                  error={!!formErrors.rol} helperText={formErrors.rol}
                  disabled={editingId && isAdminUser(usuarios.find(u => u._id === editingId))}
                  sx={fieldSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Shield size={14} color={T.t3} /></InputAdornment> } }}
                >
                  <MenuItem value="">
                    <em>{editingId ? "Sin rol" : "Seleccionar rol"}</em>
                  </MenuItem>
                  {roles.map(r => (
                    <MenuItem key={r._id} value={r.nombre}>{r.nombre}</MenuItem>
                  ))}
                </TextField>

                <Box sx={{ display: "flex", alignItems: "center", pt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch checked={formData.estado} onChange={handleChange} name="estado" size="small" sx={switchSx}
                        disabled={editingId && isAdminUser(usuarios.find(u => u._id === editingId))}
                      />
                    }
                    label={
                      <Typography sx={{ fontFamily: T.font, fontSize: ".86rem", fontWeight: 600, color: T.t2 }}>
                        {formData.estado ? "Activo" : "Inactivo"}
                      </Typography>
                    }
                  />
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{
              p: "14px 26px 22px !important", background: "transparent",
              borderTop: "1px solid rgba(0,0,0,0.04)",
              display: "flex", justifyContent: "flex-end", gap: "10px",
            }}>
              <Button onClick={handleClose} sx={cancelBtnSx}>Cancelar</Button>
              <Button onClick={handleSubmit} sx={submitBtnSx} disabled={!isFormValid}>
                <CheckIcon size={14} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                {editingId ? "Actualizar Usuario" : "+ Crear Usuario"}
              </Button>
            </DialogActions>
          </Dialog>

      {/* ═══ MODAL DETALLES ═══ */}
      <Dialog open={detailsOpen} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") handleCloseDetails() }}
            fullWidth maxWidth="sm"
            sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(14px)", background: "rgba(15,23,42,.15)" } }}
            slotProps={{ paper: { sx: {
              borderRadius: "24px !important",
              boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
              border: "1px solid rgba(255,255,255,0.20)",
              width: 600, maxWidth: "96vw",
              background: "rgba(255,255,255,0.92) !important",
              backdropFilter: "blur(32px) saturate(200%)", overflow: "hidden",
              animation: "sa-border-glow 3s ease-in-out infinite",
            } } }}>

            <DlgHdr icon={<Eye size={18} color="#fff" />} title="Detalles del Usuario" sub="Información completa del usuario" onClose={handleCloseDetails} />

            <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
              {selectedUser ? (
                <>
                  {/* Avatar + Name */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: "14px 0 24px" }}>
                    <Box sx={{
                      width: 72, height: 72, borderRadius: "50%", background: T.go,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 10px 32px rgba(255,107,53,.30), inset 0 -3px 6px rgba(0,0,0,0.12), inset 0 3px 6px rgba(255,255,255,0.25)",
                      mb: "16px", fontFamily: T.font, fontWeight: 800, fontSize: "1.5rem", color: "#fff",
                      position: "relative",
                      "&::after": {
                        content: '""', position: "absolute", top: 3, left: "18%", width: "45%", height: "28%",
                        borderRadius: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                      },
                    }}>{getInitials(selectedUser.nombre)}</Box>
                    <Typography sx={{ fontFamily: `${T.fontH} !important`, fontSize: "1.25rem !important", fontWeight: "800 !important", color: `${T.t1} !important`, mb: "8px" }}>
                      {selectedUser.nombre}
                    </Typography>
                    <Box component="span" sx={{
                      display: "inline-flex", alignItems: "center", gap: "7px", padding: "6px 16px",
                      borderRadius: "24px", fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                      backdropFilter: "blur(8px)",
                      ...(selectedUser.estado
                        ? { background: "rgba(34,197,94,0.08)", color: "#16A34A" }
                        : { background: "rgba(239,68,68,0.06)", color: "#DC2626" }),
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: selectedUser.estado ? "#22C55E" : "#EF4444", boxShadow: selectedUser.estado ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)" }} />
                      {selectedUser.estado ? "Activo" : "Inactivo"}
                    </Box>
                  </Box>

                  <Divider sx={{ my: "14px", background: "rgba(0,0,0,0.04)" }} />

                  {/* Info grid */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: 2 }}>
                    {[
                      { label: "Documento", value: selectedUser.documento || "—", icon: <FileText size={14} color={T.o1} /> },
                      { label: "Email", value: selectedUser.email, icon: <Mail size={14} color={T.o1} /> },
                      { label: "Teléfono", value: selectedUser.telefono || "—", icon: <Phone size={14} color={T.o1} /> },
                      { label: "Rol", value: selectedUser.rol || "Sin rol", icon: <Shield size={14} color={T.o1} /> },
                    ].map((item, idx) => (
                      <Box key={idx} sx={{
                        borderRadius: "16px", p: "14px 16px",
                        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.7)",
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "8px" }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)" }}>
                            {item.icon}
                          </Box>
                          <Typography sx={{ fontFamily: T.font, fontSize: ".70rem", fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {item.label}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", fontWeight: 600, color: T.t1, wordBreak: "break-all" }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {selectedUser.createdAt && (
                    <Box sx={{
                      borderRadius: "14px", p: "12px 16px", mt: 1,
                      background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.4)",
                      display: "flex", justifyContent: "space-between",
                    }}>
                      <Typography sx={{ fontFamily: T.font, fontSize: ".75rem", color: T.t3 }}>
                        Creado: {new Date(selectedUser.createdAt).toLocaleDateString("es-CO")}
                      </Typography>
                      {selectedUser.updatedAt && (
                        <Typography sx={{ fontFamily: T.font, fontSize: ".75rem", color: T.t3 }}>
                          Actualizado: {new Date(selectedUser.updatedAt).toLocaleDateString("es-CO")}
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              ) : (
                <Typography sx={{ fontFamily: T.font, color: T.t3 }}>Cargando...</Typography>
              )}
            </DialogContent>

            <DialogActions sx={{
              p: "14px 26px 22px !important", background: "transparent",
              borderTop: "1px solid rgba(0,0,0,0.04)",
              display: "flex", justifyContent: "flex-end", gap: "10px",
            }}>
              <Button onClick={handleCloseDetails} sx={cancelBtnSx}>Cerrar</Button>
              {selectedUser && (
                <Button onClick={() => { handleCloseDetails(); handleOpen(selectedUser) }} sx={submitBtnSx}>
                  <Edit2 size={13} style={{ flexShrink: 0 }} /> Editar
                </Button>
              )}
            </DialogActions>
          </Dialog>

    </Box>
  )
}

export default UsuariosList
