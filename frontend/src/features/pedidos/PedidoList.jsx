import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment, Tooltip,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, XCircle,
  ArrowLeft, ArrowRight, Plus, ShoppingCart, FileText, User,
  Phone, MapPin, Mail, Clock, Package, AlertTriangle,
  CreditCard, ShieldCheck, ShieldAlert, Truck, RefreshCw,
} from "lucide-react"
import Swal from "sweetalert2"
import pedidosService from "./pedidos.service.js"
import productosService from "../productos/productos.service.js"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Warm Glassmorphism 3D (igual a Roles)
   ═══════════════════════════════════════════════════════════════ */
const T = {
  o1: "#FF6B35", o2: "#FF3D00", o3: "#FF8F5E", o4: "#FFF0EB",
  r1: "#EF4444", y1: "#F59E0B", green: "#22C55E", green2: "#BBF7D0",
  blue: "#3B82F6", purple: "#8B5CF6",
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

/* Estados y configuración visual */
const ESTADOS = {
  pendiente:       { label: "Pendiente",        color: T.y1,    bg: "rgba(245,158,11,0.12)",  icon: Clock },
  pago_verificado: { label: "Pago verificado",  color: T.blue,  bg: "rgba(59,130,246,0.12)",  icon: ShieldCheck },
  despachado:      { label: "Despachado",       color: T.purple,bg: "rgba(139,92,246,0.12)",  icon: Truck },
  entregado:       { label: "Entregado",        color: T.green, bg: "rgba(34,197,94,0.18)",   icon: CheckCircle },
  cancelado:       { label: "Cancelado",        color: T.r1,    bg: "rgba(239,68,68,0.12)",   icon: XCircle },
}

const METODOS_PAGO = [
  { value: "transferencia", label: "Transferencia" },
  { value: "nequi",         label: "Nequi" },
  { value: "daviplata",     label: "Daviplata" },
  { value: "bancolombia",   label: "Bancolombia" },
  { value: "efectivo",      label: "Efectivo" },
  { value: "otro",          label: "Otro" },
]

/* ═══════════════════════════════════════════════════════════════
   ANIMATION KEYFRAMES
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-ped-anims3d")) {
  const s = document.createElement("style"); s.id = "sa-ped-anims3d"
  s.textContent = `
    @keyframes sa-aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes sa-float1{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}25%{transform:translate(14px,-22px) scale(1.06) rotate(6deg)}50%{transform:translate(-10px,-38px) scale(0.96) rotate(-4deg)}75%{transform:translate(18px,-12px) scale(1.04) rotate(3deg)}}
    @keyframes sa-float2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-18px,14px) scale(1.1)}66%{transform:translate(14px,-12px) scale(0.94)}}
    @keyframes sa-float3{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-22px,-18px) rotate(180deg)}}
    @keyframes sa-breathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.07) translateY(-6px)}}
    @keyframes sa-glow-pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.75;transform:scale(1.18)}}
    @keyframes sa-border-glow{0%,100%{border-color:rgba(255,107,53,.15)}50%{border-color:rgba(255,107,53,.35)}}
    @keyframes sa-pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2);opacity:0}}
  `
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════════════════════════
   SWAL STYLE INJECTION
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-ped-swal")) {
  const s = document.createElement("style"); s.id = "sa-ped-swal"
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

const swalFire = (options) => Swal.fire({ ...options, allowOutsideClick: options.showCancelButton ? true : false })

/* ═══════════════════════════════════════════════════════════════
   REUSABLE STYLES
   ═══════════════════════════════════════════════════════════════ */
const glassCard = {
  background: "rgba(255,255,255,0.92)",
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
const btnVerify = {
  ...actionBtn, background: "rgba(59,130,246,0.10)", color: T.blue,
  boxShadow: "0 2px 10px rgba(59,130,246,0.10)",
  "&:hover": { ...actionBtn["&:hover"], background: "rgba(59,130,246,0.20)", boxShadow: "0 8px 24px rgba(59,130,246,.25)" },
}
const btnPay = {
  ...actionBtn, background: "rgba(245,158,11,0.10)", color: T.y1,
  boxShadow: "0 2px 10px rgba(245,158,11,0.10)",
  "&:hover": { ...actionBtn["&:hover"], background: "rgba(245,158,11,0.20)", boxShadow: "0 8px 24px rgba(245,158,11,.25)" },
}
const btnTruck = {
  ...actionBtn, background: "rgba(139,92,246,0.10)", color: T.purple,
  boxShadow: "0 2px 10px rgba(139,92,246,0.10)",
  "&:hover": { ...actionBtn["&:hover"], background: "rgba(139,92,246,0.20)", boxShadow: "0 8px 24px rgba(139,92,246,.25)" },
}

const cancelBtnSx = {
  fontFamily: `${T.font} !important`, fontWeight: "600 !important",
  color: `${T.t2} !important`, borderRadius: "16px !important",
  padding: "11px 26px !important", border: "1.5px solid rgba(0,0,0,0.06) !important",
  textTransform: "none !important", background: "rgba(255,255,255,0.75) !important",
  /* backdropFilter removed for perf */
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

const pageBtn = {
  width: 36, height: 36, borderRadius: "12px",
  background: "rgba(255,255,255,0.90)", color: T.t3,
  border: `1px solid ${T.border}`,
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
    borderRadius: "14px",
    fontFamily: T.font,
    fontSize: ".86rem",
    background: "rgba(255,255,255,0.85)",
    "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
    "&:hover fieldset": { borderColor: T.o1 },
    "&.Mui-focused fieldset": { borderColor: T.o1, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontFamily: T.font, color: T.t2, "&.Mui-focused": { color: T.o1 } },
}

/* ═══════════════════════════════════════════════════════════════
   3D DECORATIVE ELEMENTS
   ═══════════════════════════════════════════════════════════════ */
const CartIcon3D = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(255,107,53,0.35))" }}>
    <defs>
      <linearGradient id="pe3d" x1="8" y1="4" x2="56" y2="60">
        <stop offset="0%" stopColor="#FFB088" />
        <stop offset="40%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#E83D00" />
      </linearGradient>
      <linearGradient id="pe3dSpec" x1="20%" y1="0%" x2="70%" y2="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <radialGradient id="pe3dGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="rgba(255,200,160,0.4)" />
        <stop offset="100%" stopColor="rgba(255,107,53,0)" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <circle cx="32" cy="32" r="28" fill="url(#pe3d)" />
    <circle cx="32" cy="32" r="22" fill="url(#pe3dSpec)" />
    <circle cx="32" cy="34" r="20" fill="url(#pe3dGlow)" />
    <path d="M20 22h4l3 16h18l3-12H28" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="30" cy="46" r="2.6" fill="#fff" />
    <circle cx="42" cy="46" r="2.6" fill="#fff" />
  </svg>
)

/* GlassOrb removed — continuous CSS animations on fixed elements cause input lag */

const PieChart3D = ({ total, enProceso, completados, cancelados }) => {
  const t = total || 1
  const a = (enProceso / t) * 360
  const b = (completados / t) * 360
  const c = (cancelados / t) * 360
  return (
    <Box sx={{ position: "relative", width: 170, height: 145, flexShrink: 0 }}>
      <Box sx={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 110, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)" }} />
      <Box sx={{
        position: "absolute", top: 28, left: "50%",
        transform: "translateX(-50%) perspective(500px) rotateX(55deg) translateY(8px)",
        width: 120, height: 120, borderRadius: "50%",
        background: `conic-gradient(#D85A2A 0deg, #D85A2A ${a}deg, #16803B ${a}deg, #16803B ${a + b}deg, #9A1E1E ${a + b}deg, #9A1E1E ${a + b + c}deg, #C9A94E ${a + b + c}deg, #C9A94E 360deg)`,
        opacity: 0.35, filter: "blur(1px)",
      }} />
      <Box sx={{
        position: "absolute", top: 16, left: "50%",
        transform: "translateX(-50%) perspective(500px) rotateX(55deg)",
        width: 120, height: 120, borderRadius: "50%",
        background: `conic-gradient(#FF8F5E 0deg, #FF6B35 ${a}deg, #86EFAC ${a}deg, #22C55E ${a + b}deg, #FCA5A5 ${a + b}deg, #EF4444 ${a + b + c}deg, #FDE68A ${a + b + c}deg, #FEF3C7 360deg)`,
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
      <CartIcon3D />
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

/* ─── Extracted components (outside render = stable references) ─── */
const EstadoPill = ({ estado }) => {
  const cfg = ESTADOS[estado] || { label: estado, color: T.t2, bg: "rgba(0,0,0,0.06)", icon: Clock }
  const Icon = cfg.icon
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: "7px",
      padding: "6px 14px", borderRadius: "24px",
      fontFamily: T.font, fontSize: ".73rem", fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      boxShadow: `0 2px 8px ${cfg.color}22`,
    }}>
      <Icon size={13} /> {cfg.label}
    </Box>
  )
}

const DlgHdr = ({ icon, title, sub, onClose, gradient }) => (
  <Box sx={{
    background: gradient || T.go, p: "22px 28px", display: "flex", alignItems: "center", gap: "16px",
    position: "relative", overflow: "hidden",
  }}>
    <Box sx={{
      width: 44, height: 44, borderRadius: "14px", background: "rgba(255,255,255,.18)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.1)",
    }}>{icon}</Box>
    <Box sx={{ flex: 1, zIndex: 1 }}>
      <Typography sx={{ fontFamily: `${T.fontH} !important`, fontWeight: "800 !important", fontSize: "1.12rem !important", color: "#fff !important", lineHeight: 1.2 }}>{title}</Typography>
      <Typography sx={{ fontSize: ".76rem", color: "rgba(255,255,255,.8)", mt: "4px", fontFamily: T.font }}>{sub}</Typography>
    </Box>
    <button style={{
      width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.15)",
      border: "1px solid rgba(255,255,255,.12)",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", flexShrink: 0, transition: "all .25s",
    }} onClick={onClose}><X size={14} strokeWidth={2.5} /></button>
  </Box>
)

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
const PedidoList = () => {
  const [pedidos, setPedidos] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 8

  /* Dialogs */
  const [openForm, setOpenForm] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [openComprobante, setOpenComprobante] = useState(false)
  const [openVerificar, setOpenVerificar] = useState(false)
  const [current, setCurrent] = useState(null)
  const [editing, setEditing] = useState(false)

  const emptyForm = {
    cliente: { nombre: "", telefono: "", email: "", direccion: "" },
    items: [],
    descuento: 0,
    impuesto: 0,
    notas: "",
    fechaEntrega: "",
  }
  const [form, setForm] = useState(emptyForm)

  const emptyComprobante = {
    url: "", metodoPago: "transferencia", referencia: "", fechaEnvio: "",
  }
  const [comprobante, setComprobante] = useState(emptyComprobante)
  const [comprobanteFile, setComprobanteFile] = useState(null)
  const [comprobantePreview, setComprobantePreview] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [verifyForm, setVerifyForm] = useState({ aprobado: true, notas: "" })

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [peds, prods] = await Promise.all([
        pedidosService.getPedidos(),
        productosService.getProductos(),
      ])
      setPedidos(peds)
      setProductos(prods)
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: "No se pudieron cargar los pedidos" })
    } finally {
      setLoading(false)
    }
  }

  /* ─── Filtros ─── */
  const filtered = pedidos.filter((p) => {
    const q = search.trim().toLowerCase()
    const matchQ = !q ||
      p.numero?.toLowerCase().includes(q) ||
      p.cliente?.nombre?.toLowerCase().includes(q) ||
      p.cliente?.telefono?.includes(q)
    const matchE = !filterEstado || p.estado === filterEstado
    return matchQ && matchE
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage)

  /* Stats */
  const totalPedidos = pedidos.length
  const totalEntregados = pedidos.filter((p) => p.estado === "entregado").length
  const totalCancelados = pedidos.filter((p) => p.estado === "cancelado").length
  const totalEnProceso = pedidos.filter((p) => !["entregado", "cancelado"].includes(p.estado)).length
  const pctEntregados = totalPedidos > 0 ? Math.round((totalEntregados / totalPedidos) * 100) : 0
  const pctEnProceso = totalPedidos > 0 ? Math.round((totalEnProceso / totalPedidos) * 100) : 0

  /* ─── Form helpers ─── */
  const openNew = () => {
    setEditing(false)
    setCurrent(null)
    setForm(emptyForm)
    setOpenForm(true)
  }

  const openEdit = (p) => {
    setEditing(true)
    setCurrent(p)
    setForm({
      cliente: {
        nombre: p.cliente?.nombre || "",
        telefono: p.cliente?.telefono || "",
        email: p.cliente?.email || "",
        direccion: p.cliente?.direccion || "",
      },
      items: (p.detalles || []).map((d) => ({
        producto: d.producto?._id || d.producto,
        nombreProducto: d.nombreProducto,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
      })),
      descuento: p.descuento || 0,
      impuesto: p.impuesto || 0,
      notas: p.notas || "",
      fechaEntrega: p.fechaEntrega ? p.fechaEntrega.substring(0, 10) : "",
    })
    setOpenForm(true)
  }

  const openView = async (p) => {
    try {
      const full = await pedidosService.getPedidoById(p._id)
      setCurrent(full)
      setOpenDetail(true)
    } catch {
      swalFire({ icon: "error", title: "Error", text: "No se pudo cargar el pedido" })
    }
  }

  const openComprobanteDialog = (p) => {
    setCurrent(p)
    setComprobante({
      url: p.comprobantePago?.url || "",
      metodoPago: p.comprobantePago?.metodoPago || "transferencia",
      referencia: p.comprobantePago?.referencia || "",
      fechaEnvio: p.comprobantePago?.fechaEnvio ? p.comprobantePago.fechaEnvio.substring(0, 10) : "",
    })
    setComprobanteFile(null)
    setComprobantePreview("")
    setOpenComprobante(true)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setComprobanteFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setComprobantePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const openVerificarDialog = (p) => {
    setCurrent(p)
    setVerifyForm({ aprobado: true, notas: "" })
    setOpenVerificar(true)
  }

  const addItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { producto: "", nombreProducto: "", cantidad: 1, precioUnitario: 0 }] }))
  }

  const removeItem = (idx) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  const changeItem = (idx, field, value) => {
    setForm((f) => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [field]: value }
      if (field === "producto") {
        const p = productos.find((x) => x._id === value)
        if (p) {
          items[idx].nombreProducto = p.nombre
          items[idx].precioUnitario = p.precio
        }
      }
      return { ...f, items }
    })
  }

  const subtotalForm = form.items.reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0), 0)
  const totalForm = Math.max(0, subtotalForm - (Number(form.descuento) || 0) + (Number(form.impuesto) || 0))

  /* ─── Acciones ─── */
  const validateForm = () => {
    const { cliente, items } = form
    if (!cliente.nombre?.trim())    return "El nombre del cliente es obligatorio"
    if (!cliente.telefono?.trim())  return "El teléfono del cliente es obligatorio"
    if (!cliente.direccion?.trim()) return "La dirección de entrega es obligatoria"
    if (!editing && items.length === 0) return "Agrega al menos un producto"
    if (!editing) {
      for (const it of items) {
        if (!it.producto)                return "Selecciona un producto en todos los items"
        if (!it.cantidad || it.cantidad < 1) return "La cantidad debe ser al menos 1"
      }
    }
    return null
  }

  const save = async () => {
    const err = validateForm()
    if (err) return swalFire({ icon: "warning", title: "Datos incompletos", text: err })
    try {
      if (editing) {
        await pedidosService.updatePedido(current._id, {
          cliente: form.cliente,
          descuento: Number(form.descuento) || 0,
          impuesto: Number(form.impuesto) || 0,
          notas: form.notas,
          fechaEntrega: form.fechaEntrega || null,
        })
      } else {
        await pedidosService.createPedido({
          cliente: form.cliente,
          items: form.items.map((i) => ({
            producto: i.producto,
            cantidad: Number(i.cantidad),
            precioUnitario: Number(i.precioUnitario),
          })),
          descuento: Number(form.descuento) || 0,
          impuesto: Number(form.impuesto) || 0,
          notas: form.notas,
          fechaEntrega: form.fechaEntrega || null,
        })
      }
      setOpenForm(false)
      await loadAll()
      swalFire({ icon: "success", title: editing ? "Pedido actualizado" : "Pedido creado", timer: 1400, showConfirmButton: false })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo guardar el pedido" })
    }
  }

  const remove = async (p) => {
    const res = await swalFire({
      icon: "warning", title: "¿Eliminar pedido?",
      text: `Se eliminará el pedido ${p.numero} y sus detalles.`,
      showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    })
    if (!res.isConfirmed) return
    try {
      await pedidosService.deletePedido(p._id)
      await loadAll()
      swalFire({ icon: "success", title: "Eliminado", timer: 1200, showConfirmButton: false })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo eliminar" })
    }
  }

  const saveComprobante = async () => {
    if (!comprobanteFile && !comprobante.url?.trim()) {
      return swalFire({ icon: "warning", title: "Comprobante requerido", text: "Selecciona una imagen del comprobante de pago" })
    }
    setUploading(true)
    try {
      let url = comprobante.url
      if (comprobanteFile) {
        const uploadRes = await pedidosService.uploadComprobante(current._id, comprobanteFile)
        url = uploadRes.url
      }
      await pedidosService.registrarComprobante(current._id, { ...comprobante, url })
      setOpenComprobante(false)
      setComprobanteFile(null)
      setComprobantePreview("")
      await loadAll()
      swalFire({ icon: "success", title: "Comprobante registrado", text: "Ahora debe ser revisado para confirmar el pedido", timer: 1800, showConfirmButton: false })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo registrar el comprobante" })
    } finally {
      setUploading(false)
    }
  }

  const verificar = async () => {
    try {
      await pedidosService.verificarComprobante(current._id, verifyForm.aprobado, verifyForm.notas)
      setOpenVerificar(false)
      await loadAll()
      swalFire({
        icon: verifyForm.aprobado ? "success" : "info",
        title: verifyForm.aprobado ? "Comprobante aprobado" : "Comprobante rechazado",
        text: verifyForm.aprobado
          ? "El pedido pasó a estado CONFIRMADO"
          : "El pedido volvió a pendiente de pago",
        timer: 1800, showConfirmButton: false,
      })
    } catch (e) {
      swalFire({ icon: "error", title: "No se pudo verificar", text: e.response?.data?.msg || "Error al verificar el comprobante" })
    }
  }

  const avanzarEstado = async (p, nuevoEstado) => {
    const label = ESTADOS[nuevoEstado]?.label || nuevoEstado
    const res = await swalFire({
      icon: "question", title: `¿Cambiar estado a "${label}"?`,
      showCancelButton: true, confirmButtonText: "Sí, cambiar", cancelButtonText: "Cancelar",
    })
    if (!res.isConfirmed) return
    try {
      await pedidosService.cambiarEstado(p._id, nuevoEstado)
      await loadAll()
      swalFire({ icon: "success", title: "Estado actualizado", timer: 1200, showConfirmButton: false })
    } catch (e) {
      swalFire({ icon: "error", title: "No permitido", text: e.response?.data?.msg || "No se pudo cambiar el estado" })
    }
  }

  const siguienteEstado = (estado) => {
    const map = {
      pago_verificado: "despachado",
      despachado:      "entregado",
    }
    return map[estado]
  }

  /* ─── Dialog Header ─── */
  /* DlgHdr moved outside component for performance */

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative", minHeight: "calc(100vh - 100px)" }}>

      {/* Animated backgrounds and glass orbs removed for performance */}

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
            <CartIcon3D />
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
              Gestión de Pedidos
            </Typography>
            <Typography sx={{ fontSize: ".88rem", color: T.t3, mt: "6px", fontFamily: T.font }}>
              Administra los pedidos y verifica los comprobantes de pago
            </Typography>
          </Box>
        </Box>

        <Box sx={{ zIndex: 1 }}>
          <PieChart3D total={totalPedidos} enProceso={totalEnProceso} completados={totalEntregados} cancelados={totalCancelados} />
        </Box>
      </MotionBox>

      {/* ═══ STATS CARDS ═══ */}
      <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", mb: "22px" }}>
        {[
          { label: "TOTAL",       value: totalPedidos,     desc: "registrados",  color: T.o1,     icon: <ShoppingCart size={18} /> },
          { label: "EN PROCESO",  value: totalEnProceso,   desc: "activos",      color: T.blue,   icon: <Package size={18} /> },
          { label: "ENTREGADOS",  value: totalEntregados,  desc: "completados",  color: T.green,  icon: <CheckCircle size={18} /> },
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
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.green, boxShadow: `0 2px 8px ${T.green}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>Entregados</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>{pctEntregados} %</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.blue, boxShadow: `0 2px 8px ${T.blue}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>En proceso</Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>{pctEnProceso} %</Typography>
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
          <input
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%" }}
            placeholder="Buscar por número, cliente o teléfono..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </Box>
        <TextField
          select size="small"
          value={filterEstado}
          onChange={(e) => { setFilterEstado(e.target.value); setPage(1) }}
          sx={{ ...fieldSx, minWidth: 210 }}
        >
          <MenuItem value="">Todos los estados</MenuItem>
          {Object.entries(ESTADOS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v.label}</MenuItem>
          ))}
        </TextField>
        <Tooltip title="Recargar">
          <Button onClick={loadAll} sx={{ ...cancelBtnSx, minWidth: 46, p: "11px 16px !important" }}>
            <RefreshCw size={16} />
          </Button>
        </Tooltip>
        <motion.button
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
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
          <Plus size={16} strokeWidth={2.5} /> Nuevo Pedido
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
        {pageItems.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1.2fr 1.1fr 1fr 190px", px: "26px", py: "16px", gap: "8px" }}>
            {["N°", "CLIENTE", "TOTAL", "COMPROBANTE", "ESTADO", "FECHA", "ACCIONES"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.4px", textTransform: "uppercase", color: T.t4,
                ...(h === "ACCIONES" ? { textAlign: "center" } : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        {/* Rows */}
        <AnimatePresence mode="wait">
          <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "flex", flexDirection: "column", gap: "8px", p: pageItems.length > 0 ? "0 8px 8px" : "0" }}>
            {loading && (
              <Box sx={{ textAlign: "center", py: 6, color: T.t3, fontFamily: T.font }}>Cargando pedidos...</Box>
            )}

            {!loading && pageItems.map((p) => {
              const cp = p.comprobantePago || {}
              const hasComprobante = !!cp.url
              const verificado = !!cp.verificado
              const sigEst = siguienteEstado(p.estado)
              return (
                <MotionBox key={p._id} variants={itemV}
                  whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  sx={{
                    display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1.2fr 1.1fr 1fr 190px",
                    gap: "8px", alignItems: "center", p: "18px 22px",
                    borderRadius: "18px",
                    background: "rgba(255,255,255,0.68)",
                    /* backdropFilter removed for performance */
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)",
                    cursor: "default",
                    transition: "background .3s, border-color .3s",
                    "&:hover": { borderColor: "rgba(255,107,53,0.12)", background: "rgba(255,255,255,0.82)" },
                  }}>
                  {/* Número */}
                  <Box>
                    <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, fontSize: ".95rem", color: T.o1, lineHeight: 1.2 }}>
                      {p.numero}
                    </Typography>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4 }}>
                      #{p._id?.slice(-6).toUpperCase()}
                    </Typography>
                  </Box>

                  {/* Cliente */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, background: T.go,
                      fontFamily: T.font, fontWeight: 800, fontSize: ".78rem", color: "#fff",
                      boxShadow: "0 6px 18px rgba(0,0,0,.15), inset 0 -2px 4px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.25)",
                    }}>
                      {(p.cliente?.nombre || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".86rem", color: T.t1, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.cliente?.nombre}
                      </Typography>
                      <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", color: T.t3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.cliente?.telefono}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Total */}
                  <Typography sx={{ fontFamily: T.font, fontWeight: 800, fontSize: ".90rem", color: T.t1 }}>
                    ${(p.total || 0).toLocaleString("es-CO")}
                  </Typography>

                  {/* Comprobante */}
                  <Box>
                    {!hasComprobante && (
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "10px", py: "5px", borderRadius: "20px", background: "rgba(245,158,11,0.12)", color: T.y1, fontFamily: T.font, fontSize: ".72rem", fontWeight: 700 }}>
                        <Clock size={11} /> Sin enviar
                      </Box>
                    )}
                    {hasComprobante && !verificado && (
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "10px", py: "5px", borderRadius: "20px", background: "rgba(59,130,246,0.12)", color: T.blue, fontFamily: T.font, fontSize: ".72rem", fontWeight: 700 }}>
                        <FileText size={11} /> Por revisar
                      </Box>
                    )}
                    {hasComprobante && verificado && (
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "10px", py: "5px", borderRadius: "20px", background: "rgba(34,197,94,0.14)", color: T.green, fontFamily: T.font, fontSize: ".72rem", fontWeight: 700 }}>
                        <ShieldCheck size={11} /> Verificado
                      </Box>
                    )}
                  </Box>

                  {/* Estado */}
                  <Box><EstadoPill estado={p.estado} /></Box>

                  {/* Fecha */}
                  <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t2 }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-CO") : "-"}
                  </Typography>

                  {/* Acciones */}
                  <Box sx={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                    <Tooltip title="Ver detalle" placement="top">
                      <Button sx={btnView} onClick={() => openView(p)}><Eye size={15} strokeWidth={2} /></Button>
                    </Tooltip>
                    {p.estado === "pendiente" && (
                      <Tooltip title="Registrar comprobante" placement="top">
                        <Button sx={btnPay} onClick={() => openComprobanteDialog(p)}><CreditCard size={15} strokeWidth={2} /></Button>
                      </Tooltip>
                    )}
                    {p.estado === "pendiente" && hasComprobante && !verificado && (
                      <Tooltip title="Verificar comprobante" placement="top">
                        <Button sx={btnVerify} onClick={() => openVerificarDialog(p)}><ShieldCheck size={15} strokeWidth={2} /></Button>
                      </Tooltip>
                    )}
                    {sigEst && (
                      <Tooltip title={`Avanzar a ${ESTADOS[sigEst].label}`} placement="top">
                        <Button sx={btnTruck} onClick={() => avanzarEstado(p, sigEst)}><Truck size={15} strokeWidth={2} /></Button>
                      </Tooltip>
                    )}
                    {!["entregado", "cancelado"].includes(p.estado) && (
                      <Tooltip title="Editar" placement="top">
                        <Button sx={btnEdit} onClick={() => openEdit(p)}><Edit2 size={15} strokeWidth={2} /></Button>
                      </Tooltip>
                    )}
                    <Tooltip title="Eliminar" placement="top">
                      <Button sx={btnDel} onClick={() => remove(p)}><Trash2 size={15} strokeWidth={2} /></Button>
                    </Tooltip>
                  </Box>
                </MotionBox>
              )
            })}
          </MotionBox>
        </AnimatePresence>

        {/* Empty state */}
        {!loading && pageItems.length === 0 && (
          <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
            borderRadius: T.rad, p: "50px 20px 60px", textAlign: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,248,245,0.7) 100%)",
          }}>
            <EmptyIllustration />
            <Typography sx={{ fontFamily: T.fontH, fontSize: "1.20rem", fontWeight: 800, color: T.t1, mb: "10px" }}>
              {pedidos.length === 0 ? "No hay pedidos registrados" : "Sin resultados"}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t3, maxWidth: 380, mx: "auto", mb: "24px", lineHeight: 1.6 }}>
              {pedidos.length === 0
                ? "Crea un nuevo pedido para comenzar a gestionar las ventas del sistema"
                : "No se encontraron pedidos que coincidan con los filtros aplicados."}
            </Typography>
            {pedidos.length === 0 && (
              <motion.button
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={openNew}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 9,
                  background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
                  color: "#fff", fontFamily: T.font, fontWeight: 700,
                  fontSize: ".85rem", padding: "13px 28px", borderRadius: 16,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 8px 28px rgba(255,107,53,.30)",
                }}>
                <Plus size={16} strokeWidth={2.5} /> Crear Pedido
              </motion.button>
            )}
          </MotionBox>
        )}
      </MotionBox>

      {/* ═══ PAGINATION ═══ */}
      {!loading && pageItems.length > 0 && (
        <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "10px",
        }}>
          <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
            Mostrando {filtered.length === 0 ? 0 : (pageSafe - 1) * perPage + 1}–{Math.min(pageSafe * perPage, filtered.length)} de {filtered.length} pedidos
          </Typography>
          <Box sx={{ display: "flex", gap: "6px" }}>
            <Button sx={pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageSafe === 1} style={{ opacity: pageSafe === 1 ? .35 : 1 }}><ArrowLeft size={14} /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button key={n} sx={n === pageSafe ? pageBtnOn : pageBtn} onClick={() => setPage(n)}>{n}</Button>
            ))}
            <Button sx={pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={pageSafe >= totalPages} style={{ opacity: pageSafe >= totalPages ? .35 : 1 }}><ArrowRight size={14} /></Button>
          </Box>
        </MotionBox>
      )}

      {/* ═══ MODAL CREAR / EDITAR ═══ */}
      <Dialog key={editing ? current?._id : "new"} open={openForm} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") setOpenForm(false) }}
            fullWidth maxWidth="md"
            sx={{ "& .MuiBackdrop-root": { background: "rgba(15,23,42,.22)" } }}
            slotProps={{ paper: { sx: {
              borderRadius: "24px !important",
              boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
              border: "1px solid rgba(255,255,255,0.20)",
              width: "94%",
              background: "rgba(255,255,255,0.92) !important",
              /* backdropFilter removed for performance */
              overflow: "hidden",
            } } }}>
            <DlgHdr
              icon={<ShoppingCart size={18} color="#fff" />}
              title={editing ? `Editar pedido ${current?.numero || ""}` : "Crear Nuevo Pedido"}
              sub={editing ? "Modifica los datos del pedido seleccionado" : "Completa los campos para registrar un nuevo pedido"}
              onClose={() => setOpenForm(false)}
            />

            <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
              <Box sx={{
                display: "flex", alignItems: "center", gap: "10px",
                fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
                color: T.t1, mb: "14px", pb: "10px",
                borderBottom: "1.5px solid rgba(0,0,0,0.05)",
              }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)", boxShadow: "0 3px 8px rgba(255,107,53,0.08)" }}>
                  <User size={13} color={T.o1} />
                </Box>
                Datos del cliente
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
                <TextField label="Nombre *" sx={fieldSx} size="small"
                  value={form.cliente.nombre}
                  onChange={(e) => setForm({ ...form, cliente: { ...form.cliente, nombre: e.target.value } })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><User size={15} color={T.t3} /></InputAdornment> }} />
                <TextField label="Teléfono *" sx={fieldSx} size="small"
                  value={form.cliente.telefono}
                  onChange={(e) => setForm({ ...form, cliente: { ...form.cliente, telefono: e.target.value } })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={15} color={T.t3} /></InputAdornment> }} />
                <TextField label="Email" sx={fieldSx} size="small"
                  value={form.cliente.email}
                  onChange={(e) => setForm({ ...form, cliente: { ...form.cliente, email: e.target.value } })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={15} color={T.t3} /></InputAdornment> }} />
                <TextField label="Dirección de entrega *" sx={fieldSx} size="small"
                  value={form.cliente.direccion}
                  onChange={(e) => setForm({ ...form, cliente: { ...form.cliente, direccion: e.target.value } })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={15} color={T.t3} /></InputAdornment> }} />
              </Box>

              {!editing && (
                <>
                  <Box sx={{
                    display: "flex", alignItems: "center", gap: "10px",
                    fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
                    color: T.t1, mb: "14px", pb: "10px",
                    borderBottom: "1.5px solid rgba(0,0,0,0.05)",
                  }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)", boxShadow: "0 3px 8px rgba(255,107,53,0.08)" }}>
                      <Package size={13} color={T.o1} />
                    </Box>
                    Productos
                    <Button onClick={addItem} sx={{ ml: "auto", fontFamily: `${T.font} !important`, fontWeight: "700 !important", fontSize: ".72rem !important", color: `${T.o1} !important`, background: "rgba(255,107,53,.08) !important", border: `1px solid ${T.border2} !important`, borderRadius: "50px !important", padding: "4px 14px !important", textTransform: "none !important" }} startIcon={<Plus size={13} />}>
                      Agregar
                    </Button>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    {form.items.length === 0 && (
                      <Box sx={{ textAlign: "center", py: 3, color: T.t3, border: `1.5px dashed rgba(0,0,0,0.08)`, borderRadius: T.rad2, background: "rgba(255,255,255,0.5)", fontFamily: T.font, fontSize: ".86rem" }}>
                        Agrega productos al pedido
                      </Box>
                    )}
                    {form.items.map((it, i) => (
                      <Box key={i} sx={{
                        display: "grid", gridTemplateColumns: "2fr 90px 130px 40px", gap: 1, mb: 1.2,
                        p: "10px", borderRadius: "14px",
                        background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.04)",
                      }}>
                        <TextField select size="small" sx={fieldSx} value={it.producto}
                          onChange={(e) => changeItem(i, "producto", e.target.value)}>
                          <MenuItem value="">Selecciona producto</MenuItem>
                          {productos.map((p) => (
                            <MenuItem key={p._id} value={p._id}>{p.nombre} — ${p.precio}</MenuItem>
                          ))}
                        </TextField>
                        <TextField type="number" size="small" sx={fieldSx} label="Cant."
                          value={it.cantidad}
                          onChange={(e) => changeItem(i, "cantidad", e.target.value)}
                          inputProps={{ min: 1 }} />
                        <TextField type="number" size="small" sx={fieldSx} label="Precio"
                          value={it.precioUnitario}
                          onChange={(e) => changeItem(i, "precioUnitario", e.target.value)}
                          inputProps={{ min: 0, step: "0.01" }} />
                        <Button sx={btnDel} onClick={() => removeItem(i)}><X size={16} /></Button>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
                <TextField label="Descuento" type="number" size="small" sx={fieldSx}
                  value={form.descuento}
                  onChange={(e) => setForm({ ...form, descuento: e.target.value })} />
                <TextField label="Impuesto" type="number" size="small" sx={fieldSx}
                  value={form.impuesto}
                  onChange={(e) => setForm({ ...form, impuesto: e.target.value })} />
                <TextField label="Fecha entrega" type="date" size="small" sx={fieldSx}
                  InputLabelProps={{ shrink: true }}
                  value={form.fechaEntrega}
                  onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })} />
              </Box>

              <TextField label="Notas" size="small" fullWidth multiline rows={2} sx={{ ...fieldSx, mb: 2 }}
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })} />

              {!editing && (
                <Box sx={{
                  p: 2, ...glassCard, borderRadius: T.rad2,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <Typography sx={{ fontFamily: T.font, color: T.t2 }}>Subtotal: <b>${subtotalForm.toLocaleString("es-CO")}</b></Typography>
                  <Typography sx={{ fontFamily: T.fontH, fontWeight: 900, fontSize: "1.3rem", color: T.o1 }}>
                    Total: ${totalForm.toLocaleString("es-CO")}
                  </Typography>
                </Box>
              )}

              <Box sx={{
                mt: 2, p: 1.5, borderRadius: T.rad2,
                background: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.25)`,
                display: "flex", gap: 1, alignItems: "flex-start",
              }}>
                <AlertTriangle size={18} color={T.y1} style={{ flexShrink: 0, marginTop: 2 }} />
                <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>
                  El pedido iniciará en estado <b>"Pendiente"</b>. No pasará a <b>"Pago verificado"</b> hasta que el administrador registre y apruebe el comprobante de pago.
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{
              p: "14px 26px 22px !important", background: "transparent",
              borderTop: "1px solid rgba(0,0,0,0.04)",
              display: "flex", justifyContent: "flex-end", gap: "10px",
            }}>
              <Button onClick={() => setOpenForm(false)} sx={cancelBtnSx}>Cancelar</Button>
              <Button onClick={save} sx={submitBtnSx}>
                <CheckCircle size={14} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                {editing ? "Actualizar" : "Crear Pedido"}
              </Button>
            </DialogActions>
          </Dialog>

      {/* ═══ MODAL DETALLE ═══ */}
      <Dialog open={openDetail} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") setOpenDetail(false) }}
            fullWidth maxWidth="md"
            sx={{ "& .MuiBackdrop-root": { background: "rgba(15,23,42,.22)" } }}
            slotProps={{ paper: { sx: {
              borderRadius: "24px !important",
              boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
              border: "1px solid rgba(255,255,255,0.20)",
              width: "94%",
              background: "rgba(255,255,255,0.92) !important",
              /* backdropFilter removed for performance */
              overflow: "hidden",
            } } }}>
            {current && (
              <>
                <DlgHdr
                  icon={<Eye size={18} color="#fff" />}
                  title={`Pedido ${current.numero}`}
                  sub={current.createdAt ? `Creado el ${new Date(current.createdAt).toLocaleString("es-CO")}` : "Detalle del pedido"}
                  onClose={() => setOpenDetail(false)}
                />
                <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
                  <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <EstadoPill estado={current.estado} />
                    {current.comprobantePago?.verificado && (
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "12px", py: "6px", borderRadius: "24px", background: "rgba(34,197,94,0.14)", color: T.green, fontFamily: T.font, fontSize: ".73rem", fontWeight: 700 }}>
                        <ShieldCheck size={12} /> Comprobante verificado
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
                    <Box sx={{ ...glassCard, borderRadius: T.rad2, p: 2 }}>
                      <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Cliente</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: .5, color: T.t1 }}><User size={14} color={T.t3} /> {current.cliente?.nombre}</Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: .5, color: T.t2 }}><Phone size={14} color={T.t3} /> {current.cliente?.telefono}</Box>
                      {current.cliente?.email && <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: .5, color: T.t2 }}><Mail size={14} color={T.t3} /> {current.cliente.email}</Box>}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: T.t2 }}><MapPin size={14} color={T.t3} /> {current.cliente?.direccion}</Box>
                    </Box>
                    <Box sx={{ ...glassCard, borderRadius: T.rad2, p: 2 }}>
                      <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Comprobante de pago</Typography>
                      {current.comprobantePago?.url ? (
                        <>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: .5, color: T.t1 }}>
                            <CreditCard size={14} color={T.t3} /> {METODOS_PAGO.find((m) => m.value === current.comprobantePago.metodoPago)?.label || current.comprobantePago.metodoPago}
                          </Box>
                          {current.comprobantePago.referencia && <Box sx={{ mb: .5, color: T.t2, fontSize: ".85rem" }}>Ref: {current.comprobantePago.referencia}</Box>}
                          <a href={current.comprobantePago.url} target="_blank" rel="noreferrer" style={{ color: T.o1, fontWeight: 700, fontFamily: T.font }}>Ver imagen/enlace</a>
                          {current.comprobantePago.notasVerificacion && (
                            <Typography sx={{ mt: 1, fontFamily: T.font, fontSize: ".8rem", color: T.t2 }}>
                              <b>Notas verificación:</b> {current.comprobantePago.notasVerificacion}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography sx={{ color: T.t3, fontFamily: T.font, fontSize: ".85rem" }}>Aún no se ha registrado el comprobante</Typography>
                      )}
                    </Box>
                  </Box>

                  <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, mb: 1 }}>Productos</Typography>
                  <Box sx={{ ...glassCard, borderRadius: T.rad2, overflow: "hidden", mb: 2 }}>
                    <Box component="table" sx={{
                      width: "100%", borderCollapse: "collapse",
                      "& th, & td": { padding: "10px 14px", fontSize: ".86rem", textAlign: "left", fontFamily: T.font },
                      "& th": { background: "rgba(255,107,53,0.06)", color: T.t2, fontWeight: 700, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".04em" },
                      "& td": { borderTop: `1px solid rgba(0,0,0,0.04)`, color: T.t1 },
                    }}>
                      <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                      <tbody>
                        {(current.detalles || []).map((d) => (
                          <tr key={d._id}>
                            <td>{d.nombreProducto}</td>
                            <td><b>{d.cantidad}</b></td>
                            <td>${(d.precioUnitario || 0).toLocaleString("es-CO")}</td>
                            <td style={{ fontWeight: 700, color: T.o1 }}>${(d.subtotal || 0).toLocaleString("es-CO")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box sx={{ minWidth: 260, p: 2, ...glassCard, borderRadius: T.rad2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", fontFamily: T.font, color: T.t2 }}>Subtotal: <b>${(current.subtotal || 0).toLocaleString("es-CO")}</b></Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", fontFamily: T.font, color: T.t2 }}>Descuento: <b>-${(current.descuento || 0).toLocaleString("es-CO")}</b></Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", fontFamily: T.font, color: T.t2 }}>Impuesto: <b>${(current.impuesto || 0).toLocaleString("es-CO")}</b></Box>
                      <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", fontFamily: T.fontH, fontWeight: 900, fontSize: "1.2rem", color: T.o1 }}>
                        Total: ${(current.total || 0).toLocaleString("es-CO")}
                      </Box>
                    </Box>
                  </Box>

                  {current.historialEstados?.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, mb: 1 }}>Historial de estados</Typography>
                      <Box sx={{ borderLeft: `2px solid ${T.border2}`, pl: 2 }}>
                        {current.historialEstados.map((h, i) => (
                          <Box key={i} sx={{ mb: 1.5, position: "relative" }}>
                            <Box sx={{ position: "absolute", left: -22, top: 6, width: 10, height: 10, borderRadius: "50%", background: T.o1, boxShadow: `0 0 8px ${T.o1}66` }} />
                            <EstadoPill estado={h.estado} />
                            <Typography sx={{ fontFamily: T.font, fontSize: ".78rem", color: T.t3, mt: .3 }}>
                              {new Date(h.fecha).toLocaleString("es-CO")}
                            </Typography>
                            {h.nota && <Typography sx={{ fontFamily: T.font, fontSize: ".85rem", color: T.t2, mt: .2 }}>{h.nota}</Typography>}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </DialogContent>

                <DialogActions sx={{
                  p: "14px 26px 22px !important", background: "transparent",
                  borderTop: "1px solid rgba(0,0,0,0.04)",
                }}>
                  <Button onClick={() => setOpenDetail(false)} sx={cancelBtnSx}>Cerrar</Button>
                </DialogActions>
              </>
            )}
          </Dialog>

      {/* ═══ MODAL COMPROBANTE ═══ */}
      <Dialog open={openComprobante} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") setOpenComprobante(false) }}
            fullWidth maxWidth="sm"
            sx={{ "& .MuiBackdrop-root": { background: "rgba(15,23,42,.22)" } }}
            slotProps={{ paper: { sx: {
              borderRadius: "24px !important",
              boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
              border: "1px solid rgba(255,255,255,0.20)",
              width: "92%", maxWidth: 540,
              background: "rgba(255,255,255,0.92) !important",
              /* backdropFilter removed for performance */
              overflow: "hidden",
            } } }}>
            <DlgHdr
              icon={<CreditCard size={18} color="#fff" />}
              title="Registrar comprobante de pago"
              sub="Registra el comprobante enviado por el cliente"
              onClose={() => setOpenComprobante(false)}
              gradient={`linear-gradient(135deg, ${T.y1} 0%, ${T.o1} 100%)`}
            />
            <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
              <Typography sx={{ fontFamily: T.font, fontSize: ".86rem", color: T.t2, mb: 2 }}>
                Sube la imagen del comprobante que el cliente envió por WhatsApp. El pedido quedará marcado para revisión.
              </Typography>

              {/* Upload de imagen */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  mb: 2, p: 3, borderRadius: "16px",
                  border: comprobantePreview ? `2px solid ${T.green}` : "2px dashed rgba(255,107,53,0.25)",
                  background: comprobantePreview ? "rgba(34,197,94,0.04)" : "rgba(255,107,53,0.03)",
                  cursor: "pointer", textAlign: "center",
                  transition: "all .25s",
                  "&:hover": { borderColor: T.o1, background: "rgba(255,107,53,0.06)" },
                }}
              >
                {comprobantePreview ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                    <Box
                      component="img"
                      src={comprobantePreview}
                      alt="Vista previa"
                      sx={{ maxWidth: 220, maxHeight: 160, borderRadius: "12px", objectFit: "cover", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
                    />
                    <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.green, fontWeight: 700 }}>
                      {comprobanteFile?.name}
                    </Typography>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", color: T.t3 }}>
                      Click para cambiar la imagen
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,107,53,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CreditCard size={24} color={T.o1} />
                    </Box>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", fontWeight: 700, color: T.t1 }}>
                      Subir comprobante de pago
                    </Typography>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", color: T.t3 }}>
                      Arrastra o haz click para seleccionar la imagen (JPG, PNG, PDF - Max 5MB)
                    </Typography>
                  </Box>
                )}
              </Box>
              <TextField select label="Método de pago" size="small" fullWidth sx={{ ...fieldSx, mb: 2 }}
                value={comprobante.metodoPago}
                onChange={(e) => setComprobante({ ...comprobante, metodoPago: e.target.value })}>
                {METODOS_PAGO.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </TextField>
              <TextField label="Número de referencia" size="small" fullWidth sx={{ ...fieldSx, mb: 2 }}
                value={comprobante.referencia}
                onChange={(e) => setComprobante({ ...comprobante, referencia: e.target.value })} />
              <TextField label="Fecha de envío" type="date" size="small" fullWidth sx={fieldSx}
                InputLabelProps={{ shrink: true }}
                value={comprobante.fechaEnvio}
                onChange={(e) => setComprobante({ ...comprobante, fechaEnvio: e.target.value })} />
            </DialogContent>
            <DialogActions sx={{
              p: "14px 26px 22px !important", background: "transparent",
              borderTop: "1px solid rgba(0,0,0,0.04)",
              display: "flex", justifyContent: "flex-end", gap: "10px",
            }}>
              <Button onClick={() => setOpenComprobante(false)} disabled={uploading} sx={cancelBtnSx}>Cancelar</Button>
              <Button onClick={saveComprobante} disabled={uploading} sx={submitBtnSx}>
                {uploading ? "Subiendo..." : "Registrar"}
              </Button>
            </DialogActions>
          </Dialog>

      {/* ═══ MODAL VERIFICAR ═══ */}
      <Dialog open={openVerificar} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") setOpenVerificar(false) }}
            fullWidth maxWidth="sm"
            sx={{ "& .MuiBackdrop-root": { background: "rgba(15,23,42,.22)" } }}
            slotProps={{ paper: { sx: {
              borderRadius: "24px !important",
              boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
              border: "1px solid rgba(255,255,255,0.20)",
              width: "92%", maxWidth: 540,
              background: "rgba(255,255,255,0.92) !important",
              /* backdropFilter removed for performance */
              overflow: "hidden",
            } } }}>
            <DlgHdr
              icon={<ShieldCheck size={18} color="#fff" />}
              title="Verificar comprobante"
              sub="Aprueba o rechaza el comprobante de pago"
              onClose={() => setOpenVerificar(false)}
              gradient={`linear-gradient(135deg, ${T.blue} 0%, ${T.purple} 100%)`}
            />
            <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
              {current?.comprobantePago?.url && (
                <Box sx={{ mb: 2, p: 2, ...glassCard, borderRadius: T.rad2 }}>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".85rem", color: T.t2, mb: .5 }}>Comprobante enviado:</Typography>
                  <a href={current.comprobantePago.url} target="_blank" rel="noreferrer" style={{ color: T.o1, fontWeight: 700, wordBreak: "break-all", fontFamily: T.font }}>
                    {current.comprobantePago.url}
                  </a>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t3, mt: .5 }}>
                    Método: {METODOS_PAGO.find((m) => m.value === current.comprobantePago.metodoPago)?.label}
                    {current.comprobantePago.referencia && ` · Ref: ${current.comprobantePago.referencia}`}
                  </Typography>
                </Box>
              )}

              <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.t1, mb: 1.5 }}>Decisión</Typography>
              <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                <Button
                  onClick={() => setVerifyForm({ ...verifyForm, aprobado: true })}
                  sx={{
                    flex: 1, p: 2, borderRadius: T.rad2, textTransform: "none", fontFamily: T.font, fontWeight: 700,
                    background: verifyForm.aprobado ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.55)",
                    color: verifyForm.aprobado ? T.green : T.t2,
                    border: `1.5px solid ${verifyForm.aprobado ? T.green : "rgba(0,0,0,0.08)"}`,
                    display: "flex", flexDirection: "column", gap: .5,
                  }}>
                  <CheckCircle size={22} /> Aprobar<Box component="span" sx={{ fontSize: ".72rem", fontWeight: 500, display: "block" }}>Pedido → Confirmado</Box>
                </Button>
                <Button
                  onClick={() => setVerifyForm({ ...verifyForm, aprobado: false })}
                  sx={{
                    flex: 1, p: 2, borderRadius: T.rad2, textTransform: "none", fontFamily: T.font, fontWeight: 700,
                    background: !verifyForm.aprobado ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.55)",
                    color: !verifyForm.aprobado ? T.r1 : T.t2,
                    border: `1.5px solid ${!verifyForm.aprobado ? T.r1 : "rgba(0,0,0,0.08)"}`,
                    display: "flex", flexDirection: "column", gap: .5,
                  }}>
                  <ShieldAlert size={22} /> Rechazar<Box component="span" sx={{ fontSize: ".72rem", fontWeight: 500, display: "block" }}>Vuelve a Pendiente</Box>
                </Button>
              </Box>

              <TextField label="Notas de verificación" size="small" fullWidth multiline rows={3} sx={fieldSx}
                value={verifyForm.notas}
                onChange={(e) => setVerifyForm({ ...verifyForm, notas: e.target.value })}
                placeholder={verifyForm.aprobado ? "Ej: Pago confirmado por transferencia Bancolombia" : "Indica por qué se rechaza"} />
            </DialogContent>
            <DialogActions sx={{
              p: "14px 26px 22px !important", background: "transparent",
              borderTop: "1px solid rgba(0,0,0,0.04)",
              display: "flex", justifyContent: "flex-end", gap: "10px",
            }}>
              <Button onClick={() => setOpenVerificar(false)} sx={cancelBtnSx}>Cancelar</Button>
              <Button onClick={verificar} sx={submitBtnSx}>
                {verifyForm.aprobado ? "Aprobar y confirmar" : "Rechazar"}
              </Button>
            </DialogActions>
          </Dialog>
    </Box>
  )
}

export default PedidoList
export { PedidoList }
