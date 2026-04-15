import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment, FormControlLabel, Divider, Tabs, Tab,
  Switch, Tooltip,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, Settings, Shield,
  XCircle, User, Lock, PenTool, Key, ArrowLeft, ArrowRight,
  Check as CheckIcon, AlertTriangle, ShoppingCart, ClipboardList, Tag, BarChart3,
  Plus, FileText,
} from "lucide-react"
import Swal from "sweetalert2"
import api from "../../services/api.js"

/* ═══════════════════════════════════════════════════════════════
   MÓDULOS DISPONIBLES
   ═══════════════════════════════════════════════════════════════ */
const availableModules = [
  "dashboard", "usuarios", "roles", "categorias", "productos", "pedidos", "reportes",
]

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
if (typeof document !== "undefined" && !document.getElementById("sa-role-anims3d")) {
  const s = document.createElement("style"); s.id = "sa-role-anims3d"
  s.textContent = `
    @keyframes sa-aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes sa-float1{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}25%{transform:translate(14px,-22px) scale(1.06) rotate(6deg)}50%{transform:translate(-10px,-38px) scale(0.96) rotate(-4deg)}75%{transform:translate(18px,-12px) scale(1.04) rotate(3deg)}}
    @keyframes sa-float2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-18px,14px) scale(1.1)}66%{transform:translate(14px,-12px) scale(0.94)}}
    @keyframes sa-float3{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-22px,-18px) rotate(180deg)}}
    @keyframes sa-breathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.07) translateY(-6px)}}
    @keyframes sa-glow-pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.75;transform:scale(1.18)}}
    @keyframes sa-spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
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
if (typeof document !== "undefined" && !document.getElementById("sa-swal")) {
  const s = document.createElement("style"); s.id = "sa-swal"
  s.textContent = `
    .swal2-icon.swal2-question{border-color:#FF6B35!important;color:#FF6B35!important;}
    .swal2-icon.swal2-warning{border-color:#FF3D00!important;color:#FF3D00!important;}
    .swal2-icon.swal2-success{border-color:#22C55E!important;color:#22C55E!important;}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#22C55E!important;}
    .swal2-icon.swal2-success .swal2-success-ring{border-color:rgba(34,197,94,.30)!important;}
    .swal2-icon.swal2-error{border-color:#EF4444!important;color:#EF4444!important;}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#EF4444!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#FF6B35,#FF3D00)!important;}
    .swal2-container{z-index:99999!important;}
    .swal2-popup{z-index:100000!important;border-radius:22px!important;box-shadow:0 30px 70px rgba(0,0,0,0.18)!important;backdrop-filter:blur(12px)!important;}
    .swal2-backdrop-show{z-index:99998!important;background:rgba(15,23,42,.18)!important;backdrop-filter:blur(10px)!important;}
  `
  document.head.appendChild(s)
}

const SW  = { customClass:{ popup:"sa-dash-pop", title:"sa-dash-ttl", htmlContainer:"sa-dash-bod", confirmButton:"sa-dash-ok", cancelButton:"sa-dash-cn" }, buttonsStyling:false }
const SWD = { ...SW }
const SWW = { ...SW }
const swalFire = (options) =>
  Swal.fire({ ...options, allowOutsideClick: options.showCancelButton ? true : false })

/* ═══════════════════════════════════════════════════════════════
   REUSABLE STYLES
   ═══════════════════════════════════════════════════════════════ */
const glassCard = {
  background: T.glass2,
  backdropFilter: T.blur,
  WebkitBackdropFilter: T.blur,
  border: `1px solid ${T.border}`,
  boxShadow: T.neu,
}

const actionBtn = {
  width: 36, height: 36, borderRadius: "12px", display: "flex", alignItems: "center",
  justifyContent: "center", border: "none", cursor: "pointer",
  transition: "all .3s cubic-bezier(.25,.46,.45,.94)",
  minWidth: "unset", p: 0,
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

const cancelBtnSx = {
  fontFamily: `${T.font} !important`, fontWeight: "600 !important",
  color: `${T.t2} !important`, borderRadius: "16px !important",
  padding: "11px 26px !important", border: "1.5px solid rgba(0,0,0,0.06) !important",
  textTransform: "none !important", background: "rgba(255,255,255,0.75) !important",
  backdropFilter: "blur(16px) !important",
  transition: "all .25s ease !important",
  "&:hover": { background: "rgba(255,255,255,0.95) !important", boxShadow: "0 4px 16px rgba(0,0,0,0.06) !important", transform: "translateY(-1px)" },
}
const submitBtnSx = {
  display: "flex !important", alignItems: "center !important", gap: "8px !important",
  background: `${T.go} !important`, color: "#fff !important",
  fontFamily: `${T.font} !important`, fontWeight: "700 !important",
  borderRadius: "16px !important", padding: "11px 28px !important",
  textTransform: "none !important",
  boxShadow: `${T.glow} !important`,
  transition: "all .3s cubic-bezier(.25,.46,.45,.94) !important",
  "&:hover": { transform: "translateY(-3px) scale(1.02)", boxShadow: `${T.glow2} !important` },
  "&:disabled": { background: "rgba(255,107,53,.12) !important", boxShadow: "none !important", transform: "none !important", color: "rgba(255,107,53,.35) !important" },
}

const permBtnSelSx = {
  display: "flex !important", alignItems: "center !important", gap: "4px !important",
  background: `${T.go} !important`, color: "#fff !important",
  fontFamily: `${T.font} !important`, fontWeight: "700 !important",
  fontSize: ".70rem !important", padding: "4px 12px !important",
  borderRadius: "50px !important", boxShadow: "0 2px 10px rgba(255,107,53,.25) !important",
  textTransform: "uppercase",
}
const permBtnQuitSx = {
  display: "flex !important", alignItems: "center !important", gap: "4px !important",
  background: "rgba(239,68,68,.06) !important", color: "#EF4444 !important",
  fontFamily: `${T.font} !important`, fontWeight: "700 !important",
  fontSize: ".70rem !important", padding: "4px 12px !important",
  borderRadius: "50px !important", border: "1px solid rgba(239,68,68,.15) !important",
  textTransform: "uppercase",
}

const pageBtn = {
  width: 36, height: 36, borderRadius: "12px",
  background: "rgba(255,255,255,0.65)", color: T.t3,
  border: `1px solid ${T.border}`,
  backdropFilter: "blur(16px)",
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

/* ═══════════════════════════════════════════════════════════════
   3D DECORATIVE ELEMENTS
   ═══════════════════════════════════════════════════════════════ */

/* 3D Shield — multi-layer with specular highlights */
const ShieldIcon3D = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(255,107,53,0.35))" }}>
    <defs>
      <linearGradient id="sh3d" x1="8" y1="4" x2="56" y2="60">
        <stop offset="0%" stopColor="#FFB088" />
        <stop offset="40%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#E83D00" />
      </linearGradient>
      <linearGradient id="sh3dSpec" x1="20%" y1="0%" x2="70%" y2="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <radialGradient id="sh3dGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="rgba(255,200,160,0.4)" />
        <stop offset="100%" stopColor="rgba(255,107,53,0)" />
      </radialGradient>
    </defs>
    <path d="M32 6L8 18v14c0 14 10 26 24 30 14-4 24-16 24-30V18L32 6z" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <path d="M32 6L8 18v14c0 14 10 26 24 30 14-4 24-16 24-30V18L32 6z" fill="url(#sh3d)" />
    <path d="M32 12L14 22v10c0 11 8 20 18 24 10-4 18-13 18-24V22L32 12z" fill="url(#sh3dSpec)" />
    <circle cx="32" cy="34" r="20" fill="url(#sh3dGlow)" />
    <path d="M24 34l6 6 10-13" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
  </svg>
)

/* Floating 3D Glass Orb */
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

/* 3D Pie Chart */
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
      {/* Mini orbs decorating the chart */}
      <Box sx={{ position: "absolute", top: 4, right: 12, width: 14, height: 14, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(255,107,53,0.5))", boxShadow: "0 3px 8px rgba(255,107,53,0.2)", animation: "sa-float1 5s ease-in-out infinite" }} />
      <Box sx={{ position: "absolute", top: 18, left: 8, width: 9, height: 9, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(34,197,94,0.5))", boxShadow: "0 2px 6px rgba(34,197,94,0.2)", animation: "sa-float2 4s ease-in-out 0.5s infinite" }} />
      <Box sx={{ position: "absolute", bottom: 12, right: 5, width: 7, height: 7, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(245,158,11,0.5))", boxShadow: "0 2px 6px rgba(245,158,11,0.2)", animation: "sa-float3 6s ease-in-out 1s infinite" }} />
    </Box>
  )
}

/* Empty State Illustration */
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
          <linearGradient id="emShG" x1="10" y1="5" x2="90" y2="100"><stop stopColor="#FFB088" /><stop offset="0.4" stopColor="#FF6B35" /><stop offset="1" stopColor="#E84D0E" /></linearGradient>
          <filter id="emShS"><feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#FF6B35" floodOpacity="0.30" /></filter>
        </defs>
        <path d="M50 8L14 24V50C14 74 30 90 50 97C70 90 86 74 86 50V24L50 8Z" fill="url(#emShG)" filter="url(#emShS)" />
        <path d="M38 52L46 60L64 42" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
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
const modalV = { hidden: { opacity: 0, scale: 0.88, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }, exit: { opacity: 0, scale: 0.92, y: 10, transition: { duration: 0.2 } } }

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const RolesList = () => {
  const [roles, setRoles] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({ nombre: "", estado: true, permisos: [], nombrePersonalizado: "", isAdminRole: false })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [formErrors, setFormErrors] = useState({ nombre: "", nombrePersonalizado: "", permisos: "" })
  const [isFormValid, setIsFormValid] = useState(false)

  const fetchRoles = async () => {
    try {
      const r = await api.get("/api/roles")
      setRoles(Array.isArray(r.data) ? r.data : [])
    } catch (e) {
      console.error("Error al cargar roles:", e)
      setRoles([])
    }
  }
  useEffect(() => { fetchRoles() }, [])

  const checkRoleExists = (name, excludeId = null) =>
    roles.some(r => r.nombre.toLowerCase() === name.toLowerCase() && r._id !== excludeId)

  const initializePermissions = () =>
    availableModules.map(modulo => ({
      modulo,
      acciones: { crear: false, leer: modulo === "dashboard", actualizar: false, eliminar: false },
    }))

  const handleOpen = role => {
    setFormErrors({ nombre: "", nombrePersonalizado: "", permisos: "" })
    if (role) {
      let permisos = (role.permisos || []).map(p =>
        typeof p === "string"
          ? { modulo: p, acciones: { crear: false, leer: true, actualizar: false, eliminar: false } }
          : { modulo: p.modulo, acciones: { ...p.acciones } }
      )
      const existing = permisos.map(p => p.modulo)
      availableModules.filter(m => !existing.includes(m)).forEach(m =>
        permisos.push({ modulo: m, acciones: { crear: false, leer: false, actualizar: false, eliminar: false } })
      )
      const isAdmin = role.nombre.toLowerCase() === "administrador"
      setFormData({ nombre: role.nombre, estado: isAdmin ? true : role.estado, permisos, nombrePersonalizado: "", isAdminRole: isAdmin })
      setEditingId(role._id); setIsFormValid(true)
    } else {
      setFormData({ nombre: "", estado: true, permisos: initializePermissions(), nombrePersonalizado: "", isAdminRole: false })
      setEditingId(null); setIsFormValid(false)
    }
    setOpen(true); setTabValue(0)
  }
  const handleClose = () => {
    setOpen(false)
    setEditingId(null)
    setFormData({ nombre: "", estado: true, permisos: [], nombrePersonalizado: "", isAdminRole: false })
    setFormErrors({ nombre: "", nombrePersonalizado: "", permisos: "" })
    setTabValue(0)
    setIsFormValid(false)
  }

  const handleDetails = role => {
    const permisos = (role.permisos || []).map(p =>
      typeof p === "string"
        ? { modulo: p, acciones: { crear: false, leer: true, actualizar: false, eliminar: false } }
        : { modulo: p.modulo, acciones: { ...p.acciones } }
    )
    setSelectedRole({ ...role, permisos }); setDetailsOpen(true); setTabValue(0)
  }
  const handleCloseDetails = () => setDetailsOpen(false)

  const handleChange = e => {
    const { name, value } = e.target
    const parsed = name === "estado" ? value === "true" || value === true : value
    setFormData({ ...formData, [name]: parsed })
    validateField(name, parsed)
  }

  const validateField = (name, value) => {
    let err = ""
    if (name === "nombre") { if (editingId) return true }
    else if (name === "nombrePersonalizado") {
      if (!editingId && (!value || !value.trim())) err = "El nombre del rol es obligatorio"
      else if (value && value.length < 6) err = "El nombre debe tener al menos 6 caracteres"
      else if (value && value.length > 30) err = "El nombre no puede exceder 30 caracteres"
      else if (value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) err = "Solo letras y espacios"
      else if (value && checkRoleExists(value.trim(), editingId)) err = "Ya existe un rol con este nombre"
    }
    setFormErrors(p => ({ ...p, [name]: err }))
    setTimeout(() => validateForm({ ...formData, [name]: value }), 0)
    return !err
  }

  const validateForm = data => {
    if (!editingId) {
      const nombreOk =
        !!data.nombrePersonalizado && data.nombrePersonalizado.trim() !== "" &&
        data.nombrePersonalizado.length >= 6 && data.nombrePersonalizado.length <= 30 &&
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.nombrePersonalizado) &&
        !checkRoleExists(data.nombrePersonalizado.trim(), editingId)
      const permisosOk = (data.permisos || []).some(p =>
        p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar
      )
      setIsFormValid(nombreOk && permisosOk)
    } else {
      setIsFormValid(true)
    }
  }

  const handlePermissionChange = (idx, accion, checked) => {
    if (formData.isAdminRole) return
    const up = formData.permisos.map((p, i) =>
      i === idx ? { ...p, acciones: { ...p.acciones, [accion]: checked } } : p
    )
    setFormData(prev => ({ ...prev, permisos: up }))
    validateForm({ ...formData, permisos: up })
  }
  const handleSelectAllForModule = idx => {
    if (formData.isAdminRole) return
    const up = formData.permisos.map((p, i) => {
      if (i !== idx) return p
      return { ...p, acciones: p.modulo === "dashboard"
        ? { crear: false, leer: true, actualizar: false, eliminar: false }
        : { crear: true, leer: true, actualizar: true, eliminar: true }
      }
    })
    setFormData(prev => ({ ...prev, permisos: up }))
    validateForm({ ...formData, permisos: up })
  }
  const handleRemoveAllForModule = idx => {
    if (formData.isAdminRole) return
    const up = formData.permisos.map((p, i) =>
      i === idx ? { ...p, acciones: { crear: false, leer: false, actualizar: false, eliminar: false } } : p
    )
    setFormData(prev => ({ ...prev, permisos: up }))
    validateForm({ ...formData, permisos: up })
  }
  const handleSelectAllPermissions = () => {
    if (formData.isAdminRole) return
    const updated = {
      ...formData, permisos: formData.permisos.map(p => ({
        ...p,
        acciones: p.modulo === "dashboard"
          ? { crear: false, leer: true, actualizar: false, eliminar: false }
          : { crear: true, leer: true, actualizar: true, eliminar: true }
      }))
    }
    setFormData(updated); validateForm(updated)
  }
  const handleRemoveAllPermissions = () => {
    if (formData.isAdminRole) return
    const updated = { ...formData, permisos: formData.permisos.map(p => ({ ...p, acciones: { crear: false, leer: false, actualizar: false, eliminar: false } })) }
    setFormData(updated); validateForm(updated)
  }

  const prepareFormData = () => {
    const f = { ...formData }
    if (!editingId) { f.nombre = f.nombrePersonalizado || ""; f.estado = true }
    if (f.nombre.toLowerCase() === "administrador") f.estado = true
    delete f.nombrePersonalizado; delete f.isAdminRole
    return f
  }

  const handleSubmit = async () => {
    const tempErrors = {}
    if (!editingId) {
      if (!formData.nombrePersonalizado || !formData.nombrePersonalizado.trim())
        tempErrors.nombrePersonalizado = "El nombre del rol es obligatorio"
      else if (checkRoleExists(formData.nombrePersonalizado.trim(), editingId))
        tempErrors.nombrePersonalizado = "Ya existe un rol con este nombre"
      const tienePermisos = (formData.permisos || []).some(p =>
        p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar
      )
      if (!tienePermisos) tempErrors.permisos = "Debes asignar al menos un permiso."
    }
    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors)
      if (tempErrors.nombrePersonalizado?.includes("Ya existe"))
        await swalFire({ ...SWD, icon: "error", title: "Rol duplicado", text: `Ya existe un rol con el nombre "${formData.nombrePersonalizado}".` })
      else if (tempErrors.permisos)
        await swalFire({ ...SWW, icon: "warning", title: "Sin permisos", text: "Debes asignar al menos un permiso antes de crear el rol." })
      else
        await swalFire({ ...SWD, icon: "error", title: "Error", text: Object.values(tempErrors)[0] })
      return
    }
    try {
      const d = prepareFormData()
      const wasEditing = !!editingId
      if (wasEditing) {
        await api.put(`/api/roles/${editingId}`, d)
      } else {
        await api.post("/api/roles", d)
      }
      handleClose()
      await fetchRoles()
      setTimeout(() => {
        swalFire({ ...SW, icon: "success", title: wasEditing ? "Rol actualizado" : "Rol creado", text: wasEditing ? "Los cambios se guardaron correctamente." : "El nuevo rol se registró correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      }, 300)
    } catch (e) {
      let msg = "Ocurrió un error al guardar el rol."
      if (e.response?.data?.msg) {
        const s = e.response.data.msg
        msg = (s.includes("ya existe") || s.includes("duplicate"))
          ? `No se puede ${editingId ? "actualizar" : "crear"} el rol porque ya existe uno con ese nombre.` : s
      }
      await swalFire({ ...SWD, icon: "error", title: "Error al guardar", text: msg })
    }
  }

  const handleDelete = async id => {
    const role = roles.find(r => r._id === id)
    if (role?.nombre.toLowerCase() === "administrador") {
      await swalFire({ ...SW, icon: "error", title: "Acción no permitida", text: "El rol de administrador no puede ser eliminado" })
      return
    }
    if (role?.estado) {
      await swalFire({ ...SWW, icon: "warning", title: "Rol activo", text: "No puedes eliminar un rol activo. Desactívalo primero." })
      return
    }
    const r = await swalFire({ ...SWD, title: "¿Eliminar rol?", text: "Esta acción no se puede deshacer", icon: "question", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" })
    if (r.isConfirmed) {
      try {
        await api.delete(`/api/roles/${id}`)
        await fetchRoles()
        setTimeout(() => {
          swalFire({ ...SW, icon: "success", title: "Eliminado", text: "El rol se eliminó correctamente.", timer: 2000, timerProgressBar: true, showConfirmButton: false })
        }, 300)
      } catch (e) {
        await swalFire({ ...SW, icon: "error", title: "Error", text: e.response?.data?.msg || "Error al eliminar." })
      }
    }
  }

  /* helpers */
  const getInitials = name => name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2)
  const formatPermissions = permisos => {
    if (!permisos || permisos.length === 0) return "Sin permisos"
    if (typeof permisos[0] === "string") return permisos.join(", ")
    const mods = permisos.filter(p => p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar).map(p => p.modulo)
    return mods.length > 0 ? mods.join(", ") : "Sin permisos"
  }
  const countActivePermissions = permisos => {
    if (!permisos || permisos.length === 0) return 0
    if (typeof permisos[0] === "string") return permisos.length
    return permisos.filter(p => p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar).length
  }
  const handleTabChange = (_, v) => setTabValue(v)

  const getModuleIcon = m => {
    const c = T.o1
    switch (m) {
      case "dashboard": return <Settings size={14} color={c} />
      case "usuarios": return <User size={14} color={c} />
      case "roles": return <Shield size={14} color={c} />
      case "categorias": return <Tag size={14} color={c} />
      case "productos": return <ShoppingCart size={14} color={c} />
      case "pedidos": return <ClipboardList size={14} color={c} />
      case "reportes": return <BarChart3 size={14} color={c} />
      default: return <Settings size={14} color={c} />
    }
  }

  /* Permission Groups for modal toggle UI */
  const permissionGroups = [
    { label: "Panel Administrativo", modules: ["dashboard", "usuarios", "roles"], icon: <Settings size={16} color={T.o1} /> },
    { label: "Panel de Productos", modules: ["categorias", "productos"], icon: <ShoppingCart size={16} color={T.o1} /> },
    { label: "Panel de Operaciones", modules: ["pedidos", "reportes"], icon: <ClipboardList size={16} color={T.o1} /> },
  ]
  const isGroupEnabled = (permisos, modules) =>
    modules.some(mod => {
      const perm = permisos.find(p => p.modulo === mod)
      return perm && Object.values(perm.acciones).some(v => v)
    })
  const handleGroupToggle = (modules, checked) => {
    if (formData.isAdminRole) return
    const up = formData.permisos.map(p => {
      if (!modules.includes(p.modulo)) return p
      if (checked) {
        return { ...p, acciones: p.modulo === "dashboard"
          ? { crear: false, leer: true, actualizar: false, eliminar: false }
          : { crear: true, leer: true, actualizar: true, eliminar: true }
        }
      } else {
        return { ...p, acciones: { crear: false, leer: false, actualizar: false, eliminar: false } }
      }
    })
    setFormData(prev => ({ ...prev, permisos: up }))
    validateForm({ ...formData, permisos: up })
  }

  const totalActive = roles.filter(r => r.estado).length
  const totalInactive = roles.filter(r => !r.estado).length
  const filtered = roles.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const pctRegistered = roles.length > 0 ? 100 : 0
  const pctActive = roles.length > 0 ? Math.round((totalActive / roles.length) * 100) : 0

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

  /* ─── Permission Panel (granular editing) ─── */
  const PermPanel = ({ moduleNames }) => (
    <Box sx={{ pt: 1 }}>
      {formData.permisos.filter(p => moduleNames.includes(p.modulo)).map(permiso => {
        const idx = formData.permisos.findIndex(p => p.modulo === permiso.modulo)
        const isAdmin = formData.isAdminRole
        return (
          <Box key={permiso.modulo} sx={{
            borderRadius: "18px", p: "16px 18px", mb: "12px",
            background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.7)",
            transition: "all .3s cubic-bezier(.25,.46,.45,.94)",
            "&:hover": { boxShadow: "0 8px 28px rgba(255,107,53,.06), inset 0 1px 2px rgba(255,255,255,0.7)", transform: "translateY(-1px)" },
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: T.font, fontSize: ".87rem", fontWeight: 700, color: T.t1 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)", boxShadow: "0 3px 8px rgba(255,107,53,0.08)" }}>{getModuleIcon(permiso.modulo)}</Box>
                {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
              </Box>
              {!isAdmin && (
                <Box sx={{ display: "flex", gap: "6px" }}>
                  <Button size="small" sx={permBtnSelSx} onClick={() => handleSelectAllForModule(idx)}><CheckCircle size={10} /> Sel.</Button>
                  <Button size="small" sx={permBtnQuitSx} onClick={() => handleRemoveAllForModule(idx)}><XCircle size={10} /> Quitar</Button>
                </Box>
              )}
            </Box>
            <Divider sx={{ my: "8px", background: "rgba(0,0,0,0.04)" }} />
            <Box>
              {permiso.modulo === "dashboard" ? (
                <Box sx={{ display: "flex", alignItems: "center", p: "10px 14px", borderRadius: "14px", background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", mb: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <Eye style={{ color: T.o1, marginRight: 10 }} size={15} />
                  <Typography sx={{ flex: 1, fontFamily: T.font, fontSize: ".85rem", fontWeight: 600, color: T.t2 }}>Acceso</Typography>
                  <FormControlLabel control={<Switch checked={permiso.acciones.leer} onChange={e => handlePermissionChange(idx, "leer", e.target.checked)} disabled={isAdmin} size="small" sx={switchSx} />} label="" />
                </Box>
              ) : (
                [
                  { key: "crear", label: "Crear", icon: <PenTool size={14} /> },
                  { key: "leer", label: "Ver", icon: <Eye size={14} /> },
                  { key: "actualizar", label: "Editar", icon: <Edit2 size={14} /> },
                  { key: "eliminar", label: "Eliminar", icon: <Trash2 size={14} /> },
                ].map(a => (
                  <Box key={a.key} sx={{ display: "flex", alignItems: "center", p: "10px 14px", borderRadius: "14px", background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", mb: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <Box sx={{ color: a.key === "eliminar" ? T.r1 : T.o1, mr: "10px" }}>{a.icon}</Box>
                    <Typography sx={{ flex: 1, fontFamily: T.font, fontSize: ".85rem", fontWeight: 600, color: T.t2 }}>{a.label}</Typography>
                    <FormControlLabel control={<Switch checked={permiso.acciones[a.key]} onChange={e => handlePermissionChange(idx, a.key, e.target.checked)} disabled={isAdmin} size="small" sx={switchSx} />} label="" />
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )

  /* ─── Details Permission Panel ─── */
  const DetPermPanel = ({ moduleNames }) => (
    <Box sx={{ pt: 1 }}>
      {selectedRole?.permisos.filter(p => moduleNames.includes(p.modulo)).map((permiso, i) => (
        <Box key={i} sx={{
          borderRadius: "18px", p: "16px 18px", mb: "12px",
          background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.7)",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: T.font, fontSize: ".87rem", fontWeight: 700, color: T.t1, mb: "12px" }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)", boxShadow: "0 3px 8px rgba(255,107,53,0.08)" }}>{getModuleIcon(permiso.modulo)}</Box>
            {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
          </Box>
          <Divider sx={{ my: 1, background: "rgba(0,0,0,0.04)" }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px", mt: 1 }}>
            {permiso.modulo === "dashboard" ? (
              <Box sx={{
                fontFamily: T.font, fontWeight: 700, fontSize: ".73rem", padding: "6px 14px", borderRadius: "22px", m: "3px",
                display: "inline-flex", alignItems: "center", gap: "5px",
                ...(permiso.acciones.leer
                  ? { background: "rgba(255,107,53,.08)", color: T.o1, border: `1px solid ${T.border2}`, boxShadow: "0 2px 8px rgba(255,107,53,0.08)" }
                  : { background: "rgba(0,0,0,.02)", color: T.t3, border: "1px solid rgba(0,0,0,0.04)" }),
              }}><Eye size={11} /> Acceso</Box>
            ) : (
              [
                { key: "crear", label: "Crear", icon: <PenTool size={10} /> },
                { key: "leer", label: "Ver", icon: <Eye size={10} /> },
                { key: "actualizar", label: "Editar", icon: <Edit2 size={10} /> },
                { key: "eliminar", label: "Eliminar", icon: <Trash2 size={10} /> },
              ].map(a => (
                <Box key={a.key} sx={{
                  fontFamily: T.font, fontWeight: 700, fontSize: ".73rem", padding: "6px 14px", borderRadius: "22px", m: "3px",
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  transition: "all .2s ease",
                  ...(permiso.acciones[a.key]
                    ? { background: "rgba(255,107,53,.08)", color: T.o1, border: `1px solid ${T.border2}`, boxShadow: "0 2px 8px rgba(255,107,53,0.08)" }
                    : { background: "rgba(0,0,0,.02)", color: T.t3, border: "1px solid rgba(0,0,0,0.04)" }),
                }}>{a.icon} {a.label}</Box>
              ))
            )}
          </Box>
        </Box>
      ))}
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

      {/* Dot grid overlay */}
      <Box sx={{
        position: "fixed", inset: 0, zIndex: -2, pointerEvents: "none", opacity: 0.025,
        backgroundImage: "radial-gradient(circle, #FF6B35 1px, transparent 1px)",
        backgroundSize: "32px 32px",
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
            <ShieldIcon3D />
            <Box sx={{
              position: "absolute", top: "50%", left: "50%", width: 90, height: 90,
              borderRadius: "50%", pointerEvents: "none", zIndex: -1,
              background: "radial-gradient(circle, rgba(255,107,53,0.12), transparent 70%)",
              animation: "sa-glow-pulse 3s ease-in-out infinite",
              transform: "translate(-50%,-50%)",
            }} />
          </Box>
          <Box>
            <Typography sx={{
              fontFamily: `${T.fontH} !important`, fontSize: "1.50rem !important",
              fontWeight: "800 !important", lineHeight: 1.2,
              background: T.go, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Gestión de Roles
            </Typography>
            <Typography sx={{ fontSize: ".88rem", color: T.t3, mt: "6px", fontFamily: T.font }}>
              Administra los roles y permisos del sistema
            </Typography>
          </Box>
        </Box>

        <Box sx={{ zIndex: 1 }}>
          <PieChart3D total={roles.length} active={totalActive} inactive={totalInactive} />
        </Box>
      </MotionBox>

      {/* ═══ STATS CARDS ═══ */}
      <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", mb: "22px" }}>
        {[
          { label: "TOTAL", value: roles.length, desc: "registrados", color: T.o1, icon: <Shield size={18} /> },
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
                transition: "all .3s ease",
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

        {/* Legend card */}
        <MotionBox variants={itemV}
          whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 20 } }}
          sx={{
            ...glassCard, borderRadius: "22px", p: "22px 24px",
            display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px", cursor: "default",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.o1, boxShadow: `0 2px 8px ${T.o1}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>Registrados</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>{pctRegistered} %</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.green, boxShadow: `0 2px 8px ${T.green}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>Habilitados</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>{pctActive} %</Typography>
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
          }} placeholder="Buscar rol..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0) }} />
        </Box>
        <motion.button
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
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
          <Plus size={16} strokeWidth={2.5} /> Crear Rol
          {/* Pulse ring animation */}
          <span style={{
            position: "absolute", inset: 0, borderRadius: 16,
            border: "2px solid rgba(255,255,255,0.3)",
            animation: "sa-pulse-ring 2s ease-out infinite",
            pointerEvents: "none",
          }} />
        </motion.button>
      </MotionBox>

      {/* ═══ TABLE CONTAINER ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        ...glassCard, borderRadius: T.rad3, p: "8px", mb: "22px",
      }}>
        {/* Column headers */}
        {paginated.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 150px", px: "26px", py: "16px" }}>
            {["ROL", "PERMISOS", "ESTADO", "ACCIONES"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.4px", textTransform: "uppercase", color: T.t4,
                ...(h === "ESTADO" || h === "ACCIONES" ? { textAlign: "center" } : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        {/* Card rows */}
        <AnimatePresence mode="wait">
          <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "flex", flexDirection: "column", gap: "8px", p: paginated.length > 0 ? "0 8px 8px" : "0" }}>
            {paginated.map((role, i) => (
              <MotionBox key={role._id} variants={itemV}
                whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                sx={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 1fr 150px",
                  alignItems: "center", p: "18px 22px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.68)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)",
                  cursor: "default",
                  transition: "background .3s, border-color .3s",
                  "&:hover": { borderColor: "rgba(255,107,53,0.12)", background: "rgba(255,255,255,0.82)" },
                }}>
                {/* Role info */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, background: avGrad(i),
                    fontFamily: T.font, fontWeight: 800, fontSize: ".82rem", color: "#fff",
                    boxShadow: "0 6px 18px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.25)",
                    position: "relative",
                    "&::after": {
                      content: '""', position: "absolute", top: 2, left: "15%", width: "50%", height: "30%",
                      borderRadius: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                    },
                  }}>
                    {getInitials(role.nombre)}
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".90rem", color: T.t1, lineHeight: 1.3 }}>
                      {role.nombre}
                    </Typography>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4 }}>
                      #{role._id?.slice(-6).toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                {/* Permissions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    background: "rgba(255,107,53,0.06)", borderRadius: "10px", padding: "5px 12px",
                    backdropFilter: "blur(8px)",
                  }}>
                    <Shield size={12} color={T.o1} />
                    <Typography sx={{ fontFamily: T.font, fontSize: ".73rem", fontWeight: 700, color: T.o1 }}>
                      {countActivePermissions(role.permisos)}
                    </Typography>
                  </Box>
                  <Tooltip title={formatPermissions(role.permisos)} placement="top">
                    <Typography sx={{
                      fontFamily: T.font, fontSize: ".80rem", color: T.t3,
                      maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {formatPermissions(role.permisos)}
                    </Typography>
                  </Tooltip>
                </Box>

                {/* Status */}
                <Box sx={{ textAlign: "center" }}>
                  <Box component="span" sx={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    padding: "6px 16px", borderRadius: "24px",
                    fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                    backdropFilter: "blur(8px)",
                    transition: "all .25s",
                    ...(role.estado
                      ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "0 2px 8px rgba(34,197,94,0.06)" }
                      : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "0 2px 8px rgba(239,68,68,0.06)" }),
                  }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: role.estado ? "#22C55E" : "#EF4444",
                      boxShadow: role.estado ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)",
                    }} />
                    {role.estado ? "Activo" : "Inactivo"}
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                  <Tooltip title="Editar" placement="top">
                    <Button sx={btnEdit} onClick={() => handleOpen(role)}><Edit2 size={15} strokeWidth={2} /></Button>
                  </Tooltip>
                  <Tooltip title="Ver detalles" placement="top">
                    <Button sx={btnView} onClick={() => handleDetails(role)}><Eye size={15} strokeWidth={2} /></Button>
                  </Tooltip>
                  {role.nombre.toLowerCase() !== "administrador"
                    ? (
                      <Tooltip title={role.estado ? "Desactiva el rol para eliminar" : "Eliminar"} placement="top">
                        <Button sx={{ ...btnDel, ...(role.estado ? { opacity: 0.35, cursor: "not-allowed" } : {}) }}
                          onClick={() => handleDelete(role._id)}>
                          <Trash2 size={15} strokeWidth={2} />
                        </Button>
                      </Tooltip>
                    )
                    : <Box sx={{ width: 36 }} />
                  }
                </Box>
              </MotionBox>
            ))}
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
              {roles.length === 0 ? "No hay roles registrados" : "Sin resultados"}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t3, maxWidth: 380, mx: "auto", mb: "24px", lineHeight: 1.6 }}>
              {roles.length === 0
                ? "Crea un nuevo rol para administrar los permisos del sistema"
                : "No se encontraron roles que coincidan con la búsqueda."}
            </Typography>
            {roles.length === 0 && (
              <motion.button
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleOpen(null)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 9,
                  background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
                  color: "#fff", fontFamily: T.font, fontWeight: 700,
                  fontSize: ".85rem", padding: "13px 28px", borderRadius: 16,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 8px 28px rgba(255,107,53,.30)",
                }}>
                <Plus size={16} strokeWidth={2.5} /> Crear Rol
              </motion.button>
            )}
          </MotionBox>
        )}
      </MotionBox>

      {/* ═══ PAGINATION ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "10px",
      }}>
        <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
          Mostrando {filtered.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length} roles
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
      <Dialog open={open} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") handleClose() }}
            fullWidth maxWidth="sm"
            sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(14px)", background: "rgba(15,23,42,.15)" } }}
            slotProps={{ paper: { sx: {
              borderRadius: "24px !important",
              boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
              border: "1px solid rgba(255,255,255,0.20)",
              width: "90%", maxWidth: 540,
              background: "rgba(255,255,255,0.92) !important",
              backdropFilter: "blur(32px) saturate(200%)",
              overflow: "hidden",
              animation: "sa-border-glow 3s ease-in-out infinite",
            } } }}>

            <DlgHdr
              icon={editingId ? <Edit2 size={18} color="#fff" /> : <Shield size={18} color="#fff" />}
              title={editingId ? "Editar Rol" : "Crear Nuevo Rol"}
              sub={editingId ? "Modifica los datos del rol seleccionado" : "Completa los campos para registrar un nuevo rol"}
              onClose={handleClose}
            />

            <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
              {/* Info fields */}
              <Box sx={{ mb: 2 }}>
                {editingId ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <TextField margin="dense" label="Rol" value={formData.nombre}
                      fullWidth variant="outlined" size="small"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)" } }}
                      slotProps={{ input: { readOnly: true, startAdornment: <InputAdornment position="start"><Shield size={14} color={T.t3} /></InputAdornment> } }}
                    />
                    <TextField select margin="dense" label="Estado" name="estado"
                      value={formData.estado} onChange={handleChange}
                      fullWidth variant="outlined" size="small"
                      disabled={formData.isAdminRole}
                      helperText={formData.isAdminRole ? "El administrador siempre está activo" : ""}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)" } }}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Key size={14} color={T.t3} /></InputAdornment> } }}
                    >
                      <MenuItem value={true}>Activo</MenuItem>
                      <MenuItem value={false}>Inactivo</MenuItem>
                    </TextField>
                  </Box>
                ) : (
                  <TextField margin="dense" label="Nombre de Rol" name="nombrePersonalizado"
                    value={formData.nombrePersonalizado || ""} onChange={handleChange}
                    onBlur={e => validateField(e.target.name, e.target.value)}
                    onKeyPress={e => { if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.key)) e.preventDefault() }}
                    fullWidth variant="outlined" size="small"
                    placeholder="Ej. Supervisor"
                    error={!!formErrors.nombrePersonalizado}
                    helperText={formErrors.nombrePersonalizado || "El rol se creará como activo por defecto"}
                    required
                    inputProps={{ maxLength: 30 }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)" } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><User size={14} color={T.t3} /></InputAdornment> } }}
                  />
                )}
              </Box>

              {/* Permisos section */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{
                  display: "flex", alignItems: "center", gap: "10px",
                  fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
                  color: T.t1, mb: "16px", pb: "10px",
                  borderBottom: "1.5px solid rgba(0,0,0,0.05)",
                }}>
                  <Box sx={{
                    width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(34,197,94,.08)", boxShadow: "0 2px 8px rgba(34,197,94,0.06)",
                  }}>
                    <CheckCircle size={13} color={T.green} />
                  </Box>
                  Permisos
                  {formData.isAdminRole && (
                    <Box component="span" sx={{
                      ml: "auto", display: "inline-flex", alignItems: "center", gap: "5px",
                      fontSize: ".70rem", fontWeight: 600, color: T.o1,
                      background: "rgba(255,107,53,.06)", border: `1px solid ${T.border2}`,
                      borderRadius: "24px", padding: "4px 12px",
                    }}>
                      <Lock size={10} /> Bloqueados
                    </Box>
                  )}
                  {!editingId && !(formData.permisos || []).some(p => p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar) && (
                    <Box component="span" sx={{
                      ml: "auto", display: "inline-flex", alignItems: "center", gap: "5px",
                      fontSize: ".70rem", fontWeight: 600, color: T.r1,
                      background: "rgba(239,68,68,.05)", border: "1px solid rgba(239,68,68,.12)",
                      borderRadius: "24px", padding: "4px 12px",
                    }}>
                      <AlertTriangle size={10} /> Mínimo un permiso
                    </Box>
                  )}
                </Box>

                {!formData.isAdminRole && (
                  <Box sx={{ display: "flex", gap: "8px", mb: "14px" }}>
                    <Button size="small" sx={permBtnSelSx} onClick={handleSelectAllPermissions}><CheckCircle size={11} /> Seleccionar todo</Button>
                    <Button size="small" sx={permBtnQuitSx} onClick={handleRemoveAllPermissions}><XCircle size={11} /> Quitar todo</Button>
                  </Box>
                )}

                <Tabs value={tabValue} onChange={handleTabChange} sx={{
                  mb: 2,
                  "& .MuiTabs-indicator": { background: T.go, height: 3, borderRadius: "3px" },
                  borderBottom: "1.5px solid rgba(0,0,0,0.05)",
                }}>
                  <Tab label="Sistema" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<Settings size={14} />} />
                  <Tab label="Inventario" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<ShoppingCart size={14} />} />
                  <Tab label="Operaciones" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<ClipboardList size={14} />} />
                </Tabs>

                {tabValue === 0 && <PermPanel moduleNames={["dashboard", "usuarios", "roles"]} />}
                {tabValue === 1 && <PermPanel moduleNames={["categorias", "productos"]} />}
                {tabValue === 2 && <PermPanel moduleNames={["pedidos", "reportes"]} />}
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
                {editingId ? "Actualizar Rol" : "+ Crear Rol"}
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
              backdropFilter: "blur(32px) saturate(200%)",
              overflow: "hidden",
              animation: "sa-border-glow 3s ease-in-out infinite",
            } } }}>

            <DlgHdr icon={<Eye size={18} color="#fff" />} title="Detalles del Rol" sub="Información completa del rol" onClose={handleCloseDetails} />

            <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
              {selectedRole ? (
                <>
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
                    }}>{getInitials(selectedRole.nombre)}</Box>
                    <Typography sx={{ fontFamily: `${T.fontH} !important`, fontSize: "1.25rem !important", fontWeight: "800 !important", color: `${T.t1} !important`, mb: "8px" }}>
                      {selectedRole.nombre}
                    </Typography>
                    <Box component="span" sx={{
                      display: "inline-flex", alignItems: "center", gap: "7px", padding: "6px 16px",
                      borderRadius: "24px", fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                      backdropFilter: "blur(8px)",
                      ...(selectedRole.estado
                        ? { background: "rgba(34,197,94,0.08)", color: "#16A34A" }
                        : { background: "rgba(239,68,68,0.06)", color: "#DC2626" }),
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: selectedRole.estado ? "#22C55E" : "#EF4444", boxShadow: selectedRole.estado ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)" }} />
                      {selectedRole.estado ? "Activo" : "Inactivo"}
                    </Box>
                  </Box>

                  <Box sx={{ height: 1, background: "rgba(0,0,0,0.04)", my: "14px" }} />

                  <Box sx={{
                    display: "flex", alignItems: "center", gap: "10px",
                    fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
                    color: T.t1, mb: "14px", pb: "10px",
                    borderBottom: "1.5px solid rgba(0,0,0,0.05)",
                  }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)", boxShadow: "0 3px 8px rgba(255,107,53,0.08)" }}>
                      <Shield size={13} color={T.o1} />
                    </Box>
                    Permisos por Módulo
                  </Box>

                  <Tabs value={tabValue} onChange={handleTabChange} sx={{
                    mb: 2,
                    "& .MuiTabs-indicator": { background: T.go, height: 3, borderRadius: "3px" },
                    borderBottom: "1.5px solid rgba(0,0,0,0.05)",
                  }}>
                    <Tab label="Sistema" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<Settings size={14} />} />
                    <Tab label="Inventario" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<ShoppingCart size={14} />} />
                    <Tab label="Operaciones" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<ClipboardList size={14} />} />
                  </Tabs>

                  {tabValue === 0 && <DetPermPanel moduleNames={["dashboard", "usuarios", "roles"]} />}
                  {tabValue === 1 && <DetPermPanel moduleNames={["categorias", "productos"]} />}
                  {tabValue === 2 && <DetPermPanel moduleNames={["pedidos", "reportes"]} />}
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
              {selectedRole && (
                <Button onClick={() => { handleCloseDetails(); handleOpen(selectedRole) }} sx={submitBtnSx}>
                  <Edit2 size={13} style={{ flexShrink: 0 }} /> Editar
                </Button>
              )}
            </DialogActions>
          </Dialog>

    </Box>
  )
}

export default RolesList
