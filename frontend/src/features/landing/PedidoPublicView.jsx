import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  getPedidoPublico,
  subirComprobanteAdminPublic,
  adminPublicComprobante,
  ADMIN_WHATSAPP,
} from "./landing.service.js"

const T = {
  bg: "#FFF8F0", ink: "#12090A", ink2: "#3A2A2C", line: "#E6DCD2",
  o600: "#F05A1A", success: "#22C55E", danger: "#DC2626",
  font: "system-ui, -apple-system, sans-serif",
  fontH: "system-ui, -apple-system, sans-serif",
}

const fmt = n => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", minimumFractionDigits: 0,
}).format(n || 0)

const ESTADO_LABEL = {
  pendiente:        { txt: "Pendiente de pago", color: "#F59E0B", bg: "#FEF3C7" },
  pago_verificado:  { txt: "Pago verificado",   color: "#15803D", bg: "#DCFCE7" },
  despachado:       { txt: "Despachado",        color: "#1D4ED8", bg: "#DBEAFE" },
  entregado:        { txt: "Entregado",         color: "#15803D", bg: "#DCFCE7" },
  cancelado:        { txt: "Cancelado",         color: "#B91C1C", bg: "#FEE2E2" },
}

export default function PedidoPublicView() {
  const { numero } = useParams()
  const [pedido, setPedido]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [okMsg, setOkMsg]     = useState("")

  // Admin upload
  const [archivo, setArchivo]       = useState(null)
  const [preview, setPreview]       = useState("")
  const [referencia, setReferencia] = useState("")
  const [subiendo, setSubiendo]     = useState(false)
  const [verificando, setVerif]     = useState(false)

  const cargar = async () => {
    try {
      setLoading(true); setError("")
      const data = await getPedidoPublico(numero)
      setPedido(data)
      setReferencia(data?.comprobantePago?.referencia || "")
    } catch (e) {
      setError(e?.response?.data?.msg || "No se pudo cargar el pedido")
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [numero])

  const onSelectFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!/^image\//.test(f.type)) { setError("El archivo debe ser una imagen"); return }
    if (f.size > 5 * 1024 * 1024)  { setError("La imagen debe pesar menos de 5MB"); return }
    setError("")
    setArchivo(f)
    setPreview(URL.createObjectURL(f))
  }

  const subirYRegistrar = async ({ verificar }) => {
    if (!archivo && !pedido?.comprobantePago?.url) {
      setError("Adjunta primero la imagen del comprobante")
      return
    }
    setError(""); setOkMsg("")
    const setBusy = verificar ? setVerif : setSubiendo
    setBusy(true)
    try {
      let url = pedido?.comprobantePago?.url
      if (archivo) {
        const up = await subirComprobanteAdminPublic(numero, archivo)
        if (!up?.url) throw new Error("No se obtuvo URL del comprobante")
        url = up.url
      }
      const body = {
        url,
        referencia: referencia.trim() || undefined,
      }
      if (verificar) body.action = "verificar"
      const res = await adminPublicComprobante(numero, body)
      setOkMsg(verificar
        ? `✓ Pago verificado. Pedido avanzado a "${res.estado}".`
        : "Comprobante guardado. Puedes verificarlo cuando quieras.")
      setArchivo(null); setPreview("")
      await cargar()
    } catch (e) {
      setError(e?.response?.data?.msg || e?.message || "Error al procesar comprobante")
    } finally { setBusy(false) }
  }

  if (loading) {
    return <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,color:T.ink2}}>Cargando pedido...</div>
  }
  if (!pedido) {
    return (
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:24,textAlign:"center"}}>
        <div>
          <h2 style={{color:T.ink,marginBottom:8}}>Pedido no encontrado</h2>
          <p style={{color:T.ink2,marginBottom:16}}>{error || "Verifica el número del pedido."}</p>
          <Link to="/" style={{color:T.o600,fontWeight:700}}>← Volver al inicio</Link>
        </div>
      </div>
    )
  }

  const cp = pedido.comprobantePago || {}
  const estadoInfo = ESTADO_LABEL[pedido.estado] || ESTADO_LABEL.pendiente
  const adminWhats = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Hola, consulto el pedido *#${pedido.numero}*`)}`
  const isAdmin = !!pedido.isAdmin
  const puedeOperar = isAdmin && pedido.estado === "pendiente" && !cp.verificado

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.font,padding:"24px 16px"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <Link to="/" style={{color:T.ink2,textDecoration:"none",fontSize:".88rem",fontWeight:600}}>← Inicio</Link>
          {isAdmin && (
            <span style={{background:"#EFF6FF",color:"#1D4ED8",padding:"6px 12px",borderRadius:99,fontWeight:700,fontSize:".74rem"}}>
              👤 Modo administrador
            </span>
          )}
        </div>

        <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:16,padding:"28px 28px",boxShadow:"0 2px 14px rgba(11,11,15,.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:20}}>
            <div>
              <div style={{fontSize:".74rem",fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:".08em"}}>Pedido</div>
              <div style={{fontSize:"1.6rem",fontWeight:800,color:T.ink,fontFamily:T.fontH,letterSpacing:"-.02em"}}>#{pedido.numero}</div>
            </div>
            <span style={{background:estadoInfo.bg,color:estadoInfo.color,padding:"6px 14px",borderRadius:99,fontWeight:700,fontSize:".82rem"}}>{estadoInfo.txt}</span>
          </div>

          {okMsg && <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#15803D",padding:"12px 14px",borderRadius:10,marginBottom:16,fontSize:".88rem",fontWeight:600}}>{okMsg}</div>}
          {error && <div style={{background:"#FEF2F2",border:"1px solid #FECACA",color:T.danger,padding:"12px 14px",borderRadius:10,marginBottom:16,fontSize:".88rem",fontWeight:600}}>⚠ {error}</div>}

          {/* Cliente */}
          <Section title="Cliente">
            <Row label="Nombre" value={`${pedido.cliente?.nombre || ""} ${pedido.cliente?.apellido || ""}`.trim()} />
            <Row label="Documento" value={pedido.cliente?.documento} />
            <Row label="Teléfono" value={pedido.cliente?.telefono} />
            <Row label="Dirección" value={`${pedido.cliente?.direccion || ""}${pedido.cliente?.ciudad ? ", " + pedido.cliente.ciudad : ""}`} />
          </Section>

          {/* Productos */}
          <Section title="Productos">
            {(pedido.detalles || []).map((d, i) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.line}`,fontSize:".88rem"}}>
                <span style={{color:T.ink2}}>{d.nombreProducto} × {d.cantidad}</span>
                <span style={{fontWeight:700,color:T.ink}}>{fmt(d.subtotal)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:10,borderTop:`2px solid ${T.ink}`}}>
              <span style={{fontWeight:700}}>Total</span>
              <span style={{fontWeight:800,fontSize:"1.15rem"}}>{fmt(pedido.total)}</span>
            </div>
          </Section>

          {/* Comprobante */}
          <Section title="Comprobante de pago">
            {cp.url ? (
              <div>
                <a href={cp.url} target="_blank" rel="noreferrer">
                  <img src={cp.url} alt="comprobante"
                    style={{maxWidth:"100%",maxHeight:280,borderRadius:10,border:`1px solid ${T.line}`,cursor:"zoom-in",display:"block"}}/>
                </a>
                <div style={{marginTop:8,fontSize:".82rem",color:"#777"}}>
                  {cp.verificado
                    ? <span style={{color:"#15803D",fontWeight:700}}>✓ Verificado</span>
                    : cp.recibidoPorWhatsapp
                      ? "Recibido por WhatsApp — pendiente de verificación"
                      : "Pendiente de verificación"}
                  {cp.referencia && ` · Ref: ${cp.referencia}`}
                </div>
              </div>
            ) : cp.recibidoPorWhatsapp ? (
              <div style={{color:"#15803D",fontWeight:600}}>✓ Marcado como recibido por WhatsApp (sin imagen adjunta)</div>
            ) : (
              <div style={{color:"#999",fontSize:".88rem"}}>Aún no se ha registrado el comprobante</div>
            )}
          </Section>

          {/* ── ACCIONES DE ADMIN ── */}
          {puedeOperar && (
            <Section title="Acciones de administrador">
              <div style={{background:T.bg,border:`1px solid ${T.line}`,borderRadius:12,padding:"16px 18px"}}>
                <div style={{fontSize:".88rem",color:T.ink2,marginBottom:12,lineHeight:1.55}}>
                  Sube la imagen del comprobante que el cliente te envió por WhatsApp.
                  Puedes <strong>guardarla</strong> y verificar más tarde, o <strong>verificar y aprobar</strong> el pago en un solo paso (descontará stock automáticamente).
                </div>

                <label htmlFor="adm-comp" style={{display:"block",border:`2px dashed ${preview?T.success:T.line}`,borderRadius:10,padding:preview?10:"18px 14px",textAlign:"center",cursor:"pointer",background:preview?"#F0FDF4":"#fff"}}>
                  {preview ? (
                    <div>
                      <img src={preview} alt="preview" style={{maxWidth:"100%",maxHeight:160,borderRadius:8,marginBottom:6,objectFit:"contain"}}/>
                      <div style={{fontSize:".78rem",color:"#777"}}>{archivo?.name} · Toca para cambiar</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontWeight:700,color:T.ink2,fontSize:".88rem",marginBottom:4}}>📎 Seleccionar imagen del comprobante</div>
                      <div style={{fontSize:".74rem",color:"#999"}}>Desde galería o cámara · máx 5MB</div>
                    </div>
                  )}
                  <input id="adm-comp" type="file" accept="image/*" capture="environment" onChange={onSelectFile} style={{display:"none"}}/>
                </label>

                <input type="text" placeholder="Referencia / # de transacción (opcional)"
                  value={referencia} onChange={e=>setReferencia(e.target.value)}
                  style={{width:"100%",marginTop:10,padding:"10px 13px",border:`1.5px solid ${T.line}`,borderRadius:10,fontSize:".86rem",outline:"none",boxSizing:"border-box"}}
                />

                <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                  <button onClick={() => subirYRegistrar({verificar:false})}
                    disabled={subiendo||verificando||(!archivo && !cp.url)}
                    style={{flex:1,minWidth:140,background:"#fff",border:`1.5px solid ${T.ink}`,color:T.ink,padding:"12px 18px",borderRadius:10,cursor:(subiendo||verificando)?"not-allowed":"pointer",fontWeight:700,fontSize:".88rem",opacity:(subiendo||verificando)?.6:1}}>
                    {subiendo ? "Guardando..." : "Solo guardar"}
                  </button>
                  <button onClick={() => subirYRegistrar({verificar:true})}
                    disabled={subiendo||verificando||(!archivo && !cp.url)}
                    style={{flex:1,minWidth:140,background:T.success,border:"none",color:"#fff",padding:"12px 18px",borderRadius:10,cursor:(subiendo||verificando)?"not-allowed":"pointer",fontWeight:700,fontSize:".88rem",opacity:(subiendo||verificando)?.6:1}}>
                    {verificando ? "Verificando..." : "✓ Verificar y aprobar pago"}
                  </button>
                </div>
              </div>
            </Section>
          )}

          {!isAdmin && pedido.estado === "pendiente" && (
            <Section title="¿Eres el administrador?">
              <div style={{background:T.bg,border:`1px solid ${T.line}`,borderRadius:12,padding:"14px 18px",fontSize:".86rem",color:T.ink2,lineHeight:1.55}}>
                Inicia sesión en <Link to="/login" style={{color:T.o600,fontWeight:700}}>el panel</Link> con tu usuario admin y vuelve a abrir este enlace para subir el comprobante y verificar el pago.
              </div>
            </Section>
          )}

          {/* Acciones generales */}
          <div style={{display:"flex",gap:10,marginTop:24,flexWrap:"wrap"}}>
            <a href={adminWhats} target="_blank" rel="noreferrer"
              style={{flex:1,minWidth:200,background:"#25D366",color:"#fff",padding:"14px 22px",borderRadius:12,textDecoration:"none",fontWeight:700,textAlign:"center",fontSize:".92rem"}}>
              Abrir conversación en WhatsApp
            </a>
            {isAdmin && (
              <Link to="/dashboard"
                style={{flex:1,minWidth:200,background:T.ink,color:"#fff",padding:"14px 22px",borderRadius:12,textDecoration:"none",fontWeight:700,textAlign:"center",fontSize:".92rem"}}>
                Ir al panel de pedidos
              </Link>
            )}
          </div>
        </div>

        <p style={{textAlign:"center",color:"#999",fontSize:".78rem",marginTop:16}}>
          Surti Antojos · Comparte este enlace solo con personas de confianza
        </p>
      </div>
    </div>
  )
}

const Section = ({ title, children }) => (
  <div style={{marginTop:20,paddingTop:20,borderTop:`1px solid ${T.line}`}}>
    <div style={{fontSize:".72rem",fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>{title}</div>
    {children}
  </div>
)

const Row = ({ label, value }) => (
  <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:".88rem"}}>
    <span style={{color:"#777"}}>{label}</span>
    <span style={{color:T.ink,fontWeight:600,textAlign:"right",maxWidth:"65%"}}>{value || "—"}</span>
  </div>
)
