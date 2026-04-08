import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import Chart from "chart.js/auto"
import {
  LayoutDashboard, Package, Tag, ShoppingCart, FileText,
  Shield, Users, LogOut, ChevronLeft, ChevronRight,
  X, Menu, Bell, Search, TrendingUp, AlertCircle,
  ChevronDown, User, ShoppingBag, BarChart2,
} from "lucide-react"

// ─── API base ──────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || ""
const url = (path) => API ? `${API}${path}` : path

// ─── Inyectar estilos globales ─────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("sa-dash-style")) {
  const s = document.createElement("style")
  s.id = "sa-dash-style"
  s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.sa-root,.sa-root *,.sa-root *::before,.sa-root *::after{box-sizing:border-box;}

:root {
  --o1:#FF6B2B; --o2:#FF9A3C; --r1:#E8321A; --y1:#FFCC02;
  --bg:#F5F7FA;  --bg2:#FFFFFF; --bg3:#EEF1F5;
  --t1:#1E1E2D;  --t2:#636578; --t3:#A1A3B5;
  --go:linear-gradient(135deg,#FF6B2B,#FF9A3C);
  --gr:linear-gradient(135deg,#E8321A,#FF6B2B);
  --gy:linear-gradient(135deg,#FF9A3C,#FFCC02);
  --glass:rgba(255,107,43,0.05);
  --border:rgba(0,0,0,0.08);
  --border2:rgba(255,107,43,0.22);
  --sh:0 4px 24px rgba(0,0,0,0.06);
  --sh2:0 8px 40px rgba(0,0,0,0.10);
  --sb-w:255px; --sb-col:62px; --hdr-h:60px;
  --font:'Plus Jakarta Sans',sans-serif;
  --font-h:'Fraunces',serif;
  --ease:cubic-bezier(0.4,0,0.2,1);
}

@keyframes sa-dash-blobA {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.06)}}
@keyframes sa-dash-blobB {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-22px,28px) scale(0.94)}}
@keyframes sa-dash-cardUp  {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes sa-dash-shimmer {from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes sa-dash-pipPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,43,0.7)}60%{box-shadow:0 0 0 5px rgba(255,107,43,0)}}
@keyframes sa-dash-sweep   {0%{width:0;margin-left:0}55%{width:60%}100%{width:0;margin-left:100%}}
@keyframes sa-dash-dropIn  {from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes sa-dash-orbFloat{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-6px,8px) scale(1.08)}}
@keyframes sa-dash-logoBob {0%,100%{transform:translateY(0);box-shadow:0 4px 20px rgba(255,107,43,0.5)}50%{transform:translateY(-3px);box-shadow:0 8px 28px rgba(232,50,26,0.5)}}
@keyframes sa-dash-sparkUp {from{opacity:0;height:0}to{opacity:1}}
@keyframes sa-dash-fIn     {from{opacity:0}to{opacity:1}}
@keyframes sa-dash-loadBar {0%{width:0;margin-left:0}55%{width:65%}100%{width:0;margin-left:100%}}

/* ROOT */
.sa-root {
  display:flex; height:100vh; overflow:hidden;
  font-family:var(--font); color:var(--t1);
  background:var(--bg); position:relative;
}
.sa-root::before,.sa-root::after {
  content:''; position:fixed; border-radius:50%;
  filter:blur(100px); pointer-events:none; z-index:0;
}
.sa-root::before {
  width:460px; height:460px;
  background:rgba(255,107,43,0.06);
  top:-130px; left:-80px;
  animation:sa-dash-blobA 18s ease-in-out infinite;
}
.sa-root::after {
  width:340px; height:340px;
  background:rgba(232,50,26,0.05);
  bottom:-70px; right:-50px;
  animation:sa-dash-blobB 14s ease-in-out infinite;
}

/* ─── SIDEBAR ─────────────────────────────────────────────────── */
.sa-sb {
  position:relative; z-index:60;
  width:var(--sb-w); height:100vh; flex-shrink:0;
  display:flex; flex-direction:column;
  background:rgba(255,255,255,0.95);
  backdrop-filter:blur(28px) saturate(180%);
  border-right:1px solid var(--border);
  transition:width 0.32s var(--ease);
  overflow:hidden;
  box-shadow:4px 0 30px rgba(0,0,0,0.04);
}
.sa-sb::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:var(--go); z-index:2;
}
.sa-sb.col { width:var(--sb-col); }

.sa-brand {
  display:flex; align-items:center; gap:11px;
  padding:19px 15px 16px; flex-shrink:0;
}
.sa-logo {
  width:38px; height:38px; flex-shrink:0; border-radius:12px;
  background:var(--go);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-h); font-weight:900; font-size:18px; color:#fff;
  box-shadow:0 4px 20px rgba(255,107,43,0.50);
  animation:sa-dash-logoBob 5s ease-in-out infinite;
  position:relative; overflow:hidden;
}
.sa-logo::after {
  content:''; position:absolute; top:-5px; right:-5px;
  width:16px; height:16px; border-radius:50%;
  background:rgba(255,255,255,0.20);
}
.sa-brand-name {
  font-family:var(--font-h); font-size:17px; font-weight:900;
  color:var(--t1); letter-spacing:-0.4px;
  white-space:nowrap; overflow:hidden;
  transition:opacity 0.2s,width 0.2s;
}
.sa-sb.col .sa-brand-name { opacity:0; width:0; }

.sa-toggle {
  position:absolute; right:-12px; top:74px;
  width:24px; height:24px; border-radius:50%;
  background:#FFFFFF; border:1.5px solid var(--border2);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--t3); z-index:10;
  box-shadow:var(--sh); transition:all 0.2s;
}
.sa-toggle:hover { color:var(--o1); border-color:var(--o1); transform:scale(1.1); }

.sa-nav-scroll { flex:1; overflow-y:auto; overflow-x:hidden; padding:8px 9px; }
.sa-nav-scroll::-webkit-scrollbar { width:2px; }
.sa-nav-scroll::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

.sa-sec-lbl {
  font-size:9.5px; font-weight:700; letter-spacing:1.6px;
  text-transform:uppercase; color:var(--t3);
  padding:12px 8px 5px;
  white-space:nowrap; overflow:hidden;
  transition:opacity 0.2s;
}
.sa-sb.col .sa-sec-lbl { opacity:0; }

.sa-nav-btn {
  display:flex; align-items:center; gap:10px;
  padding:9px 10px; border-radius:11px;
  border:none; background:none;
  color:var(--t3); font-family:var(--font);
  font-size:13.5px; font-weight:500;
  width:100%; text-align:left; cursor:pointer;
  transition:all 0.17s; position:relative;
  white-space:nowrap; margin-bottom:2px;
}
.sa-nav-btn::before {
  content:''; position:absolute; left:0; top:22%; bottom:22%;
  width:3px; border-radius:0 3px 3px 0;
  background:var(--go);
  transform:scaleY(0); transform-origin:center;
  transition:transform 0.2s var(--ease);
}
.sa-nav-btn:hover { background:rgba(255,107,43,0.08); color:var(--t1); }
.sa-nav-btn.on {
  background:linear-gradient(135deg,rgba(255,107,43,0.12),rgba(232,50,26,0.06));
  color:var(--o1); font-weight:600;
}
.sa-nav-btn.on::before { transform:scaleY(1); }
.sa-nav-ico {
  width:29px; height:29px; border-radius:9px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:rgba(255,107,43,0.08); transition:background 0.17s;
}
.sa-nav-btn.on .sa-nav-ico { background:rgba(255,107,43,0.18); color:var(--o1); }
.sa-nav-btn:hover .sa-nav-ico { background:rgba(255,107,43,0.13); }
.sa-nav-ico svg { width:15px; height:15px; }
.sa-nav-txt { flex:1; overflow:hidden; transition:opacity 0.2s,width 0.2s; }
.sa-sb.col .sa-nav-txt { opacity:0; width:0; }
.sa-sb.col .sa-nav-btn { padding:9px; justify-content:center; }

/* Tooltip colapsado */
.sa-sb.col .sa-nav-btn:hover::after {
  content:attr(data-label);
  position:absolute; left:calc(100% + 11px); top:50%; transform:translateY(-50%);
  background:#FFFFFF; border:1px solid var(--border2);
  color:var(--t1); font-size:12px; font-weight:600;
  padding:5px 12px; border-radius:8px; white-space:nowrap; z-index:300;
  box-shadow:var(--sh2);
}

.sa-sb-foot { padding:11px 9px; border-top:1px solid var(--border); flex-shrink:0; }
.sa-user-pill {
  display:flex; align-items:center; gap:10px;
  padding:10px; border-radius:13px;
  background:rgba(255,107,43,0.06);
  cursor:pointer; transition:all 0.17s;
  border:1px solid transparent; overflow:hidden;
}
.sa-user-pill:hover { background:rgba(255,107,43,0.12); border-color:var(--border); }
.sa-av {
  width:33px; height:33px; border-radius:50%; flex-shrink:0;
  background:var(--go);
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; color:#fff;
  box-shadow:0 3px 14px rgba(255,107,43,0.40);
}
.sa-uname { font-size:13px; font-weight:600; color:var(--t1); white-space:nowrap; }
.sa-urole { font-size:11px; color:var(--t3); white-space:nowrap; margin-top:1px; }
.sa-sb.col .sa-uname,.sa-sb.col .sa-urole { display:none; }
.sa-sb.col .sa-user-pill { padding:8px; justify-content:center; }

/* ─── HEADER ─────────────────────────────────────────────────── */
.sa-header {
  height:var(--hdr-h); flex-shrink:0;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 22px;
  background:rgba(255,255,255,0.88);
  backdrop-filter:blur(24px) saturate(180%);
  border-bottom:1px solid var(--border);
  position:relative; z-index:40;
  box-shadow:0 2px 16px rgba(0,0,0,0.04);
}
.sa-bc { display:flex; align-items:center; gap:6px; }
.sa-bc-home { font-size:12px; color:var(--t3); }
.sa-bc-sep  { font-size:12px; color:var(--t3); }
.sa-bc-cur  { font-family:var(--font-h); font-size:15px; font-weight:700; color:var(--t1); }
.sa-hdr-l { display:flex; align-items:center; gap:14px; }
.sa-hdr-r { display:flex; align-items:center; gap:8px; }

.sa-search {
  display:flex; align-items:center; gap:8px;
  background:rgba(0,0,0,0.03); border:1px solid var(--border);
  border-radius:50px; padding:7px 14px;
  min-width:180px; transition:all 0.2s;
}
.sa-search:focus-within {
  border-color:var(--o1);
  box-shadow:0 0 0 3px rgba(255,107,43,0.12);
}
.sa-search input {
  background:none; border:none; outline:none;
  font-family:var(--font); font-size:13px; color:var(--t1); width:100%;
}
.sa-search input::placeholder { color:var(--t3); }
.sa-search-kbd {
  font-size:10px; color:var(--t3);
  background:rgba(255,107,43,0.08); border-radius:5px;
  padding:2px 6px; white-space:nowrap;
}

.sa-ico-btn {
  width:35px; height:35px; border-radius:50%;
  background:rgba(0,0,0,0.03); border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  color:var(--t2); cursor:pointer; transition:all 0.17s; position:relative;
}
.sa-ico-btn:hover { background:rgba(255,107,43,0.10); border-color:var(--border2); color:var(--o1); transform:scale(1.06); }
.sa-pip {
  position:absolute; top:8px; right:8px;
  width:6px; height:6px; border-radius:50%;
  background:var(--o1); border:1.5px solid #fff;
  animation:sa-dash-pipPulse 2s ease-in-out infinite;
}

.sa-prof-btn {
  display:flex; align-items:center; gap:8px;
  background:rgba(0,0,0,0.03); border:1px solid var(--border);
  border-radius:50px; padding:4px 12px 4px 4px;
  cursor:pointer; transition:all 0.17s; position:relative;
}
.sa-prof-btn:hover { background:rgba(255,107,43,0.08); border-color:var(--border2); }
.sa-prof-name { font-size:12.5px; font-weight:600; color:var(--t1); }
.sa-chevron   { color:var(--t3); }

.sa-drop {
  position:absolute; top:calc(100% + 9px); right:0; width:210px;
  background:rgba(255,255,255,0.98);
  backdrop-filter:blur(24px);
  border:1px solid var(--border2); border-radius:16px;
  box-shadow:var(--sh2); overflow:hidden; z-index:200;
  animation:sa-dash-dropIn 0.17s var(--ease);
}
.sa-drop::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:var(--go);
}
.sa-drop-head { padding:13px 14px 10px; border-bottom:1px solid var(--border); }
.sa-drop-name { font-size:13.5px; font-weight:700; color:var(--t1); }
.sa-drop-role { font-size:11px; color:var(--t3); margin-top:2px; }
.sa-drop-body { padding:6px; }
.sa-drop-item {
  display:flex; align-items:center; gap:9px;
  padding:9px 10px; border-radius:9px;
  color:var(--t2); font-size:13px; font-weight:600;
  cursor:pointer; border:none; background:none;
  width:100%; font-family:var(--font); text-align:left; transition:all 0.13s;
}
.sa-drop-item:hover { background:rgba(255,107,43,0.10); color:var(--o1); }
.sa-drop-item.red:hover { background:rgba(232,50,26,0.10); color:var(--r1); }
.sa-drop-div { height:1px; background:var(--border); margin:4px 0; }

.sa-menu-btn {
  display:none; width:36px; height:36px;
  background:rgba(0,0,0,0.03); border:1px solid var(--border);
  border-radius:10px; align-items:center; justify-content:center;
  cursor:pointer; color:var(--t2);
}
@media(max-width:768px){ .sa-menu-btn{display:flex} .sa-sb{display:none} }

/* ─── MAIN ────────────────────────────────────────────────────── */
.sa-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; position:relative; z-index:1; }
.sa-content { flex:1; overflow-y:auto; padding:22px; }
.sa-content::-webkit-scrollbar { width:4px; }
.sa-content::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

/* ─── DASHBOARD VIEW ─────────────────────────────────────────── */
.sa-dash-hero {
  display:flex; align-items:flex-end; justify-content:space-between;
  margin-bottom:18px; flex-wrap:wrap; gap:12px;
}
.sa-dash-h1 {
  font-family:var(--font-h); font-size:24px; font-weight:900; color:var(--t1);
  letter-spacing:-0.5px; line-height:1.1;
}
.sa-dash-h1 span { background:var(--go); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.sa-dash-sub { font-size:13px; color:var(--t3); margin-top:4px; }

/* KPI GRID */
.sa-kpi-grid {
  display:grid; grid-template-columns:repeat(4,1fr);
  gap:13px; margin-bottom:16px;
}
@media(max-width:1100px){.sa-kpi-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px) {.sa-kpi-grid{grid-template-columns:1fr}}

.sa-kpi {
  border-radius:18px; padding:18px;
  position:relative; overflow:hidden;
  border:1px solid rgba(255,107,43,0.15);
  animation:sa-dash-cardUp 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
  cursor:default; transition:transform 0.22s,box-shadow 0.22s;
}
.sa-kpi:hover { transform:translateY(-4px); box-shadow:var(--sh2); }
.sa-kpi:nth-child(1){animation-delay:.04s}
.sa-kpi:nth-child(2){animation-delay:.09s}
.sa-kpi:nth-child(3){animation-delay:.14s}
.sa-kpi:nth-child(4){animation-delay:.19s}

.kpi-orange { background:linear-gradient(145deg,rgba(255,107,43,0.10),rgba(255,154,60,0.05)); box-shadow:0 5px 26px rgba(255,107,43,0.08),inset 0 1px 0 rgba(255,255,255,0.60); }
.kpi-red    { background:linear-gradient(145deg,rgba(232,50,26,0.10),rgba(255,107,43,0.05)); box-shadow:0 5px 26px rgba(232,50,26,0.08),inset 0 1px 0 rgba(255,255,255,0.60); }
.kpi-yellow { background:linear-gradient(145deg,rgba(255,204,2,0.10),rgba(255,154,60,0.05)); box-shadow:0 5px 26px rgba(255,204,2,0.08),inset 0 1px 0 rgba(255,255,255,0.60); }
.kpi-warm   { background:linear-gradient(145deg,rgba(255,154,60,0.10),rgba(255,204,2,0.05)); box-shadow:0 5px 26px rgba(255,154,60,0.08),inset 0 1px 0 rgba(255,255,255,0.60); }

.sa-kpi::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  border-radius:18px 18px 0 0;
}
.kpi-orange::before { background:var(--go); }
.kpi-red::before    { background:var(--gr); }
.kpi-yellow::before { background:var(--gy); }
.kpi-warm::before   { background:linear-gradient(135deg,#FF9A3C,#FFCC02); }

.sa-kpi-orb {
  position:absolute; top:-40px; right:-40px;
  width:120px; height:120px; border-radius:50%;
  filter:blur(32px); opacity:0.40; pointer-events:none;
  animation:sa-dash-orbFloat 6s ease-in-out infinite;
}
.sa-kpi-top  { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
.sa-kpi-ico  {
  width:40px; height:40px; border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 14px rgba(0,0,0,0.12);
}
.kpi-orange .sa-kpi-ico { background:var(--go); }
.kpi-red    .sa-kpi-ico { background:var(--gr); }
.kpi-yellow .sa-kpi-ico { background:var(--gy); }
.kpi-warm   .sa-kpi-ico { background:linear-gradient(135deg,#FF9A3C,#FFCC02); }
.sa-kpi-ico svg { width:19px; height:19px; color:#fff; }

.sa-kpi-tag {
  font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px;
  display:flex; align-items:center; gap:3px;
}
.sa-kpi-tag.up   { background:rgba(0,212,130,0.16); color:#00c97a; }
.sa-kpi-tag.neu  { background:rgba(255,107,43,0.14); color:var(--o2); }

.sa-kpi-val {
  font-family:var(--font-h); font-size:29px; font-weight:900; color:var(--t1);
  letter-spacing:-1px; line-height:1;
}
.sa-kpi-val.loading {
  font-size:14px; font-weight:600; color:var(--t3);
  background:linear-gradient(90deg,rgba(255,107,43,0.1) 25%,rgba(255,107,43,0.22) 50%,rgba(255,107,43,0.1) 75%);
  background-size:200%;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  animation:sa-dash-shimmer 1.5s infinite;
}
.sa-kpi-lbl { font-size:12px; color:var(--t3); margin-top:5px; font-weight:500; }

/* Sparkline */
.sa-sparkline { display:flex; align-items:flex-end; gap:2px; height:22px; margin-top:11px; }
.sa-spark-bar {
  flex:1; border-radius:2px; min-height:3px; opacity:0.40;
  transition:opacity 0.2s;
}
.sa-kpi:hover .sa-spark-bar { opacity:0.80; }
.kpi-orange .sa-spark-bar { background:var(--o1); }
.kpi-red    .sa-spark-bar { background:var(--r1); }
.kpi-yellow .sa-spark-bar { background:var(--y1); }
.kpi-warm   .sa-spark-bar { background:var(--o2); }

/* CHARTS GRID */
.sa-charts { display:grid; grid-template-columns:1.55fr 1fr; gap:13px; margin-bottom:13px; }
@media(max-width:900px){.sa-charts{grid-template-columns:1fr}}

.sa-charts-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:13px; }
@media(max-width:900px){.sa-charts-3{grid-template-columns:1fr}}

/* CARD */
.sa-card {
  background:rgba(255,255,255,0.92);
  backdrop-filter:blur(20px) saturate(160%);
  border:1px solid var(--border);
  border-radius:18px; padding:18px;
  position:relative; overflow:hidden;
  box-shadow:0 4px 20px rgba(0,0,0,0.05);
  animation:sa-dash-cardUp 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.22s both;
  transition:box-shadow 0.22s;
}
.sa-card:hover { box-shadow:0 8px 38px rgba(255,107,43,0.12); }
.sa-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:2.5px;
  border-radius:18px 18px 0 0;
}
.sa-card.orange::before { background:var(--go); }
.sa-card.red::before    { background:var(--gr); }
.sa-card.yellow::before { background:var(--gy); }
.sa-card.warm::before   { background:linear-gradient(135deg,#FF9A3C,#FFCC02); }

.sa-card-hd {
  display:flex; align-items:flex-start; justify-content:space-between;
  margin-bottom:14px; flex-wrap:wrap; gap:8px;
}
.sa-card-title { font-family:var(--font-h); font-size:14px; font-weight:700; color:var(--t1); }
.sa-card-sub   { font-size:11.5px; color:var(--t3); margin-top:2px; }
.sa-badge {
  font-size:11px; font-weight:600; padding:4px 11px; border-radius:20px;
  background:rgba(255,107,43,0.12); color:var(--o1);
  border:1px solid rgba(255,107,43,0.18);
}
.sa-legend   { display:flex; gap:11px; flex-wrap:wrap; }
.sa-leg      { display:flex; align-items:center; gap:5px; font-size:11.5px; color:var(--t2); font-weight:500; }
.sa-leg-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

.sa-chart-wrap         { position:relative; }
.sa-chart-wrap.h240    { height:240px; }
.sa-chart-wrap.h200    { height:200px; }
.sa-chart-wrap.h180    { height:180px; }

/* Donut */
.sa-donut-box { position:relative; height:180px; display:flex; align-items:center; justify-content:center; }
.sa-donut-mid { position:absolute; text-align:center; pointer-events:none; }
.sa-donut-num { font-family:var(--font-h); font-size:26px; font-weight:900; color:var(--t1); line-height:1; }
.sa-donut-lbl { font-size:11px; color:var(--t3); margin-top:3px; font-weight:500; }

/* Status rows */
.sa-stat-rows { display:flex; flex-direction:column; gap:8px; margin-top:13px; }
.sa-stat-row  { display:flex; align-items:center; gap:8px; }
.sa-sw { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.sa-sn { flex:1; font-size:12.5px; color:var(--t2); font-weight:500; }
.sa-sv { font-size:13px; font-weight:700; color:var(--t1); }
.sa-sp { font-size:11px; color:var(--t3); min-width:32px; text-align:right; }
.sa-prog { height:3px; background:rgba(255,107,43,0.08); border-radius:3px; overflow:hidden; margin-top:3px; }
.sa-prog-fill { height:100%; border-radius:3px; transition:width 1.4s cubic-bezier(0.22,0.61,0.36,1); }

/* Activity */
.sa-activity { display:flex; flex-direction:column; gap:1px; }
.sa-act-row {
  display:flex; align-items:center; gap:10px;
  padding:9px 0; border-bottom:1px solid rgba(255,107,43,0.06);
  transition:all 0.15s; cursor:pointer; border-radius:8px;
}
.sa-act-row:last-child { border-bottom:none; }
.sa-act-row:hover { background:rgba(255,107,43,0.06); padding-left:8px; padding-right:8px; margin:0 -8px; }
.sa-act-ico {
  width:33px; height:33px; border-radius:10px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.sa-act-ico svg { width:14px; height:14px; }
.sa-act-details { flex:1; min-width:0; }
.sa-act-lbl  { font-size:13px; font-weight:600; color:var(--t1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sa-act-time { font-size:11px; color:var(--t3); margin-top:2px; }
.sa-act-badge { font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; flex-shrink:0; }
.badge-ok   { background:rgba(0,200,120,0.14); color:#00c97a; }
.badge-pend { background:rgba(255,204,2,0.16); color:#ccaa00; }
.badge-err  { background:rgba(232,50,26,0.14); color:var(--r1); }

/* Mobile overlay */
.sa-mob-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.55);
  backdrop-filter:blur(6px); z-index:80; animation:sa-dash-fIn 0.2s ease;
}
.sa-mob-sb {
  position:fixed; top:0; left:0; bottom:0; width:275px;
  background:rgba(255,255,255,0.98);
  backdrop-filter:blur(28px);
  border-right:1px solid var(--border2);
  z-index:90; display:flex; flex-direction:column;
  transform:translateX(-100%); transition:transform 0.3s var(--ease);
  box-shadow:6px 0 40px rgba(0,0,0,0.10);
}
.sa-mob-sb.open { transform:translateX(0); }
.sa-mob-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:17px 14px; border-bottom:1px solid var(--border);
}
.sa-mob-close {
  width:30px; height:30px; border-radius:9px;
  background:rgba(255,107,43,0.08); border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--t2); transition:all 0.15s;
}
.sa-mob-close:hover { background:rgba(255,107,43,0.16); color:var(--o1); }
.sa-mob-body { flex:1; overflow-y:auto; padding:9px 8px; }
.sa-mob-foot { padding:9px 8px; border-top:1px solid var(--border); }

/* Loading */
.sa-loading {
  position:fixed; inset:0;
  background:var(--bg);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px;
}
.sa-load-box { display:flex; align-items:center; gap:13px; }
.sa-load-mark {
  width:50px; height:50px; border-radius:15px;
  background:var(--go);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-h); font-weight:900; font-size:22px; color:#fff;
  box-shadow:0 8px 32px rgba(255,107,43,0.50),0 0 0 4px rgba(255,107,43,0.14);
}
.sa-load-name {
  font-family:var(--font-h); font-size:24px; font-weight:900;
  background:var(--go); -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.sa-load-track { width:180px; height:3px; background:rgba(255,107,43,0.12); border-radius:3px; overflow:hidden; }
.sa-load-bar { height:100%; background:var(--go); border-radius:3px; animation:sa-dash-loadBar 1.6s ease-in-out infinite; }

/* SweetAlert overrides */
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

// ─── SweetAlert config ──────────────────────────────────────────
const SW = {
  customClass: { popup:"sa-dash-pop", title:"sa-dash-ttl", htmlContainer:"sa-dash-bod", confirmButton:"sa-dash-ok", cancelButton:"sa-dash-cn" },
  buttonsStyling: false,
}

// ─── Spark data por módulo ──────────────────────────────────────
const SPARK = {
  productos:  [40,52,48,65,60,72,68,80,74,88,83,100],
  pedidos:    [55,62,50,72,68,80,76,85,79,90,87,100],
  categorias: [30,42,55,45,60,58,66,52,68,63,70,80],
  usuarios:   [60,65,70,67,75,80,77,84,80,88,91,100],
}

// ─── Etiquetas módulos ──────────────────────────────────────────
const MOD_LABELS = {
  dashboard: "Dashboard",
  productos: "Productos",
  categorias: "Categorías",
  pedidos: "Pedidos",
  reportes: "Reportes",
  roles: "Roles",
  usuarios: "Usuarios",
}

// ─── Estructura de navegación ───────────────────────────────────
const NAV = [
  {
    sec: "Principal",
    items: [{ id:"dashboard", label:"Dashboard", icon:LayoutDashboard }],
  },
  {
    sec: "Gestión",
    items: [
      { id:"productos",  label:"Productos",   icon:Package       },
      { id:"categorias", label:"Categorías",  icon:Tag           },
      { id:"pedidos",    label:"Pedidos",     icon:ShoppingCart  },
    ],
  },
  {
    sec: "Administración",
    items: [
      { id:"usuarios",  label:"Usuarios",  icon:Users  },
      { id:"roles",     label:"Roles",     icon:Shield },
      { id:"reportes",  label:"Reportes",  icon:FileText },
    ],
  },
]

// ─── Sparkline (fuera del componente para identidad estable) ───
const Sparkline = ({ sparkKey }) => {
  const vals = SPARK[sparkKey] || []
  const max  = Math.max(...vals)
  return (
    <div className="sa-sparkline">
      {vals.map((v,i) => (
        <div key={i} className="sa-spark-bar" style={{ height:`${Math.round(v/max*100)}%` }}/>
      ))}
    </div>
  )
}

// ─── KPI cards config (fuera del componente) ────────────────────
const kpiCards = [
  { key:"productos",  label:"Productos",   variant:"kpi-orange", icon:Package,      orb:"#FF6B2B", tag:"Catálogo",   tagCls:"neu", spark:"productos"  },
  { key:"pedidos",    label:"Pedidos",      variant:"kpi-red",    icon:ShoppingCart, orb:"#E8321A", tag:"Total",      tagCls:"up",  spark:"pedidos"     },
  { key:"categorias", label:"Categorías",   variant:"kpi-yellow", icon:Tag,          orb:"#FFCC02", tag:"Activas",    tagCls:"neu", spark:"categorias"  },
  { key:"usuarios",   label:"Usuarios Reg.",variant:"kpi-warm",   icon:Users,        orb:"#FF9A3C", tag:"Registrados",tagCls:"up",  spark:"usuarios"    },
]

// ─── Helpers ────────────────────────────────────────────────────
const getUserFromToken = () => {
  const raw = localStorage.getItem("usuario")
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()

  const [user,            setUser]            = useState(null)
  const [selectedModule,  setSelectedModule]  = useState(
    () => localStorage.getItem("sa-mod") || "dashboard"
  )
  const [open,            setOpen]            = useState(true)
  const [showDrop,        setShowDrop]        = useState(false)
  const [mobileOpen,      setMobileOpen]      = useState(false)
  const [kpis,            setKpis]            = useState({
    productos: null, pedidos: null, categorias: null, usuarios: null,
  })
  const [dashData,        setDashData]        = useState(null)

  const chartRefs = {
    ventas:     useRef(null),
    pedidosPie: useRef(null),
    ingresos:   useRef(null),
    topProd:    useRef(null),
  }
  const chartInst = useRef({})

  // ── Autenticación ──
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { replace: true })
      return
    }
    const u = getUserFromToken()
    if (u) setUser(u)
  }, [navigate])

  // ── Guardar módulo ──
  useEffect(() => {
    localStorage.setItem("sa-mod", selectedModule)
  }, [selectedModule])

  // ── Cerrar dropdown al click fuera ──
  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest(".sa-prof-btn") && !e.target.closest(".sa-drop"))
        setShowDrop(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  // ── Bloquear botón atrás ──
  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname)
    const h = () => {
      if (localStorage.getItem("token"))
        window.history.pushState(null, "", window.location.pathname)
    }
    window.addEventListener("popstate", h)
    return () => window.removeEventListener("popstate", h)
  }, [])

  // ── Fetch KPIs ──
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem("token")
    const fetchCount = async (path, key) => {
      try {
        const r = await axios.get(url(path), { headers: { Authorization: `Bearer ${token}` } })
        const data = r.data
        const count = Array.isArray(data) ? data.length : (data?.total ?? "—")
        setKpis(p => ({ ...p, [key]: count }))
        return Array.isArray(data) ? data : []
      } catch { setKpis(p => ({ ...p, [key]: "—" })); return [] }
    }
    ;(async () => {
      const [prods, peds, cats, users] = await Promise.all([
        fetchCount("/api/productos",  "productos"),
        fetchCount("/api/pedidos",    "pedidos"),
        fetchCount("/api/categorias", "categorias"),
        fetchCount("/api/usuarios",   "usuarios"),
      ])
      setDashData({ productos: prods, pedidos: peds, categorias: cats, usuarios: users })
    })().catch(() => {})
  }, [user])

  // ── Destruir charts al salir del dashboard ──
  useEffect(() => {
    return () => {
      Object.values(chartInst.current).forEach(c => c?.destroy())
      chartInst.current = {}
    }
  }, [])

  // ── Charts ──
  useEffect(() => {
    if (selectedModule !== "dashboard") return
    // Limpiar charts previos antes de crear nuevos
    Object.values(chartInst.current).forEach(c => c?.destroy())
    chartInst.current = {}
    const t = setTimeout(() => renderCharts(), 200)
    return () => clearTimeout(t)
  }, [selectedModule, dashData])

  const renderCharts = () => {
    Object.values(chartInst.current).forEach(c => c?.destroy())
    chartInst.current = {}

    const grid  = "rgba(0,0,0,0.06)"
    const tick  = "#A1A3B5"
    const tip   = {
      backgroundColor: "rgba(255,255,255,0.98)",
      titleColor: "#1E1E2D", bodyColor: "#636578",
      borderColor: "rgba(0,0,0,0.10)", borderWidth: 1,
      padding: 11, cornerRadius: 11, usePointStyle: true,
    }

    // Ventas / pedidos por mes
    if (chartRefs.ventas.current) {
      const ctx = chartRefs.ventas.current.getContext("2d")
      const g1 = ctx.createLinearGradient(0,0,0,240)
      g1.addColorStop(0,"rgba(255,107,43,0.30)"); g1.addColorStop(1,"rgba(255,107,43,0)")
      const g2 = ctx.createLinearGradient(0,0,0,240)
      g2.addColorStop(0,"rgba(255,204,2,0.24)"); g2.addColorStop(1,"rgba(255,204,2,0)")

      chartInst.current.ventas = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
          datasets: [
            { label:"Pedidos",   data:[14,22,18,28,24,32,36,40,30,27,34,38],
              backgroundColor:g1, borderColor:"#FF6B2B",
              borderWidth:2.5, tension:0.44, fill:true,
              pointBackgroundColor:"#FF6B2B", pointBorderColor:"#FFFFFF",
              pointBorderWidth:2, pointRadius:4, pointHoverRadius:7 },
            { label:"Productos creados", data:[5,8,6,12,10,14,16,18,10,9,12,15],
              backgroundColor:g2, borderColor:"#FFCC02",
              borderWidth:2.5, tension:0.44, fill:true,
              pointBackgroundColor:"#FFCC02", pointBorderColor:"#FFFFFF",
              pointBorderWidth:2, pointRadius:4, pointHoverRadius:7 },
          ],
        },
        options: {
          responsive:true, maintainAspectRatio:false,
          interaction:{ mode:"index", intersect:false },
          plugins:{ legend:{ display:false }, tooltip:{ ...tip } },
          scales:{
            y:{ beginAtZero:true, grid:{ color:grid },
                ticks:{ color:tick, font:{ size:11 }, padding:8 }, border:{ display:false } },
            x:{ grid:{ display:false }, ticks:{ color:tick, font:{ size:11 }, padding:8 }, border:{ display:false } },
          },
          animation:{ duration:1400, easing:"easeOutCubic" },
        },
      })
    }

    // Pedidos por estado (donut)
    if (chartRefs.pedidosPie.current) {
      const ctx = chartRefs.pedidosPie.current.getContext("2d")
      const peds = dashData?.pedidos || []
      const pendiente  = peds.filter(p => p.estado === "pendiente").length  || 8
      const completado = peds.filter(p => p.estado === "completado").length || 15
      const cancelado  = peds.filter(p => p.estado === "cancelado").length  || 3

      chartInst.current.pedidosPie = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Pendientes","Completados","Cancelados"],
          datasets: [{ data:[pendiente,completado,cancelado],
            backgroundColor:["#FFCC02","#FF6B2B","#E8321A"],
            borderColor:"#FFFFFF", borderWidth:5, hoverOffset:12 }],
        },
        options: {
          responsive:true, maintainAspectRatio:false, cutout:"75%",
          plugins:{ legend:{ display:false }, tooltip:{ ...tip,
            callbacks:{ label:(c)=>{
              const t = c.dataset.data.reduce((a,b)=>a+b,0)
              return `${c.label}: ${c.parsed} (${Math.round(c.parsed/t*100)}%)`
            }}}},
          animation:{ animateRotate:true, animateScale:true, duration:1800 },
        },
      })
    }

    // Ingresos por mes (barras)
    if (chartRefs.ingresos.current) {
      const ctx = chartRefs.ingresos.current.getContext("2d")
      const labels = ["Ene","Feb","Mar","Abr","May","Jun"]
      const vals   = [380000,420000,510000,470000,590000,640000]
      const palette = ["#FF6B2B","#E8321A","#FF9A3C","#FFCC02","#FF6B2B","#FF9A3C"]
      const grads = vals.map((_,i) => {
        const g = ctx.createLinearGradient(0,0,0,200)
        g.addColorStop(0, palette[i]); g.addColorStop(1, palette[i]+"44")
        return g
      })

      chartInst.current.ingresos = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets:[{ label:"Ingresos ($)", data:vals,
          backgroundColor:grads, borderRadius:9, borderSkipped:false,
          barPercentage:0.60, categoryPercentage:0.70 }] },
        options: {
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{ display:false }, tooltip:{ ...tip,
            callbacks:{ label:(c)=>`$${c.parsed.y.toLocaleString("es-CO")}` }}},
          scales:{
            y:{ beginAtZero:true, grid:{ color:grid }, border:{ display:false },
                ticks:{ color:tick, callback: v => "$"+Intl.NumberFormat("es-CO",{notation:"compact"}).format(v), font:{ size:11 }, padding:8 } },
            x:{ grid:{ display:false }, border:{ display:false }, ticks:{ color:tick, font:{ size:11 }, padding:8 } },
          },
          animation:{ duration:1400, easing:"easeOutQuart" },
        },
      })
    }

    // Top productos (horizontal)
    if (chartRefs.topProd.current) {
      const ctx = chartRefs.topProd.current.getContext("2d")
      const grads = ["#FF6B2B","#E8321A","#FF9A3C","#FFCC02","#FF6B2B"].map(c => {
        const g = ctx.createLinearGradient(300,0,0,0)
        g.addColorStop(0,c); g.addColorStop(1,c+"44")
        return g
      })
      chartInst.current.topProd = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Prod. A","Prod. B","Prod. C","Prod. D","Prod. E"],
          datasets: [{ label:"Pedidos", data:[28,22,18,14,10],
            backgroundColor:grads, borderRadius:6, borderSkipped:false,
            barPercentage:0.68, categoryPercentage:0.78 }],
        },
        options: {
          indexAxis:"y",
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{ display:false }, tooltip:{ ...tip }},
          scales:{
            x:{ beginAtZero:true, grid:{ color:grid }, border:{ display:false }, ticks:{ color:tick, font:{ size:11 }, padding:8 } },
            y:{ grid:{ display:false }, border:{ display:false }, ticks:{ color:tick, font:{ size:11, weight:"600" }, padding:8 } },
          },
          animation:{ duration:1400 },
        },
      })
    }
  }

  // ── Logout ──
  const handleLogout = () => {
    Swal.fire({ ...SW, title:"¿Cerrar sesión?", text:"¿Estás seguro que deseas salir?", icon:"question",
      showCancelButton:true, confirmButtonText:"Sí, salir", cancelButtonText:"Cancelar" })
      .then(r => {
        if (r.isConfirmed) {
          localStorage.removeItem("token"); localStorage.removeItem("usuario")
          localStorage.removeItem("sa-mod")
          navigate("/login", { replace: true })
        }
      })
  }

  const selectMod = (id) => { setSelectedModule(id); setMobileOpen(false) }

  const renderDashboard = () => {
    const peds = dashData?.pedidos || []
    const pendiente  = peds.filter(p => p.estado === "pendiente").length  || 8
    const completado = peds.filter(p => p.estado === "completado").length || 15
    const cancelado  = peds.filter(p => p.estado === "cancelado").length  || 3
    const totalPeds  = pendiente + completado + cancelado

    return (
      <div>
        {/* Hero */}
        <div className="sa-dash-hero">
          <div>
            <div className="sa-dash-h1">
              <span>Hola, </span><span>{user?.nombre?.split(" ")[0] || user?.rol || "Admin"}</span><span> 👋</span>
            </div>
            <div className="sa-dash-sub">Resumen de operaciones · SurtiAntojos</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,107,43,0.07)", border:"1px solid var(--border)", borderRadius:10, padding:"7px 13px", fontSize:"12.5px", color:"var(--t2)", fontWeight:500 }}>
              <ShoppingBag size={13} color="var(--o1)"/>
              <span>{new Date().toLocaleDateString("es-CO",{ weekday:"short", day:"numeric", month:"short", year:"numeric" })}</span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="sa-kpi-grid">
          {kpiCards.map((k) => {
            const Icon = k.icon
            const val  = kpis[k.key]
            return (
              <div className={`sa-kpi ${k.variant}`} key={k.key}>
                <div className="sa-kpi-orb" style={{ background:k.orb }}/>
                <div className="sa-kpi-top">
                  <div className="sa-kpi-ico"><Icon size={19}/></div>
                  <div className={`sa-kpi-tag ${k.tagCls}`}>{k.tag}</div>
                </div>
                <div className={`sa-kpi-val ${val == null ? "loading" : ""}`}>
                  {val != null ? val : "Cargando…"}
                </div>
                <div className="sa-kpi-lbl">{k.label}</div>
                <Sparkline sparkKey={k.spark}/>
              </div>
            )
          })}
        </div>

        {/* Row 1: líneas + donut */}
        <div className="sa-charts">
          {/* Líneas */}
          <div className="sa-card orange">
            <div className="sa-card-hd">
              <div>
                <div className="sa-card-title">Pedidos & Productos — 2025</div>
                <div className="sa-card-sub">Tendencia mensual</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div className="sa-legend">
                  <div className="sa-leg"><div className="sa-leg-dot" style={{ background:"#FF6B2B" }}/><span>Pedidos</span></div>
                  <div className="sa-leg"><div className="sa-leg-dot" style={{ background:"#FFCC02" }}/><span>Productos</span></div>
                </div>
                <div className="sa-badge">12M</div>
              </div>
            </div>
            <div className="sa-chart-wrap h240"><canvas ref={chartRefs.ventas}/></div>
          </div>

          {/* Donut pedidos */}
          <div className="sa-card red">
            <div className="sa-card-hd">
              <div>
                <div className="sa-card-title">Estado de Pedidos</div>
                <div className="sa-card-sub">Distribución actual</div>
              </div>
              <div className="sa-badge" style={{ background:"rgba(232,50,26,0.12)", color:"var(--r1)", borderColor:"rgba(232,50,26,0.20)" }}>● En vivo</div>
            </div>
            <div className="sa-donut-box">
              <canvas ref={chartRefs.pedidosPie} style={{ maxWidth:170, maxHeight:170 }}/>
              <div className="sa-donut-mid">
                <div className="sa-donut-num">{totalPeds}</div>
                <div className="sa-donut-lbl">total</div>
              </div>
            </div>
            <div className="sa-stat-rows">
              {[
                { c:"#FFCC02", grad:"linear-gradient(90deg,#FFCC02,#FF9A3C)", n:"Pendientes",   v:pendiente,  pct:totalPeds?Math.round(pendiente/totalPeds*100):0  },
                { c:"#FF6B2B", grad:"linear-gradient(90deg,#FF6B2B,#FF9A3C)", n:"Completados",  v:completado, pct:totalPeds?Math.round(completado/totalPeds*100):0 },
                { c:"#E8321A", grad:"linear-gradient(90deg,#E8321A,#FF6B2B)", n:"Cancelados",   v:cancelado,  pct:totalPeds?Math.round(cancelado/totalPeds*100):0  },
              ].map((s,i) => (
                <div key={i}>
                  <div className="sa-stat-row">
                    <div className="sa-sw" style={{ background:s.c }}/>
                    <div className="sa-sn">{s.n}</div>
                    <div className="sa-sv">{s.v}</div>
                    <div className="sa-sp">{s.pct}%</div>
                  </div>
                  <div className="sa-prog">
                    <div className="sa-prog-fill" style={{ width:`${s.pct}%`, background:s.grad }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: barras + top + actividad */}
        <div className="sa-charts-3">
          {/* Ingresos barras */}
          <div className="sa-card yellow">
            <div className="sa-card-hd">
              <div>
                <div className="sa-card-title">Ingresos Estimados</div>
                <div className="sa-card-sub">Últimos 6 meses</div>
              </div>
              <div className="sa-badge" style={{ background:"rgba(255,204,2,0.12)", color:"#ccaa00", borderColor:"rgba(255,204,2,0.20)" }}>6M</div>
            </div>
            <div className="sa-chart-wrap h200"><canvas ref={chartRefs.ingresos}/></div>
          </div>

          {/* Top productos */}
          <div className="sa-card warm">
            <div className="sa-card-hd">
              <div>
                <div className="sa-card-title">Top Productos</div>
                <div className="sa-card-sub">Por nº de pedidos</div>
              </div>
            </div>
            <div className="sa-chart-wrap h200"><canvas ref={chartRefs.topProd}/></div>
          </div>

          {/* Actividad */}
          <div className="sa-card orange">
            <div className="sa-card-hd">
              <div>
                <div className="sa-card-title">Actividad Reciente</div>
                <div className="sa-card-sub">Últimas operaciones</div>
              </div>
            </div>
            <div className="sa-activity">
              {[
                { ico:<ShoppingCart size={14}/>, bg:"rgba(255,107,43,0.14)", lbl:"Pedido #1045 recibido",          time:"Hace 10 min",  badge:"Pendiente", bc:"badge-pend" },
                { ico:<Package size={14}/>,      bg:"rgba(255,204,2,0.14)",  lbl:"Producto 'Chip BBQ' agregado",   time:"Hace 45 min",  badge:"Activo",    bc:"badge-ok"   },
                { ico:<Tag size={14}/>,          bg:"rgba(232,50,26,0.12)",  lbl:"Categoría 'Snacks' actualizada", time:"Hace 2h",      badge:"OK",        bc:"badge-ok"   },
                { ico:<Users size={14}/>,        bg:"rgba(255,154,60,0.14)", lbl:"Nuevo usuario registrado",       time:"Hace 3h",      badge:"Activo",    bc:"badge-ok"   },
                { ico:<FileText size={14}/>,     bg:"rgba(255,107,43,0.10)", lbl:"Reporte mensual generado",       time:"Hace 5h",      badge:"Listo",     bc:"badge-ok"   },
              ].map((a,i) => (
                <div className="sa-act-row" key={i}>
                  <div className="sa-act-ico" style={{ background:a.bg }}>{a.ico}</div>
                  <div className="sa-act-details">
                    <div className="sa-act-lbl">{a.lbl}</div>
                    <div className="sa-act-time">{a.time}</div>
                  </div>
                  <span className={`sa-act-badge ${a.bc}`}>{a.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render módulos ──
  const renderContent = () => {
    const placeholder = (mod) => (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:12, opacity:0.5 }}>
        <BarChart2 size={40} color="var(--o1)"/>
        <div style={{ fontFamily:"var(--font-h)", fontSize:16, color:"var(--t1)" }}>Módulo {MOD_LABELS[mod]}</div>
        <div style={{ fontSize:13, color:"var(--t3)" }}>Conecta tu componente aquí</div>
      </div>
    )

    switch (selectedModule) {
      case "dashboard":  return renderDashboard()
      case "productos":  return placeholder("productos")
      case "categorias": return placeholder("categorias")
      case "pedidos":    return placeholder("pedidos")
      case "reportes":   return placeholder("reportes")
      case "roles":      return placeholder("roles")
      case "usuarios":   return placeholder("usuarios")
      default:           return renderDashboard()
    }
  }

  // ── Nav builder ──
  const buildNav = () => NAV.map(group => (
    <div key={group.sec}>
      <div className="sa-sec-lbl">{group.sec}</div>
      {group.items.map(item => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            className={`sa-nav-btn ${selectedModule === item.id ? "on" : ""}`}
            onClick={() => selectMod(item.id)}
            data-label={item.label}
          >
            <span className="sa-nav-ico"><Icon size={15}/></span>
            <span className="sa-nav-txt">{item.label}</span>
          </button>
        )
      })}
    </div>
  ))

  // ── Loading ──
  if (!user) return (
    <div className="sa-loading">
      <div className="sa-load-box">
        <div className="sa-load-mark">S</div>
        <div className="sa-load-name">SurtiAntojos</div>
      </div>
      <div className="sa-load-track"><div className="sa-load-bar"/></div>
    </div>
  )

  return (
    <>
      <div className="sa-root">
        {/* SIDEBAR */}
        <aside className={`sa-sb ${open ? "" : "col"}`}>
          <div className="sa-brand">
            <div className="sa-logo">S</div>
            <span className="sa-brand-name">SurtiAntojos</span>
          </div>
          <button className="sa-toggle" onClick={() => setOpen(o => !o)}>
            {open ? <ChevronLeft size={11}/> : <ChevronRight size={11}/>}
          </button>
          <div className="sa-nav-scroll">{buildNav()}</div>
          <div className="sa-sb-foot">
            <div className="sa-user-pill" onClick={() => selectMod("usuarios")}>
              <div className="sa-av">{user?.nombre?.[0]?.toUpperCase() || "U"}</div>
              <div>
                <div className="sa-uname">{user?.nombre || "Usuario"}</div>
                <div className="sa-urole">{user?.rol || "—"}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {mobileOpen && <div className="sa-mob-overlay" onClick={() => setMobileOpen(false)}/>}
        <div className={`sa-mob-sb ${mobileOpen ? "open" : ""}`}>
          <div className="sa-mob-hd">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="sa-logo" style={{ width:32, height:32, fontSize:14, borderRadius:10 }}>S</div>
              <span style={{ fontFamily:"var(--font-h)", fontWeight:900, fontSize:16, color:"var(--t1)" }}>SurtiAntojos</span>
            </div>
            <button className="sa-mob-close" onClick={() => setMobileOpen(false)}><X size={14}/></button>
          </div>
          <div className="sa-mob-body">{buildNav()}</div>
          <div className="sa-mob-foot">
            <div className="sa-user-pill">
              <div className="sa-av">{user?.nombre?.[0]?.toUpperCase() || "U"}</div>
              <div>
                <div className="sa-uname">{user?.nombre || "Usuario"}</div>
                <div className="sa-urole">{user?.rol || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="sa-main">
          <header className="sa-header">
            <div className="sa-hdr-l">
              <button className="sa-menu-btn" onClick={() => setMobileOpen(true)}><Menu size={17}/></button>
              <div className="sa-bc">
                <span className="sa-bc-home">Inicio</span>
                <span className="sa-bc-sep">/</span>
                <span className="sa-bc-cur">{MOD_LABELS[selectedModule] || "Dashboard"}</span>
              </div>
            </div>
            <div className="sa-hdr-r">
              <div className="sa-search">
                <Search size={13} style={{ color:"var(--t3)", flexShrink:0 }}/>
                <input placeholder="Buscar…"/>
                <span className="sa-search-kbd">⌘K</span>
              </div>
              <button className="sa-ico-btn">
                <Bell size={14}/>
                <div className="sa-pip"/>
              </button>
              <div style={{ position:"relative" }}>
                <button className="sa-prof-btn" onClick={() => setShowDrop(d => !d)}>
                  <div className="sa-av" style={{ width:27, height:27, fontSize:11 }}>
                    {user?.nombre?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="sa-prof-name">{user?.rol || "Admin"}</span>
                  <ChevronDown size={11} className="sa-chevron"/>
                </button>
                {showDrop && (
                  <div className="sa-drop">
                    <div className="sa-drop-head">
                      <div className="sa-drop-name">{user?.nombre || "Usuario"}</div>
                      <div className="sa-drop-role">{user?.rol || "—"}</div>
                    </div>
                    <div className="sa-drop-body">
                      <button className="sa-drop-item red" onClick={handleLogout}>
                        <LogOut size={13}/><span> Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="sa-content">
            <div key={selectedModule}>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
