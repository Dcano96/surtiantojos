import { useState, useEffect } from "react"
import {
  Typography, TextField, Button, Dialog, DialogContent, DialogActions,
  MenuItem, Box, InputAdornment, Tooltip, Chip,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, XCircle,
  ArrowLeft, ArrowRight, Plus, ShoppingCart, FileText, User,
  Phone, MapPin, Mail, DollarSign, Clock, Package, AlertTriangle,
  CreditCard, ShieldCheck, ShieldAlert, Truck, RefreshCw,
} from "lucide-react"
import Swal from "sweetalert2"
import pedidosService from "./pedidos.service.js"
import productosService from "../productos/productos.service.js"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T = {
  o1: "#FF6B35", o2: "#FF3D00", o3: "#FF8F5E", o4: "#FFF0EB",
  r1: "#EF4444", y1: "#F59E0B", green: "#22C55E", green2: "#BBF7D0",
  blue: "#3B82F6", purple: "#8B5CF6",
  t1: "#1A1A2E", t2: "#4A4A68", t3: "#9CA3AF", t4: "#C5C8D4",
  bg: "#F2F0EE", bg2: "#FFFFFF", bg3: "#FAF8F6",
  go: "linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)",
  border: "rgba(0,0,0,0.06)", border2: "rgba(255,107,53,0.22)",
  shCard: "0 8px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)",
  glow: "0 4px 20px rgba(255,107,53,0.25)",
  glow2: "0 8px 32px rgba(255,107,53,0.35)",
  font: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontH: "'Fraunces', serif",
  rad: "20px", rad2: "16px", rad3: "24px",
}

/* Estados y configuración visual */
const ESTADOS = {
  pendiente_pago:        { label: "Pendiente de pago",      color: T.y1,     bg: "rgba(245,158,11,0.12)",  icon: Clock },
  comprobante_recibido:  { label: "Comprobante recibido",   color: T.blue,   bg: "rgba(59,130,246,0.12)",  icon: FileText },
  confirmado:            { label: "Confirmado",             color: T.green,  bg: "rgba(34,197,94,0.12)",   icon: CheckCircle },
  en_preparacion:        { label: "En preparación",         color: T.purple, bg: "rgba(139,92,246,0.12)",  icon: Package },
  enviado:               { label: "Enviado",                color: T.o1,     bg: "rgba(255,107,53,0.12)",  icon: Truck },
  entregado:             { label: "Entregado",              color: T.green,  bg: "rgba(34,197,94,0.18)",   icon: CheckCircle },
  cancelado:             { label: "Cancelado",              color: T.r1,     bg: "rgba(239,68,68,0.12)",   icon: XCircle },
}

const METODOS_PAGO = [
  { value: "transferencia", label: "Transferencia" },
  { value: "nequi",         label: "Nequi" },
  { value: "daviplata",     label: "Daviplata" },
  { value: "bancolombia",   label: "Bancolombia" },
  { value: "efectivo",      label: "Efectivo" },
  { value: "otro",          label: "Otro" },
]

/* SWAL style */
if (typeof document !== "undefined" && !document.getElementById("sa-ped-swal")) {
  const s = document.createElement("style"); s.id = "sa-ped-swal"
  s.textContent = `
    .swal2-icon.swal2-question{border-color:#FF6B35!important;color:#FF6B35!important}
    .swal2-icon.swal2-warning{border-color:#FF3D00!important;color:#FF3D00!important}
    .swal2-icon.swal2-success{border-color:#22C55E!important;color:#22C55E!important}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#22C55E!important}
    .swal2-icon.swal2-success .swal2-success-ring{border-color:rgba(34,197,94,.30)!important}
    .swal2-icon.swal2-error{border-color:#EF4444!important;color:#EF4444!important}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#EF4444!important}
    .swal2-popup{border-radius:20px!important;box-shadow:0 25px 60px rgba(0,0,0,0.15)!important}
    .swal2-backdrop-show{background:rgba(15,23,42,.25)!important;backdrop-filter:blur(8px)!important}
  `
  document.head.appendChild(s)
}

const swalFire = (options) => Swal.fire({ ...options, allowOutsideClick: options.showCancelButton ? true : false })

/* ═══════════════════════════════════════════════════════════════
   BUTTON STYLES
   ═══════════════════════════════════════════════════════════════ */
const actionBtn = {
  width: 36, height: 36, borderRadius: "12px", display: "flex", alignItems: "center",
  justifyContent: "center", border: "none", cursor: "pointer", transition: "all .25s ease",
  minWidth: "unset", p: 0, "&:hover": { transform: "translateY(-2px)" },
}
const btnEdit    = { ...actionBtn, background: "rgba(34,197,94,0.10)",  color: T.green,  "&:hover": { background: "rgba(34,197,94,0.18)",  transform: "translateY(-2px)" } }
const btnView    = { ...actionBtn, background: "rgba(255,107,53,0.10)", color: T.o1,     "&:hover": { background: "rgba(255,107,53,0.18)", transform: "translateY(-2px)" } }
const btnDel     = { ...actionBtn, background: "rgba(239,68,68,0.08)",  color: T.r1,     "&:hover": { background: "rgba(239,68,68,0.15)",  transform: "translateY(-2px)" } }
const btnVerify  = { ...actionBtn, background: "rgba(59,130,246,0.10)", color: T.blue,   "&:hover": { background: "rgba(59,130,246,0.18)", transform: "translateY(-2px)" } }
const btnPay     = { ...actionBtn, background: "rgba(245,158,11,0.10)", color: T.y1,     "&:hover": { background: "rgba(245,158,11,0.18)", transform: "translateY(-2px)" } }

const cancelBtnSx = {
  fontFamily: `${T.font} !important`, fontWeight: "600 !important",
  color: `${T.t2} !important`, borderRadius: "14px !important",
  padding: "10px 24px !important", border: `1.5px solid rgba(0,0,0,0.08) !important`,
  textTransform: "none !important", background: "#fff !important",
  "&:hover": { background: "#F9FAFB !important" },
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
  cursor: "pointer", minWidth: "unset", p: 0, transition: "all .2s ease",
  "&:hover": { background: T.go, color: "#fff", borderColor: "transparent", boxShadow: T.glow },
}
const pageBtnOn = { ...pageBtn, background: `${T.go} !important`, color: "#fff !important", borderColor: "transparent !important" }

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    fontFamily: T.font,
    background: "#fff",
    "& fieldset": { borderColor: "rgba(0,0,0,0.10)" },
    "&:hover fieldset": { borderColor: T.o1 },
    "&.Mui-focused fieldset": { borderColor: T.o1, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontFamily: T.font, color: T.t2, "&.Mui-focused": { color: T.o1 } },
}

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
    setOpenComprobante(true)
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
    if (!comprobante.url?.trim()) {
      return swalFire({ icon: "warning", title: "URL requerida", text: "Pega el enlace o URL de la imagen del comprobante enviado por WhatsApp" })
    }
    try {
      await pedidosService.registrarComprobante(current._id, comprobante)
      setOpenComprobante(false)
      await loadAll()
      swalFire({ icon: "success", title: "Comprobante registrado", text: "Ahora debe ser revisado para confirmar el pedido", timer: 1800, showConfirmButton: false })
    } catch (e) {
      swalFire({ icon: "error", title: "Error", text: e.response?.data?.msg || "No se pudo registrar el comprobante" })
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

  /* ─── Render helpers ─── */
  const EstadoChip = ({ estado }) => {
    const cfg = ESTADOS[estado] || { label: estado, color: T.t2, bg: "rgba(0,0,0,0.06)", icon: Clock }
    const Icon = cfg.icon
    return (
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: .6, px: 1.2, py: .5,
        borderRadius: "10px", background: cfg.bg, color: cfg.color,
        fontFamily: T.font, fontWeight: 700, fontSize: ".74rem",
      }}>
        <Icon size={13}/> {cfg.label}
      </Box>
    )
  }

  const siguienteEstado = (estado) => {
    const map = {
      confirmado: "en_preparacion",
      en_preparacion: "enviado",
      enviado: "entregado",
    }
    return map[estado]
  }

  /* ─── RENDER ─── */
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, fontFamily: T.font, minHeight: "100%" }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: "18px", background: T.go,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: T.glow, color: "#fff",
          }}>
            <ShoppingCart size={26}/>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: T.fontH, fontWeight: 900, fontSize: "1.55rem", color: T.t1, lineHeight: 1 }}>
              Pedidos
            </Typography>
            <Typography sx={{ fontSize: ".86rem", color: T.t3, mt: .3 }}>
              Gestión de pedidos con verificación de comprobante de pago vía WhatsApp
            </Typography>
          </Box>
        </Box>
        <Button onClick={openNew} sx={submitBtnSx} startIcon={<Plus size={18}/>}>
          Nuevo Pedido
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{
        display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap",
        background: "#fff", p: 2, borderRadius: T.rad2, boxShadow: T.shCard,
      }}>
        <TextField
          placeholder="Buscar por número, cliente o teléfono..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          size="small"
          sx={{ ...inputSx, flex: 1, minWidth: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} color={T.t3}/></InputAdornment> }}
        />
        <TextField
          select label="Estado" size="small"
          value={filterEstado}
          onChange={(e) => { setFilterEstado(e.target.value); setPage(1) }}
          sx={{ ...inputSx, minWidth: 220 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(ESTADOS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v.label}</MenuItem>
          ))}
        </TextField>
        <Tooltip title="Recargar">
          <Button onClick={loadAll} sx={{ ...cancelBtnSx, minWidth: 46 }}><RefreshCw size={16}/></Button>
        </Tooltip>
      </Box>

      {/* Tabla */}
      <Box sx={{ background: "#fff", borderRadius: T.rad2, boxShadow: T.shCard, overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <Box component="table" sx={{
            width: "100%", borderCollapse: "separate", borderSpacing: 0,
            "& th, & td": { padding: "14px 16px", textAlign: "left", fontSize: ".86rem" },
            "& th": {
              fontFamily: T.font, fontWeight: 700, color: T.t2, fontSize: ".78rem",
              textTransform: "uppercase", letterSpacing: ".04em",
              background: T.bg3, borderBottom: `1px solid ${T.border}`,
            },
            "& tbody tr": { transition: "background .2s ease" },
            "& tbody tr:hover": { background: "rgba(255,107,53,0.04)" },
            "& tbody td": { borderBottom: `1px solid ${T.border}`, color: T.t1, fontFamily: T.font },
          }}>
            <thead>
              <tr>
                <th>N°</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Total</th>
                <th>Comprobante</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: T.t3 }}>Cargando pedidos...</td></tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 50, color: T.t3 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <ShoppingCart size={40} color={T.t4}/>
                    <div>No hay pedidos para mostrar</div>
                  </Box>
                </td></tr>
              )}
              {!loading && pageItems.map((p) => {
                const cp = p.comprobantePago || {}
                const hasComprobante = !!cp.url
                const verificado = !!cp.verificado
                const sigEst = siguienteEstado(p.estado)
                return (
                  <tr key={p._id}>
                    <td style={{ fontFamily: T.fontH, fontWeight: 800, color: T.o1 }}>{p.numero}</td>
                    <td>
                      <Box sx={{ fontWeight: 600 }}>{p.cliente?.nombre}</Box>
                      <Box sx={{ fontSize: ".75rem", color: T.t3 }}>{p.cliente?.direccion}</Box>
                    </td>
                    <td>{p.cliente?.telefono}</td>
                    <td style={{ fontWeight: 700 }}>${(p.total || 0).toLocaleString("es-CO")}</td>
                    <td>
                      {!hasComprobante && (
                        <Chip size="small" label="Sin enviar" sx={{ background: "rgba(245,158,11,0.15)", color: T.y1, fontWeight: 700, fontFamily: T.font }}/>
                      )}
                      {hasComprobante && !verificado && (
                        <Chip size="small" label="Por revisar" sx={{ background: "rgba(59,130,246,0.15)", color: T.blue, fontWeight: 700, fontFamily: T.font }}/>
                      )}
                      {hasComprobante && verificado && (
                        <Chip size="small" icon={<ShieldCheck size={13}/>} label="Verificado" sx={{ background: "rgba(34,197,94,0.15)", color: T.green, fontWeight: 700, fontFamily: T.font }}/>
                      )}
                    </td>
                    <td><EstadoChip estado={p.estado}/></td>
                    <td style={{ color: T.t2 }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-CO") : "-"}</td>
                    <td>
                      <Box sx={{ display: "flex", gap: .8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <Tooltip title="Ver detalle">
                          <Button sx={btnView} onClick={() => openView(p)}><Eye size={16}/></Button>
                        </Tooltip>
                        {["pendiente_pago", "comprobante_recibido"].includes(p.estado) && (
                          <Tooltip title="Registrar comprobante">
                            <Button sx={btnPay} onClick={() => openComprobanteDialog(p)}><CreditCard size={16}/></Button>
                          </Tooltip>
                        )}
                        {p.estado === "comprobante_recibido" && !verificado && (
                          <Tooltip title="Verificar comprobante">
                            <Button sx={btnVerify} onClick={() => openVerificarDialog(p)}><ShieldCheck size={16}/></Button>
                          </Tooltip>
                        )}
                        {sigEst && (
                          <Tooltip title={`Avanzar a ${ESTADOS[sigEst].label}`}>
                            <Button sx={btnVerify} onClick={() => avanzarEstado(p, sigEst)}><Truck size={16}/></Button>
                          </Tooltip>
                        )}
                        {!["entregado", "cancelado"].includes(p.estado) && (
                          <Tooltip title="Editar">
                            <Button sx={btnEdit} onClick={() => openEdit(p)}><Edit2 size={16}/></Button>
                          </Tooltip>
                        )}
                        <Tooltip title="Eliminar">
                          <Button sx={btnDel} onClick={() => remove(p)}><Trash2 size={16}/></Button>
                        </Tooltip>
                      </Box>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Box>
        </Box>

        {/* Paginación */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, p: 2 }}>
            <Button sx={pageBtn} disabled={pageSafe === 1} onClick={() => setPage(pageSafe - 1)}><ArrowLeft size={14}/></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button key={n} sx={n === pageSafe ? pageBtnOn : pageBtn} onClick={() => setPage(n)}>{n}</Button>
            ))}
            <Button sx={pageBtn} disabled={pageSafe === totalPages} onClick={() => setPage(pageSafe + 1)}><ArrowRight size={14}/></Button>
          </Box>
        )}
      </Box>

      {/* ─── DIALOG CREAR/EDITAR ─── */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: T.rad, fontFamily: T.font } }}>
        <Box sx={{ p: 3, background: T.go, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ShoppingCart size={22}/>
            <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, fontSize: "1.2rem" }}>
              {editing ? `Editar pedido ${current?.numero || ""}` : "Nuevo Pedido"}
            </Typography>
          </Box>
          <Button onClick={() => setOpenForm(false)} sx={{ minWidth: 0, color: "#fff", p: 1 }}><X size={20}/></Button>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, mb: 1.5, fontSize: "1rem" }}>
            Datos del cliente
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
            <TextField label="Nombre *" sx={inputSx} size="small"
              value={form.cliente.nombre}
              onChange={(e) => setForm({ ...form, cliente: { ...form.cliente, nombre: e.target.value } })}
              InputProps={{ startAdornment: <InputAdornment position="start"><User size={15}/></InputAdornment> }}/>
            <TextField label="Teléfono *" sx={inputSx} size="small"
              value={form.cliente.telefono}
              onChange={(e) => setForm({ ...form, cliente: { ...form.cliente, telefono: e.target.value } })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={15}/></InputAdornment> }}/>
            <TextField label="Email" sx={inputSx} size="small"
              value={form.cliente.email}
              onChange={(e) => setForm({ ...form, cliente: { ...form.cliente, email: e.target.value } })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={15}/></InputAdornment> }}/>
            <TextField label="Dirección de entrega *" sx={inputSx} size="small"
              value={form.cliente.direccion}
              onChange={(e) => setForm({ ...form, cliente: { ...form.cliente, direccion: e.target.value } })}
              InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={15}/></InputAdornment> }}/>
          </Box>

          {!editing && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, color: T.t1, fontSize: "1rem" }}>
                  Productos
                </Typography>
                <Button onClick={addItem} sx={{ ...cancelBtnSx, color: `${T.o1} !important`, borderColor: `${T.border2} !important` }} startIcon={<Plus size={14}/>}>
                  Agregar
                </Button>
              </Box>
              <Box sx={{ mb: 3 }}>
                {form.items.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 3, color: T.t3, border: `1.5px dashed ${T.border}`, borderRadius: T.rad2 }}>
                    Agrega productos al pedido
                  </Box>
                )}
                {form.items.map((it, i) => (
                  <Box key={i} sx={{ display: "grid", gridTemplateColumns: "2fr 90px 130px 40px", gap: 1, mb: 1 }}>
                    <TextField select size="small" sx={inputSx}
                      value={it.producto}
                      onChange={(e) => changeItem(i, "producto", e.target.value)}>
                      <MenuItem value="">Selecciona producto</MenuItem>
                      {productos.map((p) => (
                        <MenuItem key={p._id} value={p._id}>{p.nombre} — ${p.precio}</MenuItem>
                      ))}
                    </TextField>
                    <TextField type="number" size="small" sx={inputSx} label="Cant."
                      value={it.cantidad}
                      onChange={(e) => changeItem(i, "cantidad", e.target.value)}
                      inputProps={{ min: 1 }}/>
                    <TextField type="number" size="small" sx={inputSx} label="Precio"
                      value={it.precioUnitario}
                      onChange={(e) => changeItem(i, "precioUnitario", e.target.value)}
                      inputProps={{ min: 0, step: "0.01" }}/>
                    <Button sx={btnDel} onClick={() => removeItem(i)}><X size={16}/></Button>
                  </Box>
                ))}
              </Box>
            </>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField label="Descuento" type="number" size="small" sx={inputSx}
              value={form.descuento}
              onChange={(e) => setForm({ ...form, descuento: e.target.value })}/>
            <TextField label="Impuesto" type="number" size="small" sx={inputSx}
              value={form.impuesto}
              onChange={(e) => setForm({ ...form, impuesto: e.target.value })}/>
            <TextField label="Fecha entrega" type="date" size="small" sx={inputSx}
              InputLabelProps={{ shrink: true }}
              value={form.fechaEntrega}
              onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}/>
          </Box>

          <TextField label="Notas" size="small" fullWidth multiline rows={2} sx={{ ...inputSx, mb: 2 }}
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}/>

          {!editing && (
            <Box sx={{ p: 2, background: T.bg3, borderRadius: T.rad2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ color: T.t2 }}>Subtotal: <b>${subtotalForm.toLocaleString("es-CO")}</b></Typography>
              <Typography sx={{ fontFamily: T.fontH, fontWeight: 900, fontSize: "1.3rem", color: T.o1 }}>
                Total: ${totalForm.toLocaleString("es-CO")}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, p: 1.5, borderRadius: T.rad2, background: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.25)`, display: "flex", gap: 1, alignItems: "flex-start" }}>
            <AlertTriangle size={18} color={T.y1} style={{ flexShrink: 0, marginTop: 2 }}/>
            <Typography sx={{ fontSize: ".82rem", color: T.t2 }}>
              El pedido iniciará en estado <b>"Pendiente de pago"</b>. No podrá pasar a <b>"Confirmado"</b> hasta que se registre y verifique el comprobante de pago enviado por WhatsApp.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenForm(false)} sx={cancelBtnSx}>Cancelar</Button>
          <Button onClick={save} sx={submitBtnSx}>{editing ? "Actualizar" : "Crear Pedido"}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── DIALOG VER DETALLE ─── */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: T.rad, fontFamily: T.font } }}>
        {current && (
          <>
            <Box sx={{ p: 3, background: T.go, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, fontSize: "1.3rem" }}>
                  Pedido {current.numero}
                </Typography>
                <Typography sx={{ fontSize: ".82rem", opacity: .9 }}>
                  Creado el {new Date(current.createdAt).toLocaleString("es-CO")}
                </Typography>
              </Box>
              <Button onClick={() => setOpenDetail(false)} sx={{ minWidth: 0, color: "#fff", p: 1 }}><X size={20}/></Button>
            </Box>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <EstadoChip estado={current.estado}/>
                {current.comprobantePago?.verificado && (
                  <Chip size="small" icon={<ShieldCheck size={13}/>} label="Comprobante verificado" sx={{ background: "rgba(34,197,94,0.15)", color: T.green, fontWeight: 700 }}/>
                )}
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
                <Box sx={{ p: 2, background: T.bg3, borderRadius: T.rad2 }}>
                  <Typography sx={{ fontWeight: 800, color: T.t1, mb: 1 }}>Cliente</Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: .5 }}><User size={14} color={T.t3}/> {current.cliente?.nombre}</Box>
                  <Box sx={{ display: "flex", gap: 1, mb: .5 }}><Phone size={14} color={T.t3}/> {current.cliente?.telefono}</Box>
                  {current.cliente?.email && <Box sx={{ display: "flex", gap: 1, mb: .5 }}><Mail size={14} color={T.t3}/> {current.cliente.email}</Box>}
                  <Box sx={{ display: "flex", gap: 1 }}><MapPin size={14} color={T.t3}/> {current.cliente?.direccion}</Box>
                </Box>
                <Box sx={{ p: 2, background: T.bg3, borderRadius: T.rad2 }}>
                  <Typography sx={{ fontWeight: 800, color: T.t1, mb: 1 }}>Comprobante de pago</Typography>
                  {current.comprobantePago?.url ? (
                    <>
                      <Box sx={{ display: "flex", gap: 1, mb: .5 }}>
                        <CreditCard size={14} color={T.t3}/> {METODOS_PAGO.find((m) => m.value === current.comprobantePago.metodoPago)?.label || current.comprobantePago.metodoPago}
                      </Box>
                      {current.comprobantePago.referencia && <Box sx={{ mb: .5 }}>Ref: {current.comprobantePago.referencia}</Box>}
                      <a href={current.comprobantePago.url} target="_blank" rel="noreferrer" style={{ color: T.o1, fontWeight: 700 }}>Ver imagen/enlace</a>
                      {current.comprobantePago.notasVerificacion && (
                        <Typography sx={{ mt: 1, fontSize: ".8rem", color: T.t2 }}>
                          <b>Notas verificación:</b> {current.comprobantePago.notasVerificacion}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography sx={{ color: T.t3, fontSize: ".85rem" }}>Aún no se ha registrado el comprobante</Typography>
                  )}
                </Box>
              </Box>

              <Typography sx={{ fontWeight: 800, color: T.t1, mb: 1 }}>Productos</Typography>
              <Box component="table" sx={{
                width: "100%", borderCollapse: "collapse", mb: 2,
                "& th, & td": { padding: "10px 12px", fontSize: ".86rem", textAlign: "left", borderBottom: `1px solid ${T.border}` },
                "& th": { background: T.bg3, color: T.t2, fontWeight: 700 },
              }}>
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {(current.detalles || []).map((d) => (
                    <tr key={d._id}>
                      <td>{d.nombreProducto}</td>
                      <td>{d.cantidad}</td>
                      <td>${(d.precioUnitario || 0).toLocaleString("es-CO")}</td>
                      <td><b>${(d.subtotal || 0).toLocaleString("es-CO")}</b></td>
                    </tr>
                  ))}
                </tbody>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3, mb: 2 }}>
                <Box>
                  <Box sx={{ color: T.t2 }}>Subtotal: <b>${(current.subtotal || 0).toLocaleString("es-CO")}</b></Box>
                  <Box sx={{ color: T.t2 }}>Descuento: <b>-${(current.descuento || 0).toLocaleString("es-CO")}</b></Box>
                  <Box sx={{ color: T.t2 }}>Impuesto: <b>${(current.impuesto || 0).toLocaleString("es-CO")}</b></Box>
                  <Box sx={{ fontFamily: T.fontH, fontWeight: 900, fontSize: "1.2rem", color: T.o1 }}>
                    Total: ${(current.total || 0).toLocaleString("es-CO")}
                  </Box>
                </Box>
              </Box>

              {current.historialEstados?.length > 0 && (
                <>
                  <Typography sx={{ fontWeight: 800, color: T.t1, mb: 1 }}>Historial de estados</Typography>
                  <Box sx={{ borderLeft: `2px solid ${T.border2}`, pl: 2 }}>
                    {current.historialEstados.map((h, i) => (
                      <Box key={i} sx={{ mb: 1.5, position: "relative" }}>
                        <Box sx={{ position: "absolute", left: -22, top: 4, width: 10, height: 10, borderRadius: "50%", background: T.o1 }}/>
                        <EstadoChip estado={h.estado}/>
                        <Typography sx={{ fontSize: ".78rem", color: T.t3, mt: .3 }}>
                          {new Date(h.fecha).toLocaleString("es-CO")}
                        </Typography>
                        {h.nota && <Typography sx={{ fontSize: ".85rem", color: T.t2, mt: .2 }}>{h.nota}</Typography>}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenDetail(false)} sx={cancelBtnSx}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ─── DIALOG REGISTRAR COMPROBANTE ─── */}
      <Dialog open={openComprobante} onClose={() => setOpenComprobante(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: T.rad, fontFamily: T.font } }}>
        <Box sx={{ p: 3, background: `linear-gradient(135deg, ${T.y1} 0%, ${T.o1} 100%)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CreditCard size={22}/>
            <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, fontSize: "1.15rem" }}>
              Registrar comprobante de pago
            </Typography>
          </Box>
          <Button onClick={() => setOpenComprobante(false)} sx={{ minWidth: 0, color: "#fff", p: 1 }}><X size={20}/></Button>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: ".88rem", color: T.t2, mb: 2 }}>
            Pega la URL de la imagen del comprobante que el cliente envió por WhatsApp. El pedido quedará marcado para revisión.
          </Typography>
          <TextField label="URL del comprobante *" size="small" fullWidth sx={{ ...inputSx, mb: 2 }}
            value={comprobante.url}
            onChange={(e) => setComprobante({ ...comprobante, url: e.target.value })}
            placeholder="https://..."/>
          <TextField select label="Método de pago" size="small" fullWidth sx={{ ...inputSx, mb: 2 }}
            value={comprobante.metodoPago}
            onChange={(e) => setComprobante({ ...comprobante, metodoPago: e.target.value })}>
            {METODOS_PAGO.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </TextField>
          <TextField label="Número de referencia" size="small" fullWidth sx={{ ...inputSx, mb: 2 }}
            value={comprobante.referencia}
            onChange={(e) => setComprobante({ ...comprobante, referencia: e.target.value })}/>
          <TextField label="Fecha de envío" type="date" size="small" fullWidth sx={inputSx}
            InputLabelProps={{ shrink: true }}
            value={comprobante.fechaEnvio}
            onChange={(e) => setComprobante({ ...comprobante, fechaEnvio: e.target.value })}/>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenComprobante(false)} sx={cancelBtnSx}>Cancelar</Button>
          <Button onClick={saveComprobante} sx={submitBtnSx}>Registrar</Button>
        </DialogActions>
      </Dialog>

      {/* ─── DIALOG VERIFICAR COMPROBANTE ─── */}
      <Dialog open={openVerificar} onClose={() => setOpenVerificar(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: T.rad, fontFamily: T.font } }}>
        <Box sx={{ p: 3, background: `linear-gradient(135deg, ${T.blue} 0%, ${T.purple} 100%)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ShieldCheck size={22}/>
            <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, fontSize: "1.15rem" }}>
              Verificar comprobante
            </Typography>
          </Box>
          <Button onClick={() => setOpenVerificar(false)} sx={{ minWidth: 0, color: "#fff", p: 1 }}><X size={20}/></Button>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {current?.comprobantePago?.url && (
            <Box sx={{ mb: 2, p: 2, background: T.bg3, borderRadius: T.rad2 }}>
              <Typography sx={{ fontSize: ".85rem", color: T.t2, mb: .5 }}>Comprobante enviado:</Typography>
              <a href={current.comprobantePago.url} target="_blank" rel="noreferrer" style={{ color: T.o1, fontWeight: 700, wordBreak: "break-all" }}>
                {current.comprobantePago.url}
              </a>
              <Typography sx={{ fontSize: ".82rem", color: T.t3, mt: .5 }}>
                Método: {METODOS_PAGO.find((m) => m.value === current.comprobantePago.metodoPago)?.label}
                {current.comprobantePago.referencia && ` · Ref: ${current.comprobantePago.referencia}`}
              </Typography>
            </Box>
          )}

          <Typography sx={{ fontWeight: 700, color: T.t1, mb: 1.5 }}>Decisión</Typography>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Button
              onClick={() => setVerifyForm({ ...verifyForm, aprobado: true })}
              sx={{
                flex: 1, p: 2, borderRadius: T.rad2, textTransform: "none", fontFamily: T.font, fontWeight: 700,
                background: verifyForm.aprobado ? "rgba(34,197,94,0.15)" : "#fff",
                color: verifyForm.aprobado ? T.green : T.t2,
                border: `1.5px solid ${verifyForm.aprobado ? T.green : "rgba(0,0,0,0.08)"}`,
                display: "flex", flexDirection: "column", gap: .5,
              }}>
              <CheckCircle size={22}/> Aprobar<Box sx={{ fontSize: ".72rem", fontWeight: 500 }}>Pedido → Confirmado</Box>
            </Button>
            <Button
              onClick={() => setVerifyForm({ ...verifyForm, aprobado: false })}
              sx={{
                flex: 1, p: 2, borderRadius: T.rad2, textTransform: "none", fontFamily: T.font, fontWeight: 700,
                background: !verifyForm.aprobado ? "rgba(239,68,68,0.12)" : "#fff",
                color: !verifyForm.aprobado ? T.r1 : T.t2,
                border: `1.5px solid ${!verifyForm.aprobado ? T.r1 : "rgba(0,0,0,0.08)"}`,
                display: "flex", flexDirection: "column", gap: .5,
              }}>
              <ShieldAlert size={22}/> Rechazar<Box sx={{ fontSize: ".72rem", fontWeight: 500 }}>Vuelve a Pendiente</Box>
            </Button>
          </Box>

          <TextField label="Notas de verificación" size="small" fullWidth multiline rows={3} sx={inputSx}
            value={verifyForm.notas}
            onChange={(e) => setVerifyForm({ ...verifyForm, notas: e.target.value })}
            placeholder={verifyForm.aprobado ? "Ej: Pago confirmado por transferencia Bancolombia" : "Indica por qué se rechaza"}/>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
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
export { PedidoList as PedidosList }
