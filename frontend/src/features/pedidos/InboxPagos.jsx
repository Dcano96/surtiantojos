import { useState, useEffect, useCallback, useRef } from "react"
import { motion as Motion } from "framer-motion"
import {
  Typography, Button, Dialog, DialogContent, DialogActions, Box,
} from "@mui/material"
import {
  XCircle, Clock, RefreshCw, ShieldCheck, User, Phone,
  MapPin, CreditCard, Package, ZoomIn, Inbox,
} from "lucide-react"
import Swal from "sweetalert2"
import pedidosService from "./pedidos.service.js"

/* Design tokens alineados con el resto del dashboard */
const T = {
  o1: "#FF6B35", o2: "#FF3D00", o4: "#FFF0EB",
  r1: "#EF4444", y1: "#F59E0B", green: "#22C55E", blue: "#3B82F6",
  t1: "#1A1A2E", t2: "#4A4A68", t3: "#9CA3AF",
  bg: "#FFF8F5", bg2: "#FFFFFF",
  go: "linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)",
  border2: "rgba(255,107,53,0.22)",
  glass: "rgba(255,255,255,0.72)",
  glow: "0 6px 24px rgba(255,107,53,0.30)",
  font: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontH: "'Fraunces', serif",
}

const fmtMoney = (n) => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", minimumFractionDigits: 0,
}).format(Number(n) || 0)

const fmtDate = (d) => {
  if (!d) return "—"
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return "Justo ahora"
  if (diff < 3600) return `Hace ${Math.floor(diff/60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff/3600)} h`
  return date.toLocaleDateString("es-CO", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })
}

const METODO_LABEL = {
  transferencia: "Transferencia",
  nequi: "Nequi",
  daviplata: "Daviplata",
  bancolombia: "Bancolombia",
  efectivo: "Efectivo",
  otro: "Otro",
}

const swalBase = { background: T.bg2, color: T.t1, confirmButtonColor: T.o1, cancelButtonColor: T.t3 }

export default function InboxPagos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoomUrl, setZoomUrl] = useState("")
  const [procesandoId, setProcesandoId] = useState(null)
  const mountedRef = useRef(true)

  const cargar = useCallback(async () => {
    try {
      const data = await pedidosService.getInboxPagos()
      if (!mountedRef.current) return
      setPedidos(Array.isArray(data) ? data : [])
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    cargar()
    const tick = () => { if (!document.hidden) cargar() }
    const id = setInterval(tick, 20000)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [cargar])

  const mensajeWhats = (pedido, aprobado) => {
    const numero = pedido.numero
    const nombre = pedido.cliente?.nombre || ""
    if (aprobado) {
      return `Hola ${nombre} 👋\n\n✅ Tu pago del pedido *#${numero}* fue *aprobado*.\nEstamos preparando tu despacho. Te avisamos cuando salga a entrega.\n\n¡Gracias por comprar en Surti Antojos!`
    }
    return `Hola ${nombre} 👋\n\nSobre tu pedido *#${numero}*: necesitamos revisar el comprobante de pago que enviaste. ¿Podrías verificarlo y enviarnos uno nuevo si es necesario?\n\nGracias.`
  }
  const whatsLink = (telefono, mensaje) => {
    const n = String(telefono || "").replace(/\D/g, "")
    const num = n.length >= 10 ? (n.startsWith("57") ? n : `57${n}`) : ""
    return num ? `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}` : ""
  }

  const aprobar = async (pedido) => {
    const conf = await Swal.fire({
      ...swalBase,
      icon: "question",
      title: `¿Aprobar pago del pedido #${pedido.numero}?`,
      html: `<div style="text-align:left;font-family:${T.font};font-size:14px;line-height:1.6">
        <b>Cliente:</b> ${pedido.cliente?.nombre || ""} ${pedido.cliente?.apellido || ""}<br/>
        <b>Total:</b> ${fmtMoney(pedido.total)}<br/>
        <b>Método:</b> ${METODO_LABEL[pedido.comprobantePago?.metodoPago] || pedido.comprobantePago?.metodoPago || "—"}<br/>
        <br/>
        <span style="color:${T.green};font-weight:700">Al aprobar se descontará el stock y se enviará WhatsApp al cliente.</span>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
    })
    if (!conf.isConfirmed) return

    // Pre-abrir pestaña dentro del click síncrono para evitar bloqueo del popup
    const link = whatsLink(pedido.cliente?.telefono, mensajeWhats(pedido, true))
    const waWin = link ? window.open("about:blank", "_blank") : null

    setProcesandoId(pedido._id)
    try {
      await pedidosService.verificarComprobante(pedido._id, true, "Aprobado desde Inbox de pagos")
      if (mountedRef.current) setPedidos(prev => prev.filter(p => p._id !== pedido._id))
      if (waWin && link) waWin.location.href = link
      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Pago aprobado",
        text: link ? "Stock descontado. Se abrió WhatsApp con el mensaje al cliente." : "Stock descontado. El pedido está listo para despacho.",
        timer: 2200,
        showConfirmButton: false,
      })
    } catch (e) {
      if (waWin) waWin.close()
      Swal.fire({ ...swalBase, icon: "error", title: "No se pudo aprobar", text: e.response?.data?.msg || "Error al aprobar el pago" })
    } finally {
      if (mountedRef.current) setProcesandoId(null)
    }
  }

  const rechazar = async (pedido) => {
    const r = await Swal.fire({
      ...swalBase,
      icon: "warning",
      title: `Rechazar comprobante #${pedido.numero}`,
      input: "textarea",
      inputLabel: "Motivo del rechazo (se enviará al cliente)",
      inputPlaceholder: "Ej: monto no coincide, imagen ilegible, referencia inválida...",
      inputValidator: (v) => !v?.trim() && "Debes indicar el motivo",
      showCancelButton: true,
      confirmButtonText: "Rechazar y avisar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: T.r1,
    })
    if (!r.isConfirmed) return

    const link = whatsLink(
      pedido.cliente?.telefono,
      `Hola ${pedido.cliente?.nombre||""} 👋\n\nSobre tu pedido *#${pedido.numero}*: ${r.value}\n\n¿Podrías enviarnos un nuevo comprobante?\n\nGracias.`
    )
    const waWin = link ? window.open("about:blank", "_blank") : null

    setProcesandoId(pedido._id)
    try {
      await pedidosService.verificarComprobante(pedido._id, false, r.value)
      if (mountedRef.current) setPedidos(prev => prev.filter(p => p._id !== pedido._id))
      if (waWin && link) waWin.location.href = link
      Swal.fire({
        ...swalBase,
        icon: "info",
        title: "Comprobante rechazado",
        text: link ? "Se abrió WhatsApp con el mensaje al cliente." : 'El pedido volvió a "pendiente de pago".',
        timer: 2200,
        showConfirmButton: false,
      })
    } catch (e) {
      if (waWin) waWin.close()
      Swal.fire({ ...swalBase, icon: "error", title: "No se pudo rechazar", text: e.response?.data?.msg || "Error al rechazar" })
    } finally {
      if (mountedRef.current) setProcesandoId(null)
    }
  }

  return (
    <div style={{ fontFamily: T.font, padding: "24px" }}>
      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight: 320, color: T.t2 }}>
          <RefreshCw size={20} style={{ marginRight: 10, animation:"sa-spin 1s linear infinite" }}/> Cargando inbox de pagos...
        </div>
      ) : (
      <>
      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, fontSize: { xs:"1.5rem", md:"1.9rem" }, color: T.t1, letterSpacing: "-.02em", mb: 0.5 }}>
            Inbox de pagos
          </Typography>
          <Typography sx={{ fontFamily: T.font, fontSize: ".9rem", color: T.t2 }}>
            Verifica los comprobantes de pago recibidos desde la landing · Se actualiza cada 20s
          </Typography>
        </Box>
        <Box sx={{ display:"flex", alignItems:"center", gap: 1.5 }}>
          <Box sx={{
            background: pedidos.length ? T.go : T.bg, color: pedidos.length ? "#fff" : T.t2,
            fontFamily: T.font, fontWeight: 700, fontSize: ".82rem",
            borderRadius: 99, padding: "6px 14px", border: pedidos.length ? "none" : `1px solid ${T.border2}`,
          }}>
            {pedidos.length} {pedidos.length === 1 ? "pendiente" : "pendientes"}
          </Box>
          <Button onClick={cargar} startIcon={<RefreshCw size={16}/>}
            sx={{ textTransform:"none", fontFamily:T.font, fontWeight:600, color: T.t2, borderRadius: 2 }}>
            Refrescar
          </Button>
        </Box>
      </Box>

      {/* Empty state */}
      {pedidos.length === 0 && (
        <Box sx={{
          background: T.glass, backdropFilter:"blur(30px)", border:`1px solid ${T.border2}`,
          borderRadius: 5, py: 8, px: 3, textAlign:"center",
        }}>
          <Box sx={{ display:"inline-flex", p: 2, borderRadius:"50%", background:T.o4, color: T.o1, mb: 2 }}>
            <Inbox size={40}/>
          </Box>
          <Typography sx={{ fontFamily: T.fontH, fontWeight: 700, fontSize:"1.25rem", color: T.t1, mb: 1 }}>Sin comprobantes pendientes</Typography>
          <Typography sx={{ fontFamily: T.font, fontSize:".88rem", color: T.t2, maxWidth: 420, mx:"auto" }}>
            Cuando un cliente envíe su comprobante desde la landing, aparecerá aquí para que lo verifiques con un clic.
          </Typography>
        </Box>
      )}

      {/* Cards grid */}
      <Box sx={{ display:"grid", gridTemplateColumns: { xs:"1fr", md:"repeat(auto-fill, minmax(520px, 1fr))" }, gap: 2.5 }}>
        {pedidos.map(p => {
          const cp = p.comprobantePago || {}
          const items = p.detalles || []
          const procesando = procesandoId === p._id
          return (
            <Motion.div key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "#fff", borderRadius: 20, border: `1px solid ${T.border2}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.05)", overflow: "hidden",
              }}>
                {/* Header card */}
                <Box sx={{ p: 2.2, borderBottom: `1px solid ${T.o4}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 1, background: `linear-gradient(135deg, ${T.o4} 0%, #fff 60%)` }}>
                  <Box>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".7rem", fontWeight: 700, color: T.t3, textTransform:"uppercase", letterSpacing: ".08em" }}>Pedido</Typography>
                    <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, fontSize: "1.3rem", color: T.t1, lineHeight: 1 }}>#{p.numero}</Typography>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".74rem", color: T.t3, mt: .5, display:"flex", alignItems:"center", gap: .5 }}>
                      <Clock size={11}/> {fmtDate(cp.fechaEnvio || p.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".7rem", color: T.t3, fontWeight: 600 }}>Total a verificar</Typography>
                    <Typography sx={{ fontFamily: T.fontH, fontWeight: 800, fontSize: "1.4rem", color: T.o1, letterSpacing:"-.01em" }}>{fmtMoney(p.total)}</Typography>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".74rem", color: T.t2, fontWeight: 600 }}>
                      <CreditCard size={11} style={{ verticalAlign:"middle", marginRight:3 }}/>
                      {METODO_LABEL[cp.metodoPago] || cp.metodoPago || "—"}
                    </Typography>
                  </Box>
                </Box>

                {/* Body: comprobante + datos */}
                <Box sx={{ display:"grid", gridTemplateColumns: { xs:"1fr", sm:"200px 1fr" }, gap: 0 }}>
                  {/* Imagen del comprobante */}
                  <Box sx={{ background: T.bg, p: 1.5, display:"flex", alignItems:"center", justifyContent:"center", borderRight: { sm: `1px solid ${T.o4}` }, borderBottom: { xs: `1px solid ${T.o4}`, sm: "none" } }}>
                    {cp.url ? (
                      <Box onClick={() => setZoomUrl(cp.url)} sx={{
                        position:"relative", width:"100%", height: 180, borderRadius: 2, overflow:"hidden",
                        cursor:"zoom-in", "&:hover .zoom-overlay":{ opacity: 1 },
                      }}>
                        <img src={cp.url} alt="comprobante" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        <Box className="zoom-overlay" sx={{
                          position:"absolute", inset: 0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center",
                          color:"#fff", opacity: 0, transition:"opacity .2s",
                        }}>
                          <ZoomIn size={24}/>
                        </Box>
                      </Box>
                    ) : (
                      <Typography sx={{ fontFamily: T.font, fontSize: ".8rem", color: T.t3 }}>Sin imagen</Typography>
                    )}
                  </Box>

                  {/* Datos */}
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography sx={{ fontFamily:T.font, fontSize:".7rem", color:T.t3, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", mb:.3 }}>Cliente</Typography>
                      <Typography sx={{ fontFamily:T.font, fontSize:".92rem", fontWeight:700, color:T.t1, display:"flex", alignItems:"center", gap:.6 }}>
                        <User size={13}/> {p.cliente?.nombre} {p.cliente?.apellido || ""}
                      </Typography>
                      <Typography sx={{ fontFamily:T.font, fontSize:".82rem", color:T.t2, display:"flex", alignItems:"center", gap:.6, mt:.3 }}>
                        <Phone size={12}/> {p.cliente?.telefono || "—"}
                      </Typography>
                      <Typography sx={{ fontFamily:T.font, fontSize:".8rem", color:T.t2, display:"flex", alignItems:"flex-start", gap:.6, mt:.3 }}>
                        <MapPin size={12} style={{ marginTop: 3 }}/>
                        <span>{p.cliente?.direccion || "—"}{p.cliente?.ciudad ? `, ${p.cliente.ciudad}` : ""}</span>
                      </Typography>
                    </Box>

                    {cp.referencia && (
                      <Box sx={{ mb: 1.5, p: 1, background: T.bg, borderRadius: 1.5 }}>
                        <Typography sx={{ fontFamily:T.font, fontSize:".68rem", color:T.t3, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Referencia</Typography>
                        <Typography sx={{ fontFamily:T.font, fontSize:".86rem", color:T.t1, fontWeight:600 }}>{cp.referencia}</Typography>
                      </Box>
                    )}

                    <Box>
                      <Typography sx={{ fontFamily:T.font, fontSize:".7rem", color:T.t3, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", mb:.3, display:"flex", alignItems:"center", gap:.5 }}>
                        <Package size={11}/> Productos ({items.length})
                      </Typography>
                      {items.slice(0, 4).map((d, i) => (
                        <Typography key={i} sx={{ fontFamily:T.font, fontSize:".8rem", color:T.t2, display:"flex", justifyContent:"space-between" }}>
                          <span>• {d.nombreProducto} × {d.cantidad}</span>
                          <span style={{ fontWeight: 600, color: T.t1 }}>{fmtMoney(d.subtotal)}</span>
                        </Typography>
                      ))}
                      {items.length > 4 && <Typography sx={{ fontFamily:T.font, fontSize:".76rem", color:T.t3, mt:.3 }}>y {items.length - 4} más...</Typography>}
                    </Box>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ p: 1.5, display:"flex", gap: 1, borderTop: `1px solid ${T.o4}`, background: T.bg }}>
                  <Button onClick={() => rechazar(p)} disabled={procesando}
                    startIcon={<XCircle size={16}/>}
                    sx={{
                      flex: 1, textTransform:"none", fontFamily:T.font, fontWeight:700, fontSize:".88rem",
                      background:"#fff", color: T.r1, border: `1.5px solid ${T.r1}`, borderRadius: 2.5, py: 1.1,
                      "&:hover": { background: "#FEF2F2" }, "&:disabled": { opacity: .5 },
                    }}>
                    Rechazar
                  </Button>
                  <Button onClick={() => aprobar(p)} disabled={procesando}
                    startIcon={<ShieldCheck size={16}/>}
                    sx={{
                      flex: 2, textTransform:"none", fontFamily:T.font, fontWeight:800, fontSize:".92rem",
                      background: T.green, color:"#fff", borderRadius: 2.5, py: 1.1,
                      boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                      "&:hover": { background: "#16A34A", boxShadow: "0 6px 20px rgba(34,197,94,0.45)" },
                      "&:disabled": { opacity: .5 },
                    }}>
                    {procesando ? "Aprobando..." : "Aprobar y descontar stock"}
                  </Button>
                </Box>
            </Motion.div>
          )
        })}
      </Box>

      {/* Zoom dialog del comprobante */}
      <Dialog open={!!zoomUrl} onClose={() => setZoomUrl("")} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: T.bg2, borderRadius: 4 } }}>
        <DialogContent sx={{ p: 1.5, display:"flex", justifyContent:"center", alignItems:"center", background: "#000" }}>
          {zoomUrl && <img src={zoomUrl} alt="comprobante" style={{ maxWidth:"100%", maxHeight:"80vh", objectFit:"contain" }}/>}
        </DialogContent>
        <DialogActions sx={{ background: T.bg2, px: 2 }}>
          <Button onClick={() => setZoomUrl("")} sx={{ textTransform:"none", fontFamily:T.font, fontWeight:600, color: T.t2 }}>Cerrar</Button>
          {zoomUrl && <Button component="a" href={zoomUrl} target="_blank" rel="noreferrer" sx={{ textTransform:"none", fontFamily:T.font, fontWeight:700, color: T.o1 }}>Abrir original</Button>}
        </DialogActions>
      </Dialog>
      </>
      )}
    </div>
  )
}
