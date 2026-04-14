import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Box, InputAdornment, MenuItem, Tooltip,
} from "@mui/material"
import {
  Search, RefreshCw, Layers, TrendingUp, TrendingDown,
  BarChart2, Package, ArrowLeft, ArrowRight, Calendar,
} from "lucide-react"
import inventarioService from "./inventario.service.js"
import productosService from "../productos/productos.service.js"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — idénticos a UsuariosList
   ═══════════════════════════════════════════════════════════════ */
const T = {
  o1: "#FF6B35", o2: "#FF3D00", o3: "#FF8F5E", o4: "#FFF0EB",
  r1: "#EF4444", y1: "#F59E0B", green: "#22C55E", green2: "#BBF7D0",
  blue: "#3B82F6",
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
   ANIMATION KEYFRAMES — mismo id que usuarios para no duplicar
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
   REUSABLE STYLES — iguales a UsuariosList
   ═══════════════════════════════════════════════════════════════ */
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
  "& .MuiSelect-select": { fontFamily: T.font },
}

/* ═══════════════════════════════════════════════════════════════
   3D DECORATIVE ELEMENTS — estilo idéntico a UsuariosList
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
    </defs>
    <circle cx="32" cy="32" r="28" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <circle cx="32" cy="32" r="28" fill="url(#inv3d)" />
    <circle cx="32" cy="32" r="22" fill="url(#inv3dSpec)" />
    {/* Layers icon */}
    <path d="M32 20L20 26L32 32L44 26L32 20Z" stroke="#fff" strokeWidth="2" fill="rgba(255,255,255,0.2)" strokeLinejoin="round" />
    <path d="M20 32L32 38L44 32" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 38L32 44L44 38" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

const EmptyIllustration = () => (
  <Box sx={{ position: "relative", width: 240, height: 180, mx: "auto", mb: 3 }}>
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
        <circle cx="50" cy="50" r="38" fill="url(#emInvG)" filter="url(#emInvS)" />
        <path d="M50 35L35 43L50 51L65 43L50 35Z" stroke="white" strokeWidth="3" fill="rgba(255,255,255,0.2)" strokeLinejoin="round" />
        <path d="M35 51L50 59L65 51" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 59L50 67L65 59" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  </Box>
)

/* ═══════════════════════════════════════════════════════════════
   FRAMER MOTION VARIANTS — iguales a UsuariosList
   ═══════════════════════════════════════════════════════════════ */
const MotionBox = motion.create(Box)
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const itemV = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }
const scaleV = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } } }

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const fmtFecha = (d) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const MOTIVO_CFG = {
  venta:  { label: "Venta",   color: T.o1,    bg: "rgba(255,107,53,0.08)"  },
  compra: { label: "Compra",  color: T.blue,  bg: "rgba(59,130,246,0.08)"  },
  ajuste: { label: "Ajuste",  color: T.y1,    bg: "rgba(245,158,11,0.08)"  },
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const InventarioList = () => {
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [total, setTotal]             = useState(0)
  const [totalPages, setTotalPages]   = useState(1)

  const [searchTerm,      setSearchTerm]      = useState("")
  const [filterProducto,  setFilterProducto]  = useState("")
  const [filterTipo,      setFilterTipo]      = useState("")
  const [desde,           setDesde]           = useState("")
  const [hasta,           setHasta]           = useState("")
  const [page,            setPage]            = useState(0)
  const rowsPerPage = 10

  /* ─── Fetch movimientos ─── */
  const fetchMovimientos = async () => {
    setLoading(true)
    try {
      const params = { page: page + 1, limit: rowsPerPage }
      if (filterProducto) params.productoId = filterProducto
      if (filterTipo)     params.tipo       = filterTipo
      if (desde)          params.desde      = desde
      if (hasta)          params.hasta      = hasta

      const data = await inventarioService.getMovimientos(params)
      setMovimientos(data.movimientos || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      setMovimientos([]); setTotal(0); setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMovimientos() }, [page, filterProducto, filterTipo, desde, hasta])

  useEffect(() => {
    productosService.getProductos()
      .then(d => setProductos(Array.isArray(d) ? d : d?.productos || []))
      .catch(() => {})
  }, [])

  /* Reset page on filter change */
  useEffect(() => { setPage(0) }, [filterProducto, filterTipo, desde, hasta])

  /* ─── Client-side search filter ─── */
  const filtered = searchTerm.trim()
    ? movimientos.filter(m => {
        const q = searchTerm.toLowerCase()
        return (
          m.productoId?.nombre?.toLowerCase().includes(q) ||
          m.usuarioId?.nombre?.toLowerCase().includes(q)  ||
          m.motivo?.toLowerCase().includes(q)             ||
          m.referenciaId?.numero?.toLowerCase().includes(q)
        )
      })
    : movimientos

  /* ─── KPIs (sobre la página actual) ─── */
  const kpiEntradas = movimientos.filter(m => m.tipo === "entrada").reduce((a, m) => a + m.cantidad, 0)
  const kpiSalidas  = movimientos.filter(m => m.tipo === "salida" ).reduce((a, m) => a + m.cantidad, 0)

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative", minHeight: "calc(100vh - 100px)" }}>

      {/* ═══ ANIMATED BACKGROUND ═══ */}
      <Box sx={{ position: "fixed", inset: 0, zIndex: -3, pointerEvents: "none", background: "#F5F7FA" }} />
      <Box sx={{ position: "fixed", inset: 0, zIndex: -2, pointerEvents: "none", opacity: 0.025, backgroundImage: "radial-gradient(circle, #FF6B35 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* ═══ FLOATING 3D GLASS ORBS ═══ */}
      <GlassOrb size={75} top="3%"  left="6%"   color="rgba(255,107,53,0.18)" delay={0}   dur={14} anim="sa-float1" />
      <GlassOrb size={45} top="12%" right="10%" color="rgba(255,143,94,0.15)" delay={2}   dur={11} anim="sa-float2" />
      <GlassOrb size={28} top="25%" right="25%" color="rgba(255,107,53,0.12)" delay={0.5} dur={9}  anim="sa-float3" />
      <GlassOrb size={55} bottom="18%" left="4%"  color="rgba(255,80,20,0.14)"  delay={3}   dur={13} anim="sa-float2" />
      <GlassOrb size={20} top="8%"  left="45%"  color="rgba(255,160,100,0.12)" delay={1.5} dur={8}  anim="sa-float3" />
      <GlassOrb size={35} bottom="30%" right="6%"  color="rgba(255,107,53,0.10)" delay={4}   dur={12} anim="sa-float1" />

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
            <InvIcon3D />
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
              Inventario — Kardex
            </Typography>
            <Typography sx={{ fontSize: ".88rem", color: T.t3, mt: "6px", fontFamily: T.font }}>
              Movimientos de stock generados automáticamente por pedidos
            </Typography>
          </Box>
        </Box>

        {/* Refresh button */}
        <Box sx={{ zIndex: 1 }}>
          <motion.button
            whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={fetchMovimientos}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
              color: "#fff", fontFamily: T.font, fontWeight: 700,
              fontSize: ".85rem", padding: "13px 28px", borderRadius: 16,
              border: "none", cursor: "pointer",
              boxShadow: "0 8px 28px rgba(255,107,53,.30)",
              position: "relative", overflow: "hidden",
            }}>
            <RefreshCw size={16} strokeWidth={2.5} /> Actualizar
          </motion.button>
        </Box>
      </MotionBox>

      {/* ═══ STATS CARDS ═══ */}
      <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", mb: "22px" }}>
        {[
          { label: "TOTAL",    value: total,        desc: "movimientos",  color: T.o1,   icon: <BarChart2   size={18} /> },
          { label: "ENTRADAS", value: kpiEntradas,  desc: "en esta página", color: T.green, icon: <TrendingUp  size={18} /> },
          { label: "SALIDAS",  value: kpiSalidas,   desc: "en esta página", color: T.r1,   icon: <TrendingDown size={18} /> },
          { label: "PRODUCTOS",value: productos.length, desc: "en catálogo", color: T.blue,  icon: <Package     size={18} /> },
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
      </MotionBox>

      {/* ═══ TOOLBAR — búsqueda + filtros ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", alignItems: "center", gap: "12px", mb: "22px", flexWrap: "wrap",
      }}>
        {/* Search */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          ...glassCard, borderRadius: "18px", p: "12px 18px", flex: 1, minWidth: 240,
          transition: "all .3s cubic-bezier(.25,.46,.45,.94)",
          "&:focus-within": { borderColor: "rgba(255,107,53,0.25)", boxShadow: `${T.neu}, 0 0 0 4px rgba(255,107,53,.06)` },
        }}>
          <Search size={17} color={T.t3} strokeWidth={2} />
          <input style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%" }}
            placeholder="Buscar producto, usuario, pedido..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </Box>

        {/* Producto */}
        <TextField select size="small" label="Producto" value={filterProducto}
          onChange={e => setFilterProducto(e.target.value)}
          sx={{ ...fieldSx, minWidth: 180 }}>
          <MenuItem value=""><em style={{ fontFamily: T.font }}>Todos</em></MenuItem>
          {productos.map(p => (
            <MenuItem key={p._id} value={p._id} sx={{ fontFamily: T.font, fontSize: ".85rem" }}>{p.nombre}</MenuItem>
          ))}
        </TextField>

        {/* Tipo */}
        <TextField select size="small" label="Tipo" value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          sx={{ ...fieldSx, minWidth: 140 }}>
          <MenuItem value=""><em style={{ fontFamily: T.font }}>Todos</em></MenuItem>
          <MenuItem value="entrada" sx={{ fontFamily: T.font }}>Entrada</MenuItem>
          <MenuItem value="salida"  sx={{ fontFamily: T.font }}>Salida</MenuItem>
        </TextField>

        {/* Desde */}
        <TextField size="small" label="Desde" type="date" value={desde}
          onChange={e => setDesde(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Calendar size={13} color={T.t3} /></InputAdornment> }}
          sx={{ ...fieldSx, minWidth: 165 }} />

        {/* Hasta */}
        <TextField size="small" label="Hasta" type="date" value={hasta}
          onChange={e => setHasta(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Calendar size={13} color={T.t3} /></InputAdornment> }}
          sx={{ ...fieldSx, minWidth: 165 }} />

        {/* Limpiar filtros */}
        {(filterProducto || filterTipo || desde || hasta || searchTerm) && (
          <motion.button
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setSearchTerm(""); setFilterProducto(""); setFilterTipo(""); setDesde(""); setHasta("") }}
            style={{
              padding: "11px 20px", borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.80)", cursor: "pointer",
              fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2,
            }}>
            Limpiar filtros
          </motion.button>
        )}
      </MotionBox>

      {/* ═══ TABLE CONTAINER ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{ ...glassCard, borderRadius: T.rad3, p: "8px", mb: "22px" }}>

        {/* Table header */}
        {!loading && filtered.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr 1.8fr", px: "26px", py: "16px" }}>
            {["PRODUCTO", "TIPO", "CANTIDAD", "MOTIVO", "PEDIDO", "FECHA / USUARIO"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.4px", textTransform: "uppercase", color: T.t4,
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        <AnimatePresence mode="wait">
          {/* Loading skeleton */}
          {loading ? (
            <MotionBox key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              sx={{ display: "flex", flexDirection: "column", gap: "8px", p: "0 8px 8px" }}>
              {[...Array(6)].map((_, i) => (
                <Box key={i} sx={{
                  height: 68, borderRadius: "18px",
                  background: "linear-gradient(90deg, rgba(255,255,255,0.7) 25%, rgba(240,240,240,0.8) 50%, rgba(255,255,255,0.7) 75%)",
                  backgroundSize: "200% 100%", animation: "sa-shimmer 1.4s infinite",
                }} />
              ))}
            </MotionBox>
          ) : (
            <MotionBox key="rows" variants={containerV} initial="hidden" animate="visible"
              sx={{ display: "flex", flexDirection: "column", gap: "8px", p: filtered.length > 0 ? "0 8px 8px" : "0" }}>

              {filtered.map((mov) => {
                const esEntrada = mov.tipo === "entrada"
                const motivoCfg = MOTIVO_CFG[mov.motivo] || { label: mov.motivo, color: T.t3, bg: "rgba(0,0,0,0.05)" }

                return (
                  <MotionBox key={mov._id} variants={itemV}
                    whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    sx={{
                      display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr 1.8fr",
                      alignItems: "center", p: "16px 22px", borderRadius: "18px",
                      background: "rgba(255,255,255,0.68)", backdropFilter: "blur(24px) saturate(180%)",
                      border: "1px solid rgba(255,255,255,0.55)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)",
                      cursor: "default", transition: "background .3s, border-color .3s",
                      "&:hover": { borderColor: "rgba(255,107,53,0.12)", background: "rgba(255,255,255,0.82)" },
                    }}>

                    {/* Producto */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: "12px", flexShrink: 0,
                        background: `${T.o1}12`, display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 4px 14px ${T.o1}18, inset 0 1px 2px rgba(255,255,255,0.6)`,
                      }}>
                        <Package size={17} color={T.o1} strokeWidth={2} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".88rem", color: T.t1, lineHeight: 1.3 }}>
                          {mov.productoId?.nombre ?? "—"}
                        </Typography>
                        <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4 }}>
                          {mov.unidad_medida}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Tipo */}
                    <Box>
                      <Box component="span" sx={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "5px 12px", borderRadius: "24px",
                        fontFamily: T.font, fontSize: ".73rem", fontWeight: 700,
                        backdropFilter: "blur(8px)", transition: "all .25s",
                        ...(esEntrada
                          ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "0 2px 8px rgba(34,197,94,0.06)" }
                          : { background: "rgba(239,68,68,0.08)", color: "#DC2626", boxShadow: "0 2px 8px rgba(239,68,68,0.06)" }),
                      }}>
                        <Box sx={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: esEntrada ? "#22C55E" : "#EF4444",
                          boxShadow: esEntrada ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)",
                        }} />
                        {esEntrada ? "Entrada" : "Salida"}
                      </Box>
                    </Box>

                    {/* Cantidad */}
                    <Box>
                      <Typography sx={{
                        fontFamily: T.font, fontSize: "1.10rem", fontWeight: 800, lineHeight: 1,
                        color: esEntrada ? "#16A34A" : "#DC2626",
                      }}>
                        {esEntrada ? "+" : "−"}{mov.cantidad}
                      </Typography>
                    </Box>

                    {/* Motivo */}
                    <Box>
                      <Box sx={{
                        display: "inline-flex", alignItems: "center",
                        background: motivoCfg.bg, borderRadius: "10px", padding: "5px 12px",
                        backdropFilter: "blur(8px)",
                      }}>
                        <Typography sx={{ fontFamily: T.font, fontSize: ".73rem", fontWeight: 700, color: motivoCfg.color, textTransform: "capitalize" }}>
                          {motivoCfg.label}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Pedido */}
                    <Box>
                      {mov.referenciaId?.numero ? (
                        <Box sx={{
                          display: "inline-flex", alignItems: "center",
                          background: "rgba(59,130,246,0.06)", borderRadius: "10px", padding: "5px 12px",
                          backdropFilter: "blur(8px)",
                        }}>
                          <Typography sx={{ fontFamily: T.font, fontSize: ".73rem", fontWeight: 700, color: T.blue }}>
                            {mov.referenciaId.numero}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontFamily: T.font, fontSize: ".73rem", color: T.t4 }}>—</Typography>
                      )}
                    </Box>

                    {/* Fecha / Usuario */}
                    <Box>
                      <Typography sx={{ fontFamily: T.font, fontWeight: 600, fontSize: ".82rem", color: T.t2, lineHeight: 1.3 }}>
                        {fmtFecha(mov.fecha)}
                      </Typography>
                      {mov.usuarioId?.nombre && (
                        <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4, mt: "2px" }}>
                          {mov.usuarioId.nombre}
                        </Typography>
                      )}
                    </Box>
                  </MotionBox>
                )
              })}
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
            borderRadius: T.rad, p: "50px 20px 60px", textAlign: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,248,245,0.7) 100%)",
          }}>
            <EmptyIllustration />
            <Typography sx={{ fontFamily: T.fontH, fontSize: "1.20rem", fontWeight: 800, color: T.t1, mb: "10px" }}>
              {total === 0 ? "Sin movimientos registrados" : "Sin resultados"}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t3, maxWidth: 400, mx: "auto", lineHeight: 1.6 }}>
              {total === 0
                ? "Los movimientos se generan automáticamente al confirmar o cancelar pedidos. No es posible crearlos manualmente."
                : "No se encontraron movimientos que coincidan con los filtros aplicados."}
            </Typography>
          </MotionBox>
        )}
      </MotionBox>

      {/* ═══ PAGINATION ═══ */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
      }}>
        <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
          Mostrando {total === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, total)} de {total} movimientos
        </Typography>

        <Box sx={{ display: "flex", gap: "6px" }}>
          <Button sx={pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ opacity: page === 0 ? .35 : 1 }}>
            <ArrowLeft size={14} />
          </Button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p
            if (totalPages <= 7) p = i
            else if (page <= 3) p = i
            else if (page >= totalPages - 4) p = totalPages - 7 + i
            else p = page - 3 + i
            return (
              <Button key={p} sx={page === p ? pageBtnOn : pageBtn} onClick={() => setPage(p)}>{p + 1}</Button>
            )
          })}

          <Button sx={pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{ opacity: page >= totalPages - 1 ? .35 : 1 }}>
            <ArrowRight size={14} />
          </Button>
        </Box>

        <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
          Página {page + 1} de {totalPages}
        </Typography>
      </MotionBox>

    </Box>
  )
}

export default InventarioList
