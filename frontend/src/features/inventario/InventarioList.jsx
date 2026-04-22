import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment,
} from "@mui/material"
import {
  Search, RefreshCw, TrendingUp, TrendingDown,
  Package, ArrowLeft, ArrowRight, Calendar, Plus,
  AlertTriangle, CheckCircle, XCircle, X, Layers,
  Check as CheckIcon, FileText, Truck,
} from "lucide-react"
import Swal from "sweetalert2"
import inventarioService from "./inventario.service.js"
import productosService from "../productos/productos.service.js"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Warm Glassmorphism 3D
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

/* ═══════════════════════════════════════════════════════════════
   ANIMATION KEYFRAMES
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-inv-anims3d")) {
  const s = document.createElement("style"); s.id = "sa-inv-anims3d"
  s.textContent = `
    @keyframes sa-aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes sa-float1{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}25%{transform:translate(14px,-22px) scale(1.06) rotate(6deg)}50%{transform:translate(-10px,-38px) scale(0.96) rotate(-4deg)}75%{transform:translate(18px,-12px) scale(1.04) rotate(3deg)}}
    @keyframes sa-float2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-18px,14px) scale(1.1)}66%{transform:translate(14px,-12px) scale(0.94)}}
    @keyframes sa-float3{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-22px,-18px) rotate(180deg)}}
    @keyframes sa-breathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.07) translateY(-6px)}}
    @keyframes sa-glow-pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.75;transform:scale(1.18)}}
    @keyframes sa-spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes sa-border-glow{0%,100%{border-color:rgba(255,107,53,.15)}50%{border-color:rgba(255,107,53,.35)}}
    @keyframes sa-pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2);opacity:0}}
  `
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════════════════════════
   SWAL STYLE INJECTION
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-inv-swal")) {
  const s = document.createElement("style"); s.id = "sa-inv-swal"
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

const SW = { customClass:{ popup:"sa-dash-pop", title:"sa-dash-ttl", htmlContainer:"sa-dash-bod", confirmButton:"sa-dash-ok", cancelButton:"sa-dash-cn" }, buttonsStyling:false }
const swalFire = (opts) => Swal.fire({ ...opts, allowOutsideClick: opts.showCancelButton ?? true })

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

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem",
    background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
    "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
    "&:hover fieldset": { borderColor: T.o1 },
    "&.Mui-focused fieldset": { borderColor: T.o1, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontFamily: T.font, color: T.t2, "&.Mui-focused": { color: T.o1 } },
  "& .MuiSelect-select": { fontFamily: T.font },
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

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const fmtFecha = (d) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const MOTIVO_CFG = {
  venta:  { label: "Venta",   color: T.o1,   bg: "rgba(255,107,53,0.08)" },
  compra: { label: "Compra",  color: T.blue, bg: "rgba(59,130,246,0.08)" },
  ajuste: { label: "Ajuste",  color: T.y1,   bg: "rgba(245,158,11,0.08)" },
}

const ESTADO_STOCK_CFG = {
  normal:  { label: "Normal",        color: T.green,  bg: "rgba(34,197,94,0.10)",   icon: CheckCircle },
  bajo:    { label: "Stock bajo",    color: T.y1,     bg: "rgba(245,158,11,0.10)",  icon: AlertTriangle },
  agotado: { label: "Agotado",       color: T.r1,     bg: "rgba(239,68,68,0.10)",   icon: XCircle },
}

/* ═══════════════════════════════════════════════════════════════
   FRAMER MOTION VARIANTS
   ═══════════════════════════════════════════════════════════════ */
const MotionBox = motion.create(Box)
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const itemV = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }
const scaleV = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } } }

/* ═══════════════════════════════════════════════════════════════
   3D DECORATIVE ELEMENTS
   ═══════════════════════════════════════════════════════════════ */
const InvIcon3D = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(255,107,53,0.35))" }}>
    <defs>
      <linearGradient id="inv3d" x1="8" y1="4" x2="56" y2="60">
        <stop offset="0%" stopColor="#FFB088" />
        <stop offset="40%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#E83D00" />
      </linearGradient>
      <linearGradient id="inv3dSpec" x1="20%" y1="0%" x2="70%" y2="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <radialGradient id="inv3dGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="rgba(255,200,160,0.4)" />
        <stop offset="100%" stopColor="rgba(255,107,53,0)" />
      </radialGradient>
    </defs>
    <path d="M32 8L10 18v14c0 14 9 24 22 30 13-6 22-16 22-30V18L32 8z" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <path d="M32 8L10 18v14c0 14 9 24 22 30 13-6 22-16 22-30V18L32 8z" fill="url(#inv3d)" />
    <path d="M32 14L16 22v10c0 11 7 19 16 23 9-4 16-12 16-23V22L32 14z" fill="url(#inv3dSpec)" />
    <circle cx="32" cy="32" r="18" fill="url(#inv3dGlow)" />
    <path d="M32 20L20 26L32 32L44 26L32 20Z" stroke="#fff" strokeWidth="2.5" fill="rgba(255,255,255,0.18)" strokeLinejoin="round" />
    <path d="M20 32L32 38L44 32" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 38L32 44L44 38" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
          <linearGradient id="emInvG" x1="10" y1="5" x2="90" y2="100"><stop stopColor="#FFB088" /><stop offset="0.4" stopColor="#FF6B35" /><stop offset="1" stopColor="#E84D0E" /></linearGradient>
          <filter id="emInvS"><feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#FF6B35" floodOpacity="0.30" /></filter>
        </defs>
        <path d="M50 12L18 26V52C18 74 32 90 50 98C68 90 82 74 82 52V26L50 12Z" fill="url(#emInvG)" filter="url(#emInvS)" />
        <path d="M50 28L32 36L50 44L68 36L50 28Z" stroke="#fff" strokeWidth="3" fill="rgba(255,255,255,0.2)" strokeLinejoin="round" />
        <path d="M32 48L50 56L68 48" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
    <GlassOrb size={12} top={6} right={32} color="rgba(255,107,53,0.4)" delay={0} dur={5} anim="sa-float1" />
    <GlassOrb size={8} top={18} left={3} color="rgba(34,197,94,0.4)" delay={0.8} dur={4} anim="sa-float2" />
  </Box>
)

/* ═══════════════════════════════════════════════════════════════
   DIALOG HEADER
   ═══════════════════════════════════════════════════════════════ */
const DlgHdr = ({ icon, title, sub, onClose, gradient }) => (
  <Box sx={{
    background: gradient || T.go, p: "22px 28px", display: "flex", alignItems: "center", gap: "16px",
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

/* ═══════════════════════════════════════════════════════════════
   MODAL — Registrar Entrada
   ═══════════════════════════════════════════════════════════════ */
const ModalEntrada = ({ open, onClose, productos, onSuccess }) => {
  const [form, setForm] = useState({ productoId: "", cantidad: "", nota: "", proveedor: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const reset = () => { setForm({ productoId: "", cantidad: "", nota: "", proveedor: "" }); setErrors({}) }
  const handleClose = () => { reset(); onClose() }

  const validate = () => {
    const e = {}
    if (!form.productoId) e.productoId = "Selecciona un producto"
    if (!form.cantidad || Number(form.cantidad) < 1) e.cantidad = "Ingresa una cantidad mayor a 0"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const result = await inventarioService.registrarEntrada({
        productoId: form.productoId,
        cantidad: Number(form.cantidad),
        nota: form.nota || undefined,
        proveedor: form.proveedor || undefined,
      })
      handleClose()
      onSuccess(result.msg || "Entrada registrada correctamente")
    } catch (err) {
      const msg = err.response?.data?.msg || "Error al registrar entrada"
      await swalFire({ ...SW, icon: "error", title: "Error", text: msg })
    } finally {
      setLoading(false)
    }
  }

  const productosActivos = productos.filter(p => p.estado)

  return (
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
        icon={<TrendingUp size={18} color="#fff" />}
        title="Registrar Entrada"
        sub="Ingreso de mercancía al inventario"
        onClose={handleClose}
      />

      <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent", display: "flex", flexDirection: "column", gap: "14px" }}>
        <TextField select label="Producto" value={form.productoId}
          onChange={e => { setForm(f => ({ ...f, productoId: e.target.value })); setErrors(er => ({ ...er, productoId: "" })) }}
          error={!!errors.productoId} helperText={errors.productoId} sx={fieldSx} fullWidth size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Package size={14} color={T.t3} /></InputAdornment> } }}>
          <MenuItem value="" disabled><em>Selecciona un producto</em></MenuItem>
          {productosActivos.map(p => (
            <MenuItem key={p._id} value={p._id} sx={{ fontFamily: T.font }}>
              {p.nombre} — Stock: {p.stock} {p.unidadMedida || "unidad"}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Cantidad a ingresar" type="number" value={form.cantidad}
          onChange={e => { setForm(f => ({ ...f, cantidad: e.target.value })); setErrors(er => ({ ...er, cantidad: "" })) }}
          error={!!errors.cantidad} helperText={errors.cantidad} sx={fieldSx} fullWidth size="small"
          inputProps={{ min: 1, step: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><TrendingUp size={14} color={T.t3} /></InputAdornment> } }} />

        <TextField label="Proveedor (opcional)" value={form.proveedor}
          onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))}
          sx={fieldSx} fullWidth size="small" placeholder="Nombre del proveedor o distribuidor"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Truck size={14} color={T.t3} /></InputAdornment> } }} />

        <TextField label="Nota (opcional)" value={form.nota}
          onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
          sx={fieldSx} fullWidth multiline rows={2} placeholder="Ej: Compra mensual, factura #123..." />
      </DialogContent>

      <DialogActions sx={{
        p: "14px 26px 22px !important", background: "transparent",
        borderTop: "1px solid rgba(0,0,0,0.04)",
        display: "flex", justifyContent: "flex-end", gap: "10px",
      }}>
        <Button onClick={handleClose} sx={cancelBtnSx}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading} sx={submitBtnSx}>
          <CheckIcon size={14} strokeWidth={2.5} />
          {loading ? "Registrando..." : "Registrar Entrada"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MODAL — Ajuste Manual
   ═══════════════════════════════════════════════════════════════ */
const ModalAjuste = ({ open, onClose, productos, onSuccess }) => {
  const [form, setForm] = useState({ productoId: "", tipo: "entrada", cantidad: "", nota: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const reset = () => { setForm({ productoId: "", tipo: "entrada", cantidad: "", nota: "" }); setErrors({}) }
  const handleClose = () => { reset(); onClose() }

  const validate = () => {
    const e = {}
    if (!form.productoId) e.productoId = "Selecciona un producto"
    if (!form.cantidad || Number(form.cantidad) < 1) e.cantidad = "Ingresa una cantidad mayor a 0"
    if (!form.nota?.trim()) e.nota = "La nota es obligatoria en ajustes manuales"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const result = await inventarioService.registrarAjuste({
        productoId: form.productoId,
        tipo: form.tipo,
        cantidad: Number(form.cantidad),
        nota: form.nota,
      })
      handleClose()
      onSuccess(result.msg || "Ajuste registrado correctamente")
    } catch (err) {
      const msg = err.response?.data?.msg || "Error al registrar ajuste"
      await swalFire({ ...SW, icon: "error", title: "Error", text: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
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
        icon={<RefreshCw size={18} color="#fff" />}
        title="Ajuste Manual"
        sub="Corrección de stock por conteo físico"
        onClose={handleClose}
        gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
      />

      <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent", display: "flex", flexDirection: "column", gap: "14px" }}>
        <TextField select label="Producto" value={form.productoId}
          onChange={e => { setForm(f => ({ ...f, productoId: e.target.value })); setErrors(er => ({ ...er, productoId: "" })) }}
          error={!!errors.productoId} helperText={errors.productoId} sx={fieldSx} fullWidth size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Package size={14} color={T.t3} /></InputAdornment> } }}>
          <MenuItem value="" disabled><em>Selecciona un producto</em></MenuItem>
          {productos.map(p => (
            <MenuItem key={p._id} value={p._id} sx={{ fontFamily: T.font }}>
              {p.nombre} — Stock: {p.stock} {p.unidadMedida || "unidad"}
            </MenuItem>
          ))}
        </TextField>

        <TextField select label="Tipo de ajuste" value={form.tipo}
          onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} sx={fieldSx} fullWidth size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><RefreshCw size={14} color={T.t3} /></InputAdornment> } }}>
          <MenuItem value="entrada" sx={{ fontFamily: T.font }}>Entrada (aumentar stock)</MenuItem>
          <MenuItem value="salida" sx={{ fontFamily: T.font }}>Salida (reducir stock)</MenuItem>
        </TextField>

        <TextField label="Cantidad" type="number" value={form.cantidad}
          onChange={e => { setForm(f => ({ ...f, cantidad: e.target.value })); setErrors(er => ({ ...er, cantidad: "" })) }}
          error={!!errors.cantidad} helperText={errors.cantidad} sx={fieldSx} fullWidth size="small"
          inputProps={{ min: 1, step: 1 }} />

        <TextField label="Nota obligatoria" value={form.nota}
          onChange={e => { setForm(f => ({ ...f, nota: e.target.value })); setErrors(er => ({ ...er, nota: "" })) }}
          error={!!errors.nota} helperText={errors.nota}
          sx={fieldSx} fullWidth multiline rows={2} placeholder="Ej: Conteo físico 15 abril, merma detectada..." />
      </DialogContent>

      <DialogActions sx={{
        p: "14px 26px 22px !important", background: "transparent",
        borderTop: "1px solid rgba(0,0,0,0.04)",
        display: "flex", justifyContent: "flex-end", gap: "10px",
      }}>
        <Button onClick={handleClose} sx={cancelBtnSx}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading} sx={{
          ...submitBtnSx,
          background: "linear-gradient(135deg, #F59E0B, #D97706) !important",
          boxShadow: "0 6px 20px rgba(245,158,11,0.35) !important",
          "&:hover": { transform: "translateY(-3px) scale(1.02)", boxShadow: "0 12px 32px rgba(245,158,11,0.45) !important" },
        }}>
          <CheckIcon size={14} strokeWidth={2.5} />
          {loading ? "Guardando..." : "Guardar Ajuste"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PESTAÑA — Stock Actual
   ═══════════════════════════════════════════════════════════════ */
const TabStock = () => {
  const [stockData, setStockData] = useState([])
  const [resumen, setResumen] = useState({ total: 0, activos: 0, agotados: 0, bajoMinimo: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const fetchStock = useCallback(async () => {
    setLoading(true)
    try {
      const data = await inventarioService.getStock()
      setStockData(data.stock || [])
      setResumen(data.resumen || { total: 0, activos: 0, agotados: 0, bajoMinimo: 0 })
    } catch {
      setStockData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStock() }, [fetchStock])

  const filtered = stockData.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
    const matchEstado = !filterEstado || p.estadoStock === filterEstado
    return matchSearch && matchEstado
  })
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  return (
    <Box>
      {/* ═══ STATS CARDS ═══ */}
      <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", mb: "22px" }}>
        {[
          { label: "TOTAL", value: resumen.total, desc: "productos", color: T.o1, icon: <Package size={18} /> },
          { label: "ACTIVOS", value: resumen.activos, desc: "habilitados", color: T.green, icon: <CheckCircle size={18} /> },
          { label: "STOCK BAJO", value: resumen.bajoMinimo, desc: "alerta", color: T.y1, icon: <AlertTriangle size={18} /> },
          { label: "AGOTADOS", value: resumen.agotados, desc: "sin stock", color: T.r1, icon: <XCircle size={18} /> },
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
      </MotionBox>

      {/* ═══ TOOLBAR ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between", mb: "22px", gap: "14px", flexWrap: "wrap",
      }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          ...glassCard, borderRadius: "18px", p: "12px 18px", minWidth: 220, flex: 1,
          transition: "all .3s cubic-bezier(.25,.46,.45,.94)",
          "&:focus-within": { borderColor: "rgba(255,107,53,0.25)", boxShadow: `${T.neu}, 0 0 0 4px rgba(255,107,53,.06)` },
        }}>
          <Search size={17} color={T.t3} strokeWidth={2} />
          <input style={{
            border: "none", outline: "none", background: "transparent",
            fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%",
          }} placeholder="Buscar producto..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
        </Box>

        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          ...glassCard, borderRadius: "18px", p: "12px 18px", minWidth: 200,
        }}>
          <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".86rem", color: T.t1, cursor: "pointer", flex: 1 }}>
            <option value="">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="bajo">Stock bajo</option>
            <option value="agotado">Agotado</option>
          </select>
        </Box>

        <motion.button
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchStock}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            background: "rgba(255,255,255,0.72)",
            color: T.t2, fontFamily: T.font, fontWeight: 700,
            fontSize: ".85rem", padding: "13px 24px", borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.5)", cursor: "pointer",
            backdropFilter: "blur(16px)",
            boxShadow: T.neu,
          }}>
          <RefreshCw size={15} strokeWidth={2.5} /> Actualizar
        </motion.button>
      </MotionBox>

      {/* ═══ TABLE CONTAINER ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        ...glassCard, borderRadius: T.rad3, p: "8px", mb: "22px",
      }}>
        {paginated.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.9fr", px: "26px", py: "16px" }}>
            {["PRODUCTO", "CATEGORÍA", "STOCK", "MÍNIMO", "UNIDAD", "ESTADO"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.4px", textTransform: "uppercase", color: T.t4,
                ...(h === "ESTADO" || h === "STOCK" || h === "MÍNIMO" || h === "UNIDAD" ? {} : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        <AnimatePresence mode="wait">
          <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "flex", flexDirection: "column", gap: "8px", p: paginated.length > 0 ? "0 8px 8px" : "0" }}>
            {paginated.map((p) => {
              const cfg = ESTADO_STOCK_CFG[p.estadoStock] || ESTADO_STOCK_CFG.normal
              const StatusIcon = cfg.icon
              return (
                <MotionBox key={p._id} variants={itemV}
                  whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  sx={{
                    display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.9fr",
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {p.imagen ? (
                      <Box sx={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                        <Box component="img" src={p.imagen} alt={p.nombre} sx={{
                          width: 44, height: 44, borderRadius: "14px", objectFit: "cover",
                          boxShadow: `0 6px 16px ${cfg.color}22, inset 0 1px 2px rgba(255,255,255,0.8)`,
                          border: "2px solid rgba(255,255,255,0.85)",
                        }} onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex" }} />
                        <Box sx={{
                          position: "absolute", inset: 0, width: 44, height: 44, borderRadius: "14px",
                          display: "none", alignItems: "center", justifyContent: "center",
                          background: cfg.bg,
                          boxShadow: `0 6px 16px ${cfg.color}22, inset 0 1px 2px rgba(255,255,255,0.8)`,
                        }}>
                          <Package size={19} color={cfg.color} />
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{
                        width: 44, height: 44, borderRadius: "14px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, background: cfg.bg,
                        boxShadow: `0 6px 16px ${cfg.color}22, inset 0 1px 2px rgba(255,255,255,0.8)`,
                      }}>
                        <Package size={19} color={cfg.color} />
                      </Box>
                    )}
                    <Box>
                      <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".90rem", color: T.t1, lineHeight: 1.3 }}>
                        {p.nombre}
                      </Typography>
                      <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: p.estado ? T.t4 : T.r1 }}>
                        {p.estado ? `#${p._id?.slice(-6).toUpperCase()}` : "Inactivo"}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>
                    {p.categoria?.nombre || "—"}
                  </Typography>

                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    background: `${cfg.color}12`, borderRadius: "10px", padding: "5px 12px",
                    backdropFilter: "blur(8px)", width: "fit-content",
                  }}>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: cfg.color }}>
                      {p.stock}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t3 }}>
                    {p.stockMinimo || 0}
                  </Typography>

                  <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
                    {p.unidadMedida || "unidad"}
                  </Typography>

                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    padding: "6px 14px", borderRadius: "24px",
                    fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                    backdropFilter: "blur(8px)", width: "fit-content",
                    background: cfg.bg, color: cfg.color,
                    boxShadow: `0 2px 8px ${cfg.color}18`,
                  }}>
                    <StatusIcon size={12} strokeWidth={2.5} />
                    {cfg.label}
                  </Box>
                </MotionBox>
              )
            })}
          </MotionBox>
        </AnimatePresence>

        {paginated.length === 0 && !loading && (
          <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
            borderRadius: T.rad, p: "50px 20px 60px", textAlign: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,248,245,0.7) 100%)",
          }}>
            <EmptyIllustration />
            <Typography sx={{ fontFamily: T.fontH, fontSize: "1.20rem", fontWeight: 800, color: T.t1, mb: "10px" }}>
              {stockData.length === 0 ? "No hay productos registrados" : "Sin resultados"}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t3, maxWidth: 380, mx: "auto", mb: "24px", lineHeight: 1.6 }}>
              {stockData.length === 0
                ? "Aún no hay inventario para mostrar"
                : "No se encontraron productos que coincidan con la búsqueda."}
            </Typography>
          </MotionBox>
        )}

        {loading && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ fontFamily: T.font, color: T.t3 }}>Cargando inventario...</Typography>
          </Box>
        )}
      </MotionBox>

      {/* ═══ PAGINATION ═══ */}
      {filtered.length > 0 && (
        <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "10px",
        }}>
          <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
            Mostrando {filtered.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length} productos
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
      )}
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PESTAÑA — Movimientos
   ═══════════════════════════════════════════════════════════════ */
const TabMovimientos = ({ productos }) => {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filterProducto, setFilterProducto] = useState("")
  const [filterTipo, setFilterTipo] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [page, setPage] = useState(0)
  const rowsPerPage = 10

  const fetchMovimientos = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: page + 1, limit: rowsPerPage }
      if (filterProducto) params.productoId = filterProducto
      if (filterTipo) params.tipo = filterTipo
      if (desde) params.desde = desde
      if (hasta) params.hasta = hasta
      const data = await inventarioService.getMovimientos(params)
      setMovimientos(data.movimientos || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      setMovimientos([]); setTotal(0); setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [page, filterProducto, filterTipo, desde, hasta])

  useEffect(() => { fetchMovimientos() }, [fetchMovimientos])

  return (
    <Box>
      {/* ═══ TOOLBAR FILTERS ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", alignItems: "center", mb: "22px", gap: "14px", flexWrap: "wrap",
      }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          ...glassCard, borderRadius: "18px", p: "12px 18px", minWidth: 220, flex: 1,
        }}>
          <Package size={16} color={T.t3} />
          <select value={filterProducto} onChange={e => { setFilterProducto(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".86rem", color: T.t1, cursor: "pointer", flex: 1 }}>
            <option value="">Todos los productos</option>
            {productos.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
          </select>
        </Box>

        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          ...glassCard, borderRadius: "18px", p: "12px 18px", minWidth: 190,
        }}>
          <RefreshCw size={15} color={T.t3} />
          <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".86rem", color: T.t1, cursor: "pointer", flex: 1 }}>
            <option value="">Entradas y salidas</option>
            <option value="entrada">Solo entradas</option>
            <option value="salida">Solo salidas</option>
          </select>
        </Box>

        <Box sx={{
          display: "flex", alignItems: "center", gap: "8px",
          ...glassCard, borderRadius: "18px", p: "12px 18px",
        }}>
          <Calendar size={15} color={T.t3} />
          <input type="date" value={desde} onChange={e => { setDesde(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".82rem", color: T.t1 }} />
          <Typography sx={{ color: T.t4, fontSize: ".78rem" }}>—</Typography>
          <input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".82rem", color: T.t1 }} />
        </Box>
      </MotionBox>

      {/* ═══ TABLE CONTAINER ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        ...glassCard, borderRadius: T.rad3, p: "8px", mb: "22px",
      }}>
        {movimientos.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 0.8fr 0.7fr 1.5fr 1.2fr", px: "26px", py: "16px" }}>
            {["PRODUCTO", "TIPO", "CANTIDAD", "MOTIVO", "NOTA", "FECHA"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.4px", textTransform: "uppercase", color: T.t4,
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        <AnimatePresence mode="wait">
          <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "flex", flexDirection: "column", gap: "8px", p: movimientos.length > 0 ? "0 8px 8px" : "0" }}>
            {movimientos.map((m) => {
              const esEntrada = m.tipo === "entrada"
              const motivoCfg = MOTIVO_CFG[m.motivo] || MOTIVO_CFG.ajuste
              return (
                <MotionBox key={m._id} variants={itemV}
                  whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  sx={{
                    display: "grid", gridTemplateColumns: "2fr 0.8fr 0.8fr 0.7fr 1.5fr 1.2fr",
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: "12px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      background: esEntrada ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
                      boxShadow: `0 4px 12px ${esEntrada ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}, inset 0 1px 2px rgba(255,255,255,0.8)`,
                    }}>
                      {esEntrada
                        ? <TrendingUp size={17} color={T.green} strokeWidth={2.5} />
                        : <TrendingDown size={17} color={T.r1} strokeWidth={2.5} />}
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".88rem", color: T.t1, lineHeight: 1.3 }}>
                        {m.productoId?.nombre || "—"}
                      </Typography>
                      {m.proveedor && (
                        <Typography sx={{ fontFamily: T.font, fontSize: ".70rem", color: T.t3 }}>{m.proveedor}</Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "5px 12px", borderRadius: "22px",
                    fontFamily: T.font, fontSize: ".72rem", fontWeight: 700,
                    width: "fit-content",
                    background: esEntrada ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)",
                    color: esEntrada ? "#16A34A" : "#DC2626",
                    boxShadow: `0 2px 8px ${esEntrada ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)"}`,
                  }}>
                    <Box sx={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: esEntrada ? T.green : T.r1,
                      boxShadow: esEntrada ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)",
                    }} />
                    {esEntrada ? "Entrada" : "Salida"}
                  </Box>

                  <Typography sx={{ fontFamily: T.font, fontWeight: 800, fontSize: ".95rem", color: esEntrada ? T.green : T.r1 }}>
                    {esEntrada ? "+" : "-"}{m.cantidad}
                  </Typography>

                  <Box sx={{
                    background: motivoCfg.bg, px: "10px", py: "4px", borderRadius: "10px",
                    width: "fit-content", backdropFilter: "blur(8px)",
                  }}>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".70rem", fontWeight: 700, color: motivoCfg.color }}>
                      {motivoCfg.label}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontFamily: T.font, fontSize: ".78rem", color: T.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.nota || "—"}
                  </Typography>

                  <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", color: T.t3 }}>
                    {fmtFecha(m.fecha)}
                  </Typography>
                </MotionBox>
              )
            })}
          </MotionBox>
        </AnimatePresence>

        {movimientos.length === 0 && !loading && (
          <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
            borderRadius: T.rad, p: "50px 20px 60px", textAlign: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,248,245,0.7) 100%)",
          }}>
            <EmptyIllustration />
            <Typography sx={{ fontFamily: T.fontH, fontSize: "1.20rem", fontWeight: 800, color: T.t1, mb: "10px" }}>
              No hay movimientos registrados
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t3, maxWidth: 380, mx: "auto", mb: "24px", lineHeight: 1.6 }}>
              Aún no se registran entradas, salidas ni ajustes para el rango seleccionado.
            </Typography>
          </MotionBox>
        )}

        {loading && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ fontFamily: T.font, color: T.t3 }}>Cargando movimientos...</Typography>
          </Box>
        )}
      </MotionBox>

      {/* ═══ PAGINATION ═══ */}
      {totalPages > 1 && (
        <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "10px",
        }}>
          <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
            {total} movimientos
          </Typography>
          <Box sx={{ display: "flex", gap: "6px" }}>
            <Button sx={pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ opacity: page === 0 ? .35 : 1 }}>
              <ArrowLeft size={14} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} sx={i === page ? pageBtnOn : pageBtn} onClick={() => setPage(i)}>{i + 1}</Button>
            ))}
            <Button sx={pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ opacity: page >= totalPages - 1 ? .35 : 1 }}>
              <ArrowRight size={14} />
            </Button>
          </Box>
          <Box sx={{ width: 90 }} />
        </MotionBox>
      )}
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
const InventarioList = () => {
  const [tab, setTab] = useState("stock")
  const [productos, setProductos] = useState([])
  const [modalEntrada, setModalEntrada] = useState(false)
  const [modalAjuste, setModalAjuste] = useState(false)

  useEffect(() => {
    productosService.getProductos()
      .then(d => setProductos(Array.isArray(d) ? d : d?.productos || []))
      .catch(() => setProductos([]))
  }, [])

  const handleSuccess = async (msg) => {
    await swalFire({
      ...SW, icon: "success", title: "¡Listo!", text: msg,
      timer: 2800, timerProgressBar: true, showConfirmButton: false,
    })
    setTab(t => t === "stock" ? "_reload" : "stock")
    setTimeout(() => setTab(t => t === "_reload" ? "stock" : "movimientos"), 50)
  }

  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative", minHeight: "calc(100vh - 100px)" }}>

      {/* ═══ ANIMATED BACKGROUND ═══ */}
      <Box sx={{
        position: "fixed", inset: 0, zIndex: -3, pointerEvents: "none",
        background: "#F5F7FA",
      }} />
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
        position: "relative", overflow: "hidden", gap: "16px", flexWrap: "wrap",
      }}>
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.06), transparent 70%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -30, left: 120, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.04), transparent 70%)", pointerEvents: "none" }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1 }}>
          <Box sx={{ animation: "sa-breathe 4s ease-in-out infinite", position: "relative" }}>
            <InvIcon3D />
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
              Gestión de Inventario
            </Typography>
            <Typography sx={{ fontSize: ".88rem", color: T.t3, mt: "6px", fontFamily: T.font }}>
              Control de stock y movimientos de mercancía
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: "10px", zIndex: 1, flexWrap: "wrap" }}>
          <motion.button
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalAjuste(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 16,
              border: "1.5px solid rgba(245,158,11,0.30)", background: "rgba(245,158,11,0.08)",
              cursor: "pointer", fontFamily: T.font, fontWeight: 700, fontSize: ".85rem", color: "#D97706",
              boxShadow: "0 4px 16px rgba(245,158,11,0.12)",
            }}>
            <RefreshCw size={15} strokeWidth={2.5} /> Ajuste manual
          </motion.button>
          <motion.button
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalEntrada(true)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
              color: "#fff", fontFamily: T.font, fontWeight: 700,
              fontSize: ".85rem", padding: "13px 28px", borderRadius: 16,
              border: "none", cursor: "pointer",
              boxShadow: "0 8px 28px rgba(255,107,53,.30)",
              position: "relative", overflow: "hidden",
            }}>
            <Plus size={16} strokeWidth={2.5} /> Registrar Entrada
            <span style={{
              position: "absolute", inset: 0, borderRadius: 16,
              border: "2px solid rgba(255,255,255,0.3)",
              animation: "sa-pulse-ring 2s ease-out infinite",
              pointerEvents: "none",
            }} />
          </motion.button>
        </Box>
      </MotionBox>

      {/* ═══ TABS ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", gap: "8px", mb: "22px",
        background: "rgba(255,255,255,0.60)", backdropFilter: "blur(16px)",
        borderRadius: "18px", p: "6px",
        border: `1px solid ${T.border}`, width: "fit-content",
        boxShadow: T.neu,
      }}>
        {[
          { key: "stock", label: "Stock Actual", icon: <Package size={14} /> },
          { key: "movimientos", label: "Movimientos", icon: <FileText size={14} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            fontFamily: T.font, fontWeight: 700, fontSize: ".84rem",
            padding: "11px 22px", borderRadius: "14px", cursor: "pointer",
            border: "none", transition: "all .25s ease",
            display: "inline-flex", alignItems: "center", gap: 8,
            background: tab === t.key ? T.go : "transparent",
            color: tab === t.key ? "#fff" : T.t2,
            boxShadow: tab === t.key ? T.glow : "none",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </MotionBox>

      {/* ═══ CONTENIDO ═══ */}
      <AnimatePresence mode="wait">
        {tab === "stock" && (
          <MotionBox key="stock" variants={scaleV} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <TabStock />
          </MotionBox>
        )}
        {tab === "movimientos" && (
          <MotionBox key="movimientos" variants={scaleV} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <TabMovimientos productos={productos} />
          </MotionBox>
        )}
      </AnimatePresence>

      {/* ═══ MODALES ═══ */}
      <ModalEntrada
        open={modalEntrada}
        onClose={() => setModalEntrada(false)}
        productos={productos}
        onSuccess={handleSuccess}
      />
      <ModalAjuste
        open={modalAjuste}
        onClose={() => setModalAjuste(false)}
        productos={productos}
        onSuccess={handleSuccess}
      />
    </Box>
  )
}

export default InventarioList
