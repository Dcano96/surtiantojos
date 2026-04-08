import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { InputAdornment, TextField, Box, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import {
  Mail, Lock, Eye, EyeOff,
  Key, ChevronLeft, LogIn, HelpCircle,
} from "lucide-react"

// ─── API endpoints ──────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || ""
const EP = {
  login:    API ? `${API}/api/auth/login`           : "/api/auth/login",
  register: API ? `${API}/api/auth/register`        : "/api/auth/register",
  forgot:   API ? `${API}/api/auth/forgot-password` : "/api/auth/forgot-password",
}

// ─── Tokens de color ────────────────────────────────────────────
const T = {
  o1: "#FF6B2B",
  o2: "#FF9A3C",
  r1: "#E8321A",
  y1: "#FFCC02",
  bg:  "#12090A",
  bg2: "#1C0F0B",
  bg3: "#251309",
  t1: "#FFF8F0",
  t2: "#C4AA98",
  t3: "#7A5A4A",
  go: "linear-gradient(135deg,#FF6B2B,#FF9A3C)",
  gr: "linear-gradient(135deg,#E8321A,#FF6B2B)",
  gy: "linear-gradient(135deg,#FF9A3C,#FFCC02)",
  glass: "rgba(255,107,43,0.08)",
}

// ─── Fuentes + keyframes ────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("sa-style")) {
  const s = document.createElement("style"); s.id = "sa-style"
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    @keyframes sa-orb    { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(25px,-35px) scale(1.04)} 70%{transform:translate(-18px,22px) scale(.97)} }
    @keyframes sa-slideL { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
    @keyframes sa-slideR { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
    @keyframes sa-viewIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes sa-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes sa-spin   { to{transform:rotate(360deg)} }
    @keyframes sa-pulse  { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
    @keyframes sa-shimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
    .sa-spin { animation: sa-spin .7s linear infinite }
    @media (max-width:820px){ .sa-left{display:none!important} .sa-div{display:none!important} }
  `
  document.head.appendChild(s)
}

// ─── SweetAlert2 personalizado ──────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("sa-swal")) {
  const s = document.createElement("style"); s.id = "sa-swal"
  s.textContent = `
    .sa-pop{font-family:'Plus Jakarta Sans',sans-serif!important;border-radius:24px!important;
      padding:32px 28px!important;background:rgba(18,9,10,.97)!important;
      border:1px solid rgba(255,107,43,.25)!important;box-shadow:0 24px 60px rgba(232,50,26,.25)!important;
      position:relative!important;overflow:hidden!important;}
    .sa-pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(135deg,#E8321A,#FF9A3C);}
    .sa-ttl{font-family:'Fraunces',serif!important;font-weight:800!important;font-size:1.15rem!important;color:#FFF8F0!important;}
    .sa-bod{font-size:.86rem!important;color:#C4AA98!important;line-height:1.6!important;}
    .sa-ok{background:linear-gradient(135deg,#E8321A,#FF6B2B)!important;color:#fff!important;border:none!important;
      border-radius:50px!important;font-weight:700!important;font-size:.82rem!important;
      padding:10px 28px!important;cursor:pointer!important;}
    .sa-cn{background:rgba(255,107,43,.10)!important;color:#C4AA98!important;
      border:1px solid rgba(255,107,43,.20)!important;border-radius:50px!important;
      font-weight:600!important;font-size:.82rem!important;padding:10px 28px!important;cursor:pointer!important;}
    .swal2-icon.swal2-success{border-color:#FF9A3C!important;color:#FF9A3C!important;}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#FF9A3C!important;}
    .swal2-icon.swal2-error{border-color:#E8321A!important;color:#E8321A!important;}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#E8321A!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#E8321A,#FF9A3C)!important;}
  `
  document.head.appendChild(s)
}
const SW = {
  customClass:{ popup:"sa-pop", title:"sa-ttl", htmlContainer:"sa-bod", confirmButton:"sa-ok", cancelButton:"sa-cn" },
  buttonsStyling: false,
}

// ─── Styled components ─────────────────────────────────────────
const StyledTextField = styled(TextField)(() => ({
  marginBottom: "4px !important",
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px !important",
    fontFamily:   "'Plus Jakarta Sans',sans-serif !important",
    fontSize:     ".87rem",
    color:        `${T.t1} !important`,
    backgroundColor: "rgba(255,255,255,.04) !important",
    transition:   "background-color .2s",
    "&:hover":    { backgroundColor: "rgba(255,255,255,.06) !important" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,107,43,.45)" },
    "&.Mui-focused": { backgroundColor: "rgba(255,107,43,.08) !important" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.o1, borderWidth: 2 },
    "&.Mui-error .MuiOutlinedInput-notchedOutline":   { borderColor: "rgba(232,50,26,.55) !important" },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor:     "rgba(255,255,255,.10) !important",
    backgroundColor: "transparent !important",
  },
  "& .MuiInputBase-input": {
    color:           `${T.t1} !important`,
    backgroundColor: "transparent !important",
    "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus": {
      WebkitBoxShadow:    "0 0 0px 1000px rgba(18,9,10,1) inset !important",
      WebkitTextFillColor:`${T.t1} !important`,
      caretColor:         `${T.t1} !important`,
      transition:         "background-color 99999s ease-in-out 0s",
    },
  },
  "& .MuiInputLabel-outlined":             { fontFamily:"'Plus Jakarta Sans',sans-serif", color:T.t3, fontSize:".85rem" },
  "& .MuiInputLabel-outlined.Mui-focused": { color: T.o1 },
  "& .MuiInputLabel-outlined.Mui-error":   { color: "rgba(232,50,26,.65) !important" },
  "& .MuiFormHelperText-root":             { display: "none !important" },
}))

const row2Sx = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }

// ─── Validaciones ───────────────────────────────────────────────
const vEmail = (v) => {
  if (!v) return "Correo obligatorio"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Formato inválido (ej: usuario@dominio.com)"
  return ""
}
const vPass = (v) => {
  if (!v) return "Contraseña obligatoria"
  if (v.length < 8) return "Mínimo 8 caracteres"
  if (!/[A-Z]/.test(v)) return "Incluye al menos una mayúscula"
  if (!/[a-z]/.test(v)) return "Incluye al menos una minúscula"
  if (!/[0-9]/.test(v)) return "Incluye al menos un número"
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v)) return "Incluye un carácter especial"
  return ""
}
const vNombre = (v) => {
  if (!v) return "Nombre obligatorio"
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) return "Solo letras y espacios"
  if (v.trim().split(/\s+/).length < 2) return "Ingresa nombre y apellido"
  if (v.length < 6) return "Mínimo 6 caracteres"
  return ""
}
const vDoc = (v) => {
  if (!v) return "Documento obligatorio"
  if (!/^\d+$/.test(v)) return "Solo números"
  if (v.length < 6 || v.length > 15) return "Entre 6 y 15 dígitos"
  return ""
}
const vTel = (v) => {
  if (!v) return "Teléfono obligatorio"
  if (!/^\d+$/.test(v)) return "Solo números"
  if (v.length < 7 || v.length > 10) return "Entre 7 y 10 dígitos"
  return ""
}

// ─── Sub-componentes ────────────────────────────────────────────
const Spin = () => (
  <span className="sa-spin" style={{ width:17, height:17, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", flexShrink:0 }}/>
)

const ErrHint = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5, marginTop:2, paddingLeft:4 }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:"rgba(232,50,26,.75)", flexShrink:0, display:"inline-block" }}/>
      <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".71rem", color:"rgba(255,248,240,.4)", lineHeight:1.3 }}>{msg}</span>
    </div>
  )
}

const GlobalErr = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(232,50,26,.08)", border:"1px solid rgba(232,50,26,.20)", borderRadius:10, padding:"9px 12px", marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".79rem", color:"rgba(255,248,240,.5)" }}>
      <span style={{ width:16, height:16, borderRadius:"50%", background:"rgba(232,50,26,.22)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ width:4, height:4, borderRadius:"50%", background:T.r1, display:"inline-block" }}/>
      </span>
      {msg}
    </div>
  )
}

const SuccessBox = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,154,60,.08)", border:"1px solid rgba(255,154,60,.18)", borderRadius:10, padding:"9px 12px", marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".79rem", color:"rgba(255,248,240,.5)" }}>
      <span style={{ width:16, height:16, borderRadius:"50%", background:"rgba(255,154,60,.22)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color:T.o2, fontSize:10, fontWeight:700, lineHeight:1 }}>✓</span>
      </span>
      {msg}
    </div>
  )
}

const pwStr = (v) => {
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/[0-9]/.test(v)) s++
  if (/[!@#$%^&*]/.test(v)) s++
  return s
}
const PwBar = ({ val }) => {
  const s = pwStr(val)
  const c = [T.r1, "#FF8C2B", "#FFCC02", "#7ED957"]
  return (
    <div style={{ display:"flex", gap:4, marginTop:3, marginBottom:2 }}>
      {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=s ? c[s-1] : "rgba(255,255,255,.07)", transition:"background .3s" }}/>)}
    </div>
  )
}

const SecLabel = ({ icon, iconBg, children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".67rem", fontWeight:700, color:"rgba(255,248,240,.4)", letterSpacing:".08em", textTransform:"uppercase", margin:"14px 0 7px", paddingBottom:7, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
    <span style={{ width:20, height:20, borderRadius:5, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</span>
    {children}
  </div>
)

const SubmitBtn = ({ children, bg, shadow, loading }) => (
  <button type="submit" disabled={loading}
    style={{ width:"100%", padding:"13px 0", background:bg||T.go, color:"#fff", border:"none", borderRadius:50, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:".90rem", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:shadow||`0 8px 26px rgba(255,107,43,.40)`, transition:"all .22s", opacity:loading?.65:1, marginTop:8 }}
    onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-2px)" }}
    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)" }}>
    <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
      {loading ? <><Spin/><span>Procesando…</span></> : children}
    </span>
  </button>
)

const TLink = ({ children, onClick }) => (
  <button type="button" onClick={onClick}
    style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".79rem", fontWeight:600, color:T.o1, padding:"3px 8px", borderRadius:8, display:"inline-flex", alignItems:"center", gap:4, transition:"background .15s" }}
    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,43,.10)"}
    onMouseLeave={e=>e.currentTarget.style.background="none"}>
    {children}
  </button>
)

// ─── Vistas ─────────────────────────────────────────────────────

const LoginView = ({ lf, le, ge, sp, setSp, onLChange, onLogin, setView, setFok, setFer, loading }) => (
  <form onSubmit={onLogin} style={{ animation:"sa-viewIn .4s cubic-bezier(.22,1,.36,1)" }} noValidate>
    <StyledTextField fullWidth variant="outlined" margin="dense"
      name="email" label="Correo electrónico" type="email" value={lf.email}
      onChange={onLChange} error={!!le.email} autoFocus
      inputProps={{ maxLength:60 }}
      InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={17} color={T.t3} strokeWidth={2}/></InputAdornment> }}
    />
    <ErrHint msg={le.email}/>

    <StyledTextField fullWidth variant="outlined" margin="dense"
      name="password" label="Contraseña" type={sp?"text":"password"} value={lf.password}
      onChange={onLChange} error={!!le.password}
      inputProps={{ maxLength:50 }}
      InputProps={{
        startAdornment: <InputAdornment position="start"><Lock size={17} color={T.t3} strokeWidth={2}/></InputAdornment>,
        endAdornment: (
          <InputAdornment position="end">
            <button type="button" onClick={()=>setSp(p=>!p)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4, borderRadius:8, color:T.t3 }}>
              {sp ? <EyeOff size={17} strokeWidth={2}/> : <Eye size={17} strokeWidth={2}/>}
            </button>
          </InputAdornment>
        ),
      }}
    />
    <ErrHint msg={le.password}/>
    <GlobalErr msg={ge}/>

    <SubmitBtn loading={loading}><LogIn size={17} strokeWidth={2.2}/><span>Ingresar</span></SubmitBtn>

    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:4, flexWrap:"wrap", marginTop:16 }}>
      <TLink onClick={()=>{ setView("forgot"); setFok(""); setFer("") }}>
        <HelpCircle size={13} strokeWidth={2.2}/> ¿Olvidaste tu contraseña?
      </TLink>
    </div>
  </form>
)

const ForgotView = ({ fe, setFe, fer, setFer, fok, onForgot, loading }) => (
  <form onSubmit={onForgot} style={{ animation:"sa-viewIn .4s cubic-bezier(.22,1,.36,1)" }} noValidate>
    <Typography style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".85rem", color:"rgba(255,248,240,.38)", marginBottom:14, lineHeight:1.65 }}>
      Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
    </Typography>
    <StyledTextField fullWidth variant="outlined" margin="dense"
      name="forgotEmail" label="Correo electrónico" type="email" value={fe} autoFocus
      onChange={e=>{ setFe(e.target.value); setFer("") }} error={!!fer}
      inputProps={{ maxLength:60 }}
      InputProps={{ startAdornment:<InputAdornment position="start"><Mail size={17} color={T.t3} strokeWidth={2}/></InputAdornment> }}
    />
    <ErrHint msg={fer}/>
    <SuccessBox msg={fok}/>
    <SubmitBtn loading={loading} bg={T.gy} shadow="0 8px 24px rgba(255,154,60,.35)">
      <Mail size={16} strokeWidth={2.2}/><span>Enviar instrucciones</span>
    </SubmitBtn>
  </form>
)

// ─── Canvas de partículas ────────────────────────────────────────
function CanvasBg() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); let raf
    const colors = [T.o1, T.o2, T.r1, T.y1, "#fff"]
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener("resize", resize)
    const particles = Array.from({ length:120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + .2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * .5 + .1,
      da: (Math.random() - .5) * .005,
      vy: (Math.random() - .5) * .04,
    }))
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.alpha += p.da; p.y += p.vy
        if (p.alpha < 0 || p.alpha > .7) p.da *= -1
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}/>
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()   // ✅ CAMBIO: useHistory() → useNavigate()
  const cardRef = useRef(null)
  const [view,    setView]    = useState("login")
  const [loading, setLoading] = useState(false)
  const [lf,  setLf]  = useState({ email: "", password: "" })
  const [le,  setLe]  = useState({ email: "", password: "" })
  const [ge,  setGe]  = useState("")
  const [sp,  setSp]  = useState(false)

  // Redirigir si ya hay sesión
  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard", { replace: true })  // ✅ CAMBIO: history.replace → navigate(..., { replace: true })
  }, [navigate])

  // Bloquear botón Atrás
  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname)
    const onPop = () => {
      if (localStorage.getItem("token")) window.history.pushState(null, "", window.location.pathname)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  // Efecto 3D tilt en la card
  useEffect(() => {
    const card = cardRef.current; if (!card) return
    let tX=0, tY=0, mX=0, mY=0, raf
    const onMove = e => {
      const r = card.getBoundingClientRect()
      tX = (e.clientY-r.top-r.height/2)/r.height*5
      tY = -(e.clientX-r.left-r.width/2)/r.width*5
    }
    const onLeave = () => { tX=0; tY=0 }
    const tick = () => { mX+=(tX-mX)*.08; mY+=(tY-mY)*.08; card.style.transform=`perspective(1000px) rotateX(${mX}deg) rotateY(${mY}deg)`; raf=requestAnimationFrame(tick) }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)
    tick()
    return () => { cancelAnimationFrame(raf); document.removeEventListener("mousemove",onMove); document.removeEventListener("mouseleave",onLeave) }
  }, [])

  const onLChange = e => {
    const { name, value } = e.target
    setLf(p=>({...p,[name]:value})); setGe("")
    setLe(p=>({...p,[name]: name==="email" ? vEmail(value) : (value?"":"Contraseña obligatoria") }))
  }
  const onLogin = async e => {
    e.preventDefault()
    const ee=vEmail(lf.email), ep=lf.password?"":"Contraseña obligatoria"
    setLe({email:ee,password:ep}); if(ee||ep) return
    setLoading(true); setGe("")
    try {
      const res = await axios.post(EP.login, { email:lf.email, password:lf.password })
      localStorage.setItem("token",   res.data.token)
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario))
      navigate("/dashboard", { replace: true })
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || "Credenciales incorrectas"
      setGe(msg)
      Swal.fire({ ...SW, icon:"error", title:"Acceso denegado", text:msg, timer:3500, timerProgressBar:true, showConfirmButton:false })
    } finally { setLoading(false) }
  }

  // ── Estado FORGOT ──
  const [fe,  setFe]  = useState("")
  const [fer, setFer] = useState("")
  const [fok, setFok] = useState("")

  const onForgot = async e => {
    e.preventDefault()
    const err = vEmail(fe); setFer(err); if(err) return
    setLoading(true); setFok("")
    try {
      await axios.post(EP.forgot, { email:fe })
      setFok("Si el correo existe, recibirás las instrucciones en tu bandeja.")
      setFe("")
    } catch (err) {
      setFer(err.response?.data?.msg || "Error al procesar la solicitud.")
    } finally { setLoading(false) }
  }

  // ── Meta por vista ──
  const META = {
    login:  { icon:<LogIn size={22} color="#fff" strokeWidth={2.2}/>, title:"Bienvenido",       sub:"Inicia sesión en SurtiAntojos", hBg:T.gr },
    forgot: { icon:<Key   size={22} color="#fff" strokeWidth={2.2}/>, title:"Recuperar acceso", sub:"Te ayudamos a volver",          hBg:T.gy },
  }
  const m = META[view]

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif", position:"relative", overflow:"hidden", padding:"24px 16px" }}>

      <CanvasBg/>

      {/* Grid sutil */}
      <div style={{ position:"fixed", inset:0, zIndex:1, backgroundImage:"linear-gradient(rgba(255,107,43,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,43,.04) 1px,transparent 1px)", backgroundSize:"55px 55px", pointerEvents:"none", WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)" }}/>

      {/* Orbs */}
      {[
        { w:480, h:480, t:-120, l:-120, bg:"radial-gradient(circle,rgba(232,50,26,.30),transparent 70%)", d:"0s" },
        { w:380, h:380, b:-80,  r:-80,  bg:"radial-gradient(circle,rgba(255,107,43,.24),transparent 70%)", d:"-3s" },
        { w:260, h:260, top:"38%", l:"52%", bg:"radial-gradient(circle,rgba(255,204,2,.16),transparent 70%)", d:"-6s" },
      ].map((o,i)=>(
        <div key={i} style={{ position:"fixed", borderRadius:"50%", filter:"blur(80px)", pointerEvents:"none", zIndex:1, animation:`sa-orb 9s ease-in-out ${o.d} infinite`, width:o.w, height:o.h, top:o.t||o.top, left:o.l, bottom:o.b, right:o.r, background:o.bg }}/>
      ))}

      <div style={{ position:"relative", zIndex:2, width:"100%", maxWidth:980, display:"flex", gap:0, alignItems:"stretch" }}>

        {/* ── Lado izquierdo ── */}
        <div className="sa-left" style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 40px", animation:"sa-slideL .8s cubic-bezier(.22,1,.36,1) both" }}>

          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:44 }}>
            <div style={{ width:44, height:44, background:T.go, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 24px rgba(255,107,43,.5)`, position:"relative", overflow:"hidden", flexShrink:0 }}>
              <div style={{ position:"absolute", top:-8, left:-8, width:22, height:22, background:"rgba(255,255,255,.22)", borderRadius:"50%" }}/>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} style={{ position:"relative", zIndex:1 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"1.35rem", letterSpacing:"-.3px", background:T.go, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1.1 }}>SurtiAntojos</div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".62rem", color:"rgba(255,248,240,.30)", letterSpacing:".2em", textTransform:"uppercase", marginTop:2 }}>Tu tienda favorita</div>
            </div>
          </div>

          <h1 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"clamp(2rem,3.5vw,3rem)", lineHeight:1.05, letterSpacing:"-1.2px", marginBottom:20, color:T.t1 }}>
            Todo lo que<br/>
            <span style={{ background:T.go, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>antojas</span>,<br/>
            <span style={{ background:T.gy, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>en un clic</span>
          </h1>

          <p style={{ fontSize:".88rem", color:"rgba(255,248,240,.38)", lineHeight:1.78, maxWidth:290, marginBottom:44 }}>
            Gestiona tus pedidos, revisa el catálogo y disfruta la experiencia SurtiAntojos desde un solo lugar.
          </p>

          {/* Cards flotantes */}
          <div style={{ position:"relative", height:230 }}>
            {[
              { bg:"rgba(232,50,26,.18)",  w:215, t:0,   l:0,   d:"0s",  dot:T.r1, label:"Pedidos hoy",       val:"148 pedidos" },
              { bg:"rgba(255,107,43,.13)", w:188, t:68,  l:125, d:"-2s", dot:T.o1, label:"Productos activos", val:"320 artículos" },
              { bg:"rgba(255,204,2,.10)",  w:165, t:145, l:20,  d:"-4s", dot:T.y1, label:"Clientes nuevos",   val:"23 hoy" },
            ].map((c,i)=>(
              <div key={i} style={{ position:"absolute", background:c.bg, width:c.w, top:c.t, left:c.l, backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,.09)", boxShadow:"0 18px 55px rgba(0,0,0,.4)", borderRadius:15, padding:"13px 17px", animation:`sa-float 6s ${c.d} ease-in-out infinite` }}>
                <div style={{ fontSize:".58rem", letterSpacing:".13em", textTransform:"uppercase", color:"rgba(255,248,240,.40)", marginBottom:5 }}>{c.label}</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:"1rem", color:c.dot, display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:c.dot, display:"inline-block", animation:"sa-pulse 2s ease-in-out infinite" }}/>
                  {c.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divisor */}
        <div className="sa-div" style={{ width:1, flexShrink:0, margin:"40px 0", background:`linear-gradient(to bottom,transparent,rgba(255,107,43,.3) 30%,rgba(232,50,26,.3) 70%,transparent)` }}/>

        {/* ── Card ── */}
        <div ref={cardRef} style={{ width:432, flexShrink:0, background:"rgba(255,255,255,.04)", backdropFilter:"blur(32px) saturate(180%)", WebkitBackdropFilter:"blur(32px) saturate(180%)", border:"1px solid rgba(255,255,255,.08)", borderRadius:28, overflow:"hidden", animation:"sa-slideR .8s cubic-bezier(.22,1,.36,1) .1s both", boxShadow:`0 0 0 1px rgba(255,107,43,.12),0 40px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.07)`, transformStyle:"preserve-3d" }}>

          {/* Header de la card */}
          <div style={{ padding:"26px 30px 22px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:m.hBg }}/>
            <div style={{ position:"absolute", top:-55, right:-55, width:170, height:170, background:"rgba(255,255,255,.07)", borderRadius:"50%" }}/>
            <div style={{ position:"absolute", bottom:-35, left:-18, width:110, height:110, background:"rgba(255,255,255,.05)", borderRadius:"50%" }}/>

            <div style={{ position:"relative", zIndex:2 }}>
              {view!=="login" && (
                <button type="button" onClick={()=>setView("login")}
                  style={{ position:"absolute", top:-6, right:0, width:33, height:33, background:"rgba(255,255,255,.18)", border:"none", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", transition:"all .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.30)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}>
                  <ChevronLeft size={15} strokeWidth={2.5}/>
                </button>
              )}
              <div style={{ width:46, height:46, background:"rgba(255,255,255,.18)", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:13, boxShadow:"0 8px 20px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.2)" }}>{m.icon}</div>
              <Typography style={{ fontFamily:"'Fraunces',serif", fontSize:"1.45rem", fontWeight:900, color:"#fff", letterSpacing:"-.3px", lineHeight:1.1 }}>{m.title}</Typography>
              <Typography style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".79rem", color:"rgba(255,255,255,.65)", marginTop:4 }}>{m.sub}</Typography>
            </div>
          </div>

          {/* Body */}
          <Box style={{ padding:"20px 26px 24px" }}>
            {view==="login"  && <LoginView  lf={lf} le={le} ge={ge} sp={sp} setSp={setSp} onLChange={onLChange} onLogin={onLogin} setView={setView} setFok={setFok} setFer={setFer} loading={loading}/>}
            {view==="forgot" && <ForgotView fe={fe} setFe={setFe} fer={fer} setFer={setFer} fok={fok} onForgot={onForgot} loading={loading}/>}

            <Box style={{ display:"flex", justifyContent:"center", marginTop:16 }}>
              <button type="button" onClick={()=>navigate("/")}   
                style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".76rem", color:"rgba(255,248,240,.25)", display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:8, transition:"color .15s" }}
                onMouseEnter={e=>e.currentTarget.style.color="rgba(255,248,240,.60)"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,248,240,.25)"}>
                <ChevronLeft size={12} strokeWidth={2.5}/> Volver al inicio
              </button>
            </Box>
          </Box>
        </div>
      </div>
    </div>
  )
}