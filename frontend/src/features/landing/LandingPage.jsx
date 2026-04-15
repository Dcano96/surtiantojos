import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  getProductosPublicos,
  crearPedidoPublico,
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

/* ── tokens de diseño ─────────────────────────────────────────── */
const T = {
  o1:"#FF6B35", o2:"#FF3D00", o3:"#FF8F5E", o4:"#FFA07A",
  r1:"#EF4444", green:"#22C55E",
  t1:"#0F0A08", t2:"#3D2B1F", t3:"#8B7355", t4:"#C4A882",
  bg:"#FBF7F4", bg2:"#F5EDE4",
  dark:"#1A0F0A", dark2:"#2D1810",
  go:"linear-gradient(135deg,#FF6B35 0%,#E8410A 100%)",
  go2:"linear-gradient(135deg,#FFB085,#FF6B35,#E8410A)",
  go3:"linear-gradient(160deg,#FFF8F5 0%,#FFE8D0 50%,#FFD4B0 100%)",
  gd:"linear-gradient(135deg,#1A0F0A 0%,#2D1810 100%)",
  glass:"rgba(255,255,255,0.60)",
  glass2:"rgba(255,255,255,0.85)",
  glassD:"rgba(26,15,10,0.65)",
  blur:"blur(20px) saturate(180%)",
  glow:"0 8px 32px rgba(255,107,53,0.40)",
  glow2:"0 20px 60px rgba(255,107,53,0.55)",
  glowD:"0 8px 32px rgba(0,0,0,0.40)",
  neu:"0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
  font:"'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif",
  fontH:"'Fraunces',serif",
  fontM:"'Fraunces',serif",
  rad:"24px",
  rad2:"16px",
}

/* ── CSS global ───────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("sa-lp-css")) {
  const s = document.createElement("style"); s.id = "sa-lp-css"
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,700;1,9..144,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;font-size:16px}
    body{margin:0;background:#FBF7F4;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}
    input,button,select,textarea{font-family:inherit}
    img{display:block}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,107,53,.3);border-radius:99px}
    @keyframes lp-f1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.08)}}
    @keyframes lp-f2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-28px,22px) scale(0.92)}}
    @keyframes lp-f3{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
    @keyframes lp-br{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    @keyframes lp-sh{from{background-position:-200% center}to{background-position:200% center}}
    @keyframes lp-sp{to{transform:rotate(360deg)}}
    @keyframes lp-bd{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
    @keyframes lp-glow{0%,100%{opacity:.7}50%{opacity:1}}
    @keyframes lp-slide{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
    @keyframes lp-wv{0%,100%{d:path("M0,60 C320,100 640,20 960,60 C1280,100 1440,40 1440,40 L1440,100 L0,100 Z")} 50%{d:path("M0,40 C320,0 640,80 960,40 C1280,0 1440,60 1440,60 L1440,100 L0,100 Z")}}
    .lp-btn-prim{transition:transform .18s,box-shadow .18s,filter .18s!important}
    .lp-btn-prim:hover{transform:translateY(-3px)!important;box-shadow:0 20px 60px rgba(255,107,53,.55)!important;filter:brightness(1.06)}
    .lp-btn-prim:active{transform:translateY(-1px)!important}
    .lp-card:hover{transform:translateY(-10px)!important}
    .lp-card{transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s!important}
    .lp-img{transition:transform .6s cubic-bezier(.22,1,.36,1)!important}
    .lp-card:hover .lp-img{transform:scale(1.08)!important}
  `
  document.head.appendChild(s)
}

const fmt = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(n)
const STEPS = ["Carrito","Mis datos","Confirmar","¡Listo!"]

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
  const [catActiva,  setCatActiva]  = useState("Todos")
  const catalogoRef = useRef(null)
  const heroRef     = useRef(null)

  /* scroll parallax del hero */
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 120])

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
  const prodsFilt = catActiva === "Todos" ? productos : productos.filter(p => (p.categoria?.nombre || p.categoria || "General") === catActiva)

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
      // El backend crea/actualiza el cliente automáticamente usando el documento
      // y vincula el pedido con el clienteId resultante.
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
        items: carrito.map(i => ({ producto: i.producto._id, cantidad: i.cantidad, precioUnitario: i.producto.precio })),
        metodoPago,
        notas: `Landing. Pago: ${metodoPago}`,
      })
      setPedidoCreado(pedido); setCheckoutStep(4)
    } catch(e) {
      setError(e?.response?.data?.msg || "Error al crear el pedido.")
    } finally { setEnviando(false) }
  }

  const irACheckout = () => { if(!carrito.length) return; setStep(1); setCheckoutStep(1); window.scrollTo({top:0,behavior:"smooth"}) }
  const volver      = () => { setStep(0); setCheckoutStep(1); setError(""); setFormErr({}) }
  const reiniciar   = () => { setCarrito([]); setForm(emptyForm); setFormErr({}); setMetodoPago("nequi"); setPedidoCreado(null); setError(""); setStep(0); setCheckoutStep(1); window.scrollTo({top:0}) }

  /* ── estilos botón primario / secundario ── */
  const BP = { background:T.go, border:"none", cursor:"pointer", padding:"14px 32px", borderRadius:50, color:"#fff", fontFamily:T.font, fontWeight:700, fontSize:".92rem", boxShadow:T.glow, letterSpacing:".01em" }
  const BS = { background:"rgba(255,255,255,0.80)", border:"1.5px solid rgba(0,0,0,0.09)", cursor:"pointer", padding:"14px 26px", borderRadius:50, color:T.t2, fontFamily:T.font, fontWeight:600, fontSize:".88rem", backdropFilter:"blur(12px)" }

  /* ── orb decorativo ── */
  const Orb = ({sz=300,top,left,right,bottom,c="rgba(255,107,53,0.12)",an="lp-f1",dl="0s",pos="absolute"}) => (
    <div style={{position:pos,width:sz,height:sz,borderRadius:"50%",background:c,filter:"blur(80px)",pointerEvents:"none",zIndex:0,top,left,right,bottom,animation:`${an} 14s ease-in-out ${dl} infinite`}}/>
  )

  /* ── spinner ── */
  const Spin = () => <span style={{width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"lp-sp .7s linear infinite",display:"inline-block",verticalAlign:"middle"}}/>

  /* ══════════════════════════════════════════════════════════════
     SECCIONES DE LA LANDING
     ══════════════════════════════════════════════════════════════ */

  /* ── NAVBAR ── */
  const Navbar = ({solid=false}) => {
    const [sc, setSc] = useState(solid)
    useEffect(()=>{
      if (solid) return
      const h=()=>setSc(window.scrollY>60)
      window.addEventListener("scroll",h); return()=>window.removeEventListener("scroll",h)
    },[])
    return (
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,transition:"all .35s",background:sc?"rgba(251,247,244,0.96)":"transparent",backdropFilter:sc?T.blur:"none",borderBottom:sc?"1px solid rgba(255,107,53,0.08)":"none",boxShadow:sc?"0 4px 40px rgba(0,0,0,0.06)":"none"}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"0 5vw",height:70,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {/* logo */}
          <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={volver}>
            <div style={{width:42,height:42,borderRadius:14,background:T.go,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:T.glow,flexShrink:0}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 2 4 5 4 9c0 5 8 13 8 13s8-8 8-13c0-4-4-7-8-7z" fill="white" opacity=".9"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.18rem",color:T.t1,lineHeight:1}}>
                Surti<span style={{background:T.go,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Antojos</span>
              </div>
              <div style={{fontFamily:T.font,fontSize:".65rem",color:T.t3,fontWeight:600,letterSpacing:".06em"}}>PRODUCTOS ARTESANALES</div>
            </div>
          </div>

          {/* nav links + acciones */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {step===0 && (
              <>
                <NavLink onClick={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})}>Catálogo</NavLink>
                <NavLink>Nosotros</NavLink>
              </>
            )}

            <button onClick={()=>step===0?setCarritoOpen(true):irACheckout()}
              style={{position:"relative",background:T.go,border:"none",cursor:"pointer",padding:"10px 22px",borderRadius:50,color:"#fff",fontFamily:T.font,fontWeight:700,fontSize:".86rem",boxShadow:T.glow,display:"flex",alignItems:"center",gap:9,transition:"all .2s"}}
              className="lp-btn-prim">
              <CartIcon/>
              <span>Carrito</span>
              {totalItems>0&&<span style={{position:"absolute",top:-9,right:-9,background:T.r1,color:"#fff",borderRadius:"50%",width:24,height:24,fontSize:".70rem",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:"2.5px solid #FBF7F4",animation:"lp-bd 2s infinite"}}>{totalItems}</span>}
            </button>

            <a href="/login" style={{background:"rgba(255,107,53,0.08)",border:"1.5px solid rgba(255,107,53,0.16)",color:T.o1,borderRadius:50,padding:"10px 20px",fontFamily:T.font,fontWeight:600,fontSize:".83rem",textDecoration:"none",transition:"all .2s"}} className="lp-btn-prim">
              Admin
            </a>
          </div>
        </div>
      </nav>
    )
  }

  const NavLink = ({children,onClick}) => (
    <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",fontFamily:T.font,fontWeight:600,fontSize:".87rem",color:T.t2,padding:"8px 14px",borderRadius:10,transition:"color .2s"}}
      onMouseEnter={e=>e.target.style.color=T.o1} onMouseLeave={e=>e.target.style.color=T.t2}>
      {children}
    </button>
  )

  /* ── HERO SECTION ── */
  const Hero = () => (
    <section style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",overflow:"hidden",background:T.go3}}>
      {/* orbs de fondo con parallax */}
      <Orb sz={700} top="-200px" left="-150px" c="rgba(255,107,53,0.13)" an="lp-f1"/>
      <Orb sz={450} bottom="-120px" right="-100px" c="rgba(232,65,10,0.10)" an="lp-f2" dl="3s"/>
      <Orb sz={250} top="30%" right="20%" c="rgba(255,160,122,0.15)" an="lp-f3" dl="6s"/>

      {/* patrón de puntos */}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,107,53,0.12) 1px,transparent 1px)",backgroundSize:"32px 32px",zIndex:0,pointerEvents:"none"}}/>

      <div style={{maxWidth:1320,margin:"0 auto",padding:"130px 5vw 100px",width:"100%",position:"relative",zIndex:1}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>

          {/* ── TEXTO ── */}
          <motion.div initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} transition={{duration:.9,ease:[.22,1,.36,1]}}>
            {/* pill badge */}
            <motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{delay:.3}}
              style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.75)",border:"1.5px solid rgba(255,107,53,0.22)",borderRadius:50,padding:"8px 20px",marginBottom:28,backdropFilter:"blur(12px)",boxShadow:"0 4px 20px rgba(255,107,53,0.15)"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:T.o1,display:"block",animation:"lp-glow 2s infinite"}}/>
              <span style={{fontFamily:T.font,fontSize:".78rem",fontWeight:700,color:T.o1,letterSpacing:".04em"}}>PRODUCTOS FRESCOS HOY</span>
            </motion.div>

            <h1 style={{fontFamily:T.fontH,fontWeight:900,fontSize:"clamp(2.8rem,5.5vw,4.4rem)",lineHeight:1.04,color:T.t1,marginBottom:24,letterSpacing:"-.02em"}}>
              El sabor que<br/>
              <em style={{fontStyle:"italic",background:T.go,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",display:"block"}}>enamora,</em>
              en tu puerta
            </h1>

            <p style={{fontFamily:T.font,fontSize:"1.08rem",color:T.t2,lineHeight:1.80,marginBottom:40,maxWidth:480,fontWeight:400}}>
              Chorizos artesanales, arepas frescas, pan de bono, cuajada y más productos del campo directo a tu mesa. Paga con <strong style={{color:T.o1,fontWeight:700}}>Nequi</strong> o transferencia.
            </p>

            <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:52}}>
              <motion.button className="lp-btn-prim" whileTap={{scale:.97}}
                onClick={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})}
                style={{...BP,fontSize:"1rem",padding:"16px 38px",boxShadow:"0 12px 40px rgba(255,107,53,.45)"}}>
                Ver catálogo →
              </motion.button>
              {totalItems>0&&(
                <motion.button initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="lp-btn-prim" whileTap={{scale:.97}}
                  onClick={irACheckout}
                  style={{...BS,fontSize:"1rem",padding:"16px 30px",borderColor:"rgba(255,107,53,0.28)",color:T.o1}}>
                  🛒 Finalizar ({totalItems})
                </motion.button>
              )}
            </div>

            {/* trust strip */}
            <div style={{display:"flex",alignItems:"center",gap:28,flexWrap:"wrap"}}>
              {[{i:"🤝",t:"100% artesanal"},{i:"🚚",t:"Envío a domicilio"},{i:"💳",t:"Nequi · Daviplata"},{i:"⭐",t:"Calidad garantizada"}].map(b=>(
                <div key={b.t} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:"1rem"}}>{b.i}</span>
                  <span style={{fontFamily:T.font,fontSize:".78rem",color:T.t3,fontWeight:500}}>{b.t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── GRID IMÁGENES ── */}
          <motion.div initial={{opacity:0,scale:.92,y:40}} animate={{opacity:1,scale:1,y:0}} transition={{duration:1,ease:[.22,1,.36,1],delay:.2}}
            style={{position:"relative",height:520}}>

            {/* imagen principal grande */}
            <motion.div style={{position:"absolute",top:0,left:0,width:"62%",height:"72%",borderRadius:28,overflow:"hidden",boxShadow:"0 32px 80px rgba(255,107,53,0.28),0 8px 30px rgba(0,0,0,0.14)"}} animate={{y:[0,-10,0]}} transition={{duration:6,repeat:Infinity,ease:"easeInOut"}}>
              <img src={imgChorizoCerdo} alt="Chorizo artesanal" style={{width:"100%",height:"100%",objectFit:"cover"}} className="lp-img"/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,10,8,.5) 0%,transparent 50%)"}}/>
              <div style={{position:"absolute",bottom:16,left:16,color:"#fff"}}>
                <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1rem"}}>Chorizo Artesanal</div>
                <div style={{fontFamily:T.font,fontSize:".74rem",opacity:.8}}>Desde $5.000</div>
              </div>
            </motion.div>

            {/* imagen secundaria arriba derecha */}
            <motion.div style={{position:"absolute",top:0,right:0,width:"35%",height:"46%",borderRadius:22,overflow:"hidden",boxShadow:"0 16px 50px rgba(0,0,0,0.16)"}} animate={{y:[0,10,0]}} transition={{duration:7,repeat:Infinity,ease:"easeInOut",delay:1}}>
              <img src={imgArepaYuca} alt="Arepa" style={{width:"100%",height:"100%",objectFit:"cover"}} className="lp-img"/>
            </motion.div>

            {/* imagen secundaria medio derecha */}
            <motion.div style={{position:"absolute",top:"50%",right:0,width:"35%",height:"46%",borderRadius:22,overflow:"hidden",boxShadow:"0 16px 50px rgba(0,0,0,0.16)"}} animate={{y:[0,-8,0]}} transition={{duration:8,repeat:Infinity,ease:"easeInOut",delay:2}}>
              <img src={imgPanDebono} alt="Pan de Bono" style={{width:"100%",height:"100%",objectFit:"cover"}} className="lp-img"/>
            </motion.div>

            {/* imagen pequeña abajo izquierda */}
            <motion.div style={{position:"absolute",bottom:0,left:"4%",width:"40%",height:"24%",borderRadius:18,overflow:"hidden",boxShadow:"0 12px 40px rgba(0,0,0,0.14)"}} animate={{y:[0,-6,0]}} transition={{duration:5,repeat:Infinity,ease:"easeInOut",delay:3}}>
              <img src={imgCuajada} alt="Cuajada" style={{width:"100%",height:"100%",objectFit:"cover"}} className="lp-img"/>
            </motion.div>

            {/* badge flotante precio */}
            <motion.div animate={{y:[0,-10,0],rotate:[-2,2,-2]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}
              style={{position:"absolute",top:"38%",left:"55%",background:"rgba(255,255,255,0.96)",backdropFilter:"blur(20px)",borderRadius:20,padding:"14px 20px",boxShadow:"0 16px 50px rgba(0,0,0,0.14)",border:"1px solid rgba(255,255,255,0.8)"}}>
              <div style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.5rem",color:T.o1,lineHeight:1}}>{productos.length||CATALOG_LOCAL.length}+</div>
              <div style={{fontFamily:T.font,fontSize:".72rem",color:T.t3,fontWeight:600,marginTop:3}}>productos frescos</div>
            </motion.div>

            {/* badge estrella */}
            <motion.div animate={{rotate:[0,10,-10,0],scale:[1,1.08,1]}} transition={{duration:3,repeat:Infinity,ease:"easeInOut",delay:1}}
              style={{position:"absolute",bottom:"22%",right:"-4%",background:T.go,borderRadius:"50%",width:72,height:72,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:T.glow2,color:"#fff",zIndex:2}}>
              <span style={{fontSize:"1.4rem",lineHeight:1}}>⭐</span>
              <span style={{fontFamily:T.font,fontWeight:800,fontSize:".55rem",marginTop:2,letterSpacing:".04em"}}>FRESCO</span>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* ola inferior */}
      <div style={{position:"absolute",bottom:-2,left:0,right:0,zIndex:2}}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{display:"block",width:"100%",height:100}}>
          <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,30 1440,60 L1440,100 L0,100 Z" fill="#FBF7F4"/>
        </svg>
      </div>
    </section>
  )

  /* ── BARRA DE CARACTERÍSTICAS ── */
  const Features = () => (
    <section style={{background:T.bg,padding:"60px 5vw"}}>
      <div style={{maxWidth:1320,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:20}}>
        {[
          {ic:"🫙",t:"100% Artesanal",d:"Elaborado con recetas tradicionales sin conservantes ni aditivos.",c:"#FF6B35"},
          {ic:"🚚",t:"Entrega a domicilio",d:"Llevamos tu pedido hasta la puerta de tu casa.",c:"#3B82F6"},
          {ic:"💳",t:"Pago fácil y seguro",d:"Nequi, Daviplata o transferencia bancaria.",c:"#22C55E"},
          {ic:"⭐",t:"Calidad garantizada",d:"Productos frescos del día, preparados con amor.",c:"#F59E0B"},
        ].map((f,i)=>(
          <motion.div key={f.t} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08,duration:.5}}
            style={{background:"rgba(255,255,255,0.85)",backdropFilter:T.blur,border:"1px solid rgba(255,255,255,.8)",borderRadius:24,padding:"28px 26px",boxShadow:"0 4px 28px rgba(0,0,0,0.05)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`${f.c}12`,pointerEvents:"none"}}/>
            <div style={{width:54,height:54,borderRadius:18,background:`${f.c}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",marginBottom:16}}>{f.ic}</div>
            <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.06rem",color:T.t1,marginBottom:8}}>{f.t}</div>
            <div style={{fontFamily:T.font,fontSize:".82rem",color:T.t3,lineHeight:1.65}}>{f.d}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )

  /* ── CATÁLOGO ── */
  const Catalogo = () => (
    <section ref={catalogoRef} style={{padding:"90px 5vw 120px",background:"linear-gradient(180deg,#FBF7F4 0%,#F5EDE4 100%)",position:"relative",overflow:"hidden"}}>
      <Orb sz={400} top="5%" right="-100px" c="rgba(255,107,53,0.08)" an="lp-f2"/>
      <Orb sz={300} bottom="5%" left="-80px" c="rgba(255,160,122,0.09)" an="lp-f1" dl="5s"/>

      <div style={{maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        {/* header */}
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6}}
          style={{textAlign:"center",marginBottom:56}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.75)",border:"1.5px solid rgba(255,107,53,0.18)",borderRadius:50,padding:"8px 22px",marginBottom:20,backdropFilter:"blur(12px)"}}>
            <span style={{fontFamily:T.font,fontSize:".78rem",fontWeight:700,color:T.o1,letterSpacing:".04em"}}>🛍️ NUESTROS PRODUCTOS</span>
          </div>
          <h2 style={{fontFamily:T.fontH,fontWeight:900,fontSize:"clamp(2.2rem,4.5vw,3.2rem)",color:T.t1,marginBottom:14,letterSpacing:"-.02em"}}>
            Escoge tus <em style={{fontStyle:"italic",background:T.go,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>antojos</em>
          </h2>
          <p style={{fontFamily:T.font,color:T.t3,fontSize:".96rem",maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
            Selecciona los productos que quieres, agrégalos al carrito y nosotros te los llevamos frescos a tu puerta.
          </p>
        </motion.div>

        {/* filtros */}
        {categorias.length>2&&(
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:48}}>
            {categorias.map((cat,i)=>(
              <motion.button key={cat} initial={{opacity:0,scale:.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*.04}}
                onClick={()=>setCatActiva(cat)}
                style={{padding:"10px 24px",borderRadius:50,border:catActiva===cat?"none":"1.5px solid rgba(255,107,53,0.16)",background:catActiva===cat?T.go:"rgba(255,255,255,0.80)",color:catActiva===cat?"#fff":T.t2,fontFamily:T.font,fontWeight:600,fontSize:".84rem",cursor:"pointer",backdropFilter:"blur(12px)",boxShadow:catActiva===cat?T.glow:"0 2px 12px rgba(0,0,0,0.05)",transition:"all .22s"}}>
                {cat}
              </motion.button>
            ))}
          </div>
        )}

        {/* grid de productos */}
        {loadingProds ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:28}}>
            {[...Array(6)].map((_,i)=>(
              <div key={i} style={{height:440,borderRadius:28,background:"linear-gradient(90deg,#f0e6de 25%,#ffe4d4 50%,#f0e6de 75%)",backgroundSize:"200% 100%",animation:"lp-sh 1.5s infinite"}}/>
            ))}
          </div>
        ) : prodsFilt.length===0 ? (
          <div style={{textAlign:"center",padding:"100px 20px",color:T.t3}}>
            <div style={{fontSize:"4rem",marginBottom:16}}>🔍</div>
            <p style={{fontFamily:T.font,fontSize:"1rem"}}>No hay productos en esta categoría.</p>
          </div>
        ) : (
          <motion.div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:28}}
            initial="h" whileInView="v" viewport={{once:true}} variants={{h:{},v:{transition:{staggerChildren:.07}}}}>
            {prodsFilt.map(p=><ProductoCard key={p._id} producto={p}/>)}
          </motion.div>
        )}
      </div>

      {/* FAB carrito flotante */}
      <AnimatePresence>
        {totalItems>0&&step===0&&(
          <motion.div initial={{opacity:0,y:60}} animate={{opacity:1,y:0}} exit={{opacity:0,y:60}} transition={{type:"spring",stiffness:300,damping:28}}
            style={{position:"fixed",bottom:36,left:"50%",transform:"translateX(-50%)",zIndex:800}}>
            <motion.button animate={{boxShadow:["0 12px 40px rgba(255,107,53,.45)","0 20px 60px rgba(255,107,53,.65)","0 12px 40px rgba(255,107,53,.45)"]}} transition={{duration:2,repeat:Infinity}}
              onClick={irACheckout}
              style={{background:T.go,border:"none",cursor:"pointer",padding:"16px 40px",borderRadius:50,color:"#fff",fontFamily:T.font,fontWeight:700,fontSize:"1rem",display:"flex",alignItems:"center",gap:16,whiteSpace:"nowrap",backdropFilter:"blur(20px)"}}>
              <span style={{background:"rgba(255,255,255,0.22)",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:".9rem",flexShrink:0}}>{totalItems}</span>
              <span>Ver mi pedido</span>
              <span style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.1rem"}}>{fmt(totalPrecio)}</span>
              <span style={{opacity:.8}}>→</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )

  /* ── TARJETA PRODUCTO ── */
  const ProductoCard = ({producto}) => {
    const enCarrito = carrito.find(i=>i.producto._id===producto._id)
    const agotado   = producto.stock<=0
    const img       = resolveImg(producto)
    const pocStock  = producto.stock>0&&producto.stock<=5

    return (
      <motion.div className="lp-card"
        variants={{h:{opacity:0,y:36},v:{opacity:1,y:0,transition:{type:"spring",stiffness:220,damping:24}}}}
        style={{borderRadius:28,background:"rgba(255,255,255,0.95)",border:"1px solid rgba(255,255,255,0.80)",boxShadow:"0 4px 28px rgba(0,0,0,0.06)",overflow:"hidden",display:"flex",flexDirection:"column",willChange:"transform"}}>

        {/* imagen */}
        <div style={{position:"relative",height:220,overflow:"hidden",background:"#F0E6DE",flexShrink:0}}>
          <img src={img} alt={producto.nombre}
            style={{width:"100%",height:"100%",objectFit:"cover",filter:agotado?"grayscale(50%) brightness(.9)":"none"}}
            className="lp-img"
            onError={e=>{e.currentTarget.src=imgHero; e.currentTarget.onerror=null}}
          />

          {/* overlay gradiente */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,10,8,0.40) 0%,transparent 55%)",pointerEvents:"none"}}/>

          {/* precio en la imagen */}
          <div style={{position:"absolute",bottom:14,left:16}}>
            <div style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.25rem",color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.4)"}}>{fmt(producto.precio)}</div>
          </div>

          {/* badges top */}
          <div style={{position:"absolute",top:14,left:14,display:"flex",gap:8,flexWrap:"wrap"}}>
            {(producto.categoria?.nombre||producto.categoria)&&(
              <span style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(10px)",borderRadius:50,padding:"5px 14px",fontFamily:T.font,fontSize:".68rem",fontWeight:700,color:T.o1}}>
                {producto.categoria?.nombre||producto.categoria}
              </span>
            )}
          </div>
          <div style={{position:"absolute",top:14,right:14}}>
            <span style={{background:agotado?"rgba(60,60,60,0.88)":pocStock?"rgba(239,68,68,0.88)":"rgba(34,197,94,0.88)",backdropFilter:"blur(10px)",borderRadius:50,padding:"5px 14px",fontFamily:T.font,fontSize:".68rem",fontWeight:700,color:"#fff"}}>
              {agotado?"Agotado":pocStock?`¡Solo ${producto.stock}!`:"Disponible"}
            </span>
          </div>
        </div>

        {/* contenido */}
        <div style={{padding:"20px 22px 24px",flex:1,display:"flex",flexDirection:"column",gap:8}}>
          <h3 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.08rem",color:T.t1,lineHeight:1.3,margin:0}}>{producto.nombre}</h3>
          {producto.descripcion&&(
            <p style={{fontFamily:T.font,fontSize:".80rem",color:T.t3,lineHeight:1.60,margin:0,flex:1,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{producto.descripcion}</p>
          )}

          {/* acción */}
          <div style={{marginTop:"auto",paddingTop:14}}>
            {agotado ? (
              <div style={{textAlign:"center",padding:"11px",borderRadius:14,background:"rgba(0,0,0,0.05)",fontFamily:T.font,fontWeight:600,fontSize:".82rem",color:T.t4}}>Sin stock por ahora</div>
            ) : enCarrito ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,107,53,0.06)",borderRadius:14,padding:"8px 12px",border:"1.5px solid rgba(255,107,53,0.14)"}}>
                <button onClick={()=>updateQty(producto._id,-1)} style={{width:36,height:36,borderRadius:10,border:"none",background:T.go,color:"#fff",cursor:"pointer",fontWeight:900,fontSize:"1.2rem",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:T.glow}}>−</button>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:T.font,fontWeight:900,fontSize:"1.1rem",color:T.t1}}>{enCarrito.cantidad}</div>
                  <div style={{fontFamily:T.font,fontSize:".68rem",color:T.t3}}>{fmt(producto.precio*enCarrito.cantidad)}</div>
                </div>
                <button onClick={()=>updateQty(producto._id,1)} disabled={enCarrito.cantidad>=producto.stock} style={{width:36,height:36,borderRadius:10,border:"none",background:enCarrito.cantidad>=producto.stock?"rgba(0,0,0,0.08)":T.go,color:enCarrito.cantidad>=producto.stock?T.t4:"#fff",cursor:enCarrito.cantidad>=producto.stock?"not-allowed":"pointer",fontWeight:900,fontSize:"1.2rem",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:enCarrito.cantidad>=producto.stock?"none":T.glow}}>+</button>
              </div>
            ) : (
              <motion.button whileHover={{y:-2,boxShadow:T.glow2}} whileTap={{scale:.96}}
                onClick={()=>addToCart(producto)}
                style={{width:"100%",background:T.go,border:"none",cursor:"pointer",padding:"12px",borderRadius:14,color:"#fff",fontFamily:T.font,fontWeight:700,fontSize:".88rem",boxShadow:T.glow}}>
                + Agregar al carrito
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  /* ── SECCIÓN CÓMO FUNCIONA ── */
  const ComoFunciona = () => (
    <section style={{background:T.dark,padding:"100px 5vw",position:"relative",overflow:"hidden"}}>
      <Orb sz={400} top="-100px" right="-100px" c="rgba(255,107,53,0.08)" an="lp-f1"/>
      <Orb sz={300} bottom="-80px" left="-80px" c="rgba(255,107,53,0.06)" an="lp-f2" dl="4s"/>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,107,53,0.06) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>

      <div style={{maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6}} style={{textAlign:"center",marginBottom:60}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,107,53,0.12)",border:"1.5px solid rgba(255,107,53,0.22)",borderRadius:50,padding:"8px 22px",marginBottom:20}}>
            <span style={{fontFamily:T.font,fontSize:".78rem",fontWeight:700,color:T.o3,letterSpacing:".04em"}}>⚡ ASÍ DE FÁCIL</span>
          </div>
          <h2 style={{fontFamily:T.fontH,fontWeight:900,fontSize:"clamp(2rem,4vw,3rem)",color:"#fff",marginBottom:14,letterSpacing:"-.02em"}}>
            ¿Cómo <em style={{fontStyle:"italic",color:T.o3}}>funciona?</em>
          </h2>
          <p style={{fontFamily:T.font,color:"rgba(255,255,255,.50)",fontSize:".96rem",maxWidth:480,margin:"0 auto",lineHeight:1.7}}>
            En 4 simples pasos recibe tus productos artesanales en casa.
          </p>
        </motion.div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:24}}>
          {[
            {n:"01",ic:"🛍️",t:"Elige tus productos",d:"Navega el catálogo y agrega los productos que más te gusten al carrito."},
            {n:"02",ic:"📝",t:"Ingresa tus datos",d:"Completa tu nombre, dirección y elige cómo prefieres pagar."},
            {n:"03",ic:"💳",t:"Realiza el pago",d:"Paga por Nequi, Daviplata o transferencia y envía el comprobante."},
            {n:"04",ic:"🚀",t:"Recibe tu pedido",d:"Confirmamos y despachamos. ¡Tus productos frescos llegan a tu puerta!"},
          ].map((s,i)=>(
            <motion.div key={s.n} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1,duration:.5}}
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"32px 26px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-10,right:-10,fontFamily:T.fontH,fontWeight:900,fontSize:"5rem",color:"rgba(255,107,53,0.08)",lineHeight:1,pointerEvents:"none"}}>{s.n}</div>
              <div style={{fontSize:"2.2rem",marginBottom:18}}>{s.ic}</div>
              <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.06rem",color:"#fff",marginBottom:10}}>{s.t}</div>
              <div style={{fontFamily:T.font,fontSize:".82rem",color:"rgba(255,255,255,.45)",lineHeight:1.7}}>{s.d}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.4,duration:.5}} style={{textAlign:"center",marginTop:56}}>
          <motion.button className="lp-btn-prim" whileTap={{scale:.97}}
            onClick={()=>catalogoRef.current?.scrollIntoView({behavior:"smooth"})}
            style={{...BP,padding:"16px 44px",fontSize:"1rem"}}>
            Empezar ahora →
          </motion.button>
        </motion.div>
      </div>
    </section>
  )

  /* ── CARRITO DRAWER ── */
  const CarritoDrawer = () => (
    <AnimatePresence>
      {carritoOpen&&(
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setCarritoOpen(false)}
            style={{position:"fixed",inset:0,background:"rgba(10,5,3,0.55)",backdropFilter:"blur(12px)",zIndex:900}}/>

          <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",stiffness:340,damping:34}}
            style={{position:"fixed",top:0,right:0,bottom:0,width:"min(460px,100vw)",background:"rgba(251,247,244,0.98)",backdropFilter:"blur(40px)",boxShadow:"-12px 0 80px rgba(0,0,0,0.18)",zIndex:901,display:"flex",flexDirection:"column",borderLeft:"1px solid rgba(255,107,53,0.08)"}}>

            {/* header */}
            <div style={{padding:"24px 26px 20px",background:T.go,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.08)",pointerEvents:"none"}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:1}}>
                <div>
                  <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.22rem",color:"#fff"}}>Tu carrito 🛒</div>
                  <div style={{fontFamily:T.font,fontSize:".76rem",color:"rgba(255,255,255,.70)",marginTop:3}}>{totalItems} producto{totalItems!==1?"s":""} · {fmt(totalPrecio)}</div>
                </div>
                <button onClick={()=>setCarritoOpen(false)} style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.25)",color:"#fff",cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
            </div>

            {/* items */}
            <div style={{flex:1,overflowY:"auto",padding:"18px 20px"}}>
              {carrito.length===0?(
                <div style={{textAlign:"center",padding:"80px 20px"}}>
                  <div style={{fontSize:"4rem",marginBottom:16}}>🛒</div>
                  <p style={{fontFamily:T.fontH,fontWeight:700,fontSize:"1.1rem",color:T.t2,marginBottom:8}}>Tu carrito está vacío</p>
                  <p style={{fontFamily:T.font,fontSize:".84rem",color:T.t3,marginBottom:24}}>Agrega productos del catálogo</p>
                  <button onClick={()=>{setCarritoOpen(false);catalogoRef.current?.scrollIntoView({behavior:"smooth"})}} style={{...BP,padding:"12px 28px",fontSize:".88rem"}}>Ver catálogo</button>
                </div>
              ):(
                <AnimatePresence>
                  {carrito.map(item=>(
                    <motion.div key={item.producto._id} layout initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30,height:0}} transition={{duration:.25}}
                      style={{display:"flex",alignItems:"center",gap:14,background:"rgba(255,255,255,0.85)",border:"1px solid rgba(255,107,53,0.08)",borderRadius:18,padding:"14px 16px",marginBottom:12,boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
                      <div style={{width:60,height:60,borderRadius:14,overflow:"hidden",flexShrink:0,background:"#F0E6DE"}}>
                        <img src={resolveImg(item.producto)} alt={item.producto.nombre} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.currentTarget.src=imgHero;e.currentTarget.onerror=null}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:T.font,fontWeight:700,fontSize:".86rem",color:T.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.producto.nombre}</div>
                        <div style={{fontFamily:T.fontH,fontWeight:800,fontSize:".96rem",color:T.o1,marginTop:2}}>{fmt(item.producto.precio*item.cantidad)}</div>
                        <div style={{fontFamily:T.font,fontSize:".70rem",color:T.t4,marginTop:1}}>{fmt(item.producto.precio)} c/u</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <button onClick={()=>updateQty(item.producto._id,-1)} style={{width:30,height:30,borderRadius:9,border:"none",background:T.go,color:"#fff",cursor:"pointer",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                        <span style={{fontFamily:T.font,fontWeight:800,fontSize:".92rem",color:T.t1,minWidth:18,textAlign:"center"}}>{item.cantidad}</span>
                        <button onClick={()=>updateQty(item.producto._id,1)} disabled={item.cantidad>=item.producto.stock} style={{width:30,height:30,borderRadius:9,border:"none",background:item.cantidad>=item.producto.stock?"rgba(0,0,0,0.07)":T.go,color:item.cantidad>=item.producto.stock?T.t4:"#fff",cursor:item.cantidad>=item.producto.stock?"not-allowed":"pointer",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                      </div>
                      <button onClick={()=>removeFromCart(item.producto._id)} style={{width:30,height:30,borderRadius:9,border:"none",background:"rgba(239,68,68,0.08)",color:T.r1,cursor:"pointer",flexShrink:0,fontSize:".9rem"}}>✕</button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* footer carrito */}
            {carrito.length>0&&(
              <div style={{padding:"18px 22px 30px",borderTop:"1px solid rgba(0,0,0,0.06)",background:"rgba(255,255,255,0.70)",backdropFilter:"blur(20px)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
                  <span style={{fontFamily:T.font,fontWeight:600,color:T.t2,fontSize:".90rem"}}>Total del pedido</span>
                  <span style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.5rem",color:T.o1}}>{fmt(totalPrecio)}</span>
                </div>
                <motion.button className="lp-btn-prim" whileTap={{scale:.97}} onClick={()=>{setCarritoOpen(false);irACheckout()}}
                  style={{...BP,width:"100%",padding:"15px",borderRadius:16,fontSize:".92rem",textAlign:"center"}}>
                  Finalizar pedido →
                </motion.button>
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
  const StepIndicator = () => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:44}}>
      {STEPS.map((label,i)=>{
        const idx=i+1,done=checkoutStep>idx,active=checkoutStep===idx
        return(
          <div key={label} style={{display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
              <motion.div animate={{scale:active?1.1:1,background:done?T.green:active?T.o1:"rgba(0,0,0,0.08)"}} transition={{duration:.3}}
                style={{width:40,height:40,borderRadius:"50%",color:done||active?"#fff":T.t4,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontWeight:800,fontSize:".84rem",boxShadow:active?T.glow:"none"}}>
                {done?"✓":idx}
              </motion.div>
              <span style={{fontFamily:T.font,fontSize:".72rem",fontWeight:600,color:active?T.o1:done?T.green:T.t4}}>{label}</span>
            </div>
            {i<STEPS.length-1&&(
              <motion.div animate={{background:checkoutStep>idx?"#22C55E":"rgba(0,0,0,0.08)"}} transition={{duration:.4}}
                style={{width:60,height:2,margin:"0 6px",marginBottom:22,borderRadius:2}}/>
            )}
          </div>
        )
      })}
    </div>
  )

  const PasoCarrito = () => (
    <motion.div key="pc" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} transition={{duration:.3}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:26}}>
        <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.75rem",color:T.t1}}>Resumen del pedido</h2>
        <span style={{fontFamily:T.font,fontSize:".80rem",color:T.t3}}>{totalItems} producto{totalItems!==1?"s":""}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>
        {carrito.map(item=>(
          <div key={item.producto._id} style={{display:"flex",alignItems:"center",gap:16,background:"rgba(255,107,53,0.04)",border:"1px solid rgba(255,107,53,0.09)",borderRadius:18,padding:"14px 18px"}}>
            <div style={{width:64,height:64,borderRadius:14,overflow:"hidden",flexShrink:0,background:"#F0E6DE"}}>
              <img src={resolveImg(item.producto)} alt={item.producto.nombre} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.currentTarget.src=imgHero;e.currentTarget.onerror=null}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:T.font,fontWeight:700,fontSize:".92rem",color:T.t1}}>{item.producto.nombre}</div>
              <div style={{fontFamily:T.font,fontSize:".76rem",color:T.t3,marginTop:3}}>{item.cantidad} × {fmt(item.producto.precio)}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>updateQty(item.producto._id,-1)} style={{width:32,height:32,borderRadius:10,border:"none",background:T.go,color:"#fff",cursor:"pointer",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontFamily:T.font,fontWeight:800,color:T.t1,minWidth:20,textAlign:"center"}}>{item.cantidad}</span>
              <button onClick={()=>updateQty(item.producto._id,1)} disabled={item.cantidad>=item.producto.stock} style={{width:32,height:32,borderRadius:10,border:"none",background:item.cantidad>=item.producto.stock?"rgba(0,0,0,0.07)":T.go,color:item.cantidad>=item.producto.stock?T.t4:"#fff",cursor:item.cantidad>=item.producto.stock?"not-allowed":"pointer",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
            <div style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.1rem",color:T.o1,minWidth:95,textAlign:"right"}}>{fmt(item.producto.precio*item.cantidad)}</div>
            <button onClick={()=>removeFromCart(item.producto._id)} style={{width:30,height:30,borderRadius:9,border:"none",background:"rgba(239,68,68,0.08)",color:T.r1,cursor:"pointer"}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",borderRadius:18,background:"rgba(255,107,53,0.06)",border:"1.5px solid rgba(255,107,53,0.14)",marginBottom:28}}>
        <span style={{fontFamily:T.font,fontWeight:600,color:T.t2,fontSize:"1rem"}}>Total del pedido</span>
        <span style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.65rem",color:T.o1}}>{fmt(totalPrecio)}</span>
      </div>
      <div style={{display:"flex",gap:14,justifyContent:"flex-end"}}>
        <button onClick={volver} style={BS}>← Seguir comprando</button>
        <motion.button className="lp-btn-prim" whileTap={{scale:.97}} onClick={()=>setCheckoutStep(2)} disabled={!carrito.length} style={BP}>Continuar →</motion.button>
      </div>
    </motion.div>
  )

  const PasoDatos = () => (
    <motion.div key="pd" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} transition={{duration:.3}}>
      <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.75rem",color:T.t1,marginBottom:6}}>¿A quién le enviamos?</h2>
      <p style={{fontFamily:T.font,color:T.t3,fontSize:".88rem",marginBottom:28,lineHeight:1.6}}>Completa tus datos para continuar con el pedido</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:16,marginBottom:28}}>
        {[{lb:"Nombre *",nm:"nombre",ph:"Ej: María"},{lb:"Apellido",nm:"apellido",ph:"Ej: González"},{lb:"WhatsApp / Teléfono *",nm:"telefono",ph:"3001234567"},{lb:"N° Documento *",nm:"documento",ph:"CC: 1234567890"},{lb:"Email",nm:"email",ph:"correo@email.com",tp:"email"},{lb:"Ciudad",nm:"ciudad",ph:"Bogotá"},{lb:"Dirección de entrega *",nm:"direccion",ph:"Calle, barrio, referencia...",span:2}].map(f=>(
          <div key={f.nm} style={f.span?{gridColumn:`span ${f.span}`}:{}}>
            <label style={{fontFamily:T.font,fontSize:".76rem",fontWeight:700,color:T.t2,display:"block",marginBottom:7,letterSpacing:".02em"}}>{f.lb}</label>
            <input type={f.tp||"text"} value={form[f.nm]} placeholder={f.ph}
              onChange={e=>setForm(p=>({...p,[f.nm]:e.target.value}))}
              style={{width:"100%",padding:"13px 16px",borderRadius:14,border:formErr[f.nm]?"1.5px solid #EF4444":"1.5px solid rgba(0,0,0,0.09)",fontFamily:T.font,fontSize:".88rem",color:T.t1,background:"rgba(255,255,255,0.90)",outline:"none",transition:"border-color .2s,box-shadow .2s"}}
              onFocus={e=>{e.target.style.borderColor=T.o1;e.target.style.boxShadow=`0 0 0 3px rgba(255,107,53,0.12)`}}
              onBlur={e=>{e.target.style.borderColor=formErr[f.nm]?"#EF4444":"rgba(0,0,0,0.09)";e.target.style.boxShadow="none"}}
            />
            {formErr[f.nm]&&<span style={{fontFamily:T.font,fontSize:".70rem",color:T.r1,marginTop:4,display:"block"}}>⚠ {formErr[f.nm]}</span>}
          </div>
        ))}
      </div>

      <div style={{marginBottom:28}}>
        <div style={{fontFamily:T.font,fontSize:".76rem",fontWeight:700,color:T.t2,marginBottom:14,letterSpacing:".02em"}}>MÉTODO DE PAGO *</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {[{id:"nequi",ic:"💳",lb:"Nequi",ds:"Billetera digital"},{id:"daviplata",ic:"📱",lb:"Daviplata",ds:"Billetera Davivienda"},{id:"transferencia",ic:"🏦",lb:"Transferencia",ds:"Bancolombia / PSE"}].map(mp=>(
            <motion.button key={mp.id} whileTap={{scale:.97}} onClick={()=>setMetodoPago(mp.id)}
              style={{padding:"18px 14px",borderRadius:18,cursor:"pointer",border:metodoPago===mp.id?`2.5px solid ${T.o1}`:"1.5px solid rgba(0,0,0,0.08)",background:metodoPago===mp.id?"rgba(255,107,53,0.07)":"rgba(255,255,255,0.80)",textAlign:"left",transition:"all .2s",boxShadow:metodoPago===mp.id?T.glow:"0 2px 12px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:"1.6rem",marginBottom:8}}>{mp.ic}</div>
              <div style={{fontFamily:T.font,fontWeight:700,fontSize:".86rem",color:metodoPago===mp.id?T.o1:T.t1}}>{mp.lb}</div>
              <div style={{fontFamily:T.font,fontSize:".72rem",color:T.t3,marginTop:3}}>{mp.ds}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:14,justifyContent:"flex-end"}}>
        <button onClick={()=>setCheckoutStep(1)} style={BS}>← Volver</button>
        <motion.button className="lp-btn-prim" whileTap={{scale:.97}} onClick={()=>{if(validarForm())setCheckoutStep(3)}} style={BP}>Revisar pedido →</motion.button>
      </div>
    </motion.div>
  )

  const PasoConfirmar = () => {
    const mpLabel={nequi:"Nequi",daviplata:"Daviplata",transferencia:"Transferencia bancaria"}
    return(
      <motion.div key="pcf" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} transition={{duration:.3}}>
        <h2 style={{fontFamily:T.fontH,fontWeight:800,fontSize:"1.75rem",color:T.t1,marginBottom:24}}>Confirma tu pedido</h2>
        <div style={{display:"grid",gap:16,marginBottom:20}}>
          <div style={{background:"rgba(255,107,53,0.04)",border:"1.5px solid rgba(255,107,53,0.11)",borderRadius:20,padding:"20px 22px"}}>
            <div style={{fontFamily:T.font,fontWeight:700,color:T.t3,fontSize:".72rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>🛒 Productos</div>
            {carrito.map(it=>(
              <div key={it.producto._id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(0,0,0,0.04)"}}>
                <span style={{fontFamily:T.font,fontSize:".86rem",color:T.t2}}>{it.producto.nombre} × {it.cantidad}</span>
                <span style={{fontFamily:T.fontH,fontWeight:700,color:T.t1,fontSize:".88rem"}}>{fmt(it.producto.precio*it.cantidad)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:14,paddingTop:10,borderTop:"2px solid rgba(255,107,53,0.14)"}}>
              <span style={{fontFamily:T.font,fontWeight:700,color:T.t1}}>Total</span>
              <span style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.25rem",color:T.o1}}>{fmt(totalPrecio)}</span>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.75)",border:"1px solid rgba(0,0,0,0.07)",borderRadius:20,padding:"20px 22px"}}>
            <div style={{fontFamily:T.font,fontWeight:700,color:T.t3,fontSize:".72rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>👤 Datos de entrega</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 24px"}}>
              {[{l:"Nombre",v:`${form.nombre} ${form.apellido}`.trim()},{l:"Teléfono",v:form.telefono},{l:"Documento",v:form.documento},{l:"Email",v:form.email||"—"},{l:"Ciudad",v:form.ciudad},{l:"Dirección",v:form.direccion},{l:"Método de pago",v:mpLabel[metodoPago]}].map(r=>(
                <div key={r.l}>
                  <div style={{fontFamily:T.font,fontSize:".68rem",color:T.t4,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"}}>{r.l}</div>
                  <div style={{fontFamily:T.font,fontSize:".86rem",color:T.t1,fontWeight:600,marginTop:3}}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,background:"rgba(34,197,94,0.07)",border:"1.5px solid rgba(34,197,94,0.18)",borderRadius:16,padding:"16px 20px",marginBottom:24}}>
          <span style={{fontSize:"1.5rem",flexShrink:0}}>📱</span>
          <div>
            <div style={{fontFamily:T.font,fontWeight:700,fontSize:".88rem",color:"#15803D",marginBottom:4}}>Recibirás los datos de pago por WhatsApp</div>
            <div style={{fontFamily:T.font,fontSize:".80rem",color:T.t3,lineHeight:1.6}}>Una vez confirmes, te enviamos los datos de pago. Envía el comprobante y despachamos tu pedido.</div>
          </div>
        </div>
        {error&&<div style={{background:"rgba(239,68,68,0.07)",border:"1.5px solid rgba(239,68,68,0.22)",borderRadius:12,padding:"13px 18px",marginBottom:20,fontFamily:T.font,fontSize:".86rem",color:T.r1,fontWeight:600}}>⚠️ {error}</div>}
        <div style={{display:"flex",gap:14,justifyContent:"flex-end"}}>
          <button onClick={()=>setCheckoutStep(2)} disabled={enviando} style={BS}>← Editar</button>
          <motion.button className="lp-btn-prim" whileTap={{scale:.97}} onClick={handleCrearPedido} disabled={enviando}
            style={{...BP,opacity:enviando?.75:1,display:"flex",alignItems:"center",gap:10}}>
            {enviando?<><Spin/> Procesando...</>:"✅ Confirmar pedido"}
          </motion.button>
        </div>
      </motion.div>
    )
  }

  const PasoListo = () => (
    <motion.div key="pl" initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{type:"spring",stiffness:260,damping:24}}
      style={{textAlign:"center",padding:"30px 0"}}>
      <motion.div animate={{scale:[1,1.22,0.95,1.08,1]}} transition={{duration:.7,delay:.1}} style={{fontSize:"5rem",marginBottom:28}}>🎉</motion.div>
      <h2 style={{fontFamily:T.fontH,fontWeight:900,fontSize:"2.2rem",color:T.t1,marginBottom:12}}>¡Pedido confirmado!</h2>
      <p style={{fontFamily:T.font,color:T.t3,fontSize:".96rem",maxWidth:420,margin:"0 auto 32px",lineHeight:1.70}}>
        Tu pedido <strong style={{color:T.o1}}>#{pedidoCreado?.numero||pedidoCreado?._id?.slice(-6)?.toUpperCase()}</strong> fue registrado exitosamente.<br/>
        Recibirás los datos de pago por WhatsApp al número <strong style={{color:T.t1}}>{form.telefono}</strong>.
      </p>
      <div style={{background:"rgba(255,248,245,0.95)",border:"1.5px solid rgba(255,107,53,0.15)",borderRadius:24,padding:"24px 30px",marginBottom:32,textAlign:"left",maxWidth:420,margin:"0 auto 32px"}}>
        <div style={{fontFamily:T.font,fontWeight:700,color:T.t3,fontSize:".72rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:18}}>📋 Próximos pasos</div>
        {[`Espera nuestro WhatsApp con los datos de pago`,`Realiza tu pago por ${metodoPago==="nequi"?"Nequi":metodoPago==="daviplata"?"Daviplata":"Transferencia bancaria"}`,`Envíanos el comprobante por WhatsApp`,`¡Confirmamos y despachamos tu pedido!`].map((t,i)=>(
          <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:T.go,color:"#fff",fontFamily:T.font,fontWeight:800,fontSize:".76rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:T.glow}}>{i+1}</div>
            <span style={{fontFamily:T.font,fontSize:".86rem",color:T.t2,lineHeight:1.6,paddingTop:4}}>{t}</span>
          </div>
        ))}
      </div>
      <motion.button className="lp-btn-prim" whileTap={{scale:.97}} onClick={reiniciar} style={{...BP,padding:"16px 44px",fontSize:"1rem"}}>Seguir comprando →</motion.button>
    </motion.div>
  )

  const CheckoutPage = () => (
    <div style={{minHeight:"100vh",background:T.bg,paddingTop:90,position:"relative",overflow:"hidden"}}>
      <Orb sz={350} top="-100px" right="-80px" c="rgba(255,107,53,0.09)" an="lp-f1"/>
      <Orb sz={250} bottom="10%" left="-60px" c="rgba(255,160,122,0.08)" an="lp-f2" dl="3s"/>
      <div style={{maxWidth:820,margin:"0 auto",padding:"44px 5vw 110px",position:"relative",zIndex:1}}>
        {checkoutStep<4&&(
          <button onClick={volver} style={{background:"none",border:"none",cursor:"pointer",fontFamily:T.font,fontWeight:600,fontSize:".86rem",color:T.t3,display:"flex",alignItems:"center",gap:6,marginBottom:36,padding:0,transition:"color .2s"}}
            onMouseEnter={e=>e.currentTarget.style.color=T.o1} onMouseLeave={e=>e.currentTarget.style.color=T.t3}>
            ← Volver al catálogo
          </button>
        )}
        <StepIndicator/>
        <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:T.blur,border:"1px solid rgba(255,255,255,0.80)",boxShadow:"0 8px 50px rgba(0,0,0,0.07),inset 0 1px 0 rgba(255,255,255,0.95)",borderRadius:32,padding:"40px 44px"}}>
          <AnimatePresence mode="wait">
            {checkoutStep===1&&<PasoCarrito/>}
            {checkoutStep===2&&<PasoDatos/>}
            {checkoutStep===3&&<PasoConfirmar/>}
            {checkoutStep===4&&<PasoListo/>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  /* ── FOOTER ── */
  const Footer = () => (
    <footer style={{background:T.dark,padding:"70px 5vw 40px",position:"relative",overflow:"hidden"}}>
      <Orb sz={350} top="-100px" right="-80px" c="rgba(255,107,53,0.07)" an="lp-f1" pos="absolute"/>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,107,53,0.04) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
      <div style={{maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{display:"grid",gridTemplateColumns:"2.2fr 1fr 1fr 1fr",gap:48,marginBottom:56,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{width:44,height:44,borderRadius:14,background:T.go,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:T.glow}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C8 2 4 5 4 9c0 5 8 13 8 13s8-8 8-13c0-4-4-7-8-7z" fill="white" opacity=".9"/><circle cx="12" cy="9" r="3" fill="white"/></svg>
              </div>
              <div>
                <div style={{fontFamily:T.fontH,fontWeight:900,fontSize:"1.15rem",color:"#fff"}}>SurtiAntojos</div>
                <div style={{fontFamily:T.font,fontSize:".62rem",color:"rgba(255,255,255,.4)",fontWeight:600,letterSpacing:".06em"}}>PRODUCTOS ARTESANALES</div>
              </div>
            </div>
            <p style={{fontFamily:T.font,fontSize:".84rem",color:"rgba(255,255,255,.45)",lineHeight:1.75,maxWidth:300,marginBottom:24}}>
              Chorizos, arepas, pan de bono, cuajada y más. Directo del campo a tu mesa con sabor artesanal.
            </p>
          </div>
          <div>
            <div style={{fontFamily:T.font,fontWeight:700,color:"rgba(255,255,255,.70)",fontSize:".76rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:18}}>Productos</div>
            {["Chorizos","Arepas","Panadería","Lácteos"].map(m=>(
              <div key={m} style={{fontFamily:T.font,fontSize:".83rem",color:"rgba(255,255,255,.40)",marginBottom:10,cursor:"pointer",transition:"color .2s"}} onMouseEnter={e=>e.target.style.color=T.o3} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.40)"}>{m}</div>
            ))}
          </div>
          <div>
            <div style={{fontFamily:T.font,fontWeight:700,color:"rgba(255,255,255,.70)",fontSize:".76rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:18}}>Pago</div>
            {["💳 Nequi","📱 Daviplata","🏦 Transferencia"].map(m=>(
              <div key={m} style={{fontFamily:T.font,fontSize:".83rem",color:"rgba(255,255,255,.40)",marginBottom:10}}>{m}</div>
            ))}
          </div>
          <div>
            <div style={{fontFamily:T.font,fontWeight:700,color:"rgba(255,255,255,.70)",fontSize:".76rem",textTransform:"uppercase",letterSpacing:".08em",marginBottom:18}}>Contacto</div>
            {["📱 WhatsApp","📍 Colombia","🕐 Lun–Sáb"].map(c=>(
              <div key={c} style={{fontFamily:T.font,fontSize:".83rem",color:"rgba(255,255,255,.40)",marginBottom:10}}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <span style={{fontFamily:T.font,fontSize:".76rem",color:"rgba(255,255,255,.28)"}}>© 2025 SurtiAntojos · Todos los derechos reservados</span>
          <a href="/login" style={{fontFamily:T.font,fontSize:".76rem",color:"rgba(255,107,53,.45)",textDecoration:"none",transition:"color .2s"}} onMouseEnter={e=>e.target.style.color=T.o3} onMouseLeave={e=>e.target.style.color="rgba(255,107,53,.45)"}>Acceso administrador →</a>
        </div>
      </div>
    </footer>
  )

  /* ── ícono carrito SVG ── */
  const CartIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <Navbar solid={step===1}/>
      <CarritoDrawer/>
      <AnimatePresence mode="wait">
        {step===0 ? (
          <motion.div key="land" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,x:-40}} transition={{duration:.35}}>
            <Hero/>
            <Features/>
            <Catalogo/>
            <ComoFunciona/>
            <Footer/>
          </motion.div>
        ) : (
          <motion.div key="check" initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:40}} transition={{duration:.35}}>
            <CheckoutPage/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
