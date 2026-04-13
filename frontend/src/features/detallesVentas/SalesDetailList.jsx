import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Box, InputAdornment, Tooltip, MenuItem,
} from "@mui/material"
import {
  Search, RefreshCw, FileText, Package, ArrowLeft, ArrowRight,
  Calendar, DollarSign, TrendingUp, CheckCircle, XCircle,
} from "lucide-react"
import ventasService from "../ventas/ventas.service.js"
import productosService from "../productos/productos.service.js"

/* ─── DESIGN TOKENS ─── */
const T = {
  o1: "#FF6B35", o2: "#FF3D00", o3: "#FF8F5E", o4: "#FFF0EB",
  r1: "#EF4444", y1: "#F59E0B", green: "#22C55E", blue: "#3B82F6",
  t1: "#1A1A2E", t2: "#4A4A68", t3: "#9CA3AF", t4: "#C5C8D4",
  bg: "#FFF8F5", bg2: "#FFFFFF", bg3: "#FAF8F6",
  go: "linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)",
  border: "rgba(255,255,255,0.50)",
  border2: "rgba(255,107,53,0.22)",
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

if (typeof document !== "undefined" && !document.getElementById("sa-user-anims3d")) {
  const s = document.createElement("style"); s.id = "sa-user-anims3d"
  s.textContent = `
    @keyframes sa-float1{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}25%{transform:translate(14px,-22px) scale(1.06) rotate(6deg)}50%{transform:translate(-10px,-38px) scale(0.96) rotate(-4deg)}75%{transform:translate(18px,-12px) scale(1.04) rotate(3deg)}}
    @keyframes sa-float2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-18px,14px) scale(1.1)}66%{transform:translate(14px,-12px) scale(0.94)}}
    @keyframes sa-float3{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-22px,-18px) rotate(180deg)}}
    @keyframes sa-breathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.07) translateY(-6px)}}
    @keyframes sa-glow-pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.75;transform:scale(1.18)}}
    @keyframes sa-pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2);opacity:0}}
  `
  document.head.appendChild(s)
}

/* ─── STYLES ─── */
const glassCard = {
  background: T.glass2, backdropFilter: T.blur, WebkitBackdropFilter: T.blur,
  border: `1px solid ${T.border}`, boxShadow: T.neu,
}
const cancelBtnSx = {
  fontFamily: `${T.font} !important`, fontWeight: "600 !important", color: `${T.t2} !important`,
  borderRadius: "16px !important", padding: "11px 26px !important",
  border: "1.5px solid rgba(0,0,0,0.06) !important", textTransform: "none !important",
  background: "rgba(255,255,255,0.75) !important", backdropFilter: "blur(16px) !important",
  "&:hover": { background: "rgba(255,255,255,0.95) !important", boxShadow: "0 4px 16px rgba(0,0,0,0.06) !important", transform: "translateY(-1px)" },
}
const pageBtn = {
  width: 36, height: 36, borderRadius: "12px",
  background: "rgba(255,255,255,0.65)", color: T.t3,
  border: `1px solid ${T.border}`, backdropFilter: "blur(16px)",
  fontFamily: T.font, fontSize: ".80rem", fontWeight: 600,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", minWidth: "unset", p: 0,
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  "&:hover": { background: T.go, color: "#fff", borderColor: "transparent", boxShadow: T.glow, transform: "translateY(-2px)" },
}
const pageBtnOn = { ...pageBtn, background: `${T.go} !important`, color: "#fff !important", borderColor: "transparent !important", boxShadow: `${T.glow} !important`, transform: "translateY(-2px) !important" }
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "#fff",
    "& fieldset": { borderColor: "rgba(0,0,0,0.10)" },
    "&:hover fieldset": { borderColor: T.o1 },
    "&.Mui-focused fieldset": { borderColor: T.o1, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontFamily: T.font, color: T.t2, "&.Mui-focused": { color: T.o1 } },
}

/* ─── 3D Icon ─── */
const DetallesIcon3D = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(255,107,53,0.35))" }}>
    <defs>
      <linearGradient id="dt3d" x1="8" y1="4" x2="56" y2="60">
        <stop offset="0%" stopColor="#FFB088" />
        <stop offset="40%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#E83D00" />
      </linearGradient>
      <linearGradient id="dt3dSpec" x1="20%" y1="0%" x2="70%" y2="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <circle cx="32" cy="32" r="28" fill="url(#dt3d)" />
    <circle cx="32" cy="32" r="22" fill="url(#dt3dSpec)" />
    <rect x="22" y="20" width="20" height="24" rx="2" stroke="#fff" strokeWidth="2.5" fill="none" />
    <line x1="26" y1="27" x2="38" y2="27" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="32" x2="38" y2="32" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="37" x2="34" y2="37" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
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

const MotionBox = motion.create(Box)
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const itemV = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }
const scaleV = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } } }

/* ═══════════════════════════════════════════════════════════════ */
const SalesDetailList = () => {
  const [detalles, setDetalles] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterProducto, setFilterProducto] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (desde) params.desde = desde
      if (hasta) params.hasta = hasta
      if (filterProducto) params.producto = filterProducto
      const [d, p] = await Promise.all([
        ventasService.getDetallesVentas(params),
        productosService.getProductos(),
      ])
      setDetalles(d); setProductos(p)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [desde, hasta, filterProducto]) // eslint-disable-line

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return detalles
    return detalles.filter((d) =>
      d.nombreProducto?.toLowerCase().includes(q) ||
      d.venta?.numero?.toLowerCase().includes(q) ||
      d.venta?.clienteSnapshot?.nombre?.toLowerCase().includes(q)
    )
  }, [detalles, search])

  const kpis = useMemo(() => {
    const activos = filtered.filter((d) => d.venta?.estado === "completada")
    const totalUnidades = activos.reduce((s, d) => s + (d.cantidad || 0), 0)
    const totalFacturado = activos.reduce((s, d) => s + (d.subtotal || 0), 0)
    const productosDistintos = new Set(activos.map((d) => String(d.producto?._id || d.producto))).size
    return { totalUnidades, totalFacturado, productosDistintos }
  }, [filtered])

  const topProductos = useMemo(() => {
    const mapa = new Map()
    for (const d of filtered) {
      if (d.venta?.estado !== "completada") continue
      const key = d.nombreProducto
      const prev = mapa.get(key) || { nombre: key, cantidad: 0, total: 0 }
      prev.cantidad += d.cantidad || 0
      prev.total += d.subtotal || 0
      mapa.set(key, prev)
    }
    return Array.from(mapa.values()).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
  }, [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage)

  const EstadoPill = ({ estado }) => (
    <Box component="span" sx={{
      display: "inline-flex", alignItems: "center", gap: "7px",
      padding: "5px 14px", borderRadius: "24px",
      fontFamily: T.font, fontSize: ".72rem", fontWeight: 600,
      backdropFilter: "blur(8px)",
      ...(estado === "completada"
        ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "0 2px 8px rgba(34,197,94,0.06)" }
        : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "0 2px 8px rgba(239,68,68,0.06)" }),
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: estado === "completada" ? "#22C55E" : "#EF4444", boxShadow: estado === "completada" ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)" }} />
      {estado === "completada" ? "Completada" : "Anulada"}
    </Box>
  )

  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative", minHeight: "calc(100vh - 100px)" }}>
      <Box sx={{ position: "fixed", inset: 0, zIndex: -3, pointerEvents: "none", background: "#F5F7FA" }} />
      <Box sx={{ position: "fixed", inset: 0, zIndex: -2, pointerEvents: "none", opacity: 0.025, backgroundImage: "radial-gradient(circle, #FF6B35 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <GlassOrb size={75} top="3%" left="6%" color="rgba(255,107,53,0.18)" delay={0} dur={14} anim="sa-float1" />
      <GlassOrb size={45} top="12%" right="10%" color="rgba(59,130,246,0.15)" delay={2} dur={11} anim="sa-float2" />
      <GlassOrb size={28} top="25%" right="25%" color="rgba(34,197,94,0.12)" delay={0.5} dur={9} anim="sa-float3" />
      <GlassOrb size={55} bottom="18%" left="4%" color="rgba(255,80,20,0.14)" delay={3} dur={13} anim="sa-float2" />
      <GlassOrb size={35} bottom="30%" right="6%" color="rgba(255,107,53,0.10)" delay={4} dur={12} anim="sa-float1" />

      {/* HERO */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        ...glassCard, borderRadius: T.rad3, p: "30px 34px", mb: "22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)", pointerEvents: "none" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1 }}>
          <Box sx={{ animation: "sa-breathe 4s ease-in-out infinite", position: "relative" }}>
            <DetallesIcon3D />
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
              Detalles de Ventas
            </Typography>
            <Typography sx={{ fontSize: ".88rem", color: T.t3, mt: "6px", fontFamily: T.font }}>
              Análisis detallado de productos vendidos
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Recargar">
          <Button onClick={load} sx={{ ...cancelBtnSx, minWidth: 50, p: "11px !important" }}><RefreshCw size={16} /></Button>
        </Tooltip>
      </MotionBox>

      {/* KPIs */}
      <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", mb: "22px" }}>
        {[
          { label: "TOTAL FACTURADO", value: `$${kpis.totalFacturado.toLocaleString("es-CO")}`, desc: "ventas completadas", color: T.o1, icon: <DollarSign size={18} /> },
          { label: "UNIDADES VENDIDAS", value: kpis.totalUnidades.toLocaleString("es-CO"), desc: "items totales", color: T.green, icon: <Package size={18} /> },
          { label: "PRODUCTOS DISTINTOS", value: kpis.productosDistintos, desc: "referencias únicas", color: T.blue, icon: <TrendingUp size={18} /> },
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
            <Typography sx={{ fontFamily: T.fontH, fontSize: "1.65rem", fontWeight: 900, lineHeight: 1, color: T.t1, mb: "5px" }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", fontWeight: 500, color: T.t3 }}>{stat.desc}</Typography>
          </MotionBox>
        ))}
      </MotionBox>

      {/* TOP PRODUCTOS */}
      {topProductos.length > 0 && (
        <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{ ...glassCard, borderRadius: T.rad3, p: "24px 28px", mb: "22px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "12px", background: T.go,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: T.glow, color: "#fff",
            }}>
              <TrendingUp size={18} />
            </Box>
            <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, fontSize: "1.1rem" }}>
              Top 5 productos más vendidos
            </Typography>
          </Box>
          <Box>
            {topProductos.map((p, i) => {
              const max = topProductos[0].cantidad || 1
              const pct = (p.cantidad / max) * 100
              return (
                <MotionBox key={i} variants={itemV} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: .6, alignItems: "center" }}>
                    <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.t1, fontSize: ".92rem" }}>
                      <Box component="span" sx={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 24, height: 24, borderRadius: "8px", background: T.go, color: "#fff",
                        fontSize: ".72rem", fontWeight: 800, mr: 1.2, boxShadow: T.glow,
                      }}>{i + 1}</Box>
                      {p.nombre}
                    </Typography>
                    <Typography sx={{ fontFamily: T.font, color: T.t2, fontSize: ".85rem" }}>
                      <b style={{ color: T.o1 }}>{p.cantidad}</b> uds · ${p.total.toLocaleString("es-CO")}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 10, background: "rgba(255,107,53,0.08)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: .8, delay: i * .08, ease: "easeOut" }}
                      style={{ height: "100%", background: T.go, borderRadius: 6, boxShadow: T.glow }}
                    />
                  </Box>
                </MotionBox>
              )
            })}
          </Box>
        </MotionBox>
      )}

      {/* FILTROS */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        display: "flex", alignItems: "center", gap: "14px", mb: "22px", flexWrap: "wrap",
        ...glassCard, borderRadius: "18px", p: "14px 18px",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 220 }}>
          <Search size={17} color={T.t3} strokeWidth={2} />
          <input style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%" }}
            placeholder="Buscar por producto, venta o cliente..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </Box>
        <TextField select label="Producto" size="small" value={filterProducto}
          onChange={(e) => setFilterProducto(e.target.value)} sx={{ ...fieldSx, minWidth: 180 }}>
          <MenuItem value="">Todos</MenuItem>
          {productos.map((p) => <MenuItem key={p._id} value={p._id}>{p.nombre}</MenuItem>)}
        </TextField>
        <TextField type="date" label="Desde" size="small" sx={{ ...fieldSx, minWidth: 150 }}
          InputLabelProps={{ shrink: true }} value={desde} onChange={(e) => setDesde(e.target.value)} />
        <TextField type="date" label="Hasta" size="small" sx={{ ...fieldSx, minWidth: 150 }}
          InputLabelProps={{ shrink: true }} value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </MotionBox>

      {/* TABLA */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{ ...glassCard, borderRadius: T.rad3, p: "8px", mb: "22px" }}>
        {pageItems.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1.8fr 0.6fr 1fr 1fr 1fr", px: "26px", py: "16px" }}>
            {["VENTA", "FECHA", "CLIENTE", "PRODUCTO", "CANT.", "PRECIO", "SUBTOTAL", "ESTADO"].map((h) => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.4px", textTransform: "uppercase", color: T.t4,
                ...(h === "ESTADO" ? { textAlign: "center" } : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        <AnimatePresence mode="wait">
          <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "flex", flexDirection: "column", gap: "8px", p: pageItems.length > 0 ? "0 8px 8px" : "0" }}>
            {loading && <Box sx={{ textAlign: "center", p: 5, color: T.t3 }}>Cargando detalles...</Box>}

            {!loading && pageItems.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 88, height: 88, borderRadius: "50%", background: "rgba(255,107,53,0.08)", mb: 2 }}>
                  <FileText size={42} color={T.o1} />
                </Box>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, fontSize: "1.1rem" }}>No hay detalles</Typography>
                <Typography sx={{ color: T.t3, fontSize: ".88rem", mt: .5 }}>Ajusta los filtros o registra nuevas ventas</Typography>
              </Box>
            )}

            {!loading && pageItems.map((d) => (
              <MotionBox key={d._id} variants={itemV}
                whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                sx={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1.8fr 0.6fr 1fr 1fr 1fr",
                  alignItems: "center", p: "16px 22px", borderRadius: "18px",
                  background: "rgba(255,255,255,0.68)", backdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)",
                  "&:hover": { borderColor: "rgba(255,107,53,0.12)", background: "rgba(255,255,255,0.82)" },
                }}>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.o1, fontSize: ".92rem" }}>
                  {d.venta?.numero || "—"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: .7, color: T.t2, fontSize: ".82rem", fontFamily: T.font }}>
                  <Calendar size={13} />
                  {d.venta?.fechaVenta ? new Date(d.venta.fechaVenta).toLocaleDateString("es-CO") : new Date(d.createdAt).toLocaleDateString("es-CO")}
                </Box>
                <Typography sx={{ fontFamily: T.font, fontSize: ".84rem", color: T.t1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.venta?.clienteSnapshot?.nombre || "Sin cliente"}
                </Typography>
                <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t1, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.nombreProducto}
                </Typography>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1 }}>{d.cantidad}</Typography>
                <Typography sx={{ fontFamily: T.font, fontSize: ".84rem", color: T.t2 }}>
                  ${(d.precioUnitario || 0).toLocaleString("es-CO")}
                </Typography>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.o1, fontSize: ".95rem" }}>
                  ${(d.subtotal || 0).toLocaleString("es-CO")}
                </Typography>
                <Box sx={{ textAlign: "center" }}><EstadoPill estado={d.venta?.estado} /></Box>
              </MotionBox>
            ))}
          </MotionBox>
        </AnimatePresence>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, p: 2 }}>
            <Button sx={pageBtn} disabled={pageSafe === 1} onClick={() => setPage(pageSafe - 1)}><ArrowLeft size={14} /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pageSafe - 3), pageSafe + 2).map((n) => (
              <Button key={n} sx={n === pageSafe ? pageBtnOn : pageBtn} onClick={() => setPage(n)}>{n}</Button>
            ))}
            <Button sx={pageBtn} disabled={pageSafe === totalPages} onClick={() => setPage(pageSafe + 1)}><ArrowRight size={14} /></Button>
          </Box>
        )}
      </MotionBox>
    </Box>
  )
}

export default SalesDetailList
export { SalesDetailList as DetallesVentasList }
