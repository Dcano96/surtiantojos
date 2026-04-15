import { useState, useEffect } from "react"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment, Tooltip,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, XCircle,
  ArrowLeft, ArrowRight, Plus, Package, FileText, DollarSign,
  Image, Layers, AlertTriangle, Filter,
} from "lucide-react"
import Swal from "sweetalert2"
import productosService from "./productos.service.js"
import categoriasService from "../categorias/categorias.service.js"

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
if (typeof document !== "undefined" && !document.getElementById("sa-prod-anims")) {
  const s = document.createElement("style"); s.id = "sa-prod-anims"
  s.textContent = `
    @keyframes sa-prod-bob    { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-5px) scale(1.04)} }
    @keyframes sa-prod-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  `
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════════════════════════
   SWAL STYLE
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-prod-swal")) {
  const s = document.createElement("style"); s.id = "sa-prod-swal"
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
   SVG — 3D Package Icon for Header
   ═══════════════════════════════════════════════════════════════ */
const PackageIcon3D = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pk3dGrad" x1="8" y1="4" x2="48" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF8F5E" />
        <stop offset="0.5" stopColor="#FF6B35" />
        <stop offset="1" stopColor="#FF3D00" />
      </linearGradient>
      <linearGradient id="pk3dInner" x1="14" y1="10" x2="42" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(255,255,255,0.35)" />
        <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
      </linearGradient>
      <filter id="pk3dShadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#FF6B35" floodOpacity="0.30" />
      </filter>
    </defs>
    <circle cx="28" cy="30" r="22" fill="#FF6B35" opacity="0.08" />
    <rect x="10" y="10" width="36" height="36" rx="10" fill="url(#pk3dGrad)" filter="url(#pk3dShadow)" />
    <rect x="14" y="14" width="28" height="28" rx="7" fill="url(#pk3dInner)" />
    <path d="M28 18V38M20 22L28 26L36 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 22V34L28 38L36 34V22L28 18L20 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="44" cy="12" r="4" fill="#FF8F5E" opacity="0.6" />
    <circle cx="10" cy="44" r="3" fill="#FFB088" opacity="0.5" />
  </svg>
)

/* Empty State Illustration */
const EmptyIllustration = () => (
  <Box sx={{ position: "relative", width: 200, height: 140, mx: "auto", mb: 2 }}>
    <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,60,0.10) 0%, transparent 70%)", filter: "blur(18px)", pointerEvents: "none" }} />
    <Box sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -55%)", animation: "sa-prod-bob 4s ease-in-out infinite", zIndex: 2, filter: "drop-shadow(0 14px 28px rgba(255,107,53,0.35))" }}>
      <svg width="100" height="110" viewBox="0 0 100 110" fill="none">
        <defs>
          <linearGradient id="emProd1" x1="10" y1="5" x2="90" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD4A8" /><stop offset="0.55" stopColor="#FF8F5E" /><stop offset="1" stopColor="#E85D0A" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="103" rx="32" ry="6" fill="rgba(0,0,0,0.08)" />
        <rect x="15" y="10" width="70" height="80" rx="16" fill="url(#emProd1)" />
        <path d="M50 30V70M35 38L50 46L65 38" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 38V62L50 70L65 62V38L50 30L35 38Z" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  </Box>
)

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const STOCK_LOW = 5
const formatCOP = (v) => {
  const n = Number(v) || 0
  return "$ " + n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

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

/* ═══════════════════════════════════════════════════════════════
   COMPONENT — ProductosList
   ═══════════════════════════════════════════════════════════════ */
const ProductosList = () => {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedProd, setSelectedProd] = useState(null)
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", precio: "", stockInicial: "", stockMinimo: "", unidadMedida: "unidad", categoria: "", imagen: "", estado: true })
  const [formErrors, setFormErrors] = useState({ nombre: "", precio: "", stockInicial: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Cargar datos
  const fetchProductos = async () => {
    const data = await productosService.getProductos()
    setProductos(Array.isArray(data) ? data : [])
  }
  const fetchCategorias = async () => {
    const data = await categoriasService.getCategorias()
    setCategorias(Array.isArray(data) ? data : [])
  }
  useEffect(() => { fetchProductos(); fetchCategorias() }, [])

  // Categorías activas para el formulario
  const categoriasActivas = categorias.filter(c => c.estado)

  // Verificar duplicados (mismo nombre + misma categoría)
  const checkExists = (name, catId, excludeId = null) =>
    productos.some(p =>
      p.nombre.toLowerCase() === name.toLowerCase() &&
      (p.categoria?._id || p.categoria) === catId &&
      p._id !== excludeId
    )

  // Abrir modal crear/editar
  const handleOpen = (prod) => {
    setFormErrors({ nombre: "", precio: "", stockInicial: "" })
    if (prod) {
      // Edición: el stock NO se edita aquí, solo metadatos del producto
      setFormData({
        nombre: prod.nombre,
        descripcion: prod.descripcion || "",
        precio: prod.precio,
        stockInicial: "",      // No aplica en edición
        stockMinimo: prod.stockMinimo ?? "",
        unidadMedida: prod.unidadMedida || "unidad",
        categoria: prod.categoria?._id || prod.categoria || "",
        imagen: prod.imagen || "",
        estado: prod.estado,
      })
      setEditingId(prod._id)
    } else {
      setFormData({ nombre: "", descripcion: "", precio: "", stockInicial: "", stockMinimo: "", unidadMedida: "unidad", categoria: "", imagen: "", estado: true })
      setEditingId(null)
    }
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false); setEditingId(null)
    setFormData({ nombre: "", descripcion: "", precio: "", stockInicial: "", stockMinimo: "", unidadMedida: "unidad", categoria: "", imagen: "", estado: true })
    setFormErrors({ nombre: "", precio: "", stockInicial: "" })
  }

  // Abrir detalle
  const handleDetails = (prod) => { setSelectedProd(prod); setDetailsOpen(true) }

  // Manejo de cambios
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === "nombre") validateNombre(value)
    if (name === "precio") validatePrecio(value)
    if (name === "stockInicial") validateStockInicial(value)
  }

  const validateNombre = (value) => {
    let err = ""
    if (!value || !value.trim()) err = "El nombre es obligatorio"
    else if (value.length < 3) err = "Mínimo 3 caracteres"
    else if (value.length > 80) err = "Máximo 80 caracteres"
    else if (formData.categoria && checkExists(value.trim(), formData.categoria, editingId)) err = "Ya existe un producto con este nombre en esta categoría"
    setFormErrors(prev => ({ ...prev, nombre: err }))
    return !err
  }

  const validatePrecio = (value) => {
    let err = ""
    const n = Number(value)
    if (value === "" || value === null || value === undefined) err = "El precio es obligatorio"
    else if (isNaN(n) || n < 0) err = "Precio inválido"
    else if (n === 0) err = "El precio debe ser mayor a 0"
    setFormErrors(prev => ({ ...prev, precio: err }))
    return !err
  }

  const validateStockInicial = (value) => {
    // Solo obligatorio en creación
    if (editingId) return true
    let err = ""
    const n = Number(value)
    if (value === "" || value === null || value === undefined) err = "El stock inicial es obligatorio"
    else if (isNaN(n) || n < 0) err = "Stock inválido"
    else if (!Number.isInteger(n)) err = "El stock debe ser un número entero"
    setFormErrors(prev => ({ ...prev, stockInicial: err }))
    return !err
  }

  // Guardar
  const handleSubmit = async () => {
    const vN = validateNombre(formData.nombre)
    const vP = validatePrecio(formData.precio)
    const vS = editingId ? true : validateStockInicial(formData.stockInicial)
    if (!vN || !vP || !vS) return
    if (!formData.categoria) {
      await swalFire({ ...SW, icon: "warning", title: "Categoría requerida", text: "Selecciona una categoría para el producto." })
      return
    }
    try {
      if (editingId) {
        // En edición: nunca enviar stock, solo metadatos
        const payload = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: Number(formData.precio),
          stockMinimo: Number(formData.stockMinimo) || 0,
          unidadMedida: formData.unidadMedida,
          categoria: formData.categoria,
          imagen: formData.imagen,
          estado: formData.estado,
        }
        await productosService.updateProducto(editingId, payload)
      } else {
        // En creación: enviar stockInicial para que el backend genere el movimiento
        const payload = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: Number(formData.precio),
          stockInicial: Number(formData.stockInicial) || 0,
          stockMinimo: Number(formData.stockMinimo) || 0,
          unidadMedida: formData.unidadMedida,
          categoria: formData.categoria,
          imagen: formData.imagen,
        }
        await productosService.createProducto(payload)
      }
      handleClose()
      await fetchProductos()
      setTimeout(() => {
        swalFire({ ...SW, icon: "success", title: editingId ? "Producto actualizado" : "Producto creado", text: editingId ? "Los cambios se guardaron correctamente." : "El nuevo producto se registró correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      }, 300)
    } catch (e) {
      const msg = e.response?.data?.message || "Error al guardar el producto."
      await swalFire({ ...SW, icon: "error", title: "Error al guardar", text: msg })
    }
  }

  // Cambiar estado (toggle directo desde la tabla)
  const handleToggleEstado = async (prod) => {
    const nuevoEstado = prod.estado ? "desactivar" : "activar"
    const r = await swalFire({
      ...SW, title: `¿${prod.estado ? "Desactivar" : "Activar"} producto?`,
      text: `Se va a ${nuevoEstado} el producto "${prod.nombre}"`,
      icon: "question", showCancelButton: true,
      confirmButtonText: `Sí, ${nuevoEstado}`, cancelButtonText: "Cancelar",
    })
    if (r.isConfirmed) {
      try {
        await productosService.cambiarEstadoProducto(prod._id)
        await fetchProductos()
        setTimeout(() => {
          swalFire({ ...SW, icon: "success", title: "Estado actualizado", text: `Producto ${prod.estado ? "desactivado" : "activado"} correctamente.`, timer: 2000, timerProgressBar: true, showConfirmButton: false })
        }, 300)
      } catch (e) {
        await swalFire({ ...SW, icon: "error", title: "Error", text: e.response?.data?.message || "Error al cambiar estado." })
      }
    }
  }

  // Eliminar
  const handleDelete = async (prod) => {
    if (prod.estado) {
      await swalFire({ ...SW, icon: "warning", title: "Producto activo", text: "No puedes eliminar un producto activo. Desactívalo primero." })
      return
    }
    const r = await swalFire({
      ...SW, title: "¿Eliminar producto?", text: `Se eliminará permanentemente "${prod.nombre}". Esta acción no se puede deshacer.`,
      icon: "question", showCancelButton: true,
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    })
    if (r.isConfirmed) {
      try {
        await productosService.deleteProducto(prod._id)
        await fetchProductos()
        setTimeout(() => {
          swalFire({ ...SW, icon: "success", title: "Eliminado", text: "El producto se eliminó correctamente.", timer: 2000, timerProgressBar: true, showConfirmButton: false })
        }, 300)
      } catch (e) {
        await swalFire({ ...SW, icon: "error", title: "Error", text: e.response?.data?.message || "Error al eliminar." })
      }
    }
  }

  // Filtrado y paginación
  const filtered = productos.filter(p => {
    const matchSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = !filterCategoria || (p.categoria?._id || p.categoria) === filterCategoria
    return matchSearch && matchCat
  })
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
          <Box sx={{ animation: "sa-prod-bob 4s ease-in-out infinite" }}><PackageIcon3D /></Box>
          <Box>
            <Typography sx={{ fontFamily: `${T.fontH} !important`, fontSize: "1.40rem !important", fontWeight: "800 !important", color: `${T.t1} !important`, lineHeight: 1.2 }}>
              Gestión de Productos
            </Typography>
            <Typography sx={{ fontSize: ".86rem", color: T.t3, mt: "5px", fontFamily: T.font }}>
              Administra el catálogo de productos del sistema
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══ TOOLBAR ═══ */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "18px", gap: "14px", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          {/* Buscador */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#fff", border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "14px", p: "10px 16px", minWidth: 240,
            boxShadow: T.neu, transition: "all .25s",
            "&:focus-within": { borderColor: T.o1, boxShadow: `${T.neu}, 0 0 0 3px rgba(255,107,53,.08)` },
          }}>
            <Search size={17} color={T.t3} strokeWidth={2} />
            <input style={{
              border: "none", outline: "none", background: "transparent",
              fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%",
            }} placeholder="Buscar producto..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0) }} />
          </Box>

          {/* Filtro por categoría */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#fff", border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "14px", p: "10px 16px", minWidth: 200,
            boxShadow: T.neu, transition: "all .25s",
          }}>
            <Filter size={15} color={T.t3} strokeWidth={2} />
            <select value={filterCategoria} onChange={e => { setFilterCategoria(e.target.value); setPage(0) }}
              style={{
                border: "none", outline: "none", background: "transparent",
                fontFamily: T.font, fontSize: "0.86rem", color: T.t1, cursor: "pointer", flex: 1,
              }}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
          </Box>
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
          + Nuevo Producto
        </button>
      </Box>

      {/* ═══ TABLE ═══ */}
      <Box sx={{
        background: "#fff", borderRadius: T.rad3, p: "6px",
        boxShadow: T.shCard, border: "1px solid rgba(0,0,0,0.03)", mb: "18px",
      }}>
        {paginated.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "60px 2fr 1.3fr 1fr 0.8fr 0.8fr 160px", px: "24px", py: "14px", gap: "10px" }}>
            {["IMAGEN", "NOMBRE", "CATEGORÍA", "PRECIO", "STOCK", "ESTADO", "ACCIONES"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.2px", textTransform: "uppercase", color: T.t4,
                ...(["PRECIO", "STOCK", "ESTADO", "ACCIONES"].includes(h) ? { textAlign: "center" } : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", p: paginated.length > 0 ? "0 6px 6px" : "0" }}>
          {paginated.map((prod, i) => (
            <Box key={prod._id} sx={{
              display: "grid", gridTemplateColumns: "60px 2fr 1.3fr 1fr 0.8fr 0.8fr 160px",
              alignItems: "center", p: "14px 22px", borderRadius: T.rad2, gap: "10px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(250,248,246,0.95))",
              border: "1px solid rgba(0,0,0,0.03)",
              boxShadow: "4px 4px 16px rgba(0,0,0,0.03), -2px -2px 10px rgba(255,255,255,0.8)",
              transition: "all .3s ease",
              animation: `sa-prod-fadeUp 0.4s ease ${i * 0.05}s both`,
              "&:hover": {
                boxShadow: "6px 6px 24px rgba(0,0,0,0.06), -4px -4px 16px rgba(255,255,255,0.9), 0 0 0 1px rgba(255,107,53,0.08)",
                transform: "translateY(-2px)",
              },
            }}>
              {/* Imagen */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                {prod.imagen ? (
                  <Box component="img" src={prod.imagen} alt={prod.nombre} sx={{
                    width: 44, height: 44, borderRadius: "12px", objectFit: "cover",
                    boxShadow: "0 4px 12px rgba(0,0,0,.10), inset 0 -2px 4px rgba(0,0,0,0.06)",
                    border: "2px solid rgba(255,255,255,0.8)",
                  }} onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex" }} />
                ) : null}
                <Box sx={{
                  width: 44, height: 44, borderRadius: "12px",
                  display: prod.imagen ? "none" : "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, background: avGrad(i),
                  fontFamily: T.font, fontWeight: 700, fontSize: ".78rem", color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,.12), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)",
                }}>
                  {getInitials(prod.nombre)}
                </Box>
              </Box>

              {/* Nombre */}
              <Box>
                <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".88rem", color: T.t1, lineHeight: 1.3 }}>{prod.nombre}</Typography>
                <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4 }}>#{prod._id?.slice(-6).toUpperCase()}</Typography>
              </Box>

              {/* Categoría */}
              <Box>
                <Box component="span" sx={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "4px 12px", borderRadius: "10px",
                  background: "rgba(255,107,53,0.06)", fontFamily: T.font,
                  fontSize: ".78rem", fontWeight: 600, color: T.o1,
                }}>
                  <Layers size={12} strokeWidth={2.5} />
                  {prod.categoria?.nombre || "Sin categoría"}
                </Box>
              </Box>

              {/* Precio */}
              <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".88rem", color: T.t1, textAlign: "center" }}>
                {formatCOP(prod.precio)}
              </Typography>

              {/* Stock */}
              <Box sx={{ textAlign: "center" }}>
                {prod.stock === 0 ? (
                  <Tooltip title="Sin existencias" placement="top">
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", color: "#DC2626", fontFamily: T.font, fontSize: ".80rem", fontWeight: 700 }}>
                      <AlertTriangle size={13} strokeWidth={2.5} /> 0
                    </Box>
                  </Tooltip>
                ) : prod.stock <= (prod.stockMinimo || STOCK_LOW) ? (
                  <Tooltip title={`Stock bajo — mínimo: ${prod.stockMinimo || STOCK_LOW}`} placement="top">
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "10px", background: "rgba(245,158,11,0.10)", color: "#D97706", fontFamily: T.font, fontSize: ".80rem", fontWeight: 700 }}>
                      <AlertTriangle size={13} strokeWidth={2.5} /> {prod.stock}
                    </Box>
                  </Tooltip>
                ) : (
                  <Typography sx={{ fontFamily: T.font, fontWeight: 600, fontSize: ".85rem", color: T.green }}>
                    {prod.stock} <span style={{ fontSize: ".70rem", color: "#9CA3AF" }}>{prod.unidadMedida || ""}</span>
                  </Typography>
                )}
              </Box>

              {/* Estado — clickable toggle */}
              <Box sx={{ textAlign: "center" }}>
                <Box component="span" onClick={() => handleToggleEstado(prod)} sx={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "5px 14px", borderRadius: "22px", cursor: "pointer",
                  fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                  transition: "all .25s ease",
                  ...(prod.estado
                    ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "inset 0 1px 3px rgba(34,197,94,0.06)", "&:hover": { background: "rgba(34,197,94,0.15)" } }
                    : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "inset 0 1px 3px rgba(239,68,68,0.06)", "&:hover": { background: "rgba(239,68,68,0.12)" } }),
                }}>
                  <Box sx={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: prod.estado ? "#22C55E" : "#EF4444",
                    boxShadow: prod.estado ? "0 0 6px rgba(34,197,94,0.5)" : "0 0 6px rgba(239,68,68,0.5)",
                  }} />
                  {prod.estado ? "Activo" : "Inactivo"}
                </Box>
              </Box>

              {/* Acciones */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: "7px" }}>
                <Tooltip title="Editar" placement="top">
                  <Button sx={btnEdit} onClick={() => handleOpen(prod)}><Edit2 size={15} strokeWidth={2} /></Button>
                </Tooltip>
                <Tooltip title="Ver detalles" placement="top">
                  <Button sx={btnView} onClick={() => handleDetails(prod)}><Eye size={15} strokeWidth={2} /></Button>
                </Tooltip>
                <Tooltip title={prod.estado ? "Desactiva primero para eliminar" : "Eliminar"} placement="top">
                  <Button sx={{ ...btnDel, ...(prod.estado ? { opacity: 0.35, cursor: "not-allowed" } : {}) }}
                    onClick={() => handleDelete(prod)}>
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
              {productos.length === 0 ? "No hay productos registrados" : "Sin resultados"}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".88rem", color: T.t3, maxWidth: 380, mx: "auto", mb: "24px", lineHeight: 1.6, textAlign: "center" }}>
              {productos.length === 0 ? "Crea un nuevo producto para comenzar a llenar el catálogo." : "No se encontraron productos que coincidan con la búsqueda."}
            </Typography>
            {productos.length === 0 && (
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
                + Nuevo Producto
              </button>
            )}
          </Box>
        )}
      </Box>

      {/* ═══ PAGINATION ═══ */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
          Mostrando {filtered.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length} productos
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
      <Dialog open={open} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") handleClose() }}
        fullWidth maxWidth="sm"
        sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(12px)", background: "rgba(15,23,42,.20)" } }}
        slotProps={{ paper: { sx: {
          borderRadius: "22px !important",
          boxShadow: "0 30px 70px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.1) !important",
          border: "1px solid rgba(255,255,255,0.15)",
          width: "90%", maxWidth: 560,
          background: "rgba(255,255,255,0.96) !important",
          backdropFilter: "blur(20px) saturate(180%)", overflow: "hidden",
        } } }}>

        <DlgHdr
          icon={editingId ? <Edit2 size={18} color="#fff" /> : <Package size={18} color="#fff" />}
          title={editingId ? "Editar Producto" : "Nuevo Producto"}
          sub={editingId ? "Modifica los datos del producto" : "Completa los campos para registrar un nuevo producto"}
          onClose={handleClose}
        />

        <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
          <TextField margin="dense" label="Nombre" name="nombre"
            value={formData.nombre} onChange={handleChange}
            onBlur={e => validateNombre(e.target.value)}
            fullWidth variant="outlined" size="small"
            placeholder="Ej. Empanada de carne, Jugo de naranja..."
            error={!!formErrors.nombre}
            helperText={formErrors.nombre || "Nombre del producto"}
            required
            inputProps={{ maxLength: 80 }}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Package size={14} color={T.t3} /></InputAdornment> } }}
          />

          <TextField margin="dense" label="Descripción" name="descripcion"
            value={formData.descripcion} onChange={handleChange}
            fullWidth variant="outlined" size="small"
            placeholder="Breve descripción del producto..."
            multiline rows={2}
            inputProps={{ maxLength: 300 }}
            helperText={`${(formData.descripcion || "").length}/300 caracteres`}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: "10px" }}><FileText size={14} color={T.t3} /></InputAdornment> } }}
          />

          <TextField select margin="dense" label="Categoría" name="categoria"
            value={formData.categoria} onChange={handleChange}
            fullWidth variant="outlined" size="small" required
            helperText="Solo se muestran categorías activas"
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Layers size={14} color={T.t3} /></InputAdornment> } }}
          >
            <MenuItem value="" disabled>Selecciona una categoría</MenuItem>
            {categoriasActivas.map(c => <MenuItem key={c._id} value={c._id}>{c.nombre}</MenuItem>)}
          </TextField>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: 2 }}>
            <TextField margin="dense" label="Precio (COP)" name="precio" type="number"
              value={formData.precio} onChange={handleChange}
              onBlur={e => validatePrecio(e.target.value)}
              variant="outlined" size="small" required
              error={!!formErrors.precio}
              helperText={formErrors.precio || "Precio en pesos"}
              inputProps={{ min: 0, step: 100 }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><DollarSign size={14} color={T.t3} /></InputAdornment> } }}
            />
            {/* Stock inicial solo en creación — en edición se gestiona desde inventario */}
            <Box sx={{ minHeight: "40px" }}>
              {!editingId ? (
                <TextField margin="dense" label="Stock inicial *" name="stockInicial" type="number"
                  value={formData.stockInicial} onChange={handleChange}
                  onBlur={e => validateStockInicial(e.target.value)}
                  variant="outlined" size="small" required fullWidth
                  error={!!formErrors.stockInicial}
                  helperText={formErrors.stockInicial || "Unidades con las que inicia"}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Package size={14} color={T.t3} /></InputAdornment> } }}
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(59,130,246,0.06)", borderRadius: "14px", p: "10px 16px", border: "1px solid rgba(59,130,246,0.12)", height: "100%" }}>
                  <Package size={14} color="#3B82F6" />
                  <Box component="span" sx={{ fontFamily: T.font, fontSize: ".78rem", color: "#3B82F6" }}>
                    Stock actual: <strong>{selectedProd?.stock ?? "—"}</strong>. Para modificarlo usa el módulo de Inventario.
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: 2 }}>
            <TextField margin="dense" label="Stock mínimo" name="stockMinimo" type="number"
              value={formData.stockMinimo} onChange={handleChange}
              variant="outlined" size="small"
              helperText="Alerta cuando el stock baje de este nivel"
              inputProps={{ min: 0, step: 1 }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><AlertTriangle size={14} color={T.t3} /></InputAdornment> } }}
            />
            <TextField select margin="dense" label="Unidad de medida" name="unidadMedida"
              value={formData.unidadMedida} onChange={handleChange}
              variant="outlined" size="small"
              helperText="Tipo de unidad del producto"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
            >
              {["unidad", "paquete", "caja", "bolsa", "litro", "kilogramo", "gramo", "otro"].map(u => (
                <MenuItem key={u} value={u} sx={{ fontFamily: T.font, textTransform: "capitalize" }}>{u}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField margin="dense" label="URL de Imagen" name="imagen"
            value={formData.imagen} onChange={handleChange}
            fullWidth variant="outlined" size="small"
            placeholder="https://ejemplo.com/imagen.jpg"
            helperText="Pega la URL de la imagen del producto (opcional)"
            sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Image size={14} color={T.t3} /></InputAdornment> } }}
          />

          {/* Vista previa de imagen */}
          {formData.imagen && (
            <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
              <Box component="img" src={formData.imagen} alt="Vista previa"
                sx={{
                  maxWidth: 180, maxHeight: 120, borderRadius: "14px", objectFit: "cover",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)", border: "2px solid rgba(255,255,255,0.8)",
                }}
                onError={(e) => { e.target.style.display = "none" }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: "14px 26px 20px !important", gap: "10px" }}>
          <Button onClick={handleClose} sx={cancelBtnSx}>Cancelar</Button>
          <Button onClick={handleSubmit}
            disabled={!!formErrors.nombre || !!formErrors.precio || !!formErrors.stockInicial || !formData.nombre.trim() || !formData.categoria}
            sx={submitBtnSx}>
            {editingId ? (
              <><Edit2 size={14} /> Guardar Cambios</>
            ) : (
              <><Plus size={14} /> Crear Producto</>
            )}
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
          width: "90%", maxWidth: 560,
          background: "rgba(255,255,255,0.96) !important",
          backdropFilter: "blur(20px) saturate(180%)", overflow: "hidden",
        } } }}>

        <DlgHdr
          icon={<Eye size={18} color="#fff" />}
          title="Detalles del Producto"
          sub={selectedProd?.nombre || ""}
          onClose={() => setDetailsOpen(false)}
        />

        <DialogContent sx={{ p: "22px 26px !important", background: "transparent" }}>
          {selectedProd && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Imagen grande */}
              {selectedProd.imagen && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <Box component="img" src={selectedProd.imagen} alt={selectedProd.nombre}
                    sx={{
                      maxWidth: "100%", maxHeight: 200, borderRadius: "16px", objectFit: "cover",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "3px solid rgba(255,255,255,0.8)",
                    }}
                    onError={(e) => { e.target.style.display = "none" }}
                  />
                </Box>
              )}
              {[
                { label: "Nombre", value: selectedProd.nombre, icon: <Package size={14} color={T.o1} /> },
                { label: "Descripción", value: selectedProd.descripcion || "Sin descripción", icon: <FileText size={14} color={T.o1} /> },
                { label: "Categoría", value: selectedProd.categoria?.nombre || "Sin categoría", icon: <Layers size={14} color={T.o1} /> },
                { label: "Precio", value: formatCOP(selectedProd.precio), icon: <DollarSign size={14} color={T.o1} /> },
                { label: "Stock", value: `${selectedProd.stock} unidades${selectedProd.stock <= STOCK_LOW ? " (Stock bajo)" : ""}`, icon: selectedProd.stock <= STOCK_LOW ? <AlertTriangle size={14} color={T.r1} /> : <Package size={14} color={T.o1} /> },
                { label: "Estado", value: selectedProd.estado ? "Activo" : "Inactivo", icon: selectedProd.estado ? <CheckCircle size={14} color={T.green} /> : <XCircle size={14} color={T.r1} /> },
                { label: "Fecha de Creación", value: selectedProd.createdAt ? new Date(selectedProd.createdAt).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A", icon: <FileText size={14} color={T.o1} /> },
                { label: "Última Actualización", value: selectedProd.updatedAt ? new Date(selectedProd.updatedAt).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A", icon: <Edit2 size={14} color={T.o1} /> },
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
          <Button onClick={() => { setDetailsOpen(false); handleOpen(selectedProd) }} sx={submitBtnSx}>
            <Edit2 size={14} /> Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export { ProductosList }
export default ProductosList
