import React, { useState, useEffect, useRef } from "react"
import loginBg from "../../assets/images/login.jpeg"
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

// ─── Tokens de color (tema claro — igual que Dashboard) ────────
const T = {
  o1: "#FF6B2B",
  o2: "#FF9A3C",
  r1: "#E8321A",
  y1: "#FFCC02",
  bg:  "#F5F7FA",
  bg2: "#FFFFFF",
  bg3: "#EEF1F5",
  t1: "#1E1E2D",
  t2: "#636578",
  t3: "#A1A3B5",
  go: "linear-gradient(135deg,#FF6B2B,#FF9A3C)",
  gr: "linear-gradient(135deg,#E8321A,#FF6B2B)",
  gy: "linear-gradient(135deg,#FF9A3C,#FFCC02)",
  glass: "rgba(255,107,43,0.05)",
  border: "rgba(0,0,0,0.08)",
  sh: "0 4px 24px rgba(0,0,0,0.06)",
}

// ─── Fondo: imagen local ────────────────────────────────────────

// ─── Fuentes + keyframes ────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("sa-style")) {
  const s = document.createElement("style"); s.id = "sa-style"
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    @keyframes sa-orb    { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(25px,-35px) scale(1.04)} 70%{transform:translate(-18px,22px) scale(.97)} }
    @keyframes sa-slideL  { from{opacity:0;transform:translateX(-60px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
    @keyframes sa-slideR  { from{opacity:0;transform:translateX(60px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
    @keyframes sa-viewIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes sa-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes sa-spin    { to{transform:rotate(360deg)} }
    @keyframes sa-pulse   { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
    @keyframes sa-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes sa-glow    { 0%,100%{box-shadow:0 0 20px 2px rgba(255,107,43,.15),0 0 60px 10px rgba(232,50,26,.06)} 50%{box-shadow:0 0 30px 6px rgba(255,107,43,.25),0 0 80px 20px rgba(232,50,26,.10)} }
    @keyframes sa-fadeUp  { from{opacity:0;transform:translateY(30px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes sa-pillIn  { from{opacity:0;transform:translateX(-25px)} to{opacity:1;transform:translateX(0)} }
    @keyframes sa-bgZoom  { 0%{transform:scale(1)} 100%{transform:scale(1.05)} }
    @keyframes sa-kenBurns { 0%{transform:scale(1) translate(0,0)} 25%{transform:scale(1.08) translate(-1.5%,-1%)} 50%{transform:scale(1.12) translate(1%,-2%)} 75%{transform:scale(1.06) translate(-0.5%,0.5%)} 100%{transform:scale(1) translate(0,0)} }
    @keyframes sa-bgShine  { 0%{transform:translateX(-150%) rotate(25deg)} 100%{transform:translateX(250%) rotate(25deg)} }
    @keyframes sa-bgFade   { 0%,100%{opacity:.55} 50%{opacity:.40} }
    @keyframes sa-bgDrift  { 0%{transform:scale(1.05) translate(0,0)} 33%{transform:scale(1.1) translate(-2%,-1%)} 66%{transform:scale(1.07) translate(1%,-1.5%)} 100%{transform:scale(1.05) translate(0,0)} }
    @keyframes sa-vignettePulse { 0%,100%{opacity:.3} 50%{opacity:.5} }
    @keyframes sa-ember   { 0%{opacity:0;transform:translateY(0) scale(.5)} 20%{opacity:1} 80%{opacity:.7} 100%{opacity:0;transform:translateY(-100vh) scale(0)} }
    .sa-spin { animation: sa-spin .7s linear infinite }
    @media (max-width:820px){
      .sa-left{display:none!important}
      .sa-div{display:none!important}
      .sa-card-wrap{flex:1 1 100%!important;max-width:100%!important;background:#1a0e08!important}
    }
  `
  document.head.appendChild(s)
}

// ─── SweetAlert2 personalizado (mismo estilo que Dashboard) ─────
if (typeof document !== "undefined" && !document.getElementById("sa-dash-style") && !document.getElementById("sa-login-swal")) {
  const s = document.createElement("style"); s.id = "sa-login-swal"
  s.textContent = `
    .sa-dash-pop{font-family:'Plus Jakarta Sans',sans-serif!important;border-radius:22px!important;
      padding:30px 26px!important;background:rgba(255,255,255,.98)!important;
      border:1px solid rgba(255,107,43,.18)!important;box-shadow:0 22px 56px rgba(0,0,0,.12)!important;
      position:relative!important;overflow:hidden!important;}
    .sa-dash-pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(135deg,#E8321A,#FF9A3C);}
    .sa-dash-ttl{font-family:'Fraunces',serif!important;font-weight:900!important;font-size:1.1rem!important;color:#1E1E2D!important;}
    .sa-dash-bod{font-size:.84rem!important;color:#636578!important;line-height:1.6!important;}
    .sa-dash-ok{background:linear-gradient(135deg,#E8321A,#FF6B2B)!important;color:#fff!important;border:none!important;
      border-radius:50px!important;font-weight:700!important;font-size:.82rem!important;
      padding:10px 26px!important;cursor:pointer!important;}
    .sa-dash-cn{background:rgba(0,0,0,.04)!important;color:#636578!important;
      border:1px solid rgba(0,0,0,.10)!important;border-radius:50px!important;
      font-weight:600!important;font-size:.82rem!important;padding:10px 26px!important;cursor:pointer!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#E8321A,#FF9A3C)!important;}
  `
  document.head.appendChild(s)
}
const SW = {
  customClass:{ popup:"sa-dash-pop", title:"sa-dash-ttl", htmlContainer:"sa-dash-bod", confirmButton:"sa-dash-ok", cancelButton:"sa-dash-cn" },
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
    backgroundColor: "rgba(255,255,255,.60) !important",
    transition:   "background-color .2s",
    "&:hover":    { backgroundColor: "rgba(255,255,255,.80) !important" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,107,43,.45)" },
    "&.Mui-focused": { backgroundColor: "rgba(255,255,255,.90) !important" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.o1, borderWidth: 2 },
    "&.Mui-error .MuiOutlinedInput-notchedOutline":   { borderColor: "rgba(232,50,26,.55) !important" },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor:     "rgba(0,0,0,.12) !important",
    backgroundColor: "transparent !important",
  },
  "& .MuiInputBase-input": {
    color:           `${T.t1} !important`,
    backgroundColor: "transparent !important",
    "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus": {
      WebkitBoxShadow:    "0 0 0px 1000px #FFFFFF inset !important",
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
      <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".71rem", color:T.r1, opacity:.75, lineHeight:1.3 }}>{msg}</span>
    </div>
  )
}

const GlobalErr = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(232,50,26,.06)", border:"1px solid rgba(232,50,26,.15)", borderRadius:10, padding:"9px 12px", marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".79rem", color:T.r1 }}>
      <span style={{ width:16, height:16, borderRadius:"50%", background:"rgba(232,50,26,.15)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ width:4, height:4, borderRadius:"50%", background:T.r1, display:"inline-block" }}/>
      </span>
      {msg}
    </div>
  )
}

const SuccessBox = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(0,201,122,.06)", border:"1px solid rgba(0,201,122,.18)", borderRadius:10, padding:"9px 12px", marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".79rem", color:"#00917a" }}>
      <span style={{ width:16, height:16, borderRadius:"50%", background:"rgba(0,201,122,.15)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color:"#00C97A", fontSize:10, fontWeight:700, lineHeight:1 }}>✓</span>
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
      {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=s ? c[s-1] : "rgba(0,0,0,.06)", transition:"background .3s" }}/>)}
    </div>
  )
}

const SecLabel = ({ icon, iconBg, children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".67rem", fontWeight:700, color:T.t3, letterSpacing:".08em", textTransform:"uppercase", margin:"14px 0 7px", paddingBottom:7, borderBottom:"1px solid rgba(0,0,0,.06)" }}>
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

    <SubmitBtn loading={loading}><span>🔥 Entrar ahora</span></SubmitBtn>

    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:4, flexWrap:"wrap", marginTop:16 }}>
      <TLink onClick={()=>{ setView("forgot"); setFok(""); setFer("") }}>
        <HelpCircle size={13} strokeWidth={2.2}/> ¿Olvidaste tu contraseña?
      </TLink>
    </div>
  </form>
)

const ForgotView = ({ fe, setFe, fer, setFer, fok, onForgot, loading }) => (
  <form onSubmit={onForgot} style={{ animation:"sa-viewIn .4s cubic-bezier(.22,1,.36,1)" }} noValidate>
    <Typography style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".85rem", color:T.t2, marginBottom:14, lineHeight:1.65 }}>
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

// ─── Imagen de fondo animada (Ken Burns cinematográfico) ────────
function ImageBg() {
  return (
    <>
      {/* Imagen principal con Ken Burns */}
      <div style={{ position:"absolute", inset:"-12%", backgroundImage:`url('${loginBg}')`, backgroundSize:"cover", backgroundPosition:"center 40%", animation:"sa-kenBurns 25s ease-in-out infinite", willChange:"transform" }}/>
      {/* Brillo cinematográfico que recorre la imagen */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"-50%", left:0, width:"60%", height:"200%", background:"linear-gradient(90deg, transparent 0%, rgba(255,255,255,.07) 40%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.07) 60%, transparent 100%)", animation:"sa-bgShine 8s ease-in-out 3s infinite", willChange:"transform" }}/>
      </div>
      {/* Viñeta pulsante sutil */}
      <div style={{ position:"absolute", inset:0, boxShadow:"inset 0 0 180px 60px rgba(0,0,0,.35)", pointerEvents:"none", animation:"sa-vignettePulse 6s ease-in-out infinite" }}/>
    </>
  )
}

// ─── Canvas de partículas (embers / brasas realistas) ───────────
function CanvasBg() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); let raf
    const colors = ["#FF6B2B","#FF9A3C","#FFCC02","#E8321A","#FFD4A0","#FFA040"]
    const resize = () => { canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener("resize", resize)
    // Embers: partículas que suben con movimiento orgánico
    const particles = Array.from({ length:120 }, () => {
      const w = canvas.width || window.innerWidth
      const h = canvas.height || window.innerHeight
      return {
        x: Math.random() * w,
        y: h + Math.random() * 100,
        r: Math.random() * 2.5 + .4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0,
        maxAlpha: Math.random() * .6 + .2,
        vx: (Math.random() - .5) * .3,
        vy: -(Math.random() * .6 + .15),
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * .02 + .005,
        wobbleAmp: Math.random() * .8 + .2,
        life: 0,
        maxLife: Math.random() * 600 + 300,
        decay: Math.random() * .003 + .001,
      }
    })
    const resetP = (p) => {
      p.x = Math.random() * canvas.width
      p.y = canvas.height + Math.random() * 40
      p.alpha = 0; p.life = 0
      p.maxLife = Math.random() * 600 + 300
      p.r = Math.random() * 2.5 + .4
      p.maxAlpha = Math.random() * .6 + .2
      p.vy = -(Math.random() * .6 + .15)
    }
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.life++
        p.wobble += p.wobbleSpeed
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp
        p.y += p.vy
        // Fade in / fade out
        const progress = p.life / p.maxLife
        if (progress < .15) p.alpha = (progress / .15) * p.maxAlpha
        else if (progress > .7) p.alpha = ((1 - progress) / .3) * p.maxAlpha
        else p.alpha = p.maxAlpha
        if (p.life > p.maxLife || p.y < -20) { resetP(p); return }
        // Dibujar con glow
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha * .3)
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])
  return <canvas ref={ref} style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none" }}/>
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

  // Efecto 3D tilt en la card (más pronunciado con reflejo)
  useEffect(() => {
    const card = cardRef.current; if (!card) return
    let tX=0, tY=0, mX=0, mY=0, raf
    const onMove = e => {
      const r = card.getBoundingClientRect()
      tX = (e.clientY-r.top-r.height/2)/r.height*8
      tY = -(e.clientX-r.left-r.width/2)/r.width*8
    }
    const onLeave = () => { tX=0; tY=0 }
    const tick = () => {
      mX+=(tX-mX)*.06; mY+=(tY-mY)*.06
      card.style.transform=`perspective(800px) rotateX(${mX}deg) rotateY(${mY}deg)`
      // Reflejo dinámico
      const shine = card.querySelector('.sa-shine')
      if(shine) { shine.style.background=`radial-gradient(circle at ${50-mY*5}% ${50-mX*5}%, rgba(255,255,255,.08) 0%, transparent 60%)` }
      raf=requestAnimationFrame(tick)
    }
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

  return (
    <div style={{ height:"100vh", display:"flex", fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:"hidden", background:"#0D0705" }}>

      {/* ── Panel izquierdo: video de fondo fullbleed ── */}
      <div className="sa-left" style={{ flex:"1 1 58%", minWidth:0, position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>

        {/* Imagen de fondo */}
        <ImageBg/>

        {/* Overlay multi-capa */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(170deg, rgba(8,4,2,.55) 0%, rgba(15,8,4,.35) 35%, rgba(20,10,5,.25) 55%, rgba(8,4,2,.65) 100%)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,3,1,.85) 0%, rgba(8,3,1,.45) 25%, transparent 55%)" }}/>

        {/* Resplandor cálido inferior (brasas) */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%", background:"radial-gradient(ellipse 120% 70% at 30% 100%, rgba(255,107,43,.20) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"30%", background:"radial-gradient(ellipse 80% 60% at 70% 100%, rgba(232,50,26,.12) 0%, transparent 70%)", pointerEvents:"none" }}/>

        {/* Viñeta sutil */}
        <div style={{ position:"absolute", inset:0, boxShadow:"inset 0 0 150px 40px rgba(0,0,0,.3)", pointerEvents:"none" }}/>

        {/* Embers canvas */}
        <CanvasBg/>

        {/* Contenido sobre la imagen */}
        <div style={{ position:"relative", zIndex:4, padding:"0 clamp(36px,5vw,72px) clamp(48px,7vh,80px)", animation:"sa-slideL .9s cubic-bezier(.22,1,.36,1) both" }}>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"clamp(2.6rem,5vw,4rem)", lineHeight:1.02, letterSpacing:"-2px", color:"#fff", marginBottom:"clamp(12px,2vh,20px)", textShadow:"0 4px 30px rgba(0,0,0,.4), 0 1px 3px rgba(0,0,0,.6)" }}>
            ¿Antojo<br/>de algo brutal?<span style={{ display:"inline-block", marginLeft:8, filter:"drop-shadow(0 2px 8px rgba(255,107,43,.6))" }}>🔥</span>
          </h1>

          <p style={{ fontSize:"clamp(.92rem,1.2vw,1.08rem)", color:"rgba(255,255,255,.60)", lineHeight:1.7, maxWidth:420, marginBottom:"clamp(28px,4vh,44px)", textShadow:"0 2px 10px rgba(0,0,0,.5)" }}>
            Arepas, embutidos y delicias listas<br/>para ti en segundos.
          </p>

          {/* Pills con entrada escalonada */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { emoji:"🔥", label:"+320 productos", bg:"linear-gradient(135deg,rgba(232,50,26,.75),rgba(255,107,43,.65))" },
              { emoji:"⚡", label:"Entrega rápida",  bg:"rgba(255,255,255,.10)" },
              { emoji:"🧡", label:"Calidad garantizada", bg:"rgba(255,255,255,.10)" },
            ].map((pill,i)=>(
              <div key={i} style={{ display:"inline-flex", alignItems:"center", alignSelf:"flex-start", gap:10, background:pill.bg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,.14)", borderRadius:50, padding:"10px 24px", animation:`sa-pillIn .6s cubic-bezier(.22,1,.36,1) ${.4 + i*.15}s both, sa-float 7s ${-i*2.5}s ease-in-out infinite`, cursor:"default", transition:"transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.04)";e.currentTarget.style.boxShadow="0 8px 25px rgba(255,107,43,.25)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
                <span style={{ fontSize:"1.05rem", lineHeight:1, filter:"drop-shadow(0 1px 4px rgba(0,0,0,.3))" }}>{pill.emoji}</span>
                <span style={{ color:"#fff", fontSize:".86rem", fontWeight:700, letterSpacing:".01em", textShadow:"0 1px 6px rgba(0,0,0,.3)" }}>{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel derecho: card flotante con fondo difuso ── */}
      <div className="sa-card-wrap" style={{ flex:"0 0 clamp(380px,42%,480px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", position:"relative", overflow:"hidden" }}>

        {/* Fondo: imagen difusa animada */}
        <div style={{ position:"absolute", inset:"-10%", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:`url('${loginBg}')`, backgroundSize:"cover", backgroundPosition:"right center", animation:"sa-bgDrift 20s ease-in-out infinite", willChange:"transform" }}/>
        </div>
        <div style={{ position:"absolute", inset:0, background:"rgba(6,3,1,.55)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", animation:"sa-bgFade 8s ease-in-out infinite" }}/>

        {/* Card principal con glow animado */}
        <div ref={cardRef} style={{ position:"relative", zIndex:2, width:"100%", maxWidth:420, background:"rgba(255,255,255,.96)", backdropFilter:"blur(40px) saturate(200%)", WebkitBackdropFilter:"blur(40px) saturate(200%)", borderRadius:26, padding:"clamp(30px,3.8vw,44px) clamp(28px,3.2vw,38px)", boxShadow:"0 10px 50px rgba(0,0,0,.30), 0 40px 100px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.8)", animation:"sa-fadeUp .9s cubic-bezier(.22,1,.36,1) .15s both, sa-glow 4s ease-in-out infinite", transformStyle:"preserve-3d", overflow:"hidden", maxHeight:"calc(100vh - 48px)", transition:"transform .15s ease-out" }}>

          {/* Reflejo dinámico con tilt */}
          <div className="sa-shine" style={{ position:"absolute", inset:0, borderRadius:26, pointerEvents:"none", zIndex:10, transition:"background .3s" }}/>

          {/* Línea gradient top */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#E8321A,#FF6B2B,#FF9A3C,#FFCC02)", borderRadius:"26px 26px 0 0" }}/>

          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:"clamp(20px,3vh,32px)", animation:"sa-fadeUp .7s cubic-bezier(.22,1,.36,1) .3s both" }}>
            <div style={{ width:40, height:40, background:T.go, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(255,107,43,.40)", flexShrink:0, position:"relative", overflow:"hidden", transition:"transform .3s, box-shadow .3s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1) rotate(-3deg)";e.currentTarget.style.boxShadow="0 10px 30px rgba(255,107,43,.50)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 8px 24px rgba(255,107,43,.40)"}}>
              <div style={{ position:"absolute", top:-6, left:-6, width:20, height:20, background:"rgba(255,255,255,.25)", borderRadius:"50%" }}/>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} style={{ position:"relative", zIndex:1 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"1.25rem", letterSpacing:"-.3px", background:T.go, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>SurtiAntojos</div>
          </div>

          {/* Título */}
          <div style={{ marginBottom:"clamp(16px,2.5vh,26px)", animation:"sa-fadeUp .7s cubic-bezier(.22,1,.36,1) .4s both" }}>
            {view!=="login" && (
              <button type="button" onClick={()=>setView("login")}
                style={{ background:"rgba(0,0,0,.04)", border:"none", borderRadius:8, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, padding:"6px 12px", marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".78rem", fontWeight:600, color:T.t2, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,0,0,.08)";e.currentTarget.style.transform="translateX(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,.04)";e.currentTarget.style.transform=""}}>
                <ChevronLeft size={14} strokeWidth={2.5}/> Volver
              </button>
            )}
            <Typography style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"clamp(1.45rem,2.2vw,1.75rem)", color:T.t1, letterSpacing:"-.5px", lineHeight:1.15 }}>
              {view==="login" ? "Bienvenido de nuevo" : "Recuperar acceso"}
            </Typography>
            <Typography style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".86rem", color:T.t2, marginTop:5, lineHeight:1.5 }}>
              {view==="login" ? "Ingresa y cumple tu antojo 😊" : "Te ayudamos a volver a tu cuenta"}
            </Typography>
          </div>

          {/* Formulario */}
          <div style={{ animation:"sa-fadeUp .7s cubic-bezier(.22,1,.36,1) .5s both" }}>
            {view==="login"  && <LoginView  lf={lf} le={le} ge={ge} sp={sp} setSp={setSp} onLChange={onLChange} onLogin={onLogin} setView={setView} setFok={setFok} setFer={setFer} loading={loading}/>}
            {view==="forgot" && <ForgotView fe={fe} setFe={setFe} fer={fer} setFer={setFer} fok={fok} onForgot={onForgot} loading={loading}/>}
          </div>
        </div>
      </div>
    </div>
  )
}