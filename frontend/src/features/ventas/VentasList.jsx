import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment, Tooltip, Autocomplete,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, XCircle, DollarSign,
  ArrowLeft, ArrowRight, Plus, User, CreditCard, RefreshCw, Ban, Receipt,
  TrendingUp,
} from "lucide-react"
import Swal from "sweetalert2"
import ventasService from "./ventas.service.js"
import clientesService from "../clientes/clientes.service.js"
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
    @keyframes sa-border-glow{0%,100%{box-shadow:0 32px 80px rgba(0,0,0,0.16),0 0 0 1px rgba(255,255,255,0.15)}50%{box-shadow:0 32px 80px rgba(0,0,0,0.22),0 0 0 1px rgba(255,107,53,0.25)}}
  `
  document.head.appendChild(s)
}

if (typeof document !== "undefined" && !document.getElementById("sa-swal-u")) {
  const s = document.createElement("style"); s.id = "sa-swal-u"
  s.textContent = `
    .swal2-icon.swal2-question{border-color:#FF6B35!important;color:#FF6B35!important}
    .swal2-icon.swal2-warning{border-color:#FF3D00!important;color:#FF3D00!important}
    .swal2-icon.swal2-success{border-color:#22C55E!important;color:#22C55E!important}
    .swal2-icon.swal2-error{border-color:#EF4444!important;color:#EF4444!important}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#FF6B35,#FF3D00)!important}
    .swal2-container{z-index:99999!important}
    .swal2-popup{z-index:100000!important;border-radius:22px!important;box-shadow:0 30px 70px rgba(0,0,0,0.18)!important;backdrop-filter:blur(12px)!important}
    .swal2-backdrop-show{z-index:99998!important;background:rgba(15,23,42,.18)!important;backdrop-filter:blur(10px)!important}
  `
  document.head.appendChild(s)
}
const swalFire = (o) => Swal.fire({ ...o, buttonsStyling: false, customClass: { popup: "sa-dash-pop" }, allowOutsideClick: !!o.showCancelButton })

/* ─── STYLES ─── */
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
const btnView = { ...actionBtn, background: "rgba(255,107,53,0.10)", color: T.o1, boxShadow: "0 2px 10px rgba(255,107,53,0.10)", "&:hover": { ...actionBtn["&:hover"], background: "rgba(255,107,53,0.20)", boxShadow: "0 8px 24px rgba(255,107,53,.25)" } }
const btnEdit = { ...actionBtn, background: "rgba(34,197,94,0.10)", color: T.green, boxShadow: "0 2px 10px rgba(34,197,94,0.10)", "&:hover": { ...actionBtn["&:hover"], background: "rgba(34,197,94,0.20)", boxShadow: "0 8px 24px rgba(34,197,94,.25)" } }
const btnDel = { ...actionBtn, background: "rgba(239,68,68,0.08)", color: T.r1, boxShadow: "0 2px 10px rgba(239,68,68,0.08)", "&:hover": { ...actionBtn["&:hover"], background: "rgba(239,68,68,0.18)", boxShadow: "0 8px 24px rgba(239,68,68,.25)" } }
const btnAnu = { ...actionBtn, background: "rgba(245,158,11,0.10)", color: T.y1, boxShadow: "0 2px 10px rgba(245,158,11,0.10)", "&:hover": { ...actionBtn["&:hover"], background: "rgba(245,158,11,0.20)", boxShadow: "0 8px 24px rgba(245,158,11,.25)" } }

const cancelBtnSx = {
  fontFamily: `${T.font} !important`, fontWeight: "600 !important", color: `${T.t2} !important`,
  borderRadius: "16px !important", padding: "11px 26px !important",
  border: "1.5px solid rgba(0,0,0,0.06) !important", textTransform: "none !important",
  background: "rgba(255,255,255,0.75) !important", backdropFilter: "blur(16px) !important",
  transition: "all .25s ease !important",
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
const pageBtnOn = { ...pageBtn, background: `${T.go} !important`, color: "#fff !important", borderColor: "transparent !important", boxShadow: `${T.glow} !important`, transform: "translateY(-2px) !important" }

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem",
    background: "#fff",
    "& fieldset": { borderColor: "rgba(0,0,0,0.10)" },
    "&:hover fieldset": { borderColor: T.o1 },
    "&.Mui-focused fieldset": { borderColor: T.o1, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontFamily: T.font, color: T.t2, "&.Mui-focused": { color: T.o1 } },
}

/* ─── 3D Icon ─── */
const VentasIcon3D = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(255,107,53,0.35))" }}>
    <defs>
      <linearGradient id="vt3d" x1="8" y1="4" x2="56" y2="60">
        <stop offset="0%" stopColor="#FFB088" />
        <stop offset="40%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#E83D00" />
      </linearGradient>
      <linearGradient id="vt3dSpec" x1="20%" y1="0%" x2="70%" y2="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#CC3300" opacity="0.2" transform="translate(0,3)" />
    <circle cx="32" cy="32" r="28" fill="url(#vt3d)" />
    <circle cx="32" cy="32" r="22" fill="url(#vt3dSpec)" />
    <text x="32" y="42" textAnchor="middle" fill="#fff" fontFamily="'Fraunces', serif" fontSize="30" fontWeight="900">$</text>
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

const METODOS = [
  { value: "efectivo",      label: "Efectivo" },
  { value: "tarjeta",       label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
  { value: "nequi",         label: "Nequi" },
  { value: "daviplata",     label: "Daviplata" },
  { value: "bancolombia",   label: "Bancolombia" },
  { value: "otro",          label: "Otro" },
]

/* ═══════════════════════════════════════════════════════════════ */
const VentasList = () => {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
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

  const emptyForm = {
    cliente: null, items: [], descuento: 0, impuesto: 0,
    metodoPago: "efectivo", referenciaPago: "", notas: "",
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [v, p, c] = await Promise.all([
        ventasService.getVentas(),
        productosService.getProductos(),
        clientesService.getClientes({ estado: "true" }),
      ])
      setVentas(v); setProductos(p); setClientes(c)
    } catch {
      swalFire({ icon: "error", title: "Error", text: "No se pudieron cargar las ventas" })
    } finally { setLoading(false) }
  }

  const filtered = ventas.filter((v) => {
    const q = search.trim().toLowerCase()
    const matchQ = !q ||
      v.numero?.toLowerCase().includes(q) ||
      v.clienteSnapshot?.nombre?.toLowerCase().includes(q) ||
      v.cliente?.nombre?.toLowerCase().includes(q) ||
      v.clienteSnapshot?.documento?.includes(q)
    const matchE = !filterEstado || v.estado === filterEstado
    return matchQ && matchE
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage)

  const totalVentas = filtered.reduce((s, v) => s + (v.estado === "completada" ? (v.total || 0) : 0), 0)
  const countCompletadas = filtered.filter((v) => v.estado === "completada").length
  const countAnuladas = filtered.filter((v) => v.estado === "anulada").length

  const openNew = () => { setEditing(false); setCurrent(null); setForm(emptyForm); setOpenForm(true) }

  const openEdit = (v) => {
    setEditing(true); setCurrent(v)
    setForm({
      cliente: null, items: [],
      descuento: v.descuento || 0, impuesto: v.impuesto || 0,
      metodoPago: v.metodoPago || "efectivo",
      referenciaPago: v.referenciaPago || "",
      notas: v.notas || "",
    })
    setOpenForm(true)
  }

  const openView = async (v) => {
    try {
      const full = await ventasService.getVentaById(v._id)
      setCurrent(full); setOpenDetail(true)
    } catch {
      swalFire({ icon: "error", title: "Error", text: "No se pudo cargar la venta" })
    }
  }

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { producto: "", nombreProducto: "", cantidad: 1, precioUnitario: 0 }] }))
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const changeItem = (i, field, value) => {
    setForm((f) => {
      const items = [...f.items]
      items[i] = { ...items[i], [field]: value }
      if (field === "producto") {
        const p = productos.find((x) => x._id === value)
        if (p) { items[i].nombreProducto = p.nombre; items[i].precioUnitario = p.precio }
      }
      return { ...f, items }
    })
  }

  const subtotalForm = form.items.reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0), 0)
  const totalForm = Math.max(0, subtotalForm - (Number(form.descuento) || 0) + (Number(form.impuesto) || 0))

  const save = async () => {
    try {
      if (editing) {
        await ventasService.updateVenta(current._id, {
          descuento: Number(form.descuento) || 0,
          impuesto: Number(form.impuesto) || 0,
          metodoPago: form.metodoPago,
          referenciaPago: form.referenciaPago,
          notas: form.notas,
        })
      } else {
        if (form.items.length === 0) return swalFire({ icon: "warning", title: "Sin productos", text: "Agrega al menos un producto" })
        for (const it of form.items) {
          if (!it.producto) return swalFire({ icon: "warning", title: "Producto faltante", text: "Selecciona un producto en cada fila" })
          if (!it.cantidad || it.cantidad < 1) return swalFire({ icon: "warning", title: "Cantidad inválida", text: "La cantidad debe ser al menos 1" })
        }
        await ventasService.createVenta({
          cliente: form.cliente?._id || null,
          items: form.items.map((i) => ({
            producto: i.producto, cantidad: Number(i.cantidad),
            precioUnitario: Number(i.precioUnitario),
          })),
          descuento: Number(form.descuento) || 0,
          impuesto: Number(form.impuesto) || 0,
          metodoPago: form.metodoPago,
          referenciaPago: form.referenciaPago,
          notas: form.notas,
        })
      }
      setOpenForm(false)
      await loadAll()
      swalFire({ icon: "success", title: editing ? "Venta actualizada" : "Venta registrada", timer: 1800, timerProgressBar: true, showConfirmButton: false })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo guardar" })
    }
  }

  const anular = async (v) => {
    const { value: motivo } = await swalFire({
      icon: "warning", title: `Anular venta ${v.numero}`,
      input: "text", inputLabel: "Motivo de anulación",
      inputPlaceholder: "Ej: Cliente devolvió el producto",
      showCancelButton: true, confirmButtonText: "Anular", cancelButtonText: "Cancelar",
      inputValidator: (val) => !val?.trim() && "El motivo es obligatorio",
    })
    if (!motivo) return
    try {
      await ventasService.anularVenta(v._id, motivo)
      await loadAll()
      swalFire({ icon: "success", title: "Venta anulada", timer: 1500, showConfirmButton: false })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo anular" })
    }
  }

  const remove = async (v) => {
    const res = await swalFire({
      icon: "question", title: "¿Eliminar venta?",
      text: `Se eliminará ${v.numero} y todos sus detalles.`,
      showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    })
    if (!res.isConfirmed) return
    try {
      await ventasService.deleteVenta(v._id)
      await loadAll()
      swalFire({ icon: "success", title: "Eliminada", timer: 1500, showConfirmButton: false })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo eliminar" })
    }
  }

  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box sx={{ background: T.go, p: "22px 28px", display: "flex", alignItems: "center", gap: "16px", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: -15, right: 25, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.07)", animation: "sa-float1 8s ease-in-out infinite" }} />
      <Box sx={{ position: "absolute", bottom: -10, right: 90, width: 35, height: 35, borderRadius: "50%", background: "rgba(255,255,255,0.05)", animation: "sa-float2 6s ease-in-out 1s infinite" }} />
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
        color: "#fff", flexShrink: 0,
      }} onClick={onClose}><X size={14} strokeWidth={2.5} /></button>
    </Box>
  )

  const EstadoPill = ({ estado }) => (
    <Box component="span" sx={{
      display: "inline-flex", alignItems: "center", gap: "7px",
      padding: "6px 16px", borderRadius: "24px",
      fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
      backdropFilter: "blur(8px)",
      ...(estado === "completada"
        ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "0 2px 8px rgba(34,197,94,0.06)" }
        : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "0 2px 8px rgba(239,68,68,0.06)" }),
    }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: estado === "completada" ? "#22C55E" : "#EF4444", boxShadow: estado === "completada" ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.4)" }} />
      {estado === "completada" ? "Completada" : "Anulada"}
    </Box>
  )

  return (
    <Box sx={{ fontFamily: T.font, width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative", minHeight: "calc(100vh - 100px)" }}>
      <Box sx={{ position: "fixed", inset: 0, zIndex: -3, pointerEvents: "none", background: "#F5F7FA" }} />
      <Box sx={{ position: "fixed", inset: 0, zIndex: -2, pointerEvents: "none", opacity: 0.025, backgroundImage: "radial-gradient(circle, #FF6B35 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <GlassOrb size={75} top="3%" left="6%" color="rgba(255,107,53,0.18)" delay={0} dur={14} anim="sa-float1" />
      <GlassOrb size={45} top="12%" right="10%" color="rgba(255,143,94,0.15)" delay={2} dur={11} anim="sa-float2" />
      <GlassOrb size={28} top="25%" right="25%" color="rgba(34,197,94,0.12)" delay={0.5} dur={9} anim="sa-float3" />
      <GlassOrb size={55} bottom="18%" left="4%" color="rgba(255,80,20,0.14)" delay={3} dur={13} anim="sa-float2" />
      <GlassOrb size={35} bottom="30%" right="6%" color="rgba(255,107,53,0.10)" delay={4} dur={12} anim="sa-float1" />

      {/* HERO */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{
        ...glassCard, borderRadius: T.rad3, p: "30px 34px", mb: "22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.06), transparent 70%)", pointerEvents: "none" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1 }}>
          <Box sx={{ animation: "sa-breathe 4s ease-in-out infinite", position: "relative" }}>
            <VentasIcon3D />
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
              Gestión de Ventas
            </Typography>
            <Typography sx={{ fontSize: ".88rem", color: T.t3, mt: "6px", fontFamily: T.font }}>
              Registro y control de ventas completadas
            </Typography>
          </Box>
        </Box>
      </MotionBox>

      {/* STATS */}
      <MotionBox variants={containerV} initial="hidden" animate="visible" sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "16px", mb: "22px" }}>
        {[
          { label: "TOTAL FACTURADO", value: `$${totalVentas.toLocaleString("es-CO")}`, desc: "ventas completadas", color: T.o1, icon: <DollarSign size={18} /> },
          { label: "COMPLETADAS", value: countCompletadas, desc: "activas", color: T.green, icon: <CheckCircle size={18} /> },
          { label: "ANULADAS", value: countAnuladas, desc: "canceladas", color: T.r1, icon: <XCircle size={18} /> },
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

      {/* TOOLBAR */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "22px", gap: "14px", flexWrap: "wrap" }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          ...glassCard, borderRadius: "18px", p: "12px 18px", minWidth: 260, flex: 1,
          "&:focus-within": { borderColor: "rgba(255,107,53,0.25)", boxShadow: `${T.neu}, 0 0 0 4px rgba(255,107,53,.06)` },
        }}>
          <Search size={17} color={T.t3} strokeWidth={2} />
          <input style={{ border: "none", outline: "none", background: "transparent", fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%" }}
            placeholder="Buscar por número, cliente o documento..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </Box>
        <TextField select size="small" value={filterEstado}
          onChange={(e) => { setFilterEstado(e.target.value); setPage(1) }}
          sx={{ ...fieldSx, minWidth: 160 }}>
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="completada">Completadas</MenuItem>
          <MenuItem value="anulada">Anuladas</MenuItem>
        </TextField>
        <Tooltip title="Recargar"><Button onClick={loadAll} sx={{ ...cancelBtnSx, minWidth: 46, p: "10px !important" }}><RefreshCw size={16} /></Button></Tooltip>
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
          <Plus size={16} strokeWidth={2.5} /> Nueva Venta
          <span style={{ position: "absolute", inset: 0, borderRadius: 16, border: "2px solid rgba(255,255,255,0.3)", animation: "sa-pulse-ring 2s ease-out infinite", pointerEvents: "none" }} />
        </motion.button>
      </MotionBox>

      {/* TABLE */}
      <MotionBox variants={scaleV} initial="hidden" animate="visible" sx={{ ...glassCard, borderRadius: T.rad3, p: "8px", mb: "22px" }}>
        {pageItems.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 1.2fr 1fr 1fr 180px", px: "26px", py: "16px" }}>
            {["N°", "FECHA", "CLIENTE", "MÉTODO", "TOTAL", "ESTADO", "ACCIONES"].map((h) => (
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
            {loading && <Box sx={{ textAlign: "center", p: 5, color: T.t3 }}>Cargando ventas...</Box>}

            {!loading && pageItems.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 88, height: 88, borderRadius: "50%", background: "rgba(255,107,53,0.08)", mb: 2 }}>
                  <DollarSign size={42} color={T.o1} />
                </Box>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, fontSize: "1.1rem" }}>No hay ventas</Typography>
                <Typography sx={{ color: T.t3, fontSize: ".88rem", mt: .5 }}>Registra tu primera venta para empezar</Typography>
              </Box>
            )}

            {!loading && pageItems.map((v) => (
              <MotionBox key={v._id} variants={itemV}
                whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                sx={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 2fr 1.2fr 1fr 1fr 180px",
                  alignItems: "center", p: "18px 22px", borderRadius: "18px",
                  background: "rgba(255,255,255,0.68)", backdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)",
                  "&:hover": { borderColor: "rgba(255,107,53,0.12)", background: "rgba(255,255,255,0.82)" },
                }}>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.o1, fontSize: ".95rem" }}>{v.numero}</Typography>
                <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>
                  {new Date(v.fechaVenta || v.createdAt).toLocaleDateString("es-CO")}
                </Typography>
                <Box>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".88rem", color: T.t1 }}>
                    {v.clienteSnapshot?.nombre || v.cliente?.nombre || "Venta sin cliente"}
                  </Typography>
                  {v.clienteSnapshot?.documento && (
                    <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", color: T.t3 }}>{v.clienteSnapshot.documento}</Typography>
                  )}
                </Box>
                <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", color: T.t2 }}>
                  {METODOS.find((m) => m.value === v.metodoPago)?.label || v.metodoPago}
                </Typography>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, fontSize: ".95rem" }}>
                  ${(v.total || 0).toLocaleString("es-CO")}
                </Typography>
                <Box sx={{ textAlign: "center" }}><EstadoPill estado={v.estado} /></Box>
                <Box sx={{ display: "flex", gap: .8, justifyContent: "center" }}>
                  <Tooltip title="Ver"><Button sx={btnView} onClick={() => openView(v)}><Eye size={16} /></Button></Tooltip>
                  {v.estado === "completada" && (
                    <>
                      <Tooltip title="Editar"><Button sx={btnEdit} onClick={() => openEdit(v)}><Edit2 size={16} /></Button></Tooltip>
                      <Tooltip title="Anular"><Button sx={btnAnu} onClick={() => anular(v)}><Ban size={16} /></Button></Tooltip>
                    </>
                  )}
                  <Tooltip title="Eliminar"><Button sx={btnDel} onClick={() => remove(v)}><Trash2 size={16} /></Button></Tooltip>
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

      {/* FORM DIALOG */}
      <Dialog key={editing ? current?._id : "new"} open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth
        sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(14px)", background: "rgba(15,23,42,.15)" } }}
        slotProps={{ paper: { sx: {
          borderRadius: "24px !important",
          boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
          border: "1px solid rgba(255,255,255,0.20)",
          background: "rgba(255,255,255,0.92) !important",
          backdropFilter: "blur(32px) saturate(200%)",
          fontFamily: T.font,
          overflow: "hidden",
        } } }}>
        <DlgHdr
          icon={<Receipt size={20} color="#fff" />}
          title={editing ? `Editar venta ${current?.numero || ""}` : "Nueva Venta"}
          sub={editing ? "Actualiza los datos de la venta" : "Registra una nueva venta en el sistema"}
          onClose={() => setOpenForm(false)}
        />
        <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
          {!editing && (
            <>
              <Autocomplete
                options={clientes}
                getOptionLabel={(o) => `${o.documento} — ${o.nombre}${o.apellido ? " " + o.apellido : ""}`}
                value={form.cliente}
                onChange={(_, v) => setForm({ ...form, cliente: v })}
                renderInput={(params) => <TextField {...params} label="Cliente (opcional)" size="small" sx={fieldSx}
                  InputProps={{ ...params.InputProps, startAdornment: <><InputAdornment position="start"><User size={15} /></InputAdornment>{params.InputProps.startAdornment}</> }} />}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, fontSize: "1rem" }}>Productos</Typography>
                <Button onClick={addItem} sx={{ ...cancelBtnSx, color: `${T.o1} !important`, borderColor: `${T.border2} !important` }} startIcon={<Plus size={14} />}>Agregar</Button>
              </Box>
              <Box sx={{ mb: 3 }}>
                {form.items.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 3, color: T.t3, border: `1.5px dashed rgba(0,0,0,0.08)`, borderRadius: T.rad2, background: "rgba(255,255,255,0.5)" }}>
                    Agrega productos a la venta
                  </Box>
                )}
                {form.items.map((it, i) => (
                  <Box key={i} sx={{ display: "grid", gridTemplateColumns: "2fr 90px 130px 40px", gap: 1, mb: 1 }}>
                    <TextField select size="small" sx={fieldSx} value={it.producto}
                      onChange={(e) => changeItem(i, "producto", e.target.value)}>
                      <MenuItem value="">Selecciona producto</MenuItem>
                      {productos.map((p) => <MenuItem key={p._id} value={p._id}>{p.nombre} — ${p.precio}</MenuItem>)}
                    </TextField>
                    <TextField type="number" size="small" sx={fieldSx} label="Cant."
                      value={it.cantidad} onChange={(e) => changeItem(i, "cantidad", e.target.value)}
                      inputProps={{ min: 1 }} />
                    <TextField type="number" size="small" sx={fieldSx} label="Precio"
                      value={it.precioUnitario} onChange={(e) => changeItem(i, "precioUnitario", e.target.value)}
                      inputProps={{ min: 0, step: "0.01" }} />
                    <Button sx={btnDel} onClick={() => removeItem(i)}><X size={16} /></Button>
                  </Box>
                ))}
              </Box>
            </>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField label="Descuento" type="number" size="small" sx={fieldSx}
              value={form.descuento} onChange={(e) => setForm({ ...form, descuento: e.target.value })} />
            <TextField label="Impuesto" type="number" size="small" sx={fieldSx}
              value={form.impuesto} onChange={(e) => setForm({ ...form, impuesto: e.target.value })} />
            <TextField select label="Método de pago" size="small" sx={fieldSx}
              value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><CreditCard size={14} /></InputAdornment> }}>
              {METODOS.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </TextField>
          </Box>
          <TextField label="Referencia de pago" size="small" fullWidth sx={{ ...fieldSx, mb: 2 }}
            value={form.referenciaPago} onChange={(e) => setForm({ ...form, referenciaPago: e.target.value })} />
          <TextField label="Notas" size="small" fullWidth multiline rows={2} sx={{ ...fieldSx, mb: 2 }}
            value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />

          {!editing && (
            <Box sx={{
              p: 2, ...glassCard, borderRadius: T.rad2,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <Typography sx={{ color: T.t2, fontFamily: T.font }}>Subtotal: <b>${subtotalForm.toLocaleString("es-CO")}</b></Typography>
              <Typography sx={{ fontFamily: T.fontH, fontWeight: 900, fontSize: "1.3rem", color: T.o1 }}>
                Total: ${totalForm.toLocaleString("es-CO")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: "14px 26px 22px !important", background: "transparent", borderTop: "1px solid rgba(0,0,0,0.04)", gap: "10px" }}>
          <Button onClick={() => setOpenForm(false)} sx={cancelBtnSx}>Cancelar</Button>
          <Button onClick={save} sx={submitBtnSx}>{editing ? "Actualizar" : "Registrar Venta"}</Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth
        sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(14px)", background: "rgba(15,23,42,.15)" } }}
        slotProps={{ paper: { sx: {
          borderRadius: "24px !important",
          boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.15) !important",
          border: "1px solid rgba(255,255,255,0.20)",
          background: "rgba(255,255,255,0.92) !important",
          backdropFilter: "blur(32px) saturate(200%)",
          fontFamily: T.font,
          overflow: "hidden",
        } } }}>
        {current && (
          <>
            <DlgHdr
              icon={<TrendingUp size={20} color="#fff" />}
              title={`Venta ${current.numero}`}
              sub={new Date(current.fechaVenta || current.createdAt).toLocaleString("es-CO")}
              onClose={() => setOpenDetail(false)}
            />
            <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
              <Box sx={{ mb: 2 }}><EstadoPill estado={current.estado} /></Box>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
                <Box sx={{ p: 2, ...glassCard, borderRadius: T.rad2 }}>
                  <Typography sx={{ fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Cliente</Typography>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.t1 }}>{current.clienteSnapshot?.nombre || current.cliente?.nombre || "Sin cliente"}</Typography>
                  {current.clienteSnapshot?.documento && <Typography sx={{ color: T.t2, fontSize: ".85rem" }}>{current.clienteSnapshot.documento}</Typography>}
                  {current.clienteSnapshot?.telefono && <Typography sx={{ color: T.t2, fontSize: ".85rem" }}>{current.clienteSnapshot.telefono}</Typography>}
                </Box>
                <Box sx={{ p: 2, ...glassCard, borderRadius: T.rad2 }}>
                  <Typography sx={{ fontSize: ".72rem", color: T.t3, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em", mb: .5 }}>Pago</Typography>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.t1 }}>Método: {METODOS.find((m) => m.value === current.metodoPago)?.label}</Typography>
                  {current.referenciaPago && <Typography sx={{ color: T.t2, fontSize: ".85rem" }}>Ref: {current.referenciaPago}</Typography>}
                  <Typography sx={{ color: T.t2, fontSize: ".85rem" }}>Vendedor: {current.vendedor?.nombre || "-"}</Typography>
                </Box>
              </Box>

              <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, mb: 1 }}>Productos</Typography>
              <Box sx={{ ...glassCard, borderRadius: T.rad2, overflow: "hidden", mb: 2 }}>
                <Box component="table" sx={{
                  width: "100%", borderCollapse: "collapse",
                  "& th, & td": { padding: "10px 14px", fontSize: ".86rem", textAlign: "left" },
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
                <Box sx={{ minWidth: 240, p: 2, ...glassCard, borderRadius: T.rad2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", color: T.t2 }}>Subtotal: <b>${(current.subtotal || 0).toLocaleString("es-CO")}</b></Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", color: T.t2 }}>Descuento: <b>-${(current.descuento || 0).toLocaleString("es-CO")}</b></Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", color: T.t2 }}>Impuesto: <b>${(current.impuesto || 0).toLocaleString("es-CO")}</b></Box>
                  <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", fontFamily: T.fontH, fontWeight: 900, fontSize: "1.2rem", color: T.o1 }}>
                    Total: ${(current.total || 0).toLocaleString("es-CO")}
                  </Box>
                </Box>
              </Box>

              {current.estado === "anulada" && current.motivoAnulacion && (
                <Box sx={{ mt: 2, p: 2, background: "rgba(239,68,68,0.08)", borderRadius: T.rad2, border: "1px solid rgba(239,68,68,0.25)" }}>
                  <Typography sx={{ color: T.r1, fontWeight: 800, mb: .5 }}>Motivo de anulación</Typography>
                  <Typography sx={{ color: T.t2 }}>{current.motivoAnulacion}</Typography>
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

export default VentasList
export { VentasList }
