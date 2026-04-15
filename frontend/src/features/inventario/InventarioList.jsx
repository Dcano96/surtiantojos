import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box,
} from "@mui/material"
import {
  Search, RefreshCw, TrendingUp, TrendingDown,
  Package, ArrowLeft, ArrowRight, Calendar, Plus,
  AlertTriangle, CheckCircle, XCircle,
} from "lucide-react"
import Swal from "sweetalert2"
import inventarioService from "./inventario.service.js"
import productosService from "../productos/productos.service.js"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T = {
  o1: "#FF6B35", o2: "#FF3D00", o3: "#FF8F5E", o4: "#FFF0EB",
  r1: "#EF4444", y1: "#F59E0B", green: "#22C55E",
  blue: "#3B82F6", purple: "#8B5CF6",
  t1: "#1A1A2E", t2: "#4A4A68", t3: "#9CA3AF", t4: "#C5C8D4",
  bg: "#FFF8F5", bg2: "#FFFFFF",
  go: "linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)",
  go2: "linear-gradient(135deg, #FF8F5E, #FF6B35)",
  border: "rgba(255,255,255,0.50)",
  glass: "rgba(255,255,255,0.55)",
  glass2: "rgba(255,255,255,0.72)",
  blur: "blur(40px) saturate(180%)",
  neu: "0 8px 32px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
  glow: "0 6px 24px rgba(255,107,53,0.30)",
  glow2: "0 12px 40px rgba(255,107,53,0.45)",
  font: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontH: "'Fraunces', serif",
  rad: "20px", rad2: "16px", rad3: "28px",
}

/* ─── SWAL styles ─── */
if (typeof document !== "undefined" && !document.getElementById("sa-inv-swal")) {
  const s = document.createElement("style"); s.id = "sa-inv-swal"
  s.textContent = `
    .swal2-icon.swal2-success{border-color:#22C55E!important;color:#22C55E!important;}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#22C55E!important;}
    .swal2-icon.swal2-success .swal2-success-ring{border-color:rgba(34,197,94,.30)!important;}
    .swal2-icon.swal2-error{border-color:#EF4444!important;color:#EF4444!important;}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#EF4444!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#FF6B35,#FF3D00)!important;}
    .swal2-popup{border-radius:22px!important;box-shadow:0 30px 70px rgba(0,0,0,0.18)!important;}
    .swal2-backdrop-show{background:rgba(15,23,42,.18)!important;backdrop-filter:blur(10px)!important;}
  `
  document.head.appendChild(s)
}

/* ─── Keyframes ─── */
if (typeof document !== "undefined" && !document.getElementById("sa-inv-anims")) {
  const s = document.createElement("style"); s.id = "sa-inv-anims"
  s.textContent = `
    @keyframes sa-aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes sa-float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-10px,-20px) scale(1.04)}}
    @keyframes sa-breathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.05) translateY(-4px)}}
  `
  document.head.appendChild(s)
}

const SW = { buttonsStyling: false }
const swalFire = (opts) => Swal.fire({ ...opts, allowOutsideClick: opts.showCancelButton ?? true })

/* ─── Reusable styles ─── */
const glassCard = {
  background: T.glass2, backdropFilter: T.blur, WebkitBackdropFilter: T.blur,
  border: `1px solid ${T.border}`, boxShadow: T.neu,
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
const pageBtnOn = { ...pageBtn, background: `${T.go} !important`, color: "#fff !important", borderColor: "transparent !important", boxShadow: `${T.glow} !important` }
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem",
    background: "#fff", "& fieldset": { borderColor: "rgba(0,0,0,0.10)" },
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
  "&:hover": { background: "rgba(255,255,255,0.95) !important" },
}
const submitBtnSx = {
  display: "flex !important", alignItems: "center !important", gap: "8px !important",
  background: `${T.go} !important`, color: "#fff !important",
  fontFamily: `${T.font} !important`, fontWeight: "700 !important",
  borderRadius: "16px !important", padding: "11px 28px !important",
  textTransform: "none !important", boxShadow: `${T.glow} !important`,
  "&:hover": { transform: "translateY(-2px)", boxShadow: `${T.glow2} !important` },
  "&:disabled": { background: "rgba(255,107,53,.12) !important", boxShadow: "none !important", transform: "none !important" },
}

/* ─── Helpers ─── */
const fmtFecha = (d) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
const formatCOP = (v) => "$ " + (Number(v) || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })

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

/* ─── Framer ─── */
const MotionBox = motion.create(Box)
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }
const itemV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }
const scaleV = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } } }

/* ─── SVG Header Icon ─── */
const InvIcon3D = () => (
  <svg width="60" height="60" viewBox="0 0 64 64" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(255,107,53,0.35))" }}>
    <defs>
      <linearGradient id="inv3d" x1="8" y1="4" x2="56" y2="60">
        <stop offset="0%" stopColor="#FFB088" /><stop offset="40%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#E83D00" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <circle cx="32" cy="32" r="28" fill="url(#inv3d)" />
    <path d="M32 20L20 26L32 32L44 26L32 20Z" stroke="#fff" strokeWidth="2" fill="rgba(255,255,255,0.2)" strokeLinejoin="round" />
    <path d="M20 32L32 38L44 32" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 38L32 44L44 38" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const GlassOrb = ({ size, top, left, right, bottom, color = "rgba(255,140,80,0.5)", delay = 0, dur = 10 }) => (
  <Box sx={{
    position: "fixed", width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5) 0%, ${color} 45%, rgba(200,60,0,0.15) 100%)`,
    boxShadow: `0 ${size * 0.12}px ${size * 0.4}px ${color.replace(/[\d.]+\)$/, "0.2)")}`,
    top, left, right, bottom, zIndex: -1, pointerEvents: "none",
    animation: `sa-float1 ${dur}s ease-in-out ${delay}s infinite`,
  }} />
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{
      sx: { borderRadius: T.rad, background: "#FAFAF8", boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }
    }}>
      {/* Header */}
      <Box sx={{ background: T.go, p: "20px 26px", display: "flex", alignItems: "center", gap: "14px", position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: -10, right: 30, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <Box sx={{ width: 42, height: 42, borderRadius: "14px", background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TrendingUp size={20} color="#fff" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontFamily: `${T.fontH} !important`, fontWeight: "800 !important", fontSize: "1.10rem !important", color: "#fff !important" }}>
            Registrar Entrada
          </Typography>
          <Typography sx={{ fontSize: ".75rem", color: "rgba(255,255,255,.65)", fontFamily: T.font }}>
            Ingreso de mercancía al inventario
          </Typography>
        </Box>
        <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </Box>

      <DialogContent sx={{ p: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Producto */}
        <TextField select label="Producto *" value={form.productoId}
          onChange={e => { setForm(f => ({ ...f, productoId: e.target.value })); setErrors(er => ({ ...er, productoId: "" })) }}
          error={!!errors.productoId} helperText={errors.productoId} sx={fieldSx} fullWidth>
          <MenuItem value="" disabled><em>Selecciona un producto</em></MenuItem>
          {productosActivos.map(p => (
            <MenuItem key={p._id} value={p._id} sx={{ fontFamily: T.font }}>
              {p.nombre} — Stock actual: {p.stock} {p.unidadMedida || "unidad"}
            </MenuItem>
          ))}
        </TextField>

        {/* Cantidad */}
        <TextField label="Cantidad a ingresar *" type="number" value={form.cantidad}
          onChange={e => { setForm(f => ({ ...f, cantidad: e.target.value })); setErrors(er => ({ ...er, cantidad: "" })) }}
          error={!!errors.cantidad} helperText={errors.cantidad} sx={fieldSx} fullWidth
          inputProps={{ min: 1, step: 1 }} />

        {/* Proveedor */}
        <TextField label="Proveedor (opcional)" value={form.proveedor}
          onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))}
          sx={fieldSx} fullWidth placeholder="Nombre del proveedor o distribuidor" />

        {/* Nota */}
        <TextField label="Nota (opcional)" value={form.nota}
          onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
          sx={fieldSx} fullWidth multiline rows={2} placeholder="Ej: Compra mensual, factura #123..." />
      </DialogContent>

      <DialogActions sx={{ p: "0 26px 24px", gap: "12px", justifyContent: "flex-end" }}>
        <Button onClick={handleClose} sx={cancelBtnSx}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading} sx={submitBtnSx}>
          <TrendingUp size={16} />
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{
      sx: { borderRadius: T.rad, background: "#FAFAF8", boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }
    }}>
      <Box sx={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", p: "20px 26px", display: "flex", alignItems: "center", gap: "14px" }}>
        <Box sx={{ width: 42, height: 42, borderRadius: "14px", background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RefreshCw size={20} color="#fff" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontFamily: `${T.fontH} !important`, fontWeight: "800 !important", fontSize: "1.10rem !important", color: "#fff !important" }}>
            Ajuste Manual
          </Typography>
          <Typography sx={{ fontSize: ".75rem", color: "rgba(255,255,255,.70)", fontFamily: T.font }}>
            Corrección de stock por conteo físico
          </Typography>
        </Box>
        <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </Box>

      <DialogContent sx={{ p: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <TextField select label="Producto *" value={form.productoId}
          onChange={e => { setForm(f => ({ ...f, productoId: e.target.value })); setErrors(er => ({ ...er, productoId: "" })) }}
          error={!!errors.productoId} helperText={errors.productoId} sx={fieldSx} fullWidth>
          <MenuItem value="" disabled><em>Selecciona un producto</em></MenuItem>
          {productos.map(p => (
            <MenuItem key={p._id} value={p._id} sx={{ fontFamily: T.font }}>
              {p.nombre} — Stock: {p.stock} {p.unidadMedida || "unidad"}
            </MenuItem>
          ))}
        </TextField>

        <TextField select label="Tipo de ajuste *" value={form.tipo}
          onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} sx={fieldSx} fullWidth>
          <MenuItem value="entrada" sx={{ fontFamily: T.font }}>Entrada (aumentar stock)</MenuItem>
          <MenuItem value="salida" sx={{ fontFamily: T.font }}>Salida (reducir stock)</MenuItem>
        </TextField>

        <TextField label="Cantidad *" type="number" value={form.cantidad}
          onChange={e => { setForm(f => ({ ...f, cantidad: e.target.value })); setErrors(er => ({ ...er, cantidad: "" })) }}
          error={!!errors.cantidad} helperText={errors.cantidad} sx={fieldSx} fullWidth inputProps={{ min: 1, step: 1 }} />

        <TextField label="Nota obligatoria *" value={form.nota}
          onChange={e => { setForm(f => ({ ...f, nota: e.target.value })); setErrors(er => ({ ...er, nota: "" })) }}
          error={!!errors.nota} helperText={errors.nota}
          sx={fieldSx} fullWidth multiline rows={2} placeholder="Ej: Conteo físico 15 abril, merma detectada..." />
      </DialogContent>

      <DialogActions sx={{ p: "0 26px 24px", gap: "12px", justifyContent: "flex-end" }}>
        <Button onClick={handleClose} sx={cancelBtnSx}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading} sx={{
          ...submitBtnSx,
          background: "linear-gradient(135deg, #F59E0B, #D97706) !important",
          boxShadow: "0 6px 20px rgba(245,158,11,0.35) !important",
        }}>
          <RefreshCw size={16} />
          {loading ? "Guardando..." : "Guardar Ajuste"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PESTAÑA — Stock Actual
   ═══════════════════════════════════════════════════════════════ */
const TabStock = ({ onRegistrarEntrada, onAjuste }) => {
  const [stockData, setStockData] = useState([])
  const [resumen, setResumen] = useState({ total: 0, activos: 0, agotados: 0, bajoMinimo: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("")

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

  const KPI = ({ label, value, color, icon: Icon }) => (
    <Box sx={{ ...glassCard, borderRadius: T.rad2, p: "18px 22px", flex: 1, minWidth: 120 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "8px" }}>
        <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: T.t3 }}>{label}</Typography>
        <Box sx={{ width: 32, height: 32, borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} color={color} />
        </Box>
      </Box>
      <Typography sx={{ fontFamily: T.fontH, fontSize: "1.8rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
    </Box>
  )

  return (
    <Box>
      {/* KPIs */}
      <Box sx={{ display: "flex", gap: "14px", mb: "20px", flexWrap: "wrap" }}>
        <KPI label="Total Productos" value={resumen.total} color={T.blue} icon={Package} />
        <KPI label="Activos" value={resumen.activos} color={T.green} icon={CheckCircle} />
        <KPI label="Stock Bajo" value={resumen.bajoMinimo} color={T.y1} icon={AlertTriangle} />
        <KPI label="Agotados" value={resumen.agotados} color={T.r1} icon={XCircle} />
      </Box>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: "12px", mb: "16px", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "14px", p: "10px 16px", flex: 1, minWidth: 200, boxShadow: T.neu }}>
          <Search size={15} color={T.t3} />
          <input style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".86rem", color: T.t1, width: "100%" }}
            placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "14px", p: "10px 16px", minWidth: 180, boxShadow: T.neu }}>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".86rem", color: T.t1, cursor: "pointer", flex: 1 }}>
            <option value="">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="bajo">Stock bajo</option>
            <option value="agotado">Agotado</option>
          </select>
        </Box>
        <button onClick={fetchStock} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: "14px",
          border: "1px solid rgba(0,0,0,0.06)", background: "#fff", cursor: "pointer",
          fontFamily: T.font, fontSize: ".84rem", color: T.t2, boxShadow: T.neu,
        }}>
          <RefreshCw size={15} /> Actualizar
        </button>
      </Box>

      {/* Tabla stock */}
      <Box sx={{ background: "#fff", borderRadius: T.rad, boxShadow: T.neu, border: "1px solid rgba(0,0,0,0.03)", overflow: "hidden" }}>
        {/* Header tabla */}
        {filtered.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.9fr", px: "22px", py: "14px", gap: "10px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
            {["PRODUCTO", "CATEGORÍA", "STOCK", "MÍNIMO", "UNIDAD", "ESTADO"].map(h => (
              <Typography key={h} sx={{ fontFamily: T.font, fontSize: ".67rem", fontWeight: 700, letterSpacing: "1.1px", textTransform: "uppercase", color: T.t4 }}>{h}</Typography>
            ))}
          </Box>
        )}

        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ fontFamily: T.font, color: T.t3 }}>Cargando inventario...</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Package size={40} color={T.t4} style={{ marginBottom: 12 }} />
            <Typography sx={{ fontFamily: T.font, color: T.t3 }}>No se encontraron productos</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "6px" }}>
            {filtered.map((p) => {
              const cfg = ESTADO_STOCK_CFG[p.estadoStock] || ESTADO_STOCK_CFG.normal
              const StatusIcon = cfg.icon
              return (
                <Box key={p._id} sx={{
                  display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.9fr",
                  alignItems: "center", p: "13px 20px", gap: "10px", borderRadius: "14px",
                  background: p.estadoStock === "agotado" ? "rgba(239,68,68,0.03)" : p.estadoStock === "bajo" ? "rgba(245,158,11,0.03)" : "transparent",
                  transition: "background .2s",
                  "&:hover": { background: "rgba(255,107,53,0.03)" },
                }}>
                  <Box>
                    <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".87rem", color: T.t1 }}>{p.nombre}</Typography>
                    {!p.estado && <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.r1 }}>Inactivo</Typography>}
                  </Box>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>
                    {p.categoria?.nombre || "—"}
                  </Typography>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".95rem", color: cfg.color }}>
                    {p.stock}
                  </Typography>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t3 }}>
                    {p.stockMinimo || 0}
                  </Typography>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
                    {p.unidadMedida || "unidad"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "6px", background: cfg.bg, px: "10px", py: "5px", borderRadius: "10px", width: "fit-content" }}>
                    <StatusIcon size={12} color={cfg.color} />
                    <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
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
      {/* Filtros */}
      <Box sx={{ display: "flex", gap: "12px", mb: "16px", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "14px", p: "10px 16px", minWidth: 200, boxShadow: T.neu }}>
          <select value={filterProducto} onChange={e => { setFilterProducto(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".86rem", color: T.t1, cursor: "pointer", flex: 1 }}>
            <option value="">Todos los productos</option>
            {productos.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
          </select>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "14px", p: "10px 16px", minWidth: 160, boxShadow: T.neu }}>
          <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".86rem", color: T.t1, cursor: "pointer", flex: 1 }}>
            <option value="">Entradas y salidas</option>
            <option value="entrada">Solo entradas</option>
            <option value="salida">Solo salidas</option>
          </select>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "14px", p: "10px 16px", boxShadow: T.neu }}>
          <Calendar size={14} color={T.t3} />
          <input type="date" value={desde} onChange={e => { setDesde(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".82rem", color: T.t1 }} />
          <Typography sx={{ color: T.t4, fontSize: ".78rem" }}>—</Typography>
          <input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setPage(0) }}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: ".82rem", color: T.t1 }} />
        </Box>
      </Box>

      {/* Tabla movimientos */}
      <Box sx={{ background: "#fff", borderRadius: T.rad, boxShadow: T.neu, border: "1px solid rgba(0,0,0,0.03)", overflow: "hidden" }}>
        {movimientos.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 0.8fr 0.7fr 1.5fr 1.2fr", px: "22px", py: "14px", gap: "10px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
            {["PRODUCTO", "TIPO", "CANTIDAD", "MOTIVO", "NOTA", "FECHA"].map(h => (
              <Typography key={h} sx={{ fontFamily: T.font, fontSize: ".67rem", fontWeight: 700, letterSpacing: "1.1px", textTransform: "uppercase", color: T.t4 }}>{h}</Typography>
            ))}
          </Box>
        )}

        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ fontFamily: T.font, color: T.t3 }}>Cargando movimientos...</Typography>
          </Box>
        ) : movimientos.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Layers size={40} color={T.t4} style={{ marginBottom: 12 }} />
            <Typography sx={{ fontFamily: T.font, color: T.t3 }}>No hay movimientos registrados</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "6px" }}>
            {movimientos.map((m) => {
              const esEntrada = m.tipo === "entrada"
              const motivoCfg = MOTIVO_CFG[m.motivo] || MOTIVO_CFG.ajuste
              return (
                <Box key={m._id} sx={{
                  display: "grid", gridTemplateColumns: "2fr 0.8fr 0.8fr 0.7fr 1.5fr 1.2fr",
                  alignItems: "center", p: "13px 20px", gap: "10px", borderRadius: "14px",
                  "&:hover": { background: "rgba(255,107,53,0.02)" },
                }}>
                  <Box>
                    <Typography sx={{ fontFamily: T.font, fontWeight: 600, fontSize: ".86rem", color: T.t1 }}>
                      {m.productoId?.nombre || "—"}
                    </Typography>
                    {m.proveedor && (
                      <Typography sx={{ fontFamily: T.font, fontSize: ".70rem", color: T.t3 }}>{m.proveedor}</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {esEntrada ? <TrendingUp size={14} color={T.green} /> : <TrendingDown size={14} color={T.r1} />}
                    <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", fontWeight: 700, color: esEntrada ? T.green : T.r1 }}>
                      {esEntrada ? "Entrada" : "Salida"}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".90rem", color: esEntrada ? T.green : T.r1 }}>
                    {esEntrada ? "+" : "-"}{m.cantidad}
                  </Typography>
                  <Box sx={{ background: motivoCfg.bg, px: "8px", py: "4px", borderRadius: "8px", width: "fit-content" }}>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".70rem", fontWeight: 700, color: motivoCfg.color }}>{motivoCfg.label}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".78rem", color: T.t2 }}>
                    {m.nota || "—"}
                  </Typography>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", color: T.t3 }}>
                    {fmtFecha(m.fecha)}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "16px" }}>
          <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
            {total} movimientos
          </Typography>
          <Box sx={{ display: "flex", gap: "6px" }}>
            <Button sx={pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <ArrowLeft size={14} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} sx={i === page ? pageBtnOn : pageBtn} onClick={() => setPage(i)}>{i + 1}</Button>
            ))}
            <Button sx={pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <ArrowRight size={14} />
            </Button>
          </Box>
        </Box>
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
    // Forzar re-render de la pestaña activa cambiando a movimientos y volviendo
    setTab(t => t === "stock" ? "_reload" : "stock")
    setTimeout(() => setTab(t => t === "_reload" ? "stock" : "movimientos"), 50)
  }

  const tabStyle = (active) => ({
    fontFamily: T.font, fontWeight: 700, fontSize: ".84rem",
    padding: "10px 22px", borderRadius: "14px", cursor: "pointer",
    border: "none", transition: "all .25s ease",
    background: active ? T.go : "transparent",
    color: active ? "#fff" : T.t2,
    boxShadow: active ? T.glow : "none",
  })

  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative" }}>
      <GlassOrb size={260} top={-80} right={-60} color="rgba(255,140,80,0.4)" dur={12} />
      <GlassOrb size={180} bottom={60} left={-50} color="rgba(255,100,50,0.3)" delay={4} dur={9} />

      {/* ═══ HERO HEADER ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        ...glassCard, borderRadius: T.rad3, p: "24px 28px", mb: "20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,107,53,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <Box sx={{ animation: "sa-breathe 4s ease-in-out infinite" }}><InvIcon3D /></Box>
          <Box>
            <Typography sx={{ fontFamily: `${T.fontH} !important`, fontSize: "1.45rem !important", fontWeight: "800 !important", color: `${T.t1} !important`, lineHeight: 1.2 }}>
              Inventario
            </Typography>
            <Typography sx={{ fontSize: ".86rem", color: T.t3, mt: "5px", fontFamily: T.font }}>
              Control de stock y movimientos de mercancía
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setModalAjuste(true)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: "14px",
            border: "1.5px solid rgba(245,158,11,0.30)", background: "rgba(245,158,11,0.08)",
            cursor: "pointer", fontFamily: T.font, fontWeight: 700, fontSize: ".84rem", color: "#D97706",
          }}>
            <RefreshCw size={15} /> Ajuste manual
          </button>
          <button onClick={() => setModalEntrada(true)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "14px",
            border: "none", background: T.go, cursor: "pointer",
            fontFamily: T.font, fontWeight: 700, fontSize: ".84rem", color: "#fff",
            boxShadow: T.glow,
          }}>
            <Plus size={16} /> Registrar Entrada
          </button>
        </Box>
      </MotionBox>

      {/* ═══ TABS ═══ */}
      <Box sx={{ display: "flex", gap: "8px", mb: "20px", background: "rgba(255,255,255,0.60)", backdropFilter: "blur(12px)", borderRadius: "18px", p: "6px", border: "1px solid rgba(255,255,255,0.5)", width: "fit-content" }}>
        <button style={tabStyle(tab === "stock")} onClick={() => setTab("stock")}>
          Stock Actual
        </button>
        <button style={tabStyle(tab === "movimientos")} onClick={() => setTab("movimientos")}>
          Movimientos
        </button>
      </Box>

      {/* ═══ CONTENIDO ═══ */}
      <AnimatePresence mode="wait">
        {tab === "stock" && (
          <MotionBox key="stock" variants={scaleV} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <TabStock onRegistrarEntrada={() => setModalEntrada(true)} onAjuste={() => setModalAjuste(true)} />
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
