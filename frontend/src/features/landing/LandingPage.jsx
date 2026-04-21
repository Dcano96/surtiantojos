import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  getProductosPublicos,
  crearPedidoPublico,
  subirComprobantePublico,
  registrarComprobantePublico,
  buildWhatsAppLink,
  ADMINS_WHATSAPP,
} from "./landing.service.js"

/* ── imágenes con ?url para que Vite las procese correctamente ── */
import imgArepaYuca      from "../../assets/arepa de maiz con yuca.jpeg?url"
import imgArepaQueso     from "../../assets/arepa de maiz con queso costeno.jpeg?url"
import imgPanDebono      from "../../assets/pan debono.jpeg?url"
import imgChorizoCerdo   from "../../assets/chorizo de cerdo.jpeg?url"
import imgMorzilla       from "../../assets/morzilla.jpeg?url"
import imgYogurt         from "../../assets/yogurt.jpeg?url"
import imgPan            from "../../assets/pan.jpeg?url"
import imgCuajada        from "../../assets/cuajada.jpeg?url"
import imgChorizoAhumado from "../../assets/chorizo santarosano ahumado.jpeg?url"
import imgMantequilla    from "../../assets/mantequilla.jpeg?url"
import imgHero           from "../../assets/hero.png?url"
import imgExtra          from "../../assets/imagen-1.jpeg?url"

/* ── spinner declarado a nivel de módulo para evitar que React/framer-motion
     lo recreen en cada render (causaba que <Spin> rompiera el árbol del paso 3) ── */
const Spin = () => (
  <span style={{
    width:16,height:16,borderRadius:"50%",
    border:"2px solid rgba(255,255,255,.3)",
    borderTopColor:"#fff",
    animation:"sa-spin .7s linear infinite",
    display:"inline-block"
  }}/>
)

/* ── catálogo local (fallback cuando el backend no responde) ─── */
const CATALOG_LOCAL = [
  { _id:"l1",  nombre:"Arepa de Maíz con Yuca",           precio:3500, stock:20, _img:imgArepaYuca,      categoria:{nombre:"Arepas"},    descripcion:"Suave y esponjosa, hecha con maíz molido y yuca. Perfecta para cualquier momento." },
  { _id:"l2",  nombre:"Arepa de Maíz con Queso Costeño",  precio:4000, stock:18, _img:imgArepaQueso,     categoria:{nombre:"Arepas"},    descripcion:"Rellena de queso costeño artesanal derretido. Un clásico que nunca falla." },
  { _id:"l3",  nombre:"Pan de Bono",                      precio:2500, stock:30, _img:imgPanDebono,      categoria:{nombre:"Panadería"}, descripcion:"Crujiente por fuera, suave por dentro. Horneado fresco cada mañana." },
  { _id:"l4",  nombre:"Chorizo de Cerdo",                 precio:5000, stock:15, _img:imgChorizoCerdo,   categoria:{nombre:"Carnes"},    descripcion:"Chorizo artesanal 100% cerdo, sazonado con especias naturales de la región." },
  { _id:"l5",  nombre:"Morzilla",                         precio:4500, stock:12, _img:imgMorzilla,       categoria:{nombre:"Carnes"},    descripcion:"Receta tradicional con arroz y especias. Sabor auténtico de la cocina colombiana." },
  { _id:"l6",  nombre:"Yogurt Natural",                   precio:3800, stock:25, _img:imgYogurt,         categoria:{nombre:"Lácteos"},   descripcion:"Cremoso, sin conservantes. Elaborado con leche fresca de la región." },
  { _id:"l7",  nombre:"Pan Artesanal",                    precio:2000, stock:40, _img:imgPan,            categoria:{nombre:"Panadería"}, descripcion:"Pan horneado a diario con masa madre. Crujiente, aromático y delicioso." },
  { _id:"l8",  nombre:"Cuajada Fresca",                   precio:6000, stock:10, _img:imgCuajada,        categoria:{nombre:"Lácteos"},   descripcion:"Cuajada de leche entera recién elaborada. Suave, fresca y sin aditivos." },
  { _id:"l9",  nombre:"Chorizo Santarosano Ahumado",      precio:5500, stock:18, _img:imgChorizoAhumado, categoria:{nombre:"Carnes"},    descripcion:"El clásico chorizo ahumado estilo Santarosa. Intenso, ahumado y lleno de sabor." },
  { _id:"l10", nombre:"Mantequilla Artesanal",            precio:4200, stock:22, _img:imgMantequilla,    categoria:{nombre:"Lácteos"},   descripcion:"Sin sal, elaborada con crema de leche fresca. Ideal para untar o cocinar." },
]

const NAME_TO_IMG = {
  "arepa de maiz con yuca":          imgArepaYuca,
  "arepa maiz yuca":                 imgArepaYuca,
  "arepa de maiz con queso":         imgArepaQueso,
  "arepa maiz queso":                imgArepaQueso,
  "pan de bono":                     imgPanDebono,
  "pan debono":                      imgPanDebono,
  "chorizo santarosano":             imgChorizoAhumado,
  "chorizo ahumado":                 imgChorizoAhumado,
  "chorizo de cerdo":                imgChorizoCerdo,
  "chorizo":                         imgChorizoCerdo,
  "morzilla":                        imgMorzilla,
  "morcilla":                        imgMorzilla,
  "yogurt":                          imgYogurt,
  "cuajada":                         imgCuajada,
  "mantequilla":                     imgMantequilla,
  "pan artesanal":                   imgPan,
  "pan":                             imgPan,
}

const resolveImg = (p) => {
  if (p._img) return p._img
  const nom = p.nombre?.toLowerCase() ?? ""
  const hit = Object.keys(NAME_TO_IMG).find(k => nom.includes(k))
  return hit ? NAME_TO_IMG[hit] : imgExtra
}

/* ── tokens de diseño e-commerce pro ─────────────────────────── */
const T = {
  /* paleta naranja refinada */
  o50:"#FFF5EE", o100:"#FFE8D6", o200:"#FFD0A8", o300:"#FFB07A",
  o500:"#FF6B2C", o600:"#F05A1A", o700:"#D14406", o800:"#A33605",

  /* neutros pro */
  ink:"#0B0B0F",  ink2:"#1A1A22", ink3:"#2E2E38",
  gray1:"#6B6B76", gray2:"#9A9AA4", gray3:"#C8C8D0",
  line:"#ECECEE", surf:"#FFFFFF", bg:"#FAFAFA", bg2:"#F4F4F6",

  /* estado */
  success:"#16A34A", warn:"#F59E0B", danger:"#DC2626", info:"#2563EB",

  /* gradients + sombras */
  go:"linear-gradient(135deg,#FF6B2C 0%,#F05A1A 50%,#D14406 100%)",
  goSoft:"linear-gradient(135deg,#FFE8D6 0%,#FFD0A8 100%)",
  heroBg:"linear-gradient(180deg,#FFF8F1 0%,#FFFFFF 100%)",

  shadow1:"0 1px 2px rgba(11,11,15,.04), 0 1px 3px rgba(11,11,15,.06)",
  shadow2:"0 4px 8px rgba(11,11,15,.04), 0 8px 24px rgba(11,11,15,.08)",
  shadow3:"0 12px 32px rgba(11,11,15,.10), 0 20px 60px rgba(255,107,44,.18)",
  glow:"0 10px 30px rgba(240,90,26,.32)",

  /* tipografía */
  font:"'Inter','Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif",
  fontH:"'Bricolage Grotesque','Fraunces',sans-serif",
  fontM:"'JetBrains Mono',ui-monospace,monospace",
}

/* ── CSS global ───────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("sa-lp-css")) {
  const s = document.createElement("style"); s.id = "sa-lp-css"
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;font-size:16px}
    body{margin:0;background:#FAFAFA;font-family:'Inter',-apple-system,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;color:#0B0B0F}
    input,button,select,textarea{font-family:inherit}
    img{display:block}
    ::-webkit-scrollbar{width:6px;height:6px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,107,44,.35);border-radius:99px}
    ::-webkit-scrollbar-thumb:hover{background:rgba(255,107,44,.55)}
    @keyframes sa-pulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.15);opacity:.4}}
    @keyframes sa-shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
    @keyframes sa-spin{to{transform:rotate(360deg)}}
    @keyframes sa-bd{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
    @keyframes sa-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes sa-blob{0%,100%{border-radius:42% 58% 70% 30%/40% 60% 40% 60%}50%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}}

    .sa-btn-p{transition:transform .18s,box-shadow .18s,filter .18s!important;will-change:transform}
    .sa-btn-p:hover{transform:translateY(-2px)!important;box-shadow:0 14px 40px rgba(240,90,26,.45)!important;filter:brightness(1.04)}
    .sa-btn-p:active{transform:translateY(0)!important}
    .sa-btn-s{transition:border-color .18s,background .18s,color .18s!important}
    .sa-btn-s:hover{border-color:#FF6B2C!important;color:#F05A1A!important;background:#FFF5EE!important}

    .sa-card{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s!important;will-change:transform}
    .sa-card:hover{transform:translateY(-6px)!important;box-shadow:0 18px 48px rgba(11,11,15,.10),0 6px 14px rgba(11,11,15,.05)!important}
    .sa-card:hover .sa-img{transform:scale(1.06)!important}
    .sa-card:hover .sa-quick{opacity:1!important;transform:translateY(0)!important}
    .sa-img{transition:transform .55s cubic-bezier(.22,1,.36,1)!important}

    .sa-chip{transition:all .2s!important}
    .sa-chip:hover{background:#FFF5EE!important;border-color:#FFB07A!important}

    .sa-input:focus{border-color:#FF6B2C!important;box-shadow:0 0 0 3px rgba(255,107,44,.14)!important;outline:none}

    .sa-nav-link{position:relative;transition:color .2s}
    .sa-nav-link::after{content:"";position:absolute;bottom:-4px;left:50%;width:0;height:2px;background:#F05A1A;transition:all .25s;transform:translateX(-50%)}
    .sa-nav-link:hover{color:#F05A1A!important}
    .sa-nav-link:hover::after{width:100%}

    @keyframes sa-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  `
  document.head.appendChild(s)
}

const fmt = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(n)
const STEPS = ["Carrito","Datos","Confirmar","Listo"]

/* iconos SVG reusables (minimal outline) */
const Icon = {
  cart:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  search:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  user:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  heart:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  truck:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  shield:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  leaf:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.76 3.9 1.76 7.5.4 11.43A8.08 8.08 0 0 1 11 20"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>,
  card:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  star:    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  plus:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  close:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chat:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  whats:   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>,
  flame:   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>,
  menu:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  pin:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  instagram:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  facebook:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
}

/* ══════════════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [productos,    setProductos]    = useState([])
  const [loadingProds, setLoadingProds] = useState(true)
  const [carrito,      setCarrito]      = useState([])
  const [carritoOpen,  setCarritoOpen]  = useState(false)
  const [step,         setStep]         = useState(0)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const emptyForm = {nombre:"",apellido:"",telefono:"",email:"",documento:"",direccion:"",ciudad:"Bogotá"}
  const [form,       setForm]       = useState(emptyForm)
  const [formErr,    setFormErr]    = useState({})
  const [metodoPago, setMetodoPago] = useState("nequi")
  const [pedidoCreado, setPedidoCreado] = useState(null)
  const [enviando,   setEnviando]   = useState(false)
  const [error,      setError]      = useState("")
  // ── Estados para subir comprobante en el paso 4 ──
  const [comprobanteFile,    setComprobanteFile]    = useState(null)
  const [comprobantePreview, setComprobantePreview] = useState("")
  const [referenciaPago,     setReferenciaPago]     = useState("")
  const [subiendoComp,       setSubiendoComp]       = useState(false)
  const [compEnviado,        setCompEnviado]        = useState(false)
  const [errComp,            setErrComp]            = useState("")
  const [dragActive,         setDragActive]         = useState(false)
  const [catActiva,  setCatActiva]  = useState("Todos")
  const [query,      setQuery]      = useState("")
  const [mobileMenu, setMobileMenu] = useState(false)
  const catalogoRef = useRef(null)

  useEffect(() => {
    getProductosPublicos()
      .then(data => {
        const lista = Array.isArray(data) ? data : []
        setProductos(lista.length > 0 ? lista : CATALOG_LOCAL)
      })
      .catch(() => setProductos(CATALOG_LOCAL))
      .finally(() => setLoadingProds(false))
  }, [])

  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria?.nombre || p.categoria || "General").filter(Boolean))]
  const prodsFilt = productos
    .filter(p => catActiva === "Todos" ? true : (p.categoria?.nombre || p.categoria || "General") === catActiva)
    .filter(p => !query.trim() ? true : p.nombre?.toLowerCase().includes(query.trim().toLowerCase()))

  const totalItems  = carrito.reduce((a,c) => a + c.cantidad, 0)
  const totalPrecio = carrito.reduce((a,c) => a + c.producto.precio * c.cantidad, 0)

  const addToCart = (p) => setCarrito(prev => {
    const ex = prev.find(i => i.producto._id === p._id)
    if (ex) return ex.cantidad >= p.stock ? prev : prev.map(i => i.producto._id === p._id ? {...i,cantidad:i.cantidad+1} : i)
    return [...prev, {producto:p,cantidad:1}]
  })
  const removeFromCart = id => setCarrito(prev => prev.filter(i => i.producto._id !== id))
  const updateQty = (id,d) => setCarrito(prev => prev.map(i =>
    i.producto._id !== id ? i : {...i,cantidad:Math.max(1,Math.min(i.producto.stock,i.cantidad+d))}
  ))

  const validarForm = () => {
    const e = {}
    if (!form.nombre.trim())    e.nombre    = "Requerido"
    if (!form.telefono.trim())  e.telefono  = "Requerido"
    if (!form.documento.trim()) e.documento = "Requerido"
    if (!form.direccion.trim()) e.direccion = "Requerido"
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido"
    setFormErr(e)
    return Object.keys(e).length === 0
  }

  const handleCrearPedido = async () => {
    if (!validarForm()) return
    setEnviando(true); setError("")
    try {
      // Filtrar items del catálogo local (ids "l1","l2"...): el backend no los reconoce
      const itemsValidos = carrito.filter(i => i.producto?._id && !/^l\d+$/.test(String(i.producto._id)))
      if (!itemsValidos.length) {
        throw new Error("Los productos del carrito no están sincronizados con el servidor. Recarga la página y vuelve a intentar.")
      }

      const pedido = await crearPedidoPublico({
        cliente: {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          tipoDocumento: "CC",
          documento: form.documento.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim(),
          direccion: form.direccion.trim(),
          ciudad: form.ciudad || "Bogotá",
        },
        items: itemsValidos.map(i => ({ producto: i.producto._id, cantidad: i.cantidad, precioUnitario: i.producto.precio })),
        metodoPago,
        notas: `Landing. Pago: ${metodoPago}`,
      })
      // Apagar el spinner ANTES de cambiar de paso para evitar que framer-motion
      // intente animar la salida con un componente <Spin> aún montado (causaba crash).
      setEnviando(false)
      setPedidoCreado(pedido)
      setCheckoutStep(4)
      window.scrollTo({top:0,behavior:"smooth"})
      return
    } catch(e) {
      const msg = e?.response?.data?.msg || e?.response?.data?.error || e?.message || "Error al crear el pedido."
      setError(msg)
      console.error("[LandingPage] Error al crear pedido:", e?.response?.data || e)
      setEnviando(false)
    }
  }

  const irACheckout = () => { if(!carrito.length) return; setStep(1); setCheckoutStep(1); window.scrollTo({top:0,behavior:"smooth"}) }
  const volver      = () => { setStep(0); setCheckoutStep(1); setError(""); setFormErr({}) }
  const reiniciar   = () => {
    setCarrito([]); setForm(emptyForm); setFormErr({}); setMetodoPago("nequi")
    setPedidoCreado(null); setError(""); setStep(0); setCheckoutStep(1)
    setComprobanteFile(null); setComprobantePreview(""); setReferenciaPago("")
    setCompEnviado(false); setErrComp(""); setSubiendoComp(false); setDragActive(false)
    window.scrollTo({top:0})
  }

  /* ── Selección/validación del archivo de comprobante (maneja input y DnD) ── */
  const aceptarArchivo = (f) => {
    if (!f) return
    if (!/^image\//.test(f.type)) { setErrComp("El archivo debe ser una imagen (JPG, PNG, WEBP)"); return }
    if (f.size > 5 * 1024 * 1024)  { setErrComp("La imagen debe pesar menos de 5MB"); return }
    setErrComp("")
    setComprobanteFile(f)
    // Liberar preview anterior si existe
    if (comprobantePreview) { try { URL.revokeObjectURL(comprobantePreview) } catch { /* noop */ } }
    setComprobantePreview(URL.createObjectURL(f))
  }
  const onSelectComprobante = (e) => aceptarArchivo(e.target.files?.[0])
  const onDropComprobante = (e) => {
    e.preventDefault(); setDragActive(false)
    aceptarArchivo(e.dataTransfer?.files?.[0])
  }

  /* ── Enviar comprobante al backend ── */
  const enviarComprobante = async () => {
    if (!pedidoCreado?._id) { setErrComp("No hay pedido asociado"); return }
    if (!comprobanteFile)   { setErrComp("Selecciona la imagen del comprobante"); return }
    setErrComp(""); setSubiendoComp(true)
    try {
      const up = await subirComprobantePublico(pedidoCreado._id, comprobanteFile)
      if (!up?.url) throw new Error("No se obtuvo la URL del comprobante")
      await registrarComprobantePublico(pedidoCreado._id, {
        url: up.url,
        metodoPago,
        referencia: referenciaPago.trim(),
        documento: form.documento.trim(),
      })
      setCompEnviado(true)
      // Guardar último pedido confirmado
      const numero = pedidoCreado?.numero || pedidoCreado?._id?.slice(-6)?.toUpperCase()
      if (numero) {
        try { localStorage.setItem("sa_ultimo_pedido", JSON.stringify({ numero, fecha: Date.now() })) } catch { /* noop */ }
      }
    } catch (e) {
      setErrComp(e?.response?.data?.msg || e?.message || "No se pudo enviar el comprobante")
      console.error("[LandingPage] Error al enviar comprobante:", e?.response?.data || e)
    } finally {
      setSubiendoComp(false)
    }
  }

  /* ── Mensaje pre-armado para WhatsApp (dudas del cliente, NO para pago) ── */
  const mensajeWhatsDudas = () => {
    const numero = pedidoCreado?.numero || pedidoCreado?._id?.slice(-6)?.toUpperCase() || "—"
    return `Hola Surti Antojos 👋\nTengo una consulta sobre mi pedido *#${numero}*.`
  }

  /* ── estilos base botones ── */
  const BP = { background:T.go, border:"none", cursor:"pointer", padding:"14px 28px", borderRadius:12, color:"#fff", fontFamily:T.font, fontWeight:700, fontSize:".92rem", boxShadow:T.glow, letterSpacing:"-.005em", display:"inline-flex", alignItems:"center", gap:8 }
  const BS = { background:"#fff", border:`1.5px solid ${T.line}`, cursor:"pointer", padding:"14px 24px", borderRadius:12, color:T.ink2, fontFamily:T.font, fontWeight:600, fontSize:".88rem", display:"inline-flex", alignItems:"center", gap:8 }

  /* Spin se declara a nivel de módulo (arriba del archivo) */

  /* ══════════════════════════════════════════════════════════════
     (Topbar removido)
     ══════════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════════
     NAVBAR e-commerce
     ══════════════════════════════════════════════════════════════ */
  const Navbar = () => {
    const [sc, setSc] = useState(false)
    useEffect(()=>{
      const h=()=>setSc(window.scrollY>24)
      window.addEventListener("scroll",h); return()=>window.removeEventListener("scroll",h)
    },[])
    return (
      <header style={{position:"sticky",top:0,zIndex:1000,background:"#fff",borderBottom:`1px solid ${sc?T.line:"transparent"}`,boxShadow:sc?"0 2px 14px rgba(11,11,15,.04)":"none",transition:"all .25s"}}>
        <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px",height:76,display:"flex",alignItems:"center",gap:24}}>

          {/* logo */}
          <div style={{display:"flex",alignItems:"center",gap:11,cursor:"pointer",flexShrink:0}} onClick={volver}>
            <div style={{width:40,height:40,borderRadius:11,background:T.go,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(240,90,26,.35)"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M7 8c0-2 1.5-5 5-5s5 3 5 5c0 2-1 3-1 5 0 3 2 3 2 6 0 2-2 4-6 4s-6-2-6-4c0-3 2-3 2-6 0-2-1-3-1-5z" fill="white"/>
                <circle cx="12" cy="9" r="1.8" fill={T.o600}/>
              </svg>
            </div>
            <div>
              <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.18rem",color:T.ink,lineHeight:1,letterSpacing:"-.02em"}}>
                Surti<span style={{color:T.o600}}>Antojos</span>
              </div>
              <div style={{fontFamily:T.fontM,fontSize:".62rem",color:T.gray1,fontWeight:500,letterSpacing:".08em",marginTop:3}}>ARTESANAL · FRESCO</div>
            </div>
          </div>

          {/* search bar */}
          {step===0 && (
            <div style={{flex:1,maxWidth:540,display:"none",position:"relative"}} className="sa-search-wrap">
              <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:T.gray1,pointerEvents:"none"}}>{Icon.search}</span>
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                onFocus={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})}
                placeholder="Buscar chorizos, arepas, pan de bono..."
                className="sa-input"
                style={{width:"100%",padding:"12px 18px 12px 44px",borderRadius:12,border:`1.5px solid ${T.line}`,background:T.bg2,fontSize:".88rem",color:T.ink,transition:"all .2s"}}
              />
            </div>
          )}

          {/* nav links (desktop) */}
          <nav style={{display:"flex",alignItems:"center",gap:4,flex:step===0?"none":1,justifyContent:step===0?"initial":"flex-end"}} className="sa-nav-desk">
            {step===0 && (
              <>
                <button className="sa-nav-link" onClick={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})} style={{background:"none",border:"none",cursor:"pointer",fontFamily:T.font,fontWeight:500,fontSize:".88rem",color:T.ink2,padding:"8px 14px"}}>Catálogo</button>
                <a href="#como" className="sa-nav-link" style={{textDecoration:"none",fontFamily:T.font,fontWeight:500,fontSize:".88rem",color:T.ink2,padding:"8px 14px"}}>¿Cómo funciona?</a>
                <a href="#nosotros" className="sa-nav-link" style={{textDecoration:"none",fontFamily:T.font,fontWeight:500,fontSize:".88rem",color:T.ink2,padding:"8px 14px"}}>Nosotros</a>
              </>
            )}
          </nav>

          {/* acciones derecha */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
            <a href="/login" title="Acceso administrador" style={{width:42,height:42,borderRadius:11,background:T.bg2,color:T.ink2,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",border:`1px solid ${T.line}`,transition:"all .2s"}} className="sa-btn-s">{Icon.user}</a>

            <button title="Favoritos" style={{width:42,height:42,borderRadius:11,background:T.bg2,color:T.ink2,border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}} className="sa-btn-s">{Icon.heart}</button>

            <button onClick={()=>step===0?setCarritoOpen(true):irACheckout()}
              style={{position:"relative",background:T.ink,border:"none",cursor:"pointer",padding:"0 18px",height:42,borderRadius:11,color:"#fff",fontFamily:T.font,fontWeight:600,fontSize:".85rem",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
              {Icon.cart}
              <span style={{fontFamily:T.fontM,fontWeight:600}}>{fmt(totalPrecio)}</span>
              {totalItems>0&&<span style={{position:"absolute",top:-7,right:-7,background:T.o500,color:"#fff",borderRadius:"50%",minWidth:22,height:22,padding:"0 6px",fontSize:".7rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2.5px solid #fff",animation:"sa-bd 2s infinite",fontFamily:T.fontM}}>{totalItems}</span>}
            </button>

            <button onClick={()=>setMobileMenu(!mobileMenu)} title="Menú" className="sa-mobile-only" style={{display:"none",width:42,height:42,borderRadius:11,background:T.bg2,color:T.ink2,border:`1px solid ${T.line}`,alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{Icon.menu}</button>
          </div>
        </div>

        {/* barra categorías */}
        {step===0 && !loadingProds && categorias.length>1 && (
          <div style={{borderTop:`1px solid ${T.line}`,background:"#fff",overflowX:"auto",whiteSpace:"nowrap"}}>
            <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",gap:6,height:48}}>
              <span style={{fontFamily:T.font,fontSize:".78rem",fontWeight:700,color:T.gray1,letterSpacing:".06em",textTransform:"uppercase",marginRight:16,flexShrink:0}}>Categorías</span>
              {categorias.map(c=>(
                <button key={c} onClick={()=>{setCatActiva(c);catalogoRef.current?.scrollIntoView({behavior:"smooth"})}}
                  style={{padding:"7px 15px",borderRadius:50,border:"none",background:catActiva===c?T.ink:"transparent",color:catActiva===c?"#fff":T.ink2,fontFamily:T.font,fontWeight:600,fontSize:".82rem",cursor:"pointer",transition:"all .2s",flexShrink:0}}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <style>{`
          @media (min-width:900px){ .sa-search-wrap{display:block!important} }
          @media (max-width:900px){ .sa-nav-desk{display:none!important} .sa-mobile-only{display:flex!important} }
        `}</style>
      </header>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     HERO e-commerce split
     ══════════════════════════════════════════════════════════════ */
  const Hero = () => {
    const featured = productos[3] || CATALOG_LOCAL[3]
    return (
      <section style={{background:T.heroBg,position:"relative",overflow:"hidden",padding:"48px 0 72px"}}>
        {/* blob decorativo */}
        <div style={{position:"absolute",top:-120,right:-100,width:520,height:520,background:"radial-gradient(circle,rgba(255,107,44,.16) 0%,transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-80,left:-60,width:360,height:360,background:"radial-gradient(circle,rgba(255,176,122,.14) 0%,transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>

        <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px",position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:64,alignItems:"center"}} className="sa-hero-grid">

          {/* columna izq */}
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.6,ease:[.22,1,.36,1]}}>

            {/* trust strip top */}
            <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"#fff",border:`1px solid ${T.line}`,borderRadius:50,padding:"6px 6px 6px 16px",marginBottom:28,boxShadow:T.shadow1}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:4,color:T.o600,fontSize:".82rem",fontWeight:600}}>
                <span style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(i=>Icon.star)}</span>
                <span style={{fontFamily:T.fontM,color:T.ink2}}>4.9</span>
              </span>
              <span style={{width:1,height:16,background:T.line}}/>
              <span style={{fontSize:".78rem",color:T.gray1,fontWeight:500}}>+1.200 pedidos felices</span>
              <span style={{background:T.o500,color:"#fff",borderRadius:50,padding:"3px 10px",fontSize:".68rem",fontWeight:700,marginLeft:4}}>NUEVO</span>
            </div>

            <h1 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"clamp(2.6rem,5.2vw,4.2rem)",lineHeight:1.02,color:T.ink,marginBottom:22,letterSpacing:"-.035em"}}>
              Sabor artesanal,<br/>
              <span style={{color:T.o600,position:"relative",display:"inline-block"}}>
                directo del campo
                <svg style={{position:"absolute",bottom:-6,left:0,width:"100%",height:14}} viewBox="0 0 300 14" preserveAspectRatio="none">
                  <path d="M2,10 C60,2 140,14 220,6 C260,3 290,8 298,5" stroke={T.o500} strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span><br/>
              a tu mesa.
            </h1>

            <p style={{fontFamily:T.font,fontSize:"1.04rem",color:T.gray1,lineHeight:1.65,marginBottom:36,maxWidth:500,fontWeight:400}}>
              Chorizos ahumados, arepas recién asadas, pan de bono y lácteos hechos a mano. Pide ahora, pagas con Nequi y te llega hoy mismo.
            </p>

            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:44}}>
              <motion.button whileTap={{scale:.97}} className="sa-btn-p"
                onClick={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})}
                style={{...BP,padding:"16px 30px",fontSize:".96rem"}}>
                Ver catálogo {Icon.arrow}
              </motion.button>
              <a href="https://wa.me/573128778843" target="_blank" rel="noreferrer" className="sa-btn-s"
                style={{...BS,padding:"16px 24px",textDecoration:"none",fontSize:".92rem"}}>
                <span style={{color:"#25D366"}}>{Icon.whats}</span>
                Preguntar por WhatsApp
              </a>
            </div>

            {/* metrics */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24,maxWidth:480,borderTop:`1px solid ${T.line}`,paddingTop:26}}>
              {[
                {k:"50+",l:"Productos frescos"},
                {k:"24h",l:"Tiempo de entrega"},
                {k:"100%",l:"Artesanal"},
              ].map(m=>(
                <div key={m.l}>
                  <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.8rem",color:T.ink,lineHeight:1,letterSpacing:"-.02em"}}>{m.k}</div>
                  <div style={{fontFamily:T.font,fontSize:".78rem",color:T.gray1,fontWeight:500,marginTop:6}}>{m.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* columna der: showcase producto */}
          <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} transition={{duration:.7,delay:.15,ease:[.22,1,.36,1]}} style={{position:"relative",height:560}} className="sa-hero-visual">

            {/* card producto destacado */}
            <motion.div animate={{y:[0,-8,0]}} transition={{duration:5,repeat:Infinity,ease:"easeInOut"}}
              style={{position:"absolute",top:"8%",left:"6%",width:"68%",height:"80%",borderRadius:24,overflow:"hidden",background:"#fff",boxShadow:"0 40px 80px rgba(11,11,15,.14),0 12px 30px rgba(255,107,44,.18)",zIndex:2}}>
              <div style={{position:"relative",height:"66%",overflow:"hidden",background:T.o50}}>
                <img src={resolveImg(featured)} alt={featured.nombre} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",top:14,left:14,display:"flex",gap:7}}>
                  <span style={{background:T.ink,color:"#fff",padding:"5px 11px",borderRadius:6,fontSize:".68rem",fontWeight:700,letterSpacing:".04em",display:"inline-flex",alignItems:"center",gap:5}}>
                    <span style={{color:T.o300}}>{Icon.flame}</span> DESTACADO
                  </span>
                </div>
                <button style={{position:"absolute",top:14,right:14,width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,.95)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.gray1,boxShadow:T.shadow1}}>
                  {Icon.heart}
                </button>
              </div>
              <div style={{padding:"22px 24px",height:"34%",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7,color:T.warn}}>
                    {[1,2,3,4,5].map(i=><span key={i}>{Icon.star}</span>)}
                    <span style={{fontSize:".72rem",color:T.gray1,fontWeight:500,marginLeft:4,fontFamily:T.fontM}}>(234)</span>
                  </div>
                  <div style={{fontFamily:T.fontH,fontWeight:700,fontSize:"1.1rem",color:T.ink,letterSpacing:"-.01em"}}>{featured.nombre}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.5rem",color:T.ink,letterSpacing:"-.02em"}}>{fmt(featured.precio)}</div>
                    <div style={{fontFamily:T.font,fontSize:".7rem",color:T.success,fontWeight:600,marginTop:2}}>● En stock · Envío hoy</div>
                  </div>
                  <motion.button whileTap={{scale:.95}} onClick={()=>addToCart(featured)}
                    style={{background:T.go,border:"none",cursor:"pointer",width:46,height:46,borderRadius:12,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:T.glow}}>
                    {Icon.plus}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* card secundaria 1 */}
            <motion.div animate={{y:[0,10,0]}} transition={{duration:6,repeat:Infinity,ease:"easeInOut",delay:.5}}
              style={{position:"absolute",top:"4%",right:"2%",width:"38%",height:"38%",borderRadius:20,overflow:"hidden",boxShadow:"0 20px 50px rgba(11,11,15,.14)",zIndex:3}}>
              <img src={imgArepaQueso} alt="Arepa queso" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(11,11,15,.65) 0%,transparent 55%)"}}/>
              <div style={{position:"absolute",bottom:12,left:14,right:14,color:"#fff"}}>
                <div style={{fontFamily:T.fontH,fontWeight:700,fontSize:".88rem"}}>Arepa Queso</div>
                <div style={{fontFamily:T.fontM,fontSize:".78rem",opacity:.9}}>$4.000</div>
              </div>
            </motion.div>

            {/* card secundaria 2 */}
            <motion.div animate={{y:[0,-6,0]}} transition={{duration:7,repeat:Infinity,ease:"easeInOut",delay:1.2}}
              style={{position:"absolute",bottom:"4%",right:"4%",width:"42%",height:"34%",borderRadius:20,overflow:"hidden",boxShadow:"0 20px 50px rgba(11,11,15,.14)",zIndex:3}}>
              <img src={imgPanDebono} alt="Pan de bono" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(11,11,15,.65) 0%,transparent 55%)"}}/>
              <div style={{position:"absolute",bottom:12,left:14,right:14,color:"#fff"}}>
                <div style={{fontFamily:T.fontH,fontWeight:700,fontSize:".88rem"}}>Pan de Bono</div>
                <div style={{fontFamily:T.fontM,fontSize:".78rem",opacity:.9}}>$2.500</div>
              </div>
            </motion.div>

            {/* pill notificación */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1}}
              style={{position:"absolute",bottom:"18%",left:0,background:"#fff",borderRadius:16,padding:"12px 16px",boxShadow:T.shadow2,display:"flex",alignItems:"center",gap:11,zIndex:4,border:`1px solid ${T.line}`}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#E8F7EE",color:T.success,display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.check}</div>
              <div>
                <div style={{fontFamily:T.font,fontSize:".78rem",fontWeight:700,color:T.ink}}>Pedido confirmado</div>
                <div style={{fontFamily:T.font,fontSize:".7rem",color:T.gray1}}>María · hace 2 min</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <style>{`
          @media (max-width:960px){
            .sa-hero-grid{grid-template-columns:1fr!important;gap:32px!important}
            .sa-hero-visual{height:420px!important}
          }
        `}</style>
      </section>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     BANDA DE BENEFICIOS
     ══════════════════════════════════════════════════════════════ */
  const Benefits = () => (
    <section style={{background:"#fff",borderTop:`1px solid ${T.line}`,borderBottom:`1px solid ${T.line}`,padding:"28px 0"}}>
      <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32}} className="sa-benefits-grid">
        {[
          {ic:Icon.truck,  t:"Envío a domicilio",      d:"Hoy mismo en Bogotá"},
          {ic:Icon.leaf,   t:"100% artesanal",         d:"Sin conservantes ni aditivos"},
          {ic:Icon.shield, t:"Calidad garantizada",    d:"Frescura certificada"},
          {ic:Icon.card,   t:"Pago fácil y seguro",    d:"Nequi · Daviplata · Transf."},
        ].map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:12,background:T.o50,color:T.o600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{b.ic}</div>
            <div>
              <div style={{fontFamily:T.font,fontWeight:700,fontSize:".88rem",color:T.ink,letterSpacing:"-.005em"}}>{b.t}</div>
              <div style={{fontFamily:T.font,fontSize:".76rem",color:T.gray1,marginTop:2}}>{b.d}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width:900px){.sa-benefits-grid{grid-template-columns:repeat(2,1fr)!important;gap:20px!important}}`}</style>
    </section>
  )

  /* ══════════════════════════════════════════════════════════════
     GRID CATEGORÍAS (iconográficas)
     ══════════════════════════════════════════════════════════════ */
  const CategoryGrid = () => {
    const cats = [
      {n:"Carnes",    img:imgChorizoAhumado, icon:"🔥", color:"#FEEBE4"},
      {n:"Arepas",    img:imgArepaYuca,      icon:"🫓", color:"#FFF3D6"},
      {n:"Panadería", img:imgPanDebono,      icon:"🍞", color:"#F0EADC"},
      {n:"Lácteos",   img:imgCuajada,        icon:"🥛", color:"#E7F0F8"},
    ]
    return (
      <section style={{background:T.bg,padding:"80px 0"}}>
        <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36,flexWrap:"wrap",gap:16}}>
            <div>
              <div style={{fontFamily:T.fontM,fontSize:".74rem",color:T.o600,fontWeight:600,letterSpacing:".12em",marginBottom:10,textTransform:"uppercase"}}>— Explora</div>
              <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"clamp(1.8rem,3.2vw,2.6rem)",color:T.ink,letterSpacing:"-.025em",lineHeight:1.1}}>Compra por categoría</h2>
            </div>
            <button onClick={()=>{setCatActiva("Todos");catalogoRef.current?.scrollIntoView({behavior:"smooth"})}} className="sa-btn-s" style={{...BS,padding:"12px 20px",fontSize:".84rem"}}>Ver todo el catálogo {Icon.arrow}</button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}} className="sa-cat-grid">
            {cats.map((c,i)=>(
              <motion.button key={c.n} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08}}
                onClick={()=>{setCatActiva(c.n);catalogoRef.current?.scrollIntoView({behavior:"smooth"})}}
                className="sa-card"
                style={{position:"relative",aspectRatio:"1/1.1",borderRadius:20,overflow:"hidden",border:"none",cursor:"pointer",background:c.color,boxShadow:T.shadow1,padding:0,textAlign:"left"}}>
                <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
                  <img src={c.img} alt={c.n} className="sa-img" style={{width:"100%",height:"100%",objectFit:"cover",mixBlendMode:"multiply",opacity:.9}}/>
                </div>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(11,11,15,.55) 0%,transparent 55%)"}}/>
                <div style={{position:"absolute",top:14,left:14,background:"#fff",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",boxShadow:T.shadow1}}>
                  {c.icon}
                </div>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 20px",color:"#fff"}}>
                  <div style={{fontFamily:T.fontH,fontWeight:700,fontSize:"1.15rem",letterSpacing:"-.01em"}}>{c.n}</div>
                  <div style={{fontFamily:T.font,fontSize:".78rem",opacity:.85,marginTop:3,display:"flex",alignItems:"center",gap:6}}>Comprar ahora <span>→</span></div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width:900px){.sa-cat-grid{grid-template-columns:repeat(2,1fr)!important}}
        `}</style>
      </section>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     CATÁLOGO
     ══════════════════════════════════════════════════════════════ */
  const Catalogo = () => (
    <section ref={catalogoRef} id="catalogo" style={{background:"#fff",padding:"80px 0 100px"}}>
      <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px"}}>

        {/* header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36,flexWrap:"wrap",gap:20}}>
          <div>
            <div style={{fontFamily:T.fontM,fontSize:".74rem",color:T.o600,fontWeight:600,letterSpacing:".12em",marginBottom:10,textTransform:"uppercase"}}>— Catálogo</div>
            <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"clamp(1.8rem,3.2vw,2.6rem)",color:T.ink,letterSpacing:"-.025em",lineHeight:1.1,marginBottom:8}}>
              {catActiva === "Todos" ? "Todos los productos" : catActiva}
            </h2>
            <p style={{fontFamily:T.font,fontSize:".92rem",color:T.gray1}}>
              {loadingProds ? "Cargando..." : `${prodsFilt.length} ${prodsFilt.length===1?"producto":"productos"}${query?` para "${query}"`:""}`}
            </p>
          </div>

          {/* search + sort */}
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:T.gray1,pointerEvents:"none"}}>{Icon.search}</span>
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="Buscar..."
                className="sa-input"
                style={{padding:"10px 14px 10px 40px",borderRadius:11,border:`1.5px solid ${T.line}`,background:"#fff",fontSize:".85rem",color:T.ink,width:220,transition:"all .2s"}}
              />
            </div>
          </div>
        </div>

        {/* chips de categorías */}
        {categorias.length>2 && (
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32,overflowX:"auto"}}>
            {categorias.map(cat=>(
              <button key={cat} onClick={()=>setCatActiva(cat)} className="sa-chip"
                style={{padding:"9px 18px",borderRadius:50,border:catActiva===cat?"none":`1.5px solid ${T.line}`,background:catActiva===cat?T.ink:"#fff",color:catActiva===cat?"#fff":T.ink2,fontFamily:T.font,fontWeight:600,fontSize:".82rem",cursor:"pointer",flexShrink:0}}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* grid productos */}
        {loadingProds ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}}>
            {[...Array(8)].map((_,i)=>(
              <div key={i} style={{borderRadius:16,overflow:"hidden",border:`1px solid ${T.line}`,background:"#fff"}}>
                <div style={{aspectRatio:"1/1",background:"linear-gradient(90deg,#F4F4F6 25%,#ECECEE 50%,#F4F4F6 75%)",backgroundSize:"200% 100%",animation:"sa-shimmer 1.5s infinite"}}/>
                <div style={{padding:16}}>
                  <div style={{height:14,borderRadius:6,background:"#F0F0F3",marginBottom:10,width:"70%"}}/>
                  <div style={{height:20,borderRadius:6,background:"#F0F0F3",width:"40%"}}/>
                </div>
              </div>
            ))}
          </div>
        ) : prodsFilt.length===0 ? (
          <div style={{textAlign:"center",padding:"80px 20px",color:T.gray1,background:T.bg2,borderRadius:16}}>
            <div style={{fontSize:"3rem",marginBottom:14,opacity:.5}}>🔍</div>
            <p style={{fontFamily:T.font,fontSize:".96rem",fontWeight:600,color:T.ink2,marginBottom:6}}>No encontramos productos</p>
            <p style={{fontFamily:T.font,fontSize:".82rem"}}>Prueba con otra categoría o búsqueda</p>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}}>
            {prodsFilt.map(p=>renderProductoCard(p))}
          </div>
        )}
      </div>

      {/* FAB carrito flotante */}
      <AnimatePresence>
        {totalItems>0&&step===0&&(
          <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}} transition={{type:"spring",stiffness:340,damping:28}}
            style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:800}}>
            <motion.button onClick={irACheckout}
              style={{background:T.ink,border:"none",cursor:"pointer",padding:"14px 20px",borderRadius:50,color:"#fff",fontFamily:T.font,fontWeight:600,fontSize:".9rem",display:"flex",alignItems:"center",gap:12,whiteSpace:"nowrap",boxShadow:"0 16px 40px rgba(11,11,15,.25),0 4px 12px rgba(255,107,44,.3)"}}>
              <span style={{background:T.o500,borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:".78rem",fontFamily:T.fontM}}>{totalItems}</span>
              <span>Ir a pagar</span>
              <span style={{fontFamily:T.fontM,fontWeight:700,color:T.o300}}>{fmt(totalPrecio)}</span>
              <span style={{color:T.o300}}>{Icon.arrow}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )

  /* ── TARJETA PRODUCTO (función pura, NO componente — evita remount al cambiar carrito) ── */
  const renderProductoCard = (producto) => {
    const enCarrito = carrito.find(i=>i.producto._id===producto._id)
    const agotado   = producto.stock<=0
    const img       = resolveImg(producto)
    const pocStock  = producto.stock>0&&producto.stock<=5

    return (
      <div key={producto._id} className="sa-card"
        style={{borderRadius:16,background:"#fff",border:`1px solid ${T.line}`,overflow:"hidden",display:"flex",flexDirection:"column",willChange:"transform"}}>

        {/* imagen */}
        <div style={{position:"relative",aspectRatio:"1/1",overflow:"hidden",background:T.bg2,flexShrink:0}}>
          <img src={img} alt={producto.nombre}
            style={{width:"100%",height:"100%",objectFit:"cover",filter:agotado?"grayscale(80%) brightness(.95)":"none"}}
            className="sa-img"
            onError={e=>{e.currentTarget.src=imgHero; e.currentTarget.onerror=null}}
          />

          {/* badges */}
          <div style={{position:"absolute",top:12,left:12,display:"flex",gap:6,flexWrap:"wrap"}}>
            {(producto.categoria?.nombre||producto.categoria)&&(
              <span style={{background:"#fff",borderRadius:6,padding:"4px 9px",fontFamily:T.font,fontSize:".66rem",fontWeight:700,color:T.ink2,letterSpacing:".03em",textTransform:"uppercase"}}>
                {producto.categoria?.nombre||producto.categoria}
              </span>
            )}
            {pocStock && !agotado && (
              <span style={{background:T.danger,color:"#fff",borderRadius:6,padding:"4px 9px",fontFamily:T.font,fontSize:".66rem",fontWeight:700,letterSpacing:".03em",textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:4}}>
                {Icon.flame} ¡Últimos {producto.stock}!
              </span>
            )}
            {agotado && (
              <span style={{background:T.ink,color:"#fff",borderRadius:6,padding:"4px 9px",fontFamily:T.font,fontSize:".66rem",fontWeight:700,letterSpacing:".03em",textTransform:"uppercase"}}>
                Agotado
              </span>
            )}
          </div>

          {/* favorito */}
          <button style={{position:"absolute",top:10,right:10,width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,.95)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.gray1,boxShadow:T.shadow1,transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.color=T.o600}
            onMouseLeave={e=>e.currentTarget.style.color=T.gray1}>
            {Icon.heart}
          </button>

          {/* quick-add hover */}
          {!agotado && !enCarrito && (
            <div className="sa-quick" style={{position:"absolute",bottom:12,left:12,right:12,opacity:0,transform:"translateY(8px)",transition:"all .3s"}}>
              <motion.button whileTap={{scale:.97}}
                onClick={()=>addToCart(producto)}
                style={{width:"100%",background:T.ink,border:"none",cursor:"pointer",padding:"11px",borderRadius:10,color:"#fff",fontFamily:T.font,fontWeight:600,fontSize:".84rem",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:"0 8px 24px rgba(11,11,15,.3)"}}>
                {Icon.plus} Agregar rápido
              </motion.button>
            </div>
          )}
        </div>

        {/* contenido */}
        <div style={{padding:"14px 16px 16px",flex:1,display:"flex",flexDirection:"column",gap:6}}>
          <div style={{display:"flex",alignItems:"center",gap:5,color:T.warn}}>
            {[1,2,3,4,5].map(i=><span key={i}>{Icon.star}</span>)}
            <span style={{fontSize:".68rem",color:T.gray1,fontWeight:500,marginLeft:3,fontFamily:T.fontM}}>(5.0)</span>
          </div>
          <h3 style={{fontFamily:T.fontH,fontWeight:700,fontSize:"1rem",color:T.ink,lineHeight:1.25,margin:0,letterSpacing:"-.01em",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{producto.nombre}</h3>
          {producto.descripcion&&(
            <p style={{fontFamily:T.font,fontSize:".78rem",color:T.gray1,lineHeight:1.5,margin:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{producto.descripcion}</p>
          )}

          {/* precio + acción */}
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:10,marginTop:8,paddingTop:10,borderTop:`1px solid ${T.line}`}}>
            <div>
              <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.2rem",color:T.ink,letterSpacing:"-.02em",lineHeight:1}}>{fmt(producto.precio)}</div>
              <div style={{fontFamily:T.font,fontSize:".68rem",color:T.success,fontWeight:600,marginTop:4}}>● En stock</div>
            </div>
            {agotado ? (
              <div style={{fontFamily:T.font,fontSize:".72rem",color:T.gray2,fontWeight:600}}>Sin stock</div>
            ) : enCarrito ? (
              <div style={{display:"flex",alignItems:"center",gap:4,background:T.o50,borderRadius:10,padding:3,border:`1px solid ${T.o200}`}}>
                <button onClick={()=>updateQty(producto._id,-1)} style={{width:28,height:28,borderRadius:7,border:"none",background:"#fff",color:T.o600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:T.shadow1}}>{Icon.minus}</button>
                <div style={{fontFamily:T.fontM,fontWeight:700,fontSize:".88rem",color:T.ink,minWidth:20,textAlign:"center"}}>{enCarrito.cantidad}</div>
                <button onClick={()=>updateQty(producto._id,1)} disabled={enCarrito.cantidad>=producto.stock}
                  style={{width:28,height:28,borderRadius:7,border:"none",background:enCarrito.cantidad>=producto.stock?T.bg2:T.go,color:enCarrito.cantidad>=producto.stock?T.gray2:"#fff",cursor:enCarrito.cantidad>=producto.stock?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.plus}</button>
              </div>
            ) : (
              <motion.button whileTap={{scale:.94}}
                onClick={()=>addToCart(producto)}
                style={{background:T.ink,border:"none",cursor:"pointer",width:40,height:40,borderRadius:10,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}
                onMouseEnter={e=>{e.currentTarget.style.background=T.o600}}
                onMouseLeave={e=>{e.currentTarget.style.background=T.ink}}>
                {Icon.plus}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     CTA BANNER
     ══════════════════════════════════════════════════════════════ */
  const CTABanner = () => (
    <section style={{padding:"60px 32px",background:T.bg}}>
      <div style={{maxWidth:1360,margin:"0 auto",position:"relative",borderRadius:28,overflow:"hidden",background:T.ink,padding:"60px 56px",display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:40,alignItems:"center"}} className="sa-cta-grid">
        <div style={{position:"absolute",top:-120,right:-120,width:400,height:400,background:"radial-gradient(circle,rgba(255,107,44,.35) 0%,transparent 65%)",filter:"blur(20px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-80,left:-80,width:300,height:300,background:"radial-gradient(circle,rgba(255,107,44,.2) 0%,transparent 65%)",filter:"blur(20px)",pointerEvents:"none"}}/>

        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontFamily:T.fontM,fontSize:".74rem",color:T.o300,fontWeight:600,letterSpacing:".12em",marginBottom:14,textTransform:"uppercase"}}>— Recién horneado</div>
          <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"clamp(1.9rem,3.6vw,2.8rem)",color:"#fff",lineHeight:1.05,letterSpacing:"-.025em",marginBottom:20}}>
            Lo que pides hoy,<br/>se hace <span style={{color:T.o300}}>hoy mismo</span>.
          </h2>
          <p style={{fontFamily:T.font,fontSize:"1rem",color:"rgba(255,255,255,.65)",lineHeight:1.65,marginBottom:32,maxWidth:480}}>
            Nuestros chorizos se ahúman en la madrugada, las arepas se asan al pedido y el pan de bono sale del horno cuando haces clic en comprar.
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <motion.button whileTap={{scale:.97}} className="sa-btn-p" onClick={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})}
              style={{...BP,padding:"15px 28px"}}>
              Pedir ahora {Icon.arrow}
            </motion.button>
            <a href="https://wa.me/573128778843" target="_blank" rel="noreferrer"
              style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",color:"#fff",padding:"15px 24px",borderRadius:12,fontFamily:T.font,fontWeight:600,fontSize:".88rem",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,transition:"all .2s"}}>
              <span style={{color:"#25D366"}}>{Icon.whats}</span> Chatear
            </a>
          </div>
        </div>

        <div style={{position:"relative",height:340}} className="sa-cta-visual">
          <motion.div animate={{y:[0,-10,0]}} transition={{duration:5,repeat:Infinity,ease:"easeInOut"}}
            style={{position:"absolute",top:0,right:0,width:"75%",height:"80%",borderRadius:20,overflow:"hidden",boxShadow:"0 30px 60px rgba(0,0,0,.4)"}}>
            <img src={imgChorizoAhumado} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </motion.div>
          <motion.div animate={{y:[0,10,0]}} transition={{duration:6,repeat:Infinity,ease:"easeInOut",delay:1}}
            style={{position:"absolute",bottom:0,left:0,width:"55%",height:"55%",borderRadius:20,overflow:"hidden",boxShadow:"0 20px 40px rgba(0,0,0,.5)",border:"4px solid #0B0B0F"}}>
            <img src={imgYogurt} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </motion.div>
        </div>
      </div>

      <style>{`@media (max-width:900px){.sa-cta-grid{grid-template-columns:1fr!important;padding:40px 28px!important}.sa-cta-visual{display:none!important}}`}</style>
    </section>
  )

  /* ══════════════════════════════════════════════════════════════
     ¿CÓMO FUNCIONA? (timeline)
     ══════════════════════════════════════════════════════════════ */
  const ComoFunciona = () => (
    <section id="como" style={{background:"#fff",padding:"90px 0"}}>
      <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px"}}>
        <div style={{textAlign:"center",marginBottom:56,maxWidth:620,marginLeft:"auto",marginRight:"auto"}}>
          <div style={{fontFamily:T.fontM,fontSize:".74rem",color:T.o600,fontWeight:600,letterSpacing:".12em",marginBottom:12,textTransform:"uppercase"}}>— Cómo funciona</div>
          <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"clamp(1.9rem,3.6vw,2.8rem)",color:T.ink,letterSpacing:"-.025em",lineHeight:1.1,marginBottom:14}}>
            Tu pedido en <span style={{color:T.o600}}>4 pasos</span>
          </h2>
          <p style={{fontFamily:T.font,fontSize:".95rem",color:T.gray1,lineHeight:1.65}}>
            Pedir en SurtiAntojos es tan fácil como hacer una llamada a la esquina. Sin descargas, sin registro largo.
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,position:"relative"}} className="sa-steps-grid">
          {[
            {n:"01",t:"Elige",       d:"Agrega los productos que te antojen al carrito. Sin mínimo.",ic:Icon.cart},
            {n:"02",t:"Tus datos",   d:"Nombre, dirección y cómo prefieres pagar. Solo 30 segundos.",ic:Icon.user},
            {n:"03",t:"Paga",        d:"Nequi, Daviplata o transferencia. Envía el comprobante por WhatsApp.",ic:Icon.card},
            {n:"04",t:"¡A tu mesa!", d:"Preparamos, empacamos y despachamos. Frescura garantizada.",ic:Icon.truck},
          ].map((s,i)=>(
            <motion.div key={s.n} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}}
              style={{position:"relative",padding:"28px 24px",background:"#fff",border:`1px solid ${T.line}`,borderRadius:18,transition:"all .3s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:12,background:T.o50,color:T.o600,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.ic}</div>
                <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"2.2rem",color:T.line,letterSpacing:"-.02em",lineHeight:1}}>{s.n}</div>
              </div>
              <div style={{fontFamily:T.fontH,fontWeight:700,fontSize:"1.1rem",color:T.ink,marginBottom:8,letterSpacing:"-.01em"}}>{s.t}</div>
              <div style={{fontFamily:T.font,fontSize:".84rem",color:T.gray1,lineHeight:1.6}}>{s.d}</div>
              {i < 3 && (
                <div style={{position:"absolute",top:"50%",right:-12,width:24,height:2,background:T.line,zIndex:0}} className="sa-step-line"/>
              )}
            </motion.div>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:44}}>
          <motion.button whileTap={{scale:.97}} className="sa-btn-p" onClick={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})}
            style={{...BP,padding:"15px 32px"}}>
            Empezar mi pedido {Icon.arrow}
          </motion.button>
        </div>
      </div>
      <style>{`@media (max-width:900px){.sa-steps-grid{grid-template-columns:repeat(2,1fr)!important}.sa-step-line{display:none!important}}`}</style>
    </section>
  )

  /* ══════════════════════════════════════════════════════════════
     NOSOTROS + TESTIMONIOS (diseño premium)
     ══════════════════════════════════════════════════════════════ */
  const Testimonios = () => {
    const [active, setActive] = useState(0)
    const testimonios = [
      {
        n:"María Fernanda G.",
        c:"Bogotá · Chapinero",
        rol:"Cliente frecuente · 18 pedidos",
        t:"Los chorizos llegaron calientes y el ahumado se sentía al abrir el paquete. Mi familia ya no quiere otros. Pedí un domingo y el lunes tenía el desayuno.",
        r:5,
        avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
        producto:"Chorizo Santarosano Ahumado",
      },
      {
        n:"Carlos R. Moreno",
        c:"Medellín · El Poblado",
        rol:"Nuevo cliente",
        t:"Pedí pan de bono a las 9am y a las 11 ya estaba en la casa. Crujiente por fuera y suave por dentro, igualito a los del pueblo. Diez de diez.",
        r:5,
        avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        producto:"Pan de Bono",
      },
      {
        n:"Laura Martínez",
        c:"Bogotá · Suba",
        rol:"Cliente frecuente · 9 pedidos",
        t:"La cuajada y la mantequilla son iguales a las que hacía mi abuela en la finca. Me transportaron 30 años atrás con el primer bocado. Gracias de corazón.",
        r:5,
        avatar:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        producto:"Cuajada Fresca",
      },
      {
        n:"Andrés Quintero",
        c:"Cali · Granada",
        rol:"Nuevo cliente",
        t:"Las arepas de yuca me sorprendieron, las hice al sartén con mantequilla y quedaron perfectas. Precio justo y el domiciliario súper amable.",
        r:5,
        avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        producto:"Arepa de Maíz con Yuca",
      },
    ]
    const current = testimonios[active]
    const clientes = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=160&h=160&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=face",
    ]

    return (
      <section id="nosotros" style={{background:`linear-gradient(180deg,${T.bg} 0%,#fff 100%)`,padding:"100px 0 110px",position:"relative",overflow:"hidden"}}>

        {/* decorativos */}
        <div style={{position:"absolute",top:80,left:-100,width:320,height:320,background:"radial-gradient(circle,rgba(255,107,44,.10) 0%,transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:100,right:-120,width:380,height:380,background:"radial-gradient(circle,rgba(255,107,44,.08) 0%,transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>

        <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px",position:"relative",zIndex:1}}>

          {/* HEADER centrado con stars */}
          <div style={{textAlign:"center",maxWidth:720,margin:"0 auto 64px"}}>
            <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              style={{display:"inline-flex",alignItems:"center",gap:10,background:"#fff",border:`1px solid ${T.line}`,borderRadius:50,padding:"8px 18px",marginBottom:22,boxShadow:T.shadow1}}>
              <div style={{display:"flex",gap:2,color:T.warn}}>{[1,2,3,4,5].map(i=><span key={i}>{Icon.star}</span>)}</div>
              <span style={{width:1,height:14,background:T.line}}/>
              <span style={{fontFamily:T.fontM,fontSize:".78rem",color:T.ink,fontWeight:600}}>4.9 de 5</span>
              <span style={{fontFamily:T.font,fontSize:".76rem",color:T.gray1}}>· basado en 1.247 reseñas</span>
            </motion.div>

            <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.05}}>
              <div style={{fontFamily:T.fontM,fontSize:".74rem",color:T.o600,fontWeight:600,letterSpacing:".12em",marginBottom:14,textTransform:"uppercase"}}>— Historias reales</div>
              <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"clamp(2.2rem,4.2vw,3.4rem)",color:T.ink,letterSpacing:"-.03em",lineHeight:1.02,marginBottom:16}}>
                Más de <span style={{color:T.o600,position:"relative",display:"inline-block"}}>
                  1.200 familias
                  <svg style={{position:"absolute",bottom:-4,left:0,width:"100%",height:10}} viewBox="0 0 300 10" preserveAspectRatio="none">
                    <path d="M2,7 C80,2 180,11 298,4" stroke={T.o500} strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span><br/>
                ya probaron el sabor de casa.
              </h2>
              <p style={{fontFamily:T.font,fontSize:"1.02rem",color:T.gray1,lineHeight:1.65,maxWidth:560,margin:"0 auto"}}>
                Historias reales de clientes que convirtieron nuestros antojos en parte de su mesa.
              </p>
            </motion.div>

            {/* avatar stack */}
            <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.15}}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginTop:28}}>
              <div style={{display:"flex"}}>
                {clientes.slice(0,5).map((src,i)=>(
                  <img key={i} src={src} alt="" style={{width:40,height:40,borderRadius:"50%",border:"3px solid #fff",marginLeft:i===0?0:-12,objectFit:"cover",boxShadow:T.shadow1,zIndex:5-i}}/>
                ))}
                <div style={{width:40,height:40,borderRadius:"50%",background:T.go,border:"3px solid #fff",marginLeft:-12,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:T.fontM,fontWeight:700,fontSize:".7rem",boxShadow:T.shadow1}}>+1k</div>
              </div>
              <span style={{fontFamily:T.font,fontSize:".85rem",color:T.ink2,fontWeight:500}}>se unen cada semana</span>
            </motion.div>
          </div>

          {/* TESTIMONIO DESTACADO (grid asimétrico) */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:48,alignItems:"center",marginBottom:80}} className="sa-feat-grid">

            {/* foto grande + polaroids */}
            <div style={{position:"relative",height:560}} className="sa-feat-visual">

              {/* foto principal */}
              <motion.div key={"main-"+active} initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{duration:.5}}
                style={{position:"absolute",top:0,left:"5%",width:"70%",height:"82%",borderRadius:24,overflow:"hidden",boxShadow:"0 40px 80px rgba(11,11,15,.18),0 12px 30px rgba(11,11,15,.08)",transform:"rotate(-2deg)"}}>
                <img src={current.avatar} alt={current.n} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(11,11,15,.55) 0%,transparent 55%)"}}/>

                {/* badge verificado */}
                <div style={{position:"absolute",top:18,left:18,background:"rgba(255,255,255,.95)",borderRadius:50,padding:"6px 12px 6px 8px",display:"inline-flex",alignItems:"center",gap:6,fontSize:".72rem",fontWeight:700,color:T.success,boxShadow:T.shadow1}}>
                  <span style={{width:18,height:18,borderRadius:"50%",background:T.success,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  Cliente verificado
                </div>

                {/* info en foto */}
                <div style={{position:"absolute",bottom:20,left:22,right:22,color:"#fff"}}>
                  <div style={{display:"flex",gap:3,color:"#FFC94D",marginBottom:8}}>{[...Array(current.r)].map((_,i)=><span key={i}>{Icon.star}</span>)}</div>
                  <div style={{fontFamily:T.fontH,fontWeight:700,fontSize:"1.35rem",letterSpacing:"-.015em"}}>{current.n}</div>
                  <div style={{fontFamily:T.font,fontSize:".82rem",opacity:.85,marginTop:3}}>{current.c}</div>
                </div>
              </motion.div>

              {/* polaroid 1 - producto */}
              <motion.div animate={{y:[0,-8,0]}} transition={{duration:6,repeat:Infinity,ease:"easeInOut"}}
                style={{position:"absolute",top:"12%",right:"2%",width:170,background:"#fff",padding:10,paddingBottom:32,borderRadius:6,boxShadow:"0 20px 40px rgba(11,11,15,.18)",transform:"rotate(6deg)",zIndex:3}}>
                <div style={{width:"100%",aspectRatio:"1/1",borderRadius:3,overflow:"hidden",background:T.bg2}}>
                  <img src={resolveImg({nombre:current.producto})} alt={current.producto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
                <div style={{position:"absolute",bottom:8,left:10,right:10,textAlign:"center",fontFamily:"'Caveat',cursive",fontSize:".95rem",color:T.ink,fontWeight:600}}>{current.producto}</div>
              </motion.div>

              {/* badge rating flotante */}
              <motion.div animate={{y:[0,6,0]}} transition={{duration:5,repeat:Infinity,ease:"easeInOut",delay:1}}
                style={{position:"absolute",bottom:"8%",left:"-2%",background:"#fff",borderRadius:16,padding:"14px 18px",boxShadow:"0 16px 40px rgba(11,11,15,.14)",display:"flex",alignItems:"center",gap:12,zIndex:4,border:`1px solid ${T.line}`}}>
                <div style={{width:44,height:44,borderRadius:12,background:T.o50,color:T.o600,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:"1.5rem"}}>🏆</span>
                </div>
                <div>
                  <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.15rem",color:T.ink,lineHeight:1,letterSpacing:"-.015em"}}>98%</div>
                  <div style={{fontFamily:T.font,fontSize:".72rem",color:T.gray1,marginTop:3}}>Recomendación</div>
                </div>
              </motion.div>

              {/* manchita orange */}
              <div style={{position:"absolute",top:"-4%",right:"20%",width:80,height:80,borderRadius:"50%",background:T.go,filter:"blur(30px)",opacity:.25,zIndex:0}}/>
            </div>

            {/* contenido testimonio */}
            <div>
              <svg width="48" height="36" viewBox="0 0 48 36" fill={T.o500} style={{opacity:.25,marginBottom:20}}>
                <path d="M0 36V22.5C0 15.75 1.75 10.125 5.25 5.625C8.75 1.125 13.25 -1.125 18.75 -1.125V6.75C15.75 6.75 13.125 7.875 10.875 10.125C8.625 12.375 7.5 15.375 7.5 19.125H14.25V36H0ZM25.5 36V22.5C25.5 15.75 27.25 10.125 30.75 5.625C34.25 1.125 38.75 -1.125 44.25 -1.125V6.75C41.25 6.75 38.625 7.875 36.375 10.125C34.125 12.375 33 15.375 33 19.125H39.75V36H25.5Z"/>
              </svg>

              <motion.p key={"q-"+active} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.4}}
                style={{fontFamily:T.fontH,fontWeight:500,fontSize:"clamp(1.4rem,2.2vw,1.85rem)",color:T.ink,lineHeight:1.35,letterSpacing:"-.02em",marginBottom:32}}>
                "{current.t}"
              </motion.p>

              <div style={{display:"flex",alignItems:"center",gap:16,padding:"18px 20px",background:"#fff",borderRadius:16,border:`1px solid ${T.line}`,boxShadow:T.shadow1,marginBottom:28}}>
                <img src={current.avatar} alt={current.n} style={{width:54,height:54,borderRadius:"50%",objectFit:"cover",border:`3px solid ${T.o100}`}}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:T.fontH,fontWeight:700,fontSize:"1rem",color:T.ink,letterSpacing:"-.01em"}}>{current.n}</div>
                  <div style={{fontFamily:T.font,fontSize:".8rem",color:T.gray1,marginTop:2}}>{current.rol}</div>
                </div>
                <div style={{display:"flex",gap:3,color:T.warn}}>{[...Array(current.r)].map((_,i)=><span key={i}>{Icon.star}</span>)}</div>
              </div>

              {/* navegación testimonios */}
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{display:"flex",gap:8}}>
                  {testimonios.map((_,i)=>(
                    <button key={i} onClick={()=>setActive(i)}
                      style={{width:i===active?32:10,height:10,borderRadius:50,border:"none",background:i===active?T.go:T.line,cursor:"pointer",transition:"all .3s",padding:0}}/>
                  ))}
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                  <button onClick={()=>setActive((active-1+testimonios.length)%testimonios.length)}
                    style={{width:44,height:44,borderRadius:12,border:`1.5px solid ${T.line}`,background:"#fff",color:T.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
                    className="sa-btn-s">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button onClick={()=>setActive((active+1)%testimonios.length)}
                    style={{width:44,height:44,borderRadius:12,border:"none",background:T.ink,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",boxShadow:T.shadow2}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STATS + WALL instagram-like */}
          <div style={{background:T.ink,borderRadius:28,padding:"48px 48px",position:"relative",overflow:"hidden",marginBottom:56}} className="sa-stats-card">
            <div style={{position:"absolute",top:-100,right:-100,width:300,height:300,background:"radial-gradient(circle,rgba(255,107,44,.25) 0%,transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-80,left:-80,width:260,height:260,background:"radial-gradient(circle,rgba(255,107,44,.18) 0%,transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32,position:"relative",zIndex:1}} className="sa-stats-grid">
              {[
                {k:"1.247",l:"Clientes felices",s:"+48 esta semana",ic:"👥"},
                {k:"4.9/5",l:"Calificación promedio",s:"Últimos 90 días",ic:"⭐"},
                {k:"98%",l:"Tasa de recompra",s:"Nos vuelven a pedir",ic:"🔄"},
                {k:"24h",l:"Entrega promedio",s:"En Bogotá metropolitana",ic:"⚡"},
              ].map((s,i)=>(
                <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}}
                  style={{color:"#fff",position:"relative"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",marginBottom:16}}>{s.ic}</div>
                  <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"2.4rem",color:"#fff",letterSpacing:"-.03em",lineHeight:1,marginBottom:6}}>{s.k}</div>
                  <div style={{fontFamily:T.font,fontWeight:600,fontSize:".95rem",color:"#fff",marginBottom:4}}>{s.l}</div>
                  <div style={{fontFamily:T.font,fontSize:".78rem",color:"rgba(255,255,255,.5)",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:T.o300,animation:"sa-pulse 2s infinite"}}/>
                    {s.s}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* WALL de clientes estilo redes */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
              <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.5rem",color:T.ink,letterSpacing:"-.02em"}}>Etiquétanos <span style={{color:T.o600}}>#SurtiAntojos</span></div>
              <div style={{flex:1,height:1,background:T.line}}/>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:T.font,fontSize:".85rem",fontWeight:600,color:T.ink2,textDecoration:"none",transition:"color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.color=T.o600}
                onMouseLeave={e=>e.currentTarget.style.color=T.ink2}>
                {Icon.instagram} Ver en Instagram →
              </a>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}} className="sa-wall-grid">
              {[
                {img:imgChorizoAhumado,likes:234,user:"@maria.cocina"},
                {img:imgArepaQueso,likes:189,user:"@carlos.foodie"},
                {img:imgPanDebono,likes:312,user:"@laura.home"},
                {img:imgYogurt,likes:156,user:"@andres.bog"},
                {img:imgCuajada,likes:221,user:"@chef.anto"},
                {img:imgMantequilla,likes:178,user:"@sara.deli"},
              ].map((p,i)=>(
                <motion.div key={i} initial={{opacity:0,scale:.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*.06}}
                  style={{position:"relative",aspectRatio:"1/1",borderRadius:14,overflow:"hidden",cursor:"pointer",boxShadow:T.shadow1}} className="sa-card">
                  <img src={p.img} alt="" className="sa-img" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(11,11,15,.7) 0%,transparent 55%)",opacity:0,transition:"opacity .25s"}} className="sa-wall-overlay"/>
                  <div className="sa-wall-content" style={{position:"absolute",bottom:10,left:12,right:12,color:"#fff",opacity:0,transition:"opacity .25s",transform:"translateY(6px)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,fontFamily:T.font,fontSize:".74rem",fontWeight:600,marginBottom:4}}>
                      <span style={{color:"#FF6B8A"}}>{Icon.heart}</span> {p.likes}
                    </div>
                    <div style={{fontFamily:T.fontM,fontSize:".72rem",opacity:.9}}>{p.user}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA final */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            style={{marginTop:56,textAlign:"center",padding:"40px 32px",background:T.goSoft,borderRadius:24,border:`1px solid ${T.o200}`}}>
            <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"clamp(1.4rem,2.6vw,1.85rem)",color:T.ink,letterSpacing:"-.02em",marginBottom:10}}>
              ¿Listo para ser el <span style={{color:T.o700}}>próximo feliz</span>?
            </div>
            <p style={{fontFamily:T.font,fontSize:".95rem",color:T.ink2,maxWidth:460,margin:"0 auto 20px",lineHeight:1.6,opacity:.8}}>
              Únete a las familias que ya no compran en otro lado.
            </p>
            <motion.button whileTap={{scale:.97}} className="sa-btn-p" onClick={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})}
              style={{...BP,padding:"15px 32px"}}>
              Hacer mi primer pedido {Icon.arrow}
            </motion.button>
          </motion.div>

        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&display=swap');
          .sa-wall-grid > div:hover .sa-wall-overlay{opacity:1!important}
          .sa-wall-grid > div:hover .sa-wall-content{opacity:1!important;transform:translateY(0)!important}
          @media (max-width:960px){
            .sa-feat-grid{grid-template-columns:1fr!important;gap:32px!important}
            .sa-feat-visual{height:440px!important}
            .sa-wall-grid{grid-template-columns:repeat(3,1fr)!important}
            .sa-stats-grid{grid-template-columns:repeat(2,1fr)!important;gap:28px!important}
            .sa-stats-card{padding:32px 28px!important}
          }
          @media (max-width:520px){
            .sa-wall-grid{grid-template-columns:repeat(2,1fr)!important}
          }
        `}</style>
      </section>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     CARRITO DRAWER
     ══════════════════════════════════════════════════════════════ */
  const CarritoDrawer = () => (
    <AnimatePresence>
      {carritoOpen&&(
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setCarritoOpen(false)}
            style={{position:"fixed",inset:0,background:"rgba(11,11,15,.55)",backdropFilter:"blur(4px)",zIndex:900}}/>

          <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",stiffness:340,damping:34}}
            style={{position:"fixed",top:0,right:0,bottom:0,width:"min(460px,100vw)",background:"#fff",boxShadow:"-20px 0 60px rgba(0,0,0,.18)",zIndex:901,display:"flex",flexDirection:"column"}}>

            {/* header */}
            <div style={{padding:"22px 24px 20px",borderBottom:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.2rem",color:T.ink,letterSpacing:"-.015em",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{color:T.o600}}>{Icon.cart}</span> Tu carrito
                </div>
                <div style={{fontFamily:T.font,fontSize:".78rem",color:T.gray1,marginTop:3}}>{totalItems} {totalItems===1?"producto":"productos"}</div>
              </div>
              <button onClick={()=>setCarritoOpen(false)} style={{width:38,height:38,borderRadius:10,background:T.bg2,border:`1px solid ${T.line}`,color:T.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.close}</button>
            </div>

            {/* items */}
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
              {carrito.length===0?(
                <div style={{textAlign:"center",padding:"80px 20px"}}>
                  <div style={{width:72,height:72,borderRadius:"50%",background:T.o50,color:T.o600,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>{Icon.cart}</div>
                  <p style={{fontFamily:T.fontH,fontWeight:700,fontSize:"1.08rem",color:T.ink,marginBottom:6,letterSpacing:"-.01em"}}>Tu carrito está vacío</p>
                  <p style={{fontFamily:T.font,fontSize:".84rem",color:T.gray1,marginBottom:24}}>Explora el catálogo y agrega tus antojos</p>
                  <button onClick={()=>{setCarritoOpen(false);catalogoRef.current?.scrollIntoView({behavior:"smooth"})}} style={{...BP,padding:"12px 26px",fontSize:".86rem"}}>Ver catálogo {Icon.arrow}</button>
                </div>
              ):(
                <AnimatePresence>
                  {carrito.map(item=>(
                    <motion.div key={item.producto._id} layout initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30,height:0}} transition={{duration:.25}}
                      style={{display:"flex",alignItems:"center",gap:12,background:"#fff",border:`1px solid ${T.line}`,borderRadius:12,padding:"12px",marginBottom:10}}>
                      <div style={{width:60,height:60,borderRadius:10,overflow:"hidden",flexShrink:0,background:T.bg2}}>
                        <img src={resolveImg(item.producto)} alt={item.producto.nombre} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.currentTarget.src=imgHero;e.currentTarget.onerror=null}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:T.font,fontWeight:600,fontSize:".86rem",color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.producto.nombre}</div>
                        <div style={{fontFamily:T.fontM,fontSize:".72rem",color:T.gray1,marginTop:2}}>{fmt(item.producto.precio)} c/u</div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,border:`1px solid ${T.line}`,borderRadius:8,padding:2}}>
                            <button onClick={()=>updateQty(item.producto._id,-1)} style={{width:24,height:24,borderRadius:6,border:"none",background:T.bg2,color:T.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.minus}</button>
                            <span style={{fontFamily:T.fontM,fontWeight:700,fontSize:".82rem",color:T.ink,minWidth:18,textAlign:"center"}}>{item.cantidad}</span>
                            <button onClick={()=>updateQty(item.producto._id,1)} disabled={item.cantidad>=item.producto.stock} style={{width:24,height:24,borderRadius:6,border:"none",background:item.cantidad>=item.producto.stock?T.bg2:T.ink,color:item.cantidad>=item.producto.stock?T.gray2:"#fff",cursor:item.cantidad>=item.producto.stock?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.plus}</button>
                          </div>
                          <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:".95rem",color:T.ink,letterSpacing:"-.01em"}}>{fmt(item.producto.precio*item.cantidad)}</div>
                        </div>
                      </div>
                      <button onClick={()=>removeFromCart(item.producto._id)} style={{width:28,height:28,borderRadius:7,border:"none",background:"transparent",color:T.gray2,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="#FEF2F2";e.currentTarget.style.color=T.danger}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.gray2}}>
                        {Icon.close}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* footer carrito */}
            {carrito.length>0&&(
              <div style={{padding:"18px 22px 24px",borderTop:`1px solid ${T.line}`,background:"#fff"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontFamily:T.font,fontWeight:500,color:T.gray1,fontSize:".84rem"}}>Subtotal</span>
                  <span style={{fontFamily:T.fontM,fontWeight:600,color:T.ink2,fontSize:".86rem"}}>{fmt(totalPrecio)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <span style={{fontFamily:T.font,fontWeight:500,color:T.gray1,fontSize:".84rem"}}>Envío</span>
                  <span style={{fontFamily:T.fontM,fontWeight:600,color:T.success,fontSize:".82rem"}}>Se calcula luego</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16,paddingTop:14,borderTop:`1px dashed ${T.line}`}}>
                  <span style={{fontFamily:T.font,fontWeight:700,color:T.ink,fontSize:".94rem"}}>Total</span>
                  <span style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.55rem",color:T.ink,letterSpacing:"-.02em"}}>{fmt(totalPrecio)}</span>
                </div>
                <motion.button whileTap={{scale:.97}} onClick={()=>{setCarritoOpen(false);irACheckout()}} className="sa-btn-p"
                  style={{...BP,width:"100%",padding:"14px",justifyContent:"center"}}>
                  Finalizar pedido {Icon.arrow}
                </motion.button>
                <div style={{textAlign:"center",fontFamily:T.font,fontSize:".72rem",color:T.gray1,marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <span style={{color:T.success}}>{Icon.shield}</span> Checkout seguro · Pago verificado por WhatsApp
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  /* ══════════════════════════════════════════════════════════════
     CHECKOUT
     ══════════════════════════════════════════════════════════════ */
  const renderStepIndicator = () => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:44,gap:4,flexWrap:"wrap"}}>
      {STEPS.map((label,i)=>{
        const idx=i+1,done=checkoutStep>idx,active=checkoutStep===idx
        return(
          <div key={label} style={{display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <motion.div animate={{scale:active?1.05:1}} transition={{duration:.3}}
                style={{width:36,height:36,borderRadius:10,background:done?T.success:active?T.ink:T.bg2,color:done||active?"#fff":T.gray1,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.fontM,fontWeight:700,fontSize:".82rem",border:active?"none":`1px solid ${T.line}`,boxShadow:active?T.shadow2:"none"}}>
                {done?Icon.check:idx}
              </motion.div>
              <span style={{fontFamily:T.font,fontSize:".74rem",fontWeight:600,color:active?T.ink:done?T.success:T.gray2}}>{label}</span>
            </div>
            {i<STEPS.length-1&&(
              <div style={{width:56,height:2,margin:"0 8px",marginBottom:22,borderRadius:2,background:checkoutStep>idx?T.success:T.line,transition:"background .3s"}}/>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderPasoCarrito = () => (
    <motion.div key="pc" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.25}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:24}}>
        <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.7rem",color:T.ink,letterSpacing:"-.02em"}}>Resumen del pedido</h2>
        <span style={{fontFamily:T.font,fontSize:".82rem",color:T.gray1}}>{totalItems} {totalItems===1?"producto":"productos"}</span>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
        {carrito.map(item=>(
          <div key={item.producto._id} style={{display:"flex",alignItems:"center",gap:14,background:"#fff",border:`1px solid ${T.line}`,borderRadius:14,padding:"12px 14px"}}>
            <div style={{width:62,height:62,borderRadius:10,overflow:"hidden",flexShrink:0,background:T.bg2}}>
              <img src={resolveImg(item.producto)} alt={item.producto.nombre} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.currentTarget.src=imgHero;e.currentTarget.onerror=null}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:T.font,fontWeight:600,fontSize:".9rem",color:T.ink}}>{item.producto.nombre}</div>
              <div style={{fontFamily:T.fontM,fontSize:".74rem",color:T.gray1,marginTop:3}}>{item.cantidad} × {fmt(item.producto.precio)}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,border:`1px solid ${T.line}`,borderRadius:8,padding:2}}>
              <button onClick={()=>updateQty(item.producto._id,-1)} style={{width:26,height:26,borderRadius:6,border:"none",background:T.bg2,color:T.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.minus}</button>
              <span style={{fontFamily:T.fontM,fontWeight:700,color:T.ink,minWidth:20,textAlign:"center",fontSize:".84rem"}}>{item.cantidad}</span>
              <button onClick={()=>updateQty(item.producto._id,1)} disabled={item.cantidad>=item.producto.stock} style={{width:26,height:26,borderRadius:6,border:"none",background:item.cantidad>=item.producto.stock?T.bg2:T.ink,color:item.cantidad>=item.producto.stock?T.gray2:"#fff",cursor:item.cantidad>=item.producto.stock?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.plus}</button>
            </div>
            <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1rem",color:T.ink,minWidth:85,textAlign:"right",letterSpacing:"-.01em"}}>{fmt(item.producto.precio*item.cantidad)}</div>
            <button onClick={()=>removeFromCart(item.producto._id)} style={{width:28,height:28,borderRadius:7,border:"none",background:"transparent",color:T.gray2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#FEF2F2";e.currentTarget.style.color=T.danger}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.gray2}}>
              {Icon.close}
            </button>
          </div>
        ))}
      </div>

      <div style={{background:T.bg,borderRadius:14,padding:"18px 22px",marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontFamily:T.font,fontSize:".86rem",color:T.gray1}}>
          <span>Subtotal</span><span style={{fontFamily:T.fontM,color:T.ink2}}>{fmt(totalPrecio)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,fontFamily:T.font,fontSize:".86rem",color:T.gray1}}>
          <span>Envío</span><span style={{color:T.success,fontWeight:600}}>Se calcula después</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",paddingTop:12,borderTop:`1px dashed ${T.line}`}}>
          <span style={{fontFamily:T.font,fontWeight:700,color:T.ink,fontSize:"1rem"}}>Total</span>
          <span style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.65rem",color:T.ink,letterSpacing:"-.02em"}}>{fmt(totalPrecio)}</span>
        </div>
      </div>

      <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap"}}>
        <button onClick={volver} style={BS} className="sa-btn-s">← Seguir comprando</button>
        <motion.button whileTap={{scale:.97}} onClick={()=>setCheckoutStep(2)} disabled={!carrito.length} style={BP} className="sa-btn-p">Continuar {Icon.arrow}</motion.button>
      </div>
    </motion.div>
  )

  const pasoDatosFields = [{lb:"Nombre *",nm:"nombre",ph:"María"},{lb:"Apellido",nm:"apellido",ph:"González"},{lb:"WhatsApp / Teléfono *",nm:"telefono",ph:"3001234567"},{lb:"N° Documento *",nm:"documento",ph:"1234567890"},{lb:"Email",nm:"email",ph:"correo@email.com",tp:"email"},{lb:"Ciudad",nm:"ciudad",ph:"Bogotá"},{lb:"Dirección de entrega *",nm:"direccion",ph:"Calle, barrio, referencia...",span:2}]
  const pasoDatosMetodos = [{id:"nequi",ic:"💳",lb:"Nequi",ds:"Billetera digital"},{id:"daviplata",ic:"📱",lb:"Daviplata",ds:"Billetera Davivienda"},{id:"transferencia",ic:"🏦",lb:"Transferencia",ds:"Bancolombia / PSE"}]

  const renderPasoDatos = () => (
    <motion.div key="pd" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.25}}>
      <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.7rem",color:T.ink,marginBottom:6,letterSpacing:"-.02em"}}>¿A quién le enviamos?</h2>
      <p style={{fontFamily:T.font,color:T.gray1,fontSize:".88rem",marginBottom:28,lineHeight:1.6}}>Completa tus datos para continuar con el pedido.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14,marginBottom:28}}>
        {pasoDatosFields.map(f=>(
          <div key={f.nm} style={f.span?{gridColumn:`span ${f.span}`}:{}}>
            <label style={{fontFamily:T.font,fontSize:".76rem",fontWeight:600,color:T.ink2,display:"block",marginBottom:6}}>{f.lb}</label>
            <input type={f.tp||"text"} value={form[f.nm]} placeholder={f.ph}
              onChange={e=>setForm(p=>({...p,[f.nm]:e.target.value}))}
              className="sa-input"
              style={{width:"100%",padding:"12px 14px",borderRadius:11,border:formErr[f.nm]?`1.5px solid ${T.danger}`:`1.5px solid ${T.line}`,fontFamily:T.font,fontSize:".88rem",color:T.ink,background:"#fff",transition:"all .2s"}}
            />
            {formErr[f.nm]&&<span style={{fontFamily:T.font,fontSize:".72rem",color:T.danger,marginTop:5,display:"block",fontWeight:500}}>⚠ {formErr[f.nm]}</span>}
          </div>
        ))}
      </div>

      <div style={{marginBottom:28}}>
        <div style={{fontFamily:T.font,fontSize:".76rem",fontWeight:600,color:T.ink2,marginBottom:12}}>Método de pago *</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {pasoDatosMetodos.map(mp=>(
            <motion.button key={mp.id} whileTap={{scale:.97}} onClick={()=>setMetodoPago(mp.id)}
              style={{padding:"16px 14px",borderRadius:12,cursor:"pointer",border:metodoPago===mp.id?`2px solid ${T.o500}`:`1.5px solid ${T.line}`,background:metodoPago===mp.id?T.o50:"#fff",textAlign:"left",transition:"all .2s",position:"relative"}}>
              {metodoPago===mp.id && <span style={{position:"absolute",top:10,right:10,width:18,height:18,borderRadius:"50%",background:T.o500,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.check}</span>}
              <div style={{fontSize:"1.5rem",marginBottom:6}}>{mp.ic}</div>
              <div style={{fontFamily:T.font,fontWeight:700,fontSize:".86rem",color:metodoPago===mp.id?T.o700:T.ink}}>{mp.lb}</div>
              <div style={{fontFamily:T.font,fontSize:".72rem",color:T.gray1,marginTop:2}}>{mp.ds}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap"}}>
        <button onClick={()=>setCheckoutStep(1)} style={BS} className="sa-btn-s">← Volver</button>
        <motion.button whileTap={{scale:.97}} onClick={()=>{if(validarForm())setCheckoutStep(3)}} style={BP} className="sa-btn-p">Revisar pedido {Icon.arrow}</motion.button>
      </div>
    </motion.div>
  )

  const renderPasoConfirmar = () => {
    const mpLabel={nequi:"Nequi",daviplata:"Daviplata",transferencia:"Transferencia bancaria"}
    return(
      <motion.div key="pcf" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.25}}>
        <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.7rem",color:T.ink,marginBottom:24,letterSpacing:"-.02em"}}>Confirma tu pedido</h2>
        <div style={{display:"grid",gap:14,marginBottom:20}}>
          <div style={{background:T.bg,borderRadius:14,padding:"20px 22px"}}>
            <div style={{fontFamily:T.font,fontWeight:700,color:T.gray1,fontSize:".74rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Productos</div>
            {carrito.map(it=>(
              <div key={it.producto._id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.line}`}}>
                <span style={{fontFamily:T.font,fontSize:".86rem",color:T.ink2}}>{it.producto.nombre} × {it.cantidad}</span>
                <span style={{fontFamily:T.fontM,fontWeight:700,color:T.ink,fontSize:".86rem"}}>{fmt(it.producto.precio*it.cantidad)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:10,borderTop:`2px solid ${T.ink}`}}>
              <span style={{fontFamily:T.font,fontWeight:700,color:T.ink}}>Total</span>
              <span style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.25rem",color:T.ink,letterSpacing:"-.02em"}}>{fmt(totalPrecio)}</span>
            </div>
          </div>
          <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:14,padding:"20px 22px"}}>
            <div style={{fontFamily:T.font,fontWeight:700,color:T.gray1,fontSize:".74rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Datos de entrega</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 24px"}}>
              {[{l:"Nombre",v:`${form.nombre} ${form.apellido}`.trim()},{l:"Teléfono",v:form.telefono},{l:"Documento",v:form.documento},{l:"Email",v:form.email||"—"},{l:"Ciudad",v:form.ciudad},{l:"Dirección",v:form.direccion},{l:"Método de pago",v:mpLabel[metodoPago]}].map(r=>(
                <div key={r.l}>
                  <div style={{fontFamily:T.font,fontSize:".68rem",color:T.gray2,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"}}>{r.l}</div>
                  <div style={{fontFamily:T.font,fontSize:".86rem",color:T.ink,fontWeight:600,marginTop:3}}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:"14px 18px",marginBottom:20}}>
          <span style={{color:T.success,flexShrink:0,marginTop:2}}>{Icon.whats}</span>
          <div>
            <div style={{fontFamily:T.font,fontWeight:700,fontSize:".86rem",color:"#15803D",marginBottom:3}}>Recibirás los datos de pago por WhatsApp</div>
            <div style={{fontFamily:T.font,fontSize:".78rem",color:T.gray1,lineHeight:1.55}}>Una vez confirmes, te enviamos los datos. Envía el comprobante y despachamos tu pedido.</div>
          </div>
        </div>
        {error&&<div style={{background:"#FEF2F2",border:`1px solid #FECACA`,borderRadius:10,padding:"12px 16px",marginBottom:18,fontFamily:T.font,fontSize:".86rem",color:T.danger,fontWeight:600}}>⚠ {error}</div>}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap"}}>
          <button onClick={()=>setCheckoutStep(2)} disabled={enviando} style={BS} className="sa-btn-s">← Editar</button>
          <button onClick={handleCrearPedido} disabled={enviando}
            className="sa-btn-p"
            style={{...BP,opacity:enviando?.75:1,cursor:enviando?"not-allowed":"pointer"}}>
            {enviando ? (
              <span style={{display:"inline-flex",alignItems:"center",gap:8}}><Spin/><span>Procesando...</span></span>
            ) : (
              <span style={{display:"inline-flex",alignItems:"center",gap:8}}>{Icon.check}<span>Confirmar pedido</span></span>
            )}
          </button>
        </div>
      </motion.div>
    )
  }

  const renderPasoListo = () => {
    const numero = pedidoCreado?.numero || pedidoCreado?._id?.slice(-6)?.toUpperCase()
    const metodoLabel = metodoPago==="nequi"?"Nequi":metodoPago==="daviplata"?"Daviplata":"Transferencia"

    // ── Vista de éxito tras enviar el comprobante ─────────────────────────
    if (compEnviado) {
      return (
        <motion.div key="pl-ok" initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{type:"spring",stiffness:260,damping:24}}
          style={{textAlign:"center",padding:"20px 0"}}>
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:200,delay:.1}}
            style={{width:80,height:80,borderRadius:"50%",background:T.success,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </motion.div>
          <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"2.1rem",color:T.ink,marginBottom:10,letterSpacing:"-.025em"}}>¡Comprobante recibido!</h2>
          <p style={{fontFamily:T.font,color:T.gray1,fontSize:".94rem",maxWidth:480,margin:"0 auto 28px",lineHeight:1.65}}>
            Tu pedido <strong style={{color:T.o600,fontFamily:T.fontM}}>#{numero}</strong> está siendo verificado por nuestro equipo. Te contactaremos por WhatsApp cuando el pago sea aprobado.
          </p>
          <div style={{background:T.bg,borderRadius:16,padding:"22px 26px",marginBottom:24,textAlign:"left",maxWidth:480,margin:"0 auto 24px"}}>
            <div style={{fontFamily:T.font,fontWeight:700,color:T.gray1,fontSize:".72rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Próximos pasos</div>
            {["Verificamos tu comprobante (generalmente en menos de 30 min)","Te confirmamos por WhatsApp que el pago fue aprobado","Despachamos tu pedido según la zona de entrega"].map((t,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
                <div style={{width:24,height:24,borderRadius:7,background:T.ink,color:"#fff",fontFamily:T.fontM,fontWeight:700,fontSize:".74rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                <span style={{fontFamily:T.font,fontSize:".84rem",color:T.ink2,lineHeight:1.55,paddingTop:2}}>{t}</span>
              </div>
            ))}
          </div>
          <button onClick={reiniciar} className="sa-btn-p" style={{...BP,padding:"14px 32px",fontSize:".92rem",cursor:"pointer"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:8}}><span>Seguir comprando</span>{Icon.arrow}</span>
          </button>
        </motion.div>
      )
    }

    // ── Vista principal: subir comprobante ────────────────────────────────
    return (
    <motion.div key="pl" initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{type:"spring",stiffness:260,damping:24}}
      style={{padding:"8px 0"}}>
      <div style={{textAlign:"center",marginBottom:26}}>
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:200,delay:.1}}
          style={{width:68,height:68,borderRadius:"50%",background:T.success,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </motion.div>
        <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.75rem",color:T.ink,marginBottom:8,letterSpacing:"-.025em"}}>Pedido creado <span style={{color:T.o600,fontFamily:T.fontM}}>#{numero}</span></h2>
        <p style={{fontFamily:T.font,color:T.gray1,fontSize:".9rem",maxWidth:520,margin:"0 auto",lineHeight:1.6}}>
          Realiza el pago por <strong style={{color:T.ink}}>{metodoLabel}</strong> y sube aquí la foto del comprobante para confirmar y despachar tu pedido.
        </p>
      </div>

      {/* ── Datos de pago destacados ── */}
      <div style={{maxWidth:520,margin:"0 auto 22px",background:"linear-gradient(135deg,#FFF4EC,#FFEDDB)",border:`1px solid #FED7AA`,borderRadius:16,padding:"18px 22px"}}>
        <div style={{fontFamily:T.font,fontSize:".7rem",fontWeight:700,color:T.o600,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Datos para tu pago</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontFamily:T.font,fontSize:".78rem",color:T.gray1}}>{metodoLabel} · Surti Antojos</div>
            <div style={{fontFamily:T.fontM,fontSize:"1.15rem",fontWeight:800,color:T.ink,letterSpacing:"-.01em"}}>312 877 8843</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:T.font,fontSize:".72rem",color:T.gray1}}>Total a pagar</div>
            <div style={{fontFamily:T.fontM,fontSize:"1.25rem",fontWeight:800,color:T.o600,letterSpacing:"-.01em"}}>{fmt(totalPrecio || pedidoCreado?.total || 0)}</div>
          </div>
        </div>
      </div>

      {/* ── Zona de drag & drop / input ── */}
      <div style={{maxWidth:520,margin:"0 auto 16px"}}>
        <label htmlFor="sa-comprobante-input"
          onDragEnter={e=>{e.preventDefault();setDragActive(true)}}
          onDragOver={e=>{e.preventDefault();setDragActive(true)}}
          onDragLeave={()=>setDragActive(false)}
          onDrop={onDropComprobante}
          style={{display:"block",border:`2px dashed ${comprobantePreview?T.success:dragActive?T.o600:T.line}`,borderRadius:14,padding:comprobantePreview?14:"28px 18px",textAlign:"center",cursor:"pointer",background:comprobantePreview?"#F0FDF4":dragActive?"#FFF4EC":T.bg,transition:"all .2s"}}>
          {comprobantePreview ? (
            <div>
              <img src={comprobantePreview} alt="comprobante" style={{maxWidth:"100%",maxHeight:240,borderRadius:10,marginBottom:10,objectFit:"contain",boxShadow:"0 2px 10px rgba(0,0,0,.08)"}}/>
              <div style={{fontFamily:T.font,fontSize:".82rem",color:T.ink2,fontWeight:600}}>{comprobanteFile?.name}</div>
              <div style={{fontFamily:T.font,fontSize:".74rem",color:T.gray1,marginTop:2}}>{((comprobanteFile?.size||0)/1024).toFixed(0)} KB · Toca o arrastra otra imagen para cambiar</div>
            </div>
          ) : (
            <div>
              <div style={{width:52,height:52,borderRadius:14,background:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",color:T.o600,boxShadow:"0 4px 14px rgba(240,90,26,.18)",marginBottom:12}}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div style={{fontFamily:T.font,fontWeight:700,color:T.ink,fontSize:".98rem",marginBottom:4}}>Arrastra aquí tu comprobante</div>
              <div style={{fontFamily:T.font,fontSize:".82rem",color:T.gray1,marginBottom:2}}>o toca para seleccionar desde tu galería o cámara</div>
              <div style={{fontFamily:T.font,fontSize:".72rem",color:T.gray1}}>JPG, PNG o WEBP · máx 5MB</div>
            </div>
          )}
          <input id="sa-comprobante-input" type="file" accept="image/*" capture="environment" onChange={onSelectComprobante} style={{display:"none"}}/>
        </label>

        <input type="text" placeholder="Referencia / # de transacción (opcional)"
          value={referenciaPago} onChange={e=>setReferenciaPago(e.target.value)}
          style={{width:"100%",marginTop:12,padding:"13px 15px",border:`1.5px solid ${T.line}`,borderRadius:12,fontFamily:T.font,fontSize:".9rem",color:T.ink,outline:"none",boxSizing:"border-box",background:"#fff"}}
        />

        {errComp && <div style={{marginTop:12,background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"11px 14px",fontFamily:T.font,fontSize:".84rem",color:T.danger,fontWeight:600}}>⚠ {errComp}</div>}

        <button onClick={enviarComprobante} disabled={subiendoComp||!comprobanteFile} className="sa-btn-p"
          style={{...BP,width:"100%",marginTop:14,padding:"16px 28px",fontSize:".96rem",justifyContent:"center",opacity:(subiendoComp||!comprobanteFile)?.55:1,cursor:(subiendoComp||!comprobanteFile)?"not-allowed":"pointer"}}>
          {subiendoComp ? (
            <span style={{display:"inline-flex",alignItems:"center",gap:8}}><Spin/><span>Enviando comprobante...</span></span>
          ) : (
            <span style={{display:"inline-flex",alignItems:"center",gap:8}}>{Icon.check}<span>Enviar comprobante y finalizar</span></span>
          )}
        </button>
      </div>

      {/* ── Soporte: WhatsApp solo para dudas ── */}
      <div style={{maxWidth:520,margin:"18px auto 0",paddingTop:18,borderTop:`1px dashed ${T.line}`,textAlign:"center"}}>
        <div style={{fontFamily:T.font,fontSize:".8rem",color:T.gray1,marginBottom:10}}>¿Tienes dudas con el pago?</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {ADMINS_WHATSAPP.map(admin => (
            <a key={admin.id} href={buildWhatsAppLink(mensajeWhatsDudas(), admin.numero)} target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:7,background:"#fff",border:`1.5px solid #25D366`,color:"#25D366",padding:"9px 16px",borderRadius:10,textDecoration:"none",fontWeight:700,fontSize:".82rem",fontFamily:T.font}}>
              <span style={{display:"inline-flex"}}>{Icon.whats}</span>
              <span>Escribir a {admin.nombre}</span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
    )
  }

  const renderCheckoutPage = () => (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <div style={{maxWidth:820,margin:"0 auto",padding:"32px 24px 80px"}}>
        {checkoutStep<4&&(
          <button onClick={volver} style={{background:"none",border:"none",cursor:"pointer",fontFamily:T.font,fontWeight:500,fontSize:".86rem",color:T.gray1,display:"flex",alignItems:"center",gap:6,marginBottom:28,padding:0,transition:"color .2s"}}
            onMouseEnter={e=>e.currentTarget.style.color=T.o600} onMouseLeave={e=>e.currentTarget.style.color=T.gray1}>
            ← Volver al catálogo
          </button>
        )}
        {renderStepIndicator()}
        <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:20,padding:"36px 38px",boxShadow:T.shadow1}}>
          <AnimatePresence mode="wait">
            {checkoutStep===1&&renderPasoCarrito()}
            {checkoutStep===2&&renderPasoDatos()}
            {checkoutStep===3&&renderPasoConfirmar()}
            {checkoutStep===4&&renderPasoListo()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  /* ══════════════════════════════════════════════════════════════
     FOOTER pro
     ══════════════════════════════════════════════════════════════ */
  const Footer = () => (
    <footer style={{background:T.ink,color:"rgba(255,255,255,.65)",padding:"70px 0 30px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:300,height:300,background:"radial-gradient(circle,rgba(255,107,44,.15) 0%,transparent 70%)",filter:"blur(20px)",pointerEvents:"none"}}/>
      <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px",position:"relative",zIndex:1}}>

        {/* newsletter */}
        <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:"32px 36px",marginBottom:52,display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:32,alignItems:"center"}} className="sa-footer-news">
          <div>
            <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.45rem",color:"#fff",marginBottom:6,letterSpacing:"-.02em"}}>Recibe recetas y ofertas</div>
            <div style={{fontFamily:T.font,fontSize:".88rem"}}>Descubre cómo preparar nuestros productos + descuentos exclusivos por WhatsApp.</div>
          </div>
          <form onSubmit={e=>e.preventDefault()} style={{display:"flex",gap:8}}>
            <input type="email" placeholder="tu@email.com" style={{flex:1,padding:"13px 16px",borderRadius:11,border:"1px solid rgba(255,255,255,.14)",background:"rgba(255,255,255,.06)",color:"#fff",fontFamily:T.font,fontSize:".88rem",outline:"none"}}/>
            <button type="submit" style={{...BP,padding:"0 22px",height:44,fontSize:".86rem"}}>Suscribir</button>
          </form>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:48,marginBottom:48}} className="sa-footer-cols">

          {/* col 1 */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{width:42,height:42,borderRadius:11,background:T.go,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 8c0-2 1.5-5 5-5s5 3 5 5c0 2-1 3-1 5 0 3 2 3 2 6 0 2-2 4-6 4s-6-2-6-4c0-3 2-3 2-6 0-2-1-3-1-5z" fill="white"/><circle cx="12" cy="9" r="1.8" fill={T.o600}/></svg>
              </div>
              <div>
                <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.15rem",color:"#fff",letterSpacing:"-.02em"}}>SurtiAntojos</div>
                <div style={{fontFamily:T.fontM,fontSize:".6rem",color:"rgba(255,255,255,.35)",fontWeight:500,letterSpacing:".08em",marginTop:2}}>ARTESANAL · FRESCO</div>
              </div>
            </div>
            <p style={{fontFamily:T.font,fontSize:".85rem",lineHeight:1.7,maxWidth:320,marginBottom:20}}>
              Productos artesanales hechos con recetas tradicionales de Colombia. Del campo a tu mesa, sin intermediarios.
            </p>
            <div style={{display:"flex",gap:8}}>
              {[
                {i:Icon.whats,h:"https://wa.me/573128778843",c:"#25D366"},
                {i:Icon.instagram,h:"#",c:"#E4405F"},
                {i:Icon.facebook,h:"#",c:"#1877F2"},
              ].map((s,k)=>(
                <a key={k} href={s.h} target="_blank" rel="noreferrer" style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.75)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=s.c;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=s.c}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.color="rgba(255,255,255,.75)";e.currentTarget.style.borderColor="rgba(255,255,255,.08)"}}>
                  {s.i}
                </a>
              ))}
            </div>
          </div>

          {/* col 2 */}
          <div>
            <div style={{fontFamily:T.font,fontWeight:700,color:"#fff",fontSize:".82rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:18}}>Tienda</div>
            {["Todos los productos","Carnes","Arepas","Panadería","Lácteos"].map(m=>(
              <div key={m} style={{fontFamily:T.font,fontSize:".85rem",marginBottom:10,cursor:"pointer",transition:"color .2s",width:"fit-content"}}
                onMouseEnter={e=>e.target.style.color=T.o300}
                onMouseLeave={e=>e.target.style.color=""}>
                {m}
              </div>
            ))}
          </div>

          {/* col 3 */}
          <div>
            <div style={{fontFamily:T.font,fontWeight:700,color:"#fff",fontSize:".82rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:18}}>Ayuda</div>
            {["¿Cómo funciona?","Envíos","Métodos de pago","Preguntas frecuentes"].map(m=>(
              <div key={m} style={{fontFamily:T.font,fontSize:".85rem",marginBottom:10,cursor:"pointer",transition:"color .2s",width:"fit-content"}}
                onMouseEnter={e=>e.target.style.color=T.o300}
                onMouseLeave={e=>e.target.style.color=""}>
                {m}
              </div>
            ))}
          </div>

          {/* col 4 */}
          <div>
            <div style={{fontFamily:T.font,fontWeight:700,color:"#fff",fontSize:".82rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:18}}>Contacto</div>
            <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:T.font,fontSize:".85rem",marginBottom:12}}>
              <span style={{color:T.o300}}>{Icon.whats}</span> +57 312 877 8843
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:T.font,fontSize:".85rem",marginBottom:12}}>
              <span style={{color:T.o300}}>{Icon.pin}</span> Bogotá, Colombia
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:T.font,fontSize:".85rem"}}>
              <span style={{color:T.o300}}>{Icon.clock}</span> Lun – Sáb · 7am – 7pm
            </div>
          </div>
        </div>

        <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <span style={{fontFamily:T.font,fontSize:".78rem",color:"rgba(255,255,255,.4)"}}>© 2025 SurtiAntojos · Todos los derechos reservados</span>
          <div style={{display:"flex",gap:18,alignItems:"center"}}>
            <span style={{fontFamily:T.font,fontSize:".78rem",color:"rgba(255,255,255,.4)"}}>Términos · Privacidad</span>
            <a href="/login" style={{fontFamily:T.font,fontSize:".78rem",color:T.o300,textDecoration:"none"}}>Acceso admin →</a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width:900px){
          .sa-footer-news{grid-template-columns:1fr!important;gap:20px!important;padding:24px 20px!important}
          .sa-footer-cols{grid-template-columns:1fr 1fr!important;gap:32px!important}
        }
      `}</style>
    </footer>
  )

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <Navbar/>
      <CarritoDrawer/>
      <AnimatePresence mode="wait">
        {step===0 ? (
          <motion.div key="land" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.3}}>
            <Hero/>
            <Benefits/>
            <CategoryGrid/>
            <Catalogo/>
            <CTABanner/>
            <ComoFunciona/>
            <Testimonios/>
            <Footer/>
          </motion.div>
        ) : (
          <motion.div key="check" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{duration:.3}}>
            {renderCheckoutPage()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
