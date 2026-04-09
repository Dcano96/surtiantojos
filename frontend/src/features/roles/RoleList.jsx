import { useState, useEffect } from "react"
import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  MenuItem,
  Box,
  InputAdornment,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  Switch,
  Tooltip,
} from "@mui/material"
import {
  Edit2, Trash2, Eye, X, Search, CheckCircle, Settings, Shield,
  XCircle, User, Lock, PenTool, Key, ArrowLeft, ArrowRight,
  Check as CheckIcon, AlertTriangle, ShoppingCart, ClipboardList, Tag, BarChart3,
  Plus, FileText,
} from "lucide-react"
import Swal from "sweetalert2"
import api from "../../services/api.js"

/* ═══════════════════════════════════════════════════════════════
   MÓDULOS DISPONIBLES — contexto surtiantojos
   ═══════════════════════════════════════════════════════════════ */
const availableModules = [
  "dashboard", "usuarios", "roles", "categorias", "productos", "pedidos", "reportes",
]

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Premium Soft-3D Neumorphic
   ═══════════════════════════════════════════════════════════════ */
const T = {
  o1: "#FF6B35",
  o2: "#FF3D00",
  o3: "#FF8F5E",
  o4: "#FFF0EB",
  r1: "#EF4444",
  y1: "#F59E0B",
  green: "#22C55E",
  green2: "#BBF7D0",
  t1: "#1A1A2E",
  t2: "#4A4A68",
  t3: "#9CA3AF",
  t4: "#C5C8D4",
  bg: "#F2F0EE",
  bg2: "#FFFFFF",
  bg3: "#FAF8F6",
  go: "linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)",
  go2: "linear-gradient(135deg, #FF8F5E, #FF6B35)",
  gr: "linear-gradient(135deg, #EF4444, #DC2626)",
  gy: "linear-gradient(135deg, #F59E0B, #D97706)",
  gg: "linear-gradient(135deg, #22C55E, #16A34A)",
  border: "rgba(0,0,0,0.06)",
  border2: "rgba(255,107,53,0.22)",
  glass: "rgba(255,255,255,0.70)",
  neu: "8px 8px 24px rgba(0,0,0,0.06), -8px -8px 24px rgba(255,255,255,0.95)",
  neuIn: "inset 4px 4px 10px rgba(0,0,0,0.04), inset -4px -4px 10px rgba(255,255,255,0.85)",
  neuHover: "12px 12px 32px rgba(0,0,0,0.08), -12px -12px 32px rgba(255,255,255,1)",
  sh: "0 4px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)",
  sh2: "0 12px 40px rgba(0,0,0,0.08)",
  sh3: "0 20px 60px rgba(0,0,0,0.12)",
  shCard: "0 8px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)",
  glow: "0 4px 20px rgba(255,107,53,0.25)",
  glow2: "0 8px 32px rgba(255,107,53,0.35)",
  font: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontH: "'Fraunces', serif",
  rad: "20px",
  rad2: "16px",
  rad3: "24px",
}

const AVATAR_COLORS = [
  "linear-gradient(135deg, #FF6B35, #FF3D00)",
  "linear-gradient(135deg, #6366F1, #4F46E5)",
  "linear-gradient(135deg, #22C55E, #059669)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #EC4899, #DB2777)",
  "linear-gradient(135deg, #06B6D4, #0891B2)",
]
const avGrad = i => AVATAR_COLORS[i % AVATAR_COLORS.length]

/* ═══════════════════════════════════════════════════════════════
   ANIMATION KEYFRAMES INJECTION
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-role-anims")) {
  const s = document.createElement("style"); s.id = "sa-role-anims"
  s.textContent = `
    @keyframes sa-role-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes sa-role-bob    { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-5px) scale(1.04)} }
    @keyframes sa-role-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(255,107,53,0.25)} 50%{box-shadow:0 0 0 10px rgba(255,107,53,0)} }
    @keyframes sa-role-spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes sa-role-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes sa-role-glow   { 0%,100%{opacity:.5} 50%{opacity:1} }
    @keyframes sa-role-orb1   { 0%,100%{transform:translate(0,0)} 33%{transform:translate(5px,-8px)} 66%{transform:translate(-5px,3px)} }
    @keyframes sa-role-orb2   { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-6px,5px)} 66%{transform:translate(4px,-6px)} }
    @keyframes sa-role-orb3   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(3px,-4px) scale(1.12)} }
  `
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════════════════════════
   SWAL STYLE INJECTION
   ═══════════════════════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("sa-swal")) {
  const s = document.createElement("style"); s.id = "sa-swal"
  s.textContent = `
    .swal2-icon.swal2-question{border-color:#FF6B35!important;color:#FF6B35!important;}
    .swal2-icon.swal2-warning{border-color:#FF3D00!important;color:#FF3D00!important;}
    .swal2-icon.swal2-success{border-color:#22C55E!important;color:#22C55E!important;}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#22C55E!important;}
    .swal2-icon.swal2-success .swal2-success-ring{border-color:rgba(34,197,94,.30)!important;}
    .swal2-icon.swal2-error{border-color:#EF4444!important;color:#EF4444!important;}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#EF4444!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#FF6B35,#FF3D00)!important;}
    .swal2-container{z-index:99999!important;}
    .swal2-popup{z-index:100000!important;border-radius:20px!important;box-shadow:0 25px 60px rgba(0,0,0,0.15)!important;}
    .swal2-backdrop-show{z-index:99998!important;background:rgba(15,23,42,.25)!important;backdrop-filter:blur(8px)!important;}
  `
  document.head.appendChild(s)
}

const SW  = { customClass:{ popup:"sa-dash-pop", title:"sa-dash-ttl", htmlContainer:"sa-dash-bod", confirmButton:"sa-dash-ok", cancelButton:"sa-dash-cn" }, buttonsStyling:false }
const SWD = { ...SW }
const SWW = { ...SW }
const swalFire = (options) =>
  Swal.fire({ ...options, allowOutsideClick: options.showCancelButton ? true : false })

/* ═══════════════════════════════════════════════════════════════
   REUSABLE STYLES — Premium Neumorphic
   ═══════════════════════════════════════════════════════════════ */
const actionBtn = {
  width: 36, height: 36, borderRadius: "12px", display: "flex", alignItems: "center",
  justifyContent: "center", border: "none", cursor: "pointer", transition: "all .25s ease",
  minWidth: "unset", p: 0,
  "&:hover": { transform: "translateY(-2px)" },
}
const btnEdit = { ...actionBtn, background: "rgba(34,197,94,0.10)", color: T.green, boxShadow: "0 2px 8px rgba(34,197,94,0.08)", "&:hover": { background: "rgba(34,197,94,0.18)", boxShadow: "0 6px 16px rgba(34,197,94,.20)", transform: "translateY(-2px)" } }
const btnView = { ...actionBtn, background: "rgba(255,107,53,0.10)", color: T.o1, boxShadow: "0 2px 8px rgba(255,107,53,0.08)", "&:hover": { background: "rgba(255,107,53,0.18)", boxShadow: "0 6px 16px rgba(255,107,53,.20)", transform: "translateY(-2px)" } }
const btnDel  = { ...actionBtn, background: "rgba(239,68,68,0.08)", color: T.r1, boxShadow: "0 2px 8px rgba(239,68,68,0.06)", "&:hover": { background: "rgba(239,68,68,0.15)", boxShadow: "0 6px 16px rgba(239,68,68,.20)", transform: "translateY(-2px)" } }

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
  textTransform: "none !important",
  boxShadow: `${T.glow} !important`,
  "&:hover": { transform: "translateY(-2px)", boxShadow: `${T.glow2} !important` },
  "&:disabled": { background: "rgba(255,107,53,.15) !important", boxShadow: "none !important", transform: "none !important" },
}

const permBtnSelSx = {
  display: "flex !important", alignItems: "center !important", gap: "4px !important",
  background: `${T.go} !important`, color: "#fff !important",
  fontFamily: `${T.font} !important`, fontWeight: "700 !important",
  fontSize: ".70rem !important", padding: "4px 12px !important",
  borderRadius: "50px !important", boxShadow: "0 2px 8px rgba(255,107,53,.25) !important",
  textTransform: "uppercase",
}
const permBtnQuitSx = {
  display: "flex !important", alignItems: "center !important", gap: "4px !important",
  background: "rgba(239,68,68,.06) !important", color: "#EF4444 !important",
  fontFamily: `${T.font} !important`, fontWeight: "700 !important",
  fontSize: ".70rem !important", padding: "4px 12px !important",
  borderRadius: "50px !important", border: "1px solid rgba(239,68,68,.15) !important",
  textTransform: "uppercase",
}

const pageBtn = {
  width: 34, height: 34, borderRadius: "10px",
  background: "#fff", color: T.t3, border: "1px solid rgba(0,0,0,0.06)",
  fontFamily: T.font, fontSize: ".80rem", fontWeight: 600,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", minWidth: "unset", p: 0,
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
  transition: "all .2s ease",
  "&:hover": { background: T.go, color: "#fff", borderColor: "transparent", boxShadow: T.glow, transform: "translateY(-1px)" },
}
const pageBtnOn = {
  ...pageBtn,
  background: `${T.go} !important`, color: "#fff !important", borderColor: "transparent !important",
  boxShadow: `${T.glow} !important`, transform: "translateY(-1px) !important",
}

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: T.o1 },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: T.o2, opacity: 1 },
  "& .MuiSwitch-track": { backgroundColor: "rgba(0,0,0,.10)", opacity: 1 },
}

/* ═══════════════════════════════════════════════════════════════
   SVG ILLUSTRATIONS — Premium 3D Style
   ═══════════════════════════════════════════════════════════════ */

/* 3D Shield Icon — next to title */
const ShieldIcon3D = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sh3dGrad" x1="8" y1="4" x2="48" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF8F5E" />
        <stop offset="0.5" stopColor="#FF6B35" />
        <stop offset="1" stopColor="#FF3D00" />
      </linearGradient>
      <linearGradient id="sh3dInner" x1="14" y1="10" x2="42" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(255,255,255,0.35)" />
        <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
      </linearGradient>
      <filter id="sh3dShadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#FF6B35" floodOpacity="0.30" />
      </filter>
      <filter id="sh3dGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" />
      </filter>
    </defs>
    <circle cx="28" cy="30" r="22" fill="#FF6B35" opacity="0.08" filter="url(#sh3dGlow)" />
    <path d="M28 6L10 15V29C10 40 17.5 48.5 28 51C38.5 48.5 46 40 46 29V15L28 6Z" fill="url(#sh3dGrad)" filter="url(#sh3dShadow)" />
    <path d="M28 10L14 18V29C14 38 20 45 28 47.5C36 45 42 38 42 29V18L28 10Z" fill="url(#sh3dInner)" />
    <path d="M22 28.5L26 32.5L34 24.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="44" cy="12" r="4" fill="#FF8F5E" opacity="0.6" />
    <circle cx="10" cy="44" r="3" fill="#FFB088" opacity="0.5" />
  </svg>
)

/* Floating Orb component */
const FloatingOrb = ({ size, color, top, left, right, bottom, delay = "0s", anim = "sa-role-orb1" }) => (
  <Box sx={{
    position: "absolute", top, left, right, bottom,
    width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 35% 35%, ${color}88, ${color})`,
    boxShadow: `0 4px 12px ${color}44`,
    animation: `${anim} ${3 + Math.random() * 2}s ease-in-out infinite ${delay}`,
    zIndex: 1,
  }} />
)

/* 3D Pie Chart Visual */
const PieChart3D = ({ total, active, inactive }) => {
  const t = total || 1
  const activeDeg = (active / t) * 360
  const inactiveDeg = (inactive / t) * 360
  const remainDeg = 360 - activeDeg - inactiveDeg
  return (
    <Box sx={{ position: "relative", width: 180, height: 155, flexShrink: 0 }}>
      {/* Ground shadow */}
      <Box sx={{
        position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)",
        width: 110, height: 18, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)",
      }} />
      {/* 3D Cylinder side (depth) */}
      <Box sx={{
        position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)",
        width: 128, height: 128, borderRadius: "50%",
        background: `conic-gradient(
          #D85A2A 0deg, #D85A2A ${activeDeg}deg,
          #16803B ${activeDeg}deg, #16803B ${activeDeg + inactiveDeg}deg,
          #C9A94E ${activeDeg + inactiveDeg}deg, #C9A94E 360deg
        )`,
        transform: "translateX(-50%) perspective(500px) rotateX(55deg) translateY(8px)",
        opacity: 0.45,
        filter: "blur(1px)",
      }} />
      {/* Main 3D donut */}
      <Box sx={{
        position: "absolute", top: 18, left: "50%", transform: "translateX(-50%) perspective(500px) rotateX(55deg)",
        width: 128, height: 128, borderRadius: "50%",
        background: `conic-gradient(
          #FF8F5E 0deg, #FF6B35 ${activeDeg}deg,
          #86EFAC ${activeDeg}deg, #22C55E ${activeDeg + inactiveDeg}deg,
          #FDE68A ${activeDeg + inactiveDeg}deg, #FEF3C7 360deg
        )`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.10), inset 0 -4px 12px rgba(0,0,0,0.06), inset 0 4px 8px rgba(255,255,255,0.3)",
        "&::after": {
          content: '""', position: "absolute",
          top: "25%", left: "25%", width: "50%", height: "50%",
          borderRadius: "50%", background: T.bg3,
          boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.04)",
        },
      }} />
      {/* Top highlight ring */}
      <Box sx={{
        position: "absolute", top: 18, left: "50%", transform: "translateX(-50%) perspective(500px) rotateX(55deg)",
        width: 128, height: 128, borderRadius: "50%",
        border: "1.5px solid rgba(255,255,255,0.25)",
        pointerEvents: "none",
      }} />
      {/* Floating orbs */}
      <FloatingOrb size={16} color="#FF6B35" top={5} right={8} delay="0s" anim="sa-role-orb1" />
      <FloatingOrb size={10} color="#22C55E" top={15} left={10} delay="0.6s" anim="sa-role-orb2" />
      <FloatingOrb size={8} color="#F59E0B" bottom={15} right={2} delay="1.2s" anim="sa-role-orb3" />
      <FloatingOrb size={6} color="#FF8F5E" bottom={30} left={20} delay="0.3s" anim="sa-role-orb1" />
    </Box>
  )
}

/* Empty State Illustration - 3D Shields + Floating Elements */
const EmptyIllustration = () => (
  <Box sx={{ position: "relative", width: 300, height: 180, mx: "auto", mb: 2, mt: 1 }}>
    {/* Warm ambient glow */}
    <Box sx={{
      position: "absolute", top: "50%", left: "45%", transform: "translate(-50%, -50%)",
      width: 280, height: 280, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,140,60,0.13) 0%, rgba(255,107,53,0.05) 45%, transparent 70%)",
      filter: "blur(18px)", pointerEvents: "none",
    }} />

    {/* Left shield - orange 3D shield with green checkmark */}
    <Box sx={{
      position: "absolute", left: 30, top: "50%", transform: "translateY(-55%)",
      animation: "sa-role-bob 4s ease-in-out infinite", zIndex: 2,
      filter: "drop-shadow(0 14px 28px rgba(255,107,53,0.35))",
    }}>
      <svg width="100" height="110" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="emSh1" x1="10" y1="5" x2="90" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD4A8" />
            <stop offset="0.25" stopColor="#FFB87A" />
            <stop offset="0.55" stopColor="#FF8F5E" />
            <stop offset="0.8" stopColor="#FF6B35" />
            <stop offset="1" stopColor="#E85D0A" />
          </linearGradient>
          <linearGradient id="emSh1HL" x1="20" y1="10" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(255,255,255,0.50)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id="emSh1Glow" cx="40%" cy="35%" r="45%">
            <stop stopColor="rgba(255,220,180,0.35)" />
            <stop offset="1" stopColor="rgba(255,220,180,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="103" rx="32" ry="6" fill="rgba(0,0,0,0.08)" />
        <path d="M50 8L14 24V52C14 76 28 93 50 100C72 93 86 76 86 52V24L50 8Z" fill="url(#emSh1)" />
        <path d="M50 15L22 28V52C22 72 34 86 50 92C66 86 78 72 78 52V28L50 15Z" fill="url(#emSh1HL)" />
        <path d="M50 15L22 28V52C22 72 34 86 50 92C66 86 78 72 78 52V28L50 15Z" fill="url(#emSh1Glow)" />
        <path d="M50 8L14 24V52C14 76 28 93 50 100" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" />
        <circle cx="50" cy="55" r="22" fill="rgba(34,197,94,0.18)" />
        <path d="M39 55L47 63L63 47" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M39 55L47 63L63 47" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    </Box>

    {/* Center green plus circle */}
    <Box sx={{
      position: "absolute", left: "50%", top: "46%", transform: "translate(-50%, -50%)",
      width: 44, height: 44, borderRadius: "50%",
      background: "linear-gradient(145deg, #6EE7A0, #22C55E, #16A34A)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 26px rgba(34,197,94,0.45), inset 0 2px 4px rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.12)",
      zIndex: 4,
      animation: "sa-role-float 3s ease-in-out infinite 0.3s",
      border: "2.5px solid rgba(255,255,255,0.35)",
    }}>
      <Plus size={20} color="#fff" strokeWidth={3} />
    </Box>

    {/* Right document icon with shield */}
    <Box sx={{
      position: "absolute", right: 25, top: "50%", transform: "translateY(-52%)",
      animation: "sa-role-bob 4s ease-in-out infinite 0.6s", zIndex: 2,
      filter: "drop-shadow(0 12px 24px rgba(180,120,60,0.25))",
    }}>
      <svg width="85" height="100" viewBox="0 0 85 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="emDoc1" x1="5" y1="5" x2="80" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF8F0" />
            <stop offset="0.4" stopColor="#FFE8D0" />
            <stop offset="1" stopColor="#FFDBB8" />
          </linearGradient>
          <linearGradient id="emDocSh" x1="28" y1="38" x2="58" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB87A" />
            <stop offset="0.5" stopColor="#FF8F5E" />
            <stop offset="1" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
        <ellipse cx="42" cy="95" rx="28" ry="5" fill="rgba(0,0,0,0.06)" />
        <rect x="8" y="5" width="68" height="84" rx="14" fill="url(#emDoc1)" stroke="rgba(255,180,120,0.25)" strokeWidth="1.2" />
        <rect x="8" y="5" width="68" height="38" rx="14" fill="rgba(255,255,255,0.2)" />
        <rect x="20" y="18" width="34" height="5" rx="2.5" fill="rgba(255,107,53,0.18)" />
        <rect x="20" y="28" width="46" height="3.5" rx="1.8" fill="rgba(0,0,0,0.06)" />
        <rect x="20" y="36" width="38" height="3.5" rx="1.8" fill="rgba(0,0,0,0.05)" />
        <path d="M42 50L30 56V66C30 73 35 78 42 80C49 78 54 73 54 66V56L42 50Z" fill="url(#emDocSh)" />
        <path d="M37 63L40 66L47 59" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>

    {/* Floating orbs */}
    <FloatingOrb size={16} color="#FF8F5E" top={0} right={55} delay="0s" anim="sa-role-orb1" />
    <FloatingOrb size={12} color="#FFB87A" top={15} left={10} delay="0.8s" anim="sa-role-orb2" />
    <FloatingOrb size={10} color="#FF6B35" bottom={15} right={15} delay="1.2s" anim="sa-role-orb3" />
    <FloatingOrb size={8} color="#22C55E" bottom={35} left={55} delay="0.5s" anim="sa-role-orb1" />
    <FloatingOrb size={6} color="#FFD4B0" top={30} right={10} delay="1.5s" anim="sa-role-orb2" />
  </Box>
)

/* Floating Modal Preview - decorative card for empty state */
const FloatingModalPreview = ({ onOpen }) => (
  <Box onClick={onOpen} sx={{
    width: 270, borderRadius: "20px", flexShrink: 0,
    background: "rgba(255,255,255,0.97)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(255,107,53,0.10), inset 0 1px 2px rgba(255,255,255,0.8)",
    overflow: "hidden",
    transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)",
    transition: "all .4s ease",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.6)",
    "&:hover": {
      transform: "perspective(1000px) rotateY(-2deg) rotateX(1deg) translateY(-4px)",
      boxShadow: "0 30px 70px rgba(0,0,0,0.15), 0 12px 32px rgba(255,107,53,0.14), inset 0 1px 2px rgba(255,255,255,0.8)",
    },
  }}>
    <Box sx={{ p: "16px 20px 12px", borderBottom: "1.5px solid rgba(0,0,0,0.05)" }}>
      <Typography sx={{ fontFamily: `${T.fontH} !important`, fontSize: "1.02rem !important", fontWeight: "800 !important", color: `${T.t1} !important` }}>
        Crear Nuevo Rol
      </Typography>
    </Box>
    <Box sx={{ p: "14px 20px 12px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "6px" }}>
        <User size={11} color={T.t3} />
        <Typography sx={{ fontFamily: T.font, fontSize: ".72rem", fontWeight: 600, color: T.t3 }}>Nombre de Rol</Typography>
      </Box>
      <Box sx={{
        border: "1.5px solid rgba(0,0,0,0.07)", borderRadius: "11px",
        p: "9px 14px", mb: "16px", background: "rgba(250,248,246,0.7)",
      }}>
        <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t4, fontStyle: "italic" }}>Ej. Supervisor</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "7px", mb: "12px" }}>
        <Box sx={{ width: 18, height: 18, borderRadius: "6px", background: "rgba(34,197,94,.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={11} color={T.green} />
        </Box>
        <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 700, color: T.t1 }}>Permisos</Typography>
      </Box>
      {[
        { label: "Panel Administrativo", icon: <Settings size={10} color={T.o1} /> },
        { label: "Panel de Productos", icon: <ShoppingCart size={10} color={T.o1} /> },
      ].map(item => (
        <Box key={item.label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "10px", p: "4px 0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Box sx={{ width: 24, height: 24, borderRadius: "7px", background: "rgba(255,107,53,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.icon}
            </Box>
            <Typography sx={{ fontFamily: T.font, fontSize: ".78rem", fontWeight: 500, color: T.t2 }}>{item.label}</Typography>
          </Box>
          <Box sx={{ width: 38, height: 21, borderRadius: 11, background: "linear-gradient(135deg, #3B82F6, #2563EB)", position: "relative", boxShadow: "0 2px 8px rgba(59,130,246,.30)" }}>
            <Box sx={{ width: 17, height: 17, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, right: 2, boxShadow: "0 1px 4px rgba(0,0,0,.15)" }} />
          </Box>
        </Box>
      ))}
    </Box>
    <Box sx={{
      display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px",
      p: "12px 20px", borderTop: "1.5px solid rgba(0,0,0,0.04)",
    }}>
      <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", fontWeight: 500, color: T.t3, cursor: "pointer" }}>Cancelar</Typography>
      <Box sx={{
        background: T.go, borderRadius: "10px", padding: "7px 16px",
        display: "flex", alignItems: "center", gap: "5px",
        boxShadow: "0 4px 14px rgba(255,107,53,.30)",
      }}>
        <Plus size={11} color="#fff" strokeWidth={3} />
        <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", fontWeight: 700, color: "#fff" }}>Crear Rol</Typography>
      </Box>
    </Box>
  </Box>
)

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const RolesList = () => {
  const [roles, setRoles] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({ nombre: "", estado: true, permisos: [], nombrePersonalizado: "", isAdminRole: false })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [formErrors, setFormErrors] = useState({ nombre: "", nombrePersonalizado: "", permisos: "" })
  const [isFormValid, setIsFormValid] = useState(false)

  const fetchRoles = async () => {
    try {
      const r = await api.get("/api/roles")
      setRoles(Array.isArray(r.data) ? r.data : [])
    } catch (e) {
      console.error("Error al cargar roles:", e)
      setRoles([])
    }
  }
  useEffect(() => { fetchRoles() }, [])

  const checkRoleExists = (name, excludeId = null) =>
    roles.some(r => r.nombre.toLowerCase() === name.toLowerCase() && r._id !== excludeId)

  const initializePermissions = () =>
    availableModules.map(modulo => ({
      modulo,
      acciones: { crear: false, leer: modulo === "dashboard", actualizar: false, eliminar: false },
    }))

  const handleOpen = role => {
    setFormErrors({ nombre: "", nombrePersonalizado: "", permisos: "" })
    if (role) {
      let permisos = (role.permisos || []).map(p =>
        typeof p === "string"
          ? { modulo: p, acciones: { crear: false, leer: true, actualizar: false, eliminar: false } }
          : { modulo: p.modulo, acciones: { ...p.acciones } }
      )
      const existing = permisos.map(p => p.modulo)
      availableModules.filter(m => !existing.includes(m)).forEach(m =>
        permisos.push({ modulo: m, acciones: { crear: false, leer: false, actualizar: false, eliminar: false } })
      )
      const isAdmin = role.nombre.toLowerCase() === "administrador"
      setFormData({ nombre: role.nombre, estado: isAdmin ? true : role.estado, permisos, nombrePersonalizado: "", isAdminRole: isAdmin })
      setEditingId(role._id); setIsFormValid(true)
    } else {
      setFormData({ nombre: "", estado: true, permisos: initializePermissions(), nombrePersonalizado: "", isAdminRole: false })
      setEditingId(null); setIsFormValid(false)
    }
    setOpen(true); setTabValue(0)
  }
  const handleClose = () => {
    setOpen(false)
    setEditingId(null)
    setFormData({ nombre: "", estado: true, permisos: [], nombrePersonalizado: "", isAdminRole: false })
    setFormErrors({ nombre: "", nombrePersonalizado: "", permisos: "" })
    setTabValue(0)
    setIsFormValid(false)
  }

  const handleDetails = role => {
    const permisos = (role.permisos || []).map(p =>
      typeof p === "string"
        ? { modulo: p, acciones: { crear: false, leer: true, actualizar: false, eliminar: false } }
        : { modulo: p.modulo, acciones: { ...p.acciones } }
    )
    setSelectedRole({ ...role, permisos }); setDetailsOpen(true); setTabValue(0)
  }
  const handleCloseDetails = () => setDetailsOpen(false)

  const handleChange = e => {
    const { name, value } = e.target
    const parsed = name === "estado" ? value === "true" || value === true : value
    setFormData({ ...formData, [name]: parsed })
    validateField(name, parsed)
  }

  const validateField = (name, value) => {
    let err = ""
    if (name === "nombre") { if (editingId) return true }
    else if (name === "nombrePersonalizado") {
      if (!editingId && (!value || !value.trim())) err = "El nombre del rol es obligatorio"
      else if (value && value.length < 6) err = "El nombre debe tener al menos 6 caracteres"
      else if (value && value.length > 30) err = "El nombre no puede exceder 30 caracteres"
      else if (value && !/^[a-zA-Z\u00e1\u00e9\u00ed\u00f3\u00fa\u00c1\u00c9\u00cd\u00d3\u00da\u00f1\u00d1\s]+$/.test(value)) err = "Solo letras y espacios"
      else if (value && checkRoleExists(value.trim(), editingId)) err = "Ya existe un rol con este nombre"
    }
    setFormErrors(p => ({ ...p, [name]: err }))
    setTimeout(() => validateForm({ ...formData, [name]: value }), 0)
    return !err
  }

  const validateForm = data => {
    if (!editingId) {
      const nombreOk =
        !!data.nombrePersonalizado && data.nombrePersonalizado.trim() !== "" &&
        data.nombrePersonalizado.length >= 6 && data.nombrePersonalizado.length <= 30 &&
        /^[a-zA-Z\u00e1\u00e9\u00ed\u00f3\u00fa\u00c1\u00c9\u00cd\u00d3\u00da\u00f1\u00d1\s]+$/.test(data.nombrePersonalizado) &&
        !checkRoleExists(data.nombrePersonalizado.trim(), editingId)
      const permisosOk = (data.permisos || []).some(p =>
        p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar
      )
      setIsFormValid(nombreOk && permisosOk)
    } else {
      setIsFormValid(true)
    }
  }

  const handlePermissionChange = (idx, accion, checked) => {
    if (formData.isAdminRole) return
    const up = formData.permisos.map((p, i) =>
      i === idx ? { ...p, acciones: { ...p.acciones, [accion]: checked } } : p
    )
    setFormData(prev => ({ ...prev, permisos: up }))
    validateForm({ ...formData, permisos: up })
  }
  const handleSelectAllForModule = idx => {
    if (formData.isAdminRole) return
    const up = formData.permisos.map((p, i) => {
      if (i !== idx) return p
      return { ...p, acciones: p.modulo === "dashboard"
        ? { crear: false, leer: true, actualizar: false, eliminar: false }
        : { crear: true, leer: true, actualizar: true, eliminar: true }
      }
    })
    setFormData(prev => ({ ...prev, permisos: up }))
    validateForm({ ...formData, permisos: up })
  }
  const handleRemoveAllForModule = idx => {
    if (formData.isAdminRole) return
    const up = formData.permisos.map((p, i) =>
      i === idx ? { ...p, acciones: { crear: false, leer: false, actualizar: false, eliminar: false } } : p
    )
    setFormData(prev => ({ ...prev, permisos: up }))
    validateForm({ ...formData, permisos: up })
  }
  const handleSelectAllPermissions = () => {
    if (formData.isAdminRole) return
    const updated = {
      ...formData, permisos: formData.permisos.map(p => ({
        ...p,
        acciones: p.modulo === "dashboard"
          ? { crear: false, leer: true, actualizar: false, eliminar: false }
          : { crear: true, leer: true, actualizar: true, eliminar: true }
      }))
    }
    setFormData(updated); validateForm(updated)
  }
  const handleRemoveAllPermissions = () => {
    if (formData.isAdminRole) return
    const updated = { ...formData, permisos: formData.permisos.map(p => ({ ...p, acciones: { crear: false, leer: false, actualizar: false, eliminar: false } })) }
    setFormData(updated); validateForm(updated)
  }

  const prepareFormData = () => {
    const f = { ...formData }
    if (!editingId) { f.nombre = f.nombrePersonalizado || ""; f.estado = true }
    if (f.nombre.toLowerCase() === "administrador") f.estado = true
    delete f.nombrePersonalizado; delete f.isAdminRole
    return f
  }

  const handleSubmit = async () => {
    const tempErrors = {}
    if (!editingId) {
      if (!formData.nombrePersonalizado || !formData.nombrePersonalizado.trim())
        tempErrors.nombrePersonalizado = "El nombre del rol es obligatorio"
      else if (checkRoleExists(formData.nombrePersonalizado.trim(), editingId))
        tempErrors.nombrePersonalizado = "Ya existe un rol con este nombre"
      const tienePermisos = (formData.permisos || []).some(p =>
        p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar
      )
      if (!tienePermisos) tempErrors.permisos = "Debes asignar al menos un permiso."
    }
    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors)
      if (tempErrors.nombrePersonalizado?.includes("Ya existe"))
        await swalFire({ ...SWD, icon: "error", title: "Rol duplicado", text: `Ya existe un rol con el nombre "${formData.nombrePersonalizado}".` })
      else if (tempErrors.permisos)
        await swalFire({ ...SWW, icon: "warning", title: "Sin permisos", text: "Debes asignar al menos un permiso antes de crear el rol." })
      else
        await swalFire({ ...SWD, icon: "error", title: "Error", text: Object.values(tempErrors)[0] })
      return
    }
    try {
      const d = prepareFormData()
      const wasEditing = !!editingId
      if (wasEditing) {
        await api.put(`/api/roles/${editingId}`, d)
      } else {
        await api.post("/api/roles", d)
      }
      handleClose()
      await fetchRoles()
      setTimeout(() => {
        swalFire({ ...SW, icon: "success", title: wasEditing ? "Rol actualizado" : "Rol creado", text: wasEditing ? "Los cambios se guardaron correctamente." : "El nuevo rol se registr\u00f3 correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      }, 300)
    } catch (e) {
      let msg = "Ocurri\u00f3 un error al guardar el rol."
      if (e.response?.data?.msg) {
        const s = e.response.data.msg
        msg = (s.includes("ya existe") || s.includes("duplicate"))
          ? `No se puede ${editingId ? "actualizar" : "crear"} el rol porque ya existe uno con ese nombre.` : s
      }
      await swalFire({ ...SWD, icon: "error", title: "Error al guardar", text: msg })
    }
  }

  const handleDelete = async id => {
    const role = roles.find(r => r._id === id)
    if (role?.nombre.toLowerCase() === "administrador") {
      await swalFire({ ...SW, icon: "error", title: "Acci\u00f3n no permitida", text: "El rol de administrador no puede ser eliminado" })
      return
    }
    if (role?.estado) {
      await swalFire({ ...SWW, icon: "warning", title: "Rol activo", text: "No puedes eliminar un rol activo. Desact\u00edvalo primero." })
      return
    }
    const r = await swalFire({ ...SWD, title: "\u00bfEliminar rol?", text: "Esta acci\u00f3n no se puede deshacer", icon: "question", showCancelButton: true, confirmButtonText: "S\u00ed, eliminar", cancelButtonText: "Cancelar" })
    if (r.isConfirmed) {
      try {
        await api.delete(`/api/roles/${id}`)
        await fetchRoles()
        setTimeout(() => {
          swalFire({ ...SW, icon: "success", title: "Eliminado", text: "El rol se elimin\u00f3 correctamente.", timer: 2000, timerProgressBar: true, showConfirmButton: false })
        }, 300)
      } catch (e) {
        await swalFire({ ...SW, icon: "error", title: "Error", text: e.response?.data?.msg || "Error al eliminar." })
      }
    }
  }

  /* helpers */
  const getInitials = name => name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2)
  const formatPermissions = permisos => {
    if (!permisos || permisos.length === 0) return "Sin permisos"
    if (typeof permisos[0] === "string") return permisos.join(", ")
    const mods = permisos.filter(p => p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar).map(p => p.modulo)
    return mods.length > 0 ? mods.join(", ") : "Sin permisos"
  }
  const countActivePermissions = permisos => {
    if (!permisos || permisos.length === 0) return 0
    if (typeof permisos[0] === "string") return permisos.length
    return permisos.filter(p => p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar).length
  }
  const handleTabChange = (_, v) => setTabValue(v)

  const getModuleIcon = m => {
    const c = T.o1
    switch (m) {
      case "dashboard": return <Settings size={14} color={c} />
      case "usuarios": return <User size={14} color={c} />
      case "roles": return <Shield size={14} color={c} />
      case "categorias": return <Tag size={14} color={c} />
      case "productos": return <ShoppingCart size={14} color={c} />
      case "pedidos": return <ClipboardList size={14} color={c} />
      case "reportes": return <BarChart3 size={14} color={c} />
      default: return <Settings size={14} color={c} />
    }
  }

  /* Permission Groups for modal toggle UI */
  const permissionGroups = [
    { label: "Panel Administrativo", modules: ["dashboard", "usuarios", "roles"], icon: <Settings size={16} color={T.o1} /> },
    { label: "Panel de Productos", modules: ["categorias", "productos"], icon: <ShoppingCart size={16} color={T.o1} /> },
    { label: "Panel de Operaciones", modules: ["pedidos", "reportes"], icon: <ClipboardList size={16} color={T.o1} /> },
  ]
  const isGroupEnabled = (permisos, modules) =>
    modules.some(mod => {
      const perm = permisos.find(p => p.modulo === mod)
      return perm && Object.values(perm.acciones).some(v => v)
    })
  const handleGroupToggle = (modules, checked) => {
    if (formData.isAdminRole) return
    const up = formData.permisos.map(p => {
      if (!modules.includes(p.modulo)) return p
      if (checked) {
        return { ...p, acciones: p.modulo === "dashboard"
          ? { crear: false, leer: true, actualizar: false, eliminar: false }
          : { crear: true, leer: true, actualizar: true, eliminar: true }
        }
      } else {
        return { ...p, acciones: { crear: false, leer: false, actualizar: false, eliminar: false } }
      }
    })
    setFormData(prev => ({ ...prev, permisos: up }))
    validateForm({ ...formData, permisos: up })
  }

  const totalActive = roles.filter(r => r.estado).length
  const totalInactive = roles.filter(r => !r.estado).length
  const filtered = roles.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const pctRegistered = roles.length > 0 ? 100 : 0
  const pctActive = roles.length > 0 ? Math.round((totalActive / roles.length) * 100) : 0

  /* ─── Dialog Header (Premium) ─── */
  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box sx={{
      background: T.go, p: "20px 26px", display: "flex", alignItems: "center", gap: "14px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative orbs in header */}
      <Box sx={{ position: "absolute", top: -10, right: 30, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <Box sx={{ position: "absolute", bottom: -8, right: 80, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <Box sx={{
        width: 42, height: 42, borderRadius: "14px", background: "rgba(255,255,255,.18)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        backdropFilter: "blur(8px)",
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2)",
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

  /* ─── Permission Panel (granular editing) ─── */
  const PermPanel = ({ moduleNames }) => (
    <Box sx={{ pt: 1 }}>
      {formData.permisos.filter(p => moduleNames.includes(p.modulo)).map(permiso => {
        const idx = formData.permisos.findIndex(p => p.modulo === permiso.modulo)
        const isAdmin = formData.isAdminRole
        return (
          <Box key={permiso.modulo} sx={{
            borderRadius: "16px", p: "16px 18px", mb: "12px",
            background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,0,0,0.04)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.6)",
            transition: "all .25s", "&:hover": { boxShadow: "0 6px 20px rgba(255,107,53,.06), inset 0 1px 2px rgba(255,255,255,0.6)" },
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: T.font, fontSize: ".87rem", fontWeight: 700, color: T.t1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)", boxShadow: "0 2px 6px rgba(255,107,53,0.08)" }}>{getModuleIcon(permiso.modulo)}</Box>
                {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
              </Box>
              {!isAdmin && (
                <Box sx={{ display: "flex", gap: "6px" }}>
                  <Button size="small" sx={permBtnSelSx} onClick={() => handleSelectAllForModule(idx)}><CheckCircle size={10} /> Sel.</Button>
                  <Button size="small" sx={permBtnQuitSx} onClick={() => handleRemoveAllForModule(idx)}><XCircle size={10} /> Quitar</Button>
                </Box>
              )}
            </Box>
            <Divider sx={{ my: "8px", background: "rgba(0,0,0,0.04)" }} />
            <Box>
              {permiso.modulo === "dashboard" ? (
                <Box sx={{ display: "flex", alignItems: "center", p: "8px 12px", borderRadius: "12px", background: "#fff", border: "1px solid rgba(0,0,0,0.04)", mb: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
                  <Eye style={{ color: T.o1, marginRight: 10 }} size={15} />
                  <Typography sx={{ flex: 1, fontFamily: T.font, fontSize: ".85rem", fontWeight: 600, color: T.t2 }}>Acceso</Typography>
                  <FormControlLabel control={<Switch checked={permiso.acciones.leer} onChange={e => handlePermissionChange(idx, "leer", e.target.checked)} disabled={isAdmin} size="small" sx={switchSx} />} label="" />
                </Box>
              ) : (
                [
                  { key: "crear", label: "Crear", icon: <PenTool size={14} /> },
                  { key: "leer", label: "Ver", icon: <Eye size={14} /> },
                  { key: "actualizar", label: "Editar", icon: <Edit2 size={14} /> },
                  { key: "eliminar", label: "Eliminar", icon: <Trash2 size={14} /> },
                ].map(a => (
                  <Box key={a.key} sx={{ display: "flex", alignItems: "center", p: "8px 12px", borderRadius: "12px", background: "#fff", border: "1px solid rgba(0,0,0,0.04)", mb: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
                    <Box sx={{ color: a.key === "eliminar" ? T.r1 : T.o1, mr: "10px" }}>{a.icon}</Box>
                    <Typography sx={{ flex: 1, fontFamily: T.font, fontSize: ".85rem", fontWeight: 600, color: T.t2 }}>{a.label}</Typography>
                    <FormControlLabel control={<Switch checked={permiso.acciones[a.key]} onChange={e => handlePermissionChange(idx, a.key, e.target.checked)} disabled={isAdmin} size="small" sx={switchSx} />} label="" />
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )

  /* ─── Details Permission Panel ─── */
  const DetPermPanel = ({ moduleNames }) => (
    <Box sx={{ pt: 1 }}>
      {selectedRole?.permisos.filter(p => moduleNames.includes(p.modulo)).map((permiso, i) => (
        <Box key={i} sx={{
          borderRadius: "16px", p: "16px 18px", mb: "12px",
          background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,0,0,0.04)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.6)",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: T.font, fontSize: ".87rem", fontWeight: 700, color: T.t1, mb: "12px" }}>
            <Box sx={{ width: 28, height: 28, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)", boxShadow: "0 2px 6px rgba(255,107,53,0.08)" }}>{getModuleIcon(permiso.modulo)}</Box>
            {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
          </Box>
          <Divider sx={{ my: 1, background: "rgba(0,0,0,0.04)" }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px", mt: 1 }}>
            {permiso.modulo === "dashboard" ? (
              <Box sx={{
                fontFamily: T.font, fontWeight: 700, fontSize: ".73rem", padding: "6px 14px", borderRadius: "20px", m: "3px",
                display: "inline-flex", alignItems: "center", gap: "5px",
                ...(permiso.acciones.leer
                  ? { background: "rgba(255,107,53,.08)", color: T.o1, border: `1px solid ${T.border2}`, boxShadow: "0 2px 6px rgba(255,107,53,0.06)" }
                  : { background: "rgba(0,0,0,.02)", color: T.t3, border: "1px solid rgba(0,0,0,0.04)" }),
              }}><Eye size={11} /> Acceso</Box>
            ) : (
              [
                { key: "crear", label: "Crear", icon: <PenTool size={10} /> },
                { key: "leer", label: "Ver", icon: <Eye size={10} /> },
                { key: "actualizar", label: "Editar", icon: <Edit2 size={10} /> },
                { key: "eliminar", label: "Eliminar", icon: <Trash2 size={10} /> },
              ].map(a => (
                <Box key={a.key} sx={{
                  fontFamily: T.font, fontWeight: 700, fontSize: ".73rem", padding: "6px 14px", borderRadius: "20px", m: "3px",
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  ...(permiso.acciones[a.key]
                    ? { background: "rgba(255,107,53,.08)", color: T.o1, border: `1px solid ${T.border2}`, boxShadow: "0 2px 6px rgba(255,107,53,0.06)" }
                    : { background: "rgba(0,0,0,.02)", color: T.t3, border: "1px solid rgba(0,0,0,0.04)" }),
                }}>{a.icon} {a.label}</Box>
              ))
            )}
          </Box>
        </Box>
      ))}
    </Box>
  )

  /* ══════════════════════════════════════════════════════════════
     RENDER — Premium Soft-3D Dashboard
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
        {/* Subtle background orbs */}
        <Box sx={{ position: "absolute", top: -30, right: 200, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,107,53,0.03)", filter: "blur(20px)" }} />
        <Box sx={{ position: "absolute", bottom: -20, left: 100, width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.03)", filter: "blur(18px)" }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: "18px", position: "relative", zIndex: 2 }}>
          <Box sx={{ animation: "sa-role-bob 4s ease-in-out infinite" }}>
            <ShieldIcon3D />
          </Box>
          <Box>
            <Typography sx={{
              fontFamily: `${T.fontH} !important`, fontSize: "1.40rem !important",
              fontWeight: "800 !important", color: `${T.t1} !important`, lineHeight: 1.2,
            }}>
              Gesti\u00f3n de Roles
            </Typography>
            <Typography sx={{ fontSize: ".86rem", color: T.t3, mt: "5px", fontFamily: T.font }}>
              Administra los roles y permisos del sistema
            </Typography>
          </Box>
        </Box>

        {/* 3D Pie Chart on the right */}
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <PieChart3D total={roles.length} active={totalActive} inactive={totalInactive} />
        </Box>
      </Box>

      {/* ═══ STATS CARDS ═══ */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px", mb: "18px" }}>
        {[
          { label: "TOTAL", value: roles.length, desc: "registrados", color: T.o1, gradBg: "linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(255,61,0,0.02) 100%)", icon: <Shield size={18} /> },
          { label: "ACTIVOS", value: totalActive, desc: "habilitados", color: T.green, gradBg: "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(22,163,74,0.02) 100%)", icon: <CheckCircle size={18} /> },
          { label: "INACTIVOS", value: totalInactive, desc: "desactivados", color: T.r1, gradBg: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(220,38,38,0.02) 100%)", icon: <XCircle size={18} /> },
        ].map((stat, i) => (
          <Box key={i} sx={{
            background: stat.gradBg, borderRadius: T.rad, p: "20px 22px",
            boxShadow: T.neu, border: "1px solid rgba(255,255,255,0.8)",
            transition: "all .3s ease", position: "relative", overflow: "hidden",
            "&:hover": {
              boxShadow: T.neuHover,
              transform: "translateY(-3px)",
            },
            "&::before": {
              content: '""', position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: `linear-gradient(90deg, ${stat.color}66, ${stat.color})`,
              borderRadius: "20px 20px 0 0",
            },
          }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px" }}>
              <Typography sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1px", textTransform: "uppercase", color: stat.color,
              }}>
                {stat.label}
              </Typography>
              <Box sx={{
                width: 38, height: 38, borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: stat.color, background: `${stat.color}12`,
                boxShadow: `0 4px 12px ${stat.color}15, inset 0 1px 2px rgba(255,255,255,0.6)`,
              }}>
                {stat.icon}
              </Box>
            </Box>
            <Typography sx={{
              fontFamily: T.font, fontSize: "1.80rem", fontWeight: 800,
              lineHeight: 1, color: T.t1, mb: "5px",
            }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".76rem", fontWeight: 500, color: T.t3 }}>
              {stat.desc}
            </Typography>
          </Box>
        ))}

        {/* 4th card: Legend */}
        <Box sx={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.80) 100%)",
          borderRadius: T.rad, p: "20px 22px",
          boxShadow: T.neu, border: "1px solid rgba(255,255,255,0.8)",
          transition: "all .3s ease",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px",
          "&:hover": { boxShadow: T.neuHover, transform: "translateY(-3px)" },
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.o1, boxShadow: `0 2px 6px ${T.o1}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>
              Registrados
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>
              {pctRegistered} %
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: T.green, boxShadow: `0 2px 6px ${T.green}44` }} />
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 600, color: T.t2 }}>
              Habilitados
            </Typography>
            <Typography sx={{ fontFamily: T.font, fontSize: ".82rem", fontWeight: 800, color: T.t1, ml: "auto" }}>
              {pctActive} %
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══ TOOLBAR ═══ */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "18px", gap: "14px", flexWrap: "wrap" }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "#fff", border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: "14px", p: "10px 16px", minWidth: 260,
          boxShadow: T.neu,
          transition: "all .25s",
          "&:focus-within": { borderColor: T.o1, boxShadow: `${T.neu}, 0 0 0 3px rgba(255,107,53,.08)` },
        }}>
          <Search size={17} color={T.t3} strokeWidth={2} />
          <input style={{
            border: "none", outline: "none", background: "transparent",
            fontFamily: T.font, fontSize: "0.86rem", color: T.t1, width: "100%",
          }} placeholder="Buscar rol..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0) }} />
        </Box>
        <button
          onClick={() => handleOpen(null)}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
            color: "#fff", fontFamily: T.font, fontWeight: 700,
            fontSize: ".84rem", padding: "11px 26px", borderRadius: 14,
            border: "none", cursor: "pointer",
            boxShadow: "0 6px 20px rgba(255,107,53,.30)",
            transition: "all .25s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,107,53,.40)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,107,53,.30)" }}
        >
          + Crear Rol
        </button>
      </Box>

      {/* ═══ TABLE CONTAINER ═══ */}
      <Box sx={{
        background: "#fff", borderRadius: T.rad3, p: "6px",
        boxShadow: T.shCard, border: "1px solid rgba(0,0,0,0.03)",
        mb: "18px",
      }}>
        {/* Column headers */}
        {paginated.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 140px", px: "24px", py: "14px" }}>
            {["ROL", "PERMISOS", "ESTADO", "ACCIONES"].map(h => (
              <Typography key={h} sx={{
                fontFamily: T.font, fontSize: ".68rem", fontWeight: 700,
                letterSpacing: "1.2px", textTransform: "uppercase", color: T.t4,
                ...(h === "ESTADO" || h === "ACCIONES" ? { textAlign: "center" } : {}),
              }}>{h}</Typography>
            ))}
          </Box>
        )}

        {/* Card rows */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", p: paginated.length > 0 ? "0 6px 6px" : "0" }}>
          {paginated.map((role, i) => (
            <Box key={role._id} sx={{
              display: "grid", gridTemplateColumns: "2fr 2fr 1fr 140px",
              alignItems: "center", p: "16px 22px",
              borderRadius: T.rad2,
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,248,246,0.95) 100%)",
              border: "1px solid rgba(0,0,0,0.03)",
              boxShadow: "4px 4px 16px rgba(0,0,0,0.03), -2px -2px 10px rgba(255,255,255,0.8)",
              transition: "all .3s ease",
              animation: `sa-role-fadeUp 0.4s ease ${i * 0.05}s both`,
              "&:hover": {
                boxShadow: "6px 6px 24px rgba(0,0,0,0.06), -4px -4px 16px rgba(255,255,255,0.9), 0 0 0 1px rgba(255,107,53,0.08)",
                transform: "translateY(-2px)",
              },
            }}>
              {/* Role info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <Box sx={{
                  width: 42, height: 42, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, background: avGrad(i),
                  fontFamily: T.font, fontWeight: 700, fontSize: ".82rem", color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,.12), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)",
                }}>
                  {getInitials(role.nombre)}
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: T.font, fontWeight: 700, fontSize: ".90rem", color: T.t1, lineHeight: 1.3 }}>
                    {role.nombre}
                  </Typography>
                  <Typography sx={{ fontFamily: T.font, fontSize: ".68rem", color: T.t4 }}>
                    #{role._id?.slice(-6).toUpperCase()}
                  </Typography>
                </Box>
              </Box>

              {/* Permissions */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  background: "rgba(255,107,53,0.06)", borderRadius: "8px",
                  padding: "4px 10px",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                }}>
                  <Shield size={12} color={T.o1} />
                  <Typography sx={{ fontFamily: T.font, fontSize: ".73rem", fontWeight: 700, color: T.o1 }}>
                    {countActivePermissions(role.permisos)}
                  </Typography>
                </Box>
                <Tooltip title={formatPermissions(role.permisos)} placement="top">
                  <Typography sx={{
                    fontFamily: T.font, fontSize: ".80rem", color: T.t3,
                    maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {formatPermissions(role.permisos)}
                  </Typography>
                </Tooltip>
              </Box>

              {/* Status */}
              <Box sx={{ textAlign: "center" }}>
                <Box component="span" sx={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "5px 14px", borderRadius: "22px",
                  fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                  ...(role.estado
                    ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "inset 0 1px 3px rgba(34,197,94,0.06)" }
                    : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "inset 0 1px 3px rgba(239,68,68,0.06)" }),
                }}>
                  <Box sx={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: role.estado ? "#22C55E" : "#EF4444",
                    boxShadow: role.estado ? "0 0 6px rgba(34,197,94,0.5)" : "0 0 6px rgba(239,68,68,0.5)",
                  }} />
                  {role.estado ? "Activo" : "Inactivo"}
                </Box>
              </Box>

              {/* Actions */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: "7px" }}>
                <Tooltip title="Editar" placement="top">
                  <Button sx={btnEdit} onClick={() => handleOpen(role)}><Edit2 size={15} strokeWidth={2} /></Button>
                </Tooltip>
                <Tooltip title="Ver detalles" placement="top">
                  <Button sx={btnView} onClick={() => handleDetails(role)}><Eye size={15} strokeWidth={2} /></Button>
                </Tooltip>
                {role.nombre.toLowerCase() !== "administrador"
                  ? (
                    <Tooltip title={role.estado ? "Desactiva el rol para eliminar" : "Eliminar"} placement="top">
                      <Button sx={{ ...btnDel, ...(role.estado ? { opacity: 0.35, cursor: "not-allowed" } : {}) }}
                        onClick={() => handleDelete(role._id)}>
                        <Trash2 size={15} strokeWidth={2} />
                      </Button>
                    </Tooltip>
                  )
                  : <Box sx={{ width: 36 }} />
                }
              </Box>
            </Box>
          ))}
        </Box>

        {/* Empty state */}
        {paginated.length === 0 && (
          <Box sx={{
            borderRadius: T.rad, p: "40px 30px 50px",
            background: "radial-gradient(ellipse at 35% 55%, rgba(255,160,80,0.10) 0%, rgba(255,107,53,0.04) 35%, rgba(255,255,255,0.3) 65%, rgba(250,248,246,0.6) 100%)",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "30px",
            minHeight: 360, flexWrap: "wrap",
          }}>
            {/* Warm ambient glow particles */}
            <Box sx={{ position: "absolute", top: 20, left: "18%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,60,0.07) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", bottom: 15, right: "22%", width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)", filter: "blur(15px)", pointerEvents: "none" }} />

            {/* Left side - illustration + text */}
            <Box sx={{ textAlign: "center", flex: "0 1 auto", maxWidth: 420, position: "relative", zIndex: 2 }}>
              <EmptyIllustration />
              <Typography sx={{
                fontFamily: T.fontH, fontSize: "1.20rem", fontWeight: 800,
                color: T.t1, mb: "10px",
              }}>
                {roles.length === 0 ? "No hay roles registrados." : "Sin resultados"}
              </Typography>
              <Typography sx={{
                fontFamily: T.font, fontSize: ".88rem", color: T.t3,
                maxWidth: 380, mx: "auto", mb: "24px", lineHeight: 1.6,
              }}>
                {roles.length === 0
                  ? "Crea un nuevo rol para administrar los permisos del sistema."
                  : "No se encontraron roles que coincidan con la b\u00fasqueda."}
              </Typography>
              {roles.length === 0 && (
                <button
                  onClick={() => handleOpen(null)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 9,
                    background: "linear-gradient(135deg, #FF6B35, #FF3D00)",
                    color: "#fff", fontFamily: T.font, fontWeight: 700,
                    fontSize: ".84rem", padding: "12px 28px", borderRadius: 14,
                    border: "none", cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(255,107,53,.30)",
                    transition: "all .25s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,107,53,.40)" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,107,53,.30)" }}
                >
                  + Crear Rol
                </button>
              )}
            </Box>

            {/* Right side - floating modal preview */}
            {roles.length === 0 && <FloatingModalPreview onOpen={() => handleOpen(null)} />}
          </Box>
        )}
      </Box>

      {/* ═══ PAGINATION ═══ */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "10px",
      }}>
        <Typography sx={{ fontFamily: T.font, fontSize: ".80rem", color: T.t3 }}>
          Mostrando {filtered.length === 0 ? 0 : page * rowsPerPage + 1}\u2013{Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length} roles
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

      {/* ═══ MODAL CREAR / EDITAR — Glassmorphism ═══ */}
      <Dialog open={open} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") handleClose() }}
        fullWidth maxWidth="sm"
        sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(12px)", background: "rgba(15,23,42,.20)" } }}
        slotProps={{ paper: { sx: {
          borderRadius: "22px !important",
          boxShadow: "0 30px 70px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.1) !important",
          border: "1px solid rgba(255,255,255,0.15)",
          width: "90%", maxWidth: 540,
          background: "rgba(255,255,255,0.96) !important",
          backdropFilter: "blur(20px) saturate(180%)",
          overflow: "hidden",
        } } }}>

        <DlgHdr
          icon={editingId ? <Edit2 size={18} color="#fff" /> : <Shield size={18} color="#fff" />}
          title={editingId ? "Editar Rol" : "Crear Nuevo Rol"}
          sub={editingId ? "Modifica los datos del rol seleccionado" : "Completa los campos para registrar un nuevo rol"}
          onClose={handleClose}
        />

        <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>

          {/* Info fields */}
          <Box sx={{ mb: 2 }}>
            {editingId ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <TextField margin="dense" label="Rol" value={formData.nombre}
                  fullWidth variant="outlined" size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
                  slotProps={{ input: { readOnly: true, startAdornment: <InputAdornment position="start"><Shield size={14} color={T.t3} /></InputAdornment> } }}
                />
                <TextField select margin="dense" label="Estado" name="estado"
                  value={formData.estado} onChange={handleChange}
                  fullWidth variant="outlined" size="small"
                  disabled={formData.isAdminRole}
                  helperText={formData.isAdminRole ? "El administrador siempre est\u00e1 activo" : ""}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Key size={14} color={T.t3} /></InputAdornment> } }}
                >
                  <MenuItem value={true}>Activo</MenuItem>
                  <MenuItem value={false}>Inactivo</MenuItem>
                </TextField>
              </Box>
            ) : (
              <TextField margin="dense" label="Nombre de Rol" name="nombrePersonalizado"
                value={formData.nombrePersonalizado || ""} onChange={handleChange}
                onBlur={e => validateField(e.target.name, e.target.value)}
                onKeyPress={e => { if (!/^[a-zA-Z\u00e1\u00e9\u00ed\u00f3\u00fa\u00c1\u00c9\u00cd\u00d3\u00da\u00f1\u00d1\s]*$/.test(e.key)) e.preventDefault() }}
                fullWidth variant="outlined" size="small"
                placeholder="Ej. Supervisor"
                error={!!formErrors.nombrePersonalizado}
                helperText={formErrors.nombrePersonalizado || "El rol se crear\u00e1 como activo por defecto"}
                required
                inputProps={{ maxLength: 30 }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", fontFamily: T.font, fontSize: ".86rem", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" } }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><User size={14} color={T.t3} /></InputAdornment> } }}
              />
            )}
          </Box>

          {/* Permisos section */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{
              display: "flex", alignItems: "center", gap: "10px",
              fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
              color: T.t1, mb: "16px", pb: "10px",
              borderBottom: "1.5px solid rgba(0,0,0,0.05)",
            }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: "9px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(34,197,94,.08)",
                boxShadow: "0 2px 6px rgba(34,197,94,0.06)",
              }}>
                <CheckCircle size={13} color={T.green} />
              </Box>
              Permisos
              {formData.isAdminRole && (
                <Box component="span" sx={{
                  ml: "auto", display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: ".70rem", fontWeight: 600, color: T.o1,
                  background: "rgba(255,107,53,.06)", border: `1px solid ${T.border2}`,
                  borderRadius: "22px", padding: "4px 12px",
                }}>
                  <Lock size={10} /> Bloqueados
                </Box>
              )}
              {!editingId && !(formData.permisos || []).some(p => p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar) && (
                <Box component="span" sx={{
                  ml: "auto", display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: ".70rem", fontWeight: 600, color: T.r1,
                  background: "rgba(239,68,68,.05)", border: "1px solid rgba(239,68,68,.12)",
                  borderRadius: "22px", padding: "4px 12px",
                }}>
                  <AlertTriangle size={10} /> M\u00ednimo un permiso
                </Box>
              )}
            </Box>

            {permissionGroups.map(group => {
              const enabled = isGroupEnabled(formData.permisos, group.modules)
              return (
                <Box key={group.label} sx={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  p: "14px 18px", borderRadius: "14px", mb: "10px",
                  background: enabled ? "rgba(255,107,53,.03)" : "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                  border: enabled ? `1.5px solid ${T.border2}` : "1.5px solid rgba(0,0,0,0.04)",
                  boxShadow: enabled
                    ? "0 4px 14px rgba(255,107,53,0.06), inset 0 1px 2px rgba(255,255,255,0.5)"
                    : "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 2px rgba(255,255,255,0.5)",
                  transition: "all .25s ease",
                  "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,0.5)" },
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Box sx={{
                      width: 34, height: 34, borderRadius: "10px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: enabled ? "rgba(255,107,53,.08)" : "rgba(0,0,0,.03)",
                      boxShadow: enabled ? "0 2px 8px rgba(255,107,53,0.08)" : "0 1px 4px rgba(0,0,0,0.02)",
                      transition: "all .25s",
                    }}>
                      {group.icon}
                    </Box>
                    <Typography sx={{ fontFamily: T.font, fontSize: ".90rem", fontWeight: 600, color: T.t1 }}>
                      {group.label}
                    </Typography>
                  </Box>
                  <Switch
                    checked={enabled}
                    onChange={e => handleGroupToggle(group.modules, e.target.checked)}
                    disabled={formData.isAdminRole}
                    sx={switchSx}
                  />
                </Box>
              )
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{
          p: "14px 26px 20px !important", background: "transparent",
          borderTop: "1px solid rgba(0,0,0,0.04)",
          display: "flex", justifyContent: "flex-end", gap: "10px",
        }}>
          <Button onClick={handleClose} sx={cancelBtnSx}>Cancelar</Button>
          <Button onClick={handleSubmit} sx={submitBtnSx} disabled={!isFormValid}>
            <CheckIcon size={14} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            {editingId ? "Actualizar Rol" : "+ Crear Rol"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ MODAL DETALLES — Glassmorphism ═══ */}
      <Dialog open={detailsOpen} onClose={(_, r) => { if (r !== "backdropClick" && r !== "escapeKeyDown") handleCloseDetails() }}
        fullWidth maxWidth="sm"
        sx={{ "& .MuiBackdrop-root": { backdropFilter: "blur(12px)", background: "rgba(15,23,42,.20)" } }}
        slotProps={{ paper: { sx: {
          borderRadius: "22px !important",
          boxShadow: "0 30px 70px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.1) !important",
          border: "1px solid rgba(255,255,255,0.15)",
          width: 600, maxWidth: "96vw",
          background: "rgba(255,255,255,0.96) !important",
          backdropFilter: "blur(20px) saturate(180%)",
          overflow: "hidden",
        } } }}>

        <DlgHdr icon={<Eye size={18} color="#fff" />} title="Detalles del Rol" sub="Informaci\u00f3n completa del rol" onClose={handleCloseDetails} />

        <DialogContent sx={{ p: "22px 26px 12px !important", background: "transparent" }}>
          {selectedRole ? (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: "10px 0 22px" }}>
                <Box sx={{
                  width: 68, height: 68, borderRadius: "50%", background: T.go,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(255,107,53,.30), inset 0 -3px 6px rgba(0,0,0,0.1), inset 0 3px 6px rgba(255,255,255,0.2)",
                  mb: "14px",
                  fontFamily: T.font, fontWeight: 800, fontSize: 24, color: "#fff",
                }}>{getInitials(selectedRole.nombre)}</Box>
                <Typography sx={{ fontFamily: `${T.fontH} !important`, fontSize: "1.20rem !important", fontWeight: "800 !important", color: `${T.t1} !important`, mb: "8px" }}>
                  {selectedRole.nombre}
                </Typography>
                <Box component="span" sx={{
                  display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px",
                  borderRadius: "22px", fontFamily: T.font, fontSize: ".73rem", fontWeight: 600,
                  ...(selectedRole.estado
                    ? { background: "rgba(34,197,94,0.08)", color: "#16A34A", boxShadow: "inset 0 1px 3px rgba(34,197,94,0.06)" }
                    : { background: "rgba(239,68,68,0.06)", color: "#DC2626", boxShadow: "inset 0 1px 3px rgba(239,68,68,0.06)" }),
                }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: selectedRole.estado ? "#22C55E" : "#EF4444", boxShadow: selectedRole.estado ? "0 0 6px rgba(34,197,94,0.5)" : "0 0 6px rgba(239,68,68,0.5)" }} />
                  {selectedRole.estado ? "Activo" : "Inactivo"}
                </Box>
              </Box>

              <Box sx={{ height: 1, background: "rgba(0,0,0,0.04)", my: "14px" }} />

              <Box sx={{
                display: "flex", alignItems: "center", gap: "10px",
                fontFamily: T.font, fontSize: ".82rem", fontWeight: 700,
                color: T.t1, mb: "14px", pb: "10px",
                borderBottom: "1.5px solid rgba(0,0,0,0.05)",
              }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,.08)", boxShadow: "0 2px 6px rgba(255,107,53,0.08)" }}>
                  <Shield size={13} color={T.o1} />
                </Box>
                Permisos por M\u00f3dulo
              </Box>

              <Tabs value={tabValue} onChange={handleTabChange} sx={{
                mb: 2,
                "& .MuiTabs-indicator": { background: T.go, height: 3, borderRadius: "3px" },
                borderBottom: "1.5px solid rgba(0,0,0,0.05)",
              }}>
                <Tab label="Sistema" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<Settings size={14} />} />
                <Tab label="Inventario" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<ShoppingCart size={14} />} />
                <Tab label="Operaciones" sx={{ fontFamily: `${T.font} !important`, fontWeight: "600 !important", fontSize: ".80rem !important", textTransform: "none !important", color: `${T.t3} !important`, "&.Mui-selected": { color: `${T.o1} !important` } }} icon={<ClipboardList size={14} />} />
              </Tabs>

              {tabValue === 0 && <DetPermPanel moduleNames={["dashboard", "usuarios", "roles"]} />}
              {tabValue === 1 && <DetPermPanel moduleNames={["categorias", "productos"]} />}
              {tabValue === 2 && <DetPermPanel moduleNames={["pedidos", "reportes"]} />}
            </>
          ) : (
            <Typography sx={{ fontFamily: T.font, color: T.t3 }}>Cargando...</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: "14px 26px 20px !important", background: "transparent",
          borderTop: "1px solid rgba(0,0,0,0.04)",
          display: "flex", justifyContent: "flex-end", gap: "10px",
        }}>
          <Button onClick={handleCloseDetails} sx={cancelBtnSx}>Cerrar</Button>
          {selectedRole && (
            <Button onClick={() => { handleCloseDetails(); handleOpen(selectedRole) }} sx={submitBtnSx}>
              <Edit2 size={13} style={{ flexShrink: 0 }} /> Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default RolesList