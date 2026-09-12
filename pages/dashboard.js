import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PAGE_STYLES = `
:root{
  --bg:#FAFAFA; --surface:#FFFFFF; --surface-soft:#FAFAFB; --border:#E7E7EC;
  --ink:#17181F; --ink-soft:#6B6C7C; --ink-faint:#9C9DAD;
  --violet:#5de0a8; --violet-dark:#1f9c6c; --violet-soft:#E3FBF1;
  --teal:#0BA6A0; --teal-soft:#E2F6F4;
  --amber:#E79A2E; --amber-soft:#FBF0DC;
  --coral:#E4534F; --coral-soft:#FCE9E8;
  --green:#1E9E63; --green-soft:#E3F6EC;
  --slate:#7C86C9; --slate-soft:#ECEDFA;
  --shadow-card: 0 1px 2px rgba(23,26,46,.04), 0 8px 20px -12px rgba(23,26,46,.09);
  --shadow-modal: 0 24px 60px -20px rgba(23,26,46,.35);
  --radius:14px;
  color-scheme:light;
}
[data-theme="dark"]{
  --bg:#0F1015; --surface:#1A1B23; --surface-soft:#20212B; --border:#2B2C38;
  --ink:#EDEDF3; --ink-soft:#9C9DB5; --ink-faint:#6B6C82;
  --violet:#5de0a8; --violet-dark:#7CEFC0; --violet-soft:#0f3327;
  --teal:#2DC4BD; --teal-soft:#123231;
  --amber:#F0AC4C; --amber-soft:#332813;
  --coral:#EF6F6B; --coral-soft:#3A1E1D;
  --green:#3FBB80; --green-soft:#123424;
  --slate:#9AA3E0; --slate-soft:#22243D;
  --shadow-card: 0 1px 2px rgba(0,0,0,.3), 0 8px 20px -12px rgba(0,0,0,.5);
  --shadow-modal: 0 24px 60px -20px rgba(0,0,0,.7);
  color-scheme:dark;
}
*{box-sizing:border-box;min-width:0;}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;transition:background .25s ease, color .25s ease;}
svg{display:block;}
.sidebar,.card,.stat-card,.modal,.mobile-topbar,.bottom-nav,
.toolbar select,.field select,.field input,.field textarea,.search-pill input,
.icon-btn,.btn-ghost,.badge,.chip .resp-avatar,.avatar{
  transition:background .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease;
}
h1,h2,h3,.num{font-family:'Inter',sans-serif;font-weight:600;}
.brand-name{font-weight:600;}
button, select, input, textarea{font-family:'Inter',sans-serif;}

/* App shell */
.app{display:grid;grid-template-columns:188px 1fr;min-height:100vh;}
.sidebar{background:var(--surface);border-right:1px solid var(--border);padding:18px 12px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;}
.brand{display:flex;align-items:center;gap:9px;padding:4px 6px 20px;}
.brand-mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--violet),#29a876);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.brand-mark svg{width:15px;height:15px;color:#0b3d2e;}
.brand-name{font-size:14.5px;letter-spacing:-0.01em;}
.brand-sub{font-size:10.5px;color:var(--ink-faint);margin-top:-2px;}
.nav{display:flex;flex-direction:column;gap:2px;margin-top:4px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;color:var(--ink-soft);font-size:12.5px;font-weight:500;cursor:pointer;position:relative;transition:color .15s ease, background .15s ease;}
.nav-item svg{width:15px;height:15px;flex-shrink:0;}
.nav-item:hover{background:var(--surface-soft);color:var(--ink);}
.nav-item.active{background:var(--violet-soft);color:var(--violet-dark);}
.nav-item .count{margin-left:auto;font-size:10px;background:var(--coral-soft);color:var(--coral);padding:1px 6px;border-radius:20px;font-weight:600;transition:background .2s ease, color .2s ease;}
.sidebar-footer{margin-top:auto;padding-top:12px;border-top:1px solid var(--border);}
.user-chip{display:flex;align-items:center;gap:9px;padding:7px;border-radius:9px;}
.avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#0b3d2e;flex-shrink:0;background:var(--violet);}
.user-name{font-size:12px;font-weight:600;line-height:1.2;}
.user-role{font-size:10.5px;color:var(--ink-faint);}
.logout-btn{width:28px;height:28px;border:none;background:none;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--ink-faint);cursor:pointer;flex-shrink:0;margin-left:auto;transition:background .15s ease, color .15s ease;}
.logout-btn:hover{background:var(--surface-soft);color:var(--coral);}
.logout-btn svg{width:15px;height:15px;stroke:currentColor;}

.mobile-topbar{display:none;}
.bottom-nav{display:none;}

.main{padding:24px 34px 90px;width:100%;margin:0 auto;}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:20px;flex-wrap:wrap;position:relative;z-index:25;}
.page-header h1{font-size:24px;margin:0 0 3px;letter-spacing:-0.01em;}
.page-header .lead{font-size:13px;color:var(--ink-soft);margin:0;}
.header-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;width:100%;}
.search-pill{position:relative;flex:1;min-width:180px;max-width:460px;}
.search-pill input{width:100%;padding:9px 12px 9px 32px;border-radius:9px;border:1px solid var(--border);background:var(--surface);font-size:13px;color:var(--ink);transition:box-shadow .15s ease, border-color .2s ease, background .2s ease, color .2s ease;}
.search-pill input:focus{outline:none;border-color:var(--violet);box-shadow:0 0 0 3px var(--violet-soft);}
.search-pill svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:14px;height:14px;stroke:var(--ink-faint);transition:stroke .2s ease;}
.icon-btn{width:34px;height:34px;border-radius:9px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:background .2s ease, border-color .2s ease, color .2s ease, transform .15s ease;}
.icon-btn:hover{background:var(--surface-soft);}
.icon-btn svg{width:15px;height:15px;stroke:var(--ink-soft);transition:stroke .2s ease;}
.hidden-role{display:none !important;}
.theme-ico{position:relative;width:15px;height:15px;}
.theme-ico svg{position:absolute;inset:0;width:15px;height:15px;transition:opacity .3s ease, transform .3s ease, stroke .2s ease;}
.theme-ico .theme-icon-moon,.theme-ico #iconMoon{opacity:0;transform:scale(.5) rotate(-90deg);}
[data-theme="dark"] .theme-ico .theme-icon-sun,[data-theme="dark"] .theme-ico #iconSun{opacity:0;transform:scale(.5) rotate(90deg);}
[data-theme="dark"] .theme-ico .theme-icon-moon,[data-theme="dark"] .theme-ico #iconMoon{opacity:1;transform:scale(1) rotate(0deg);}
.icon-btn .dot{position:absolute;top:6px;right:6px;width:6px;height:6px;border-radius:50%;background:var(--coral);}
.btn{border:none;border-radius:9px;font-size:13px;font-weight:600;padding:9px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:transform .12s ease, box-shadow .15s ease, background .2s ease, color .2s ease, border-color .2s ease, opacity .15s ease;}
.btn:active{transform:scale(.97);}
.btn:disabled{opacity:.6;cursor:default;}
.btn-primary{background:var(--violet);color:#0b3d2e;box-shadow:0 6px 16px -6px rgba(31,156,108,.4);}
.btn-primary:hover{background:var(--violet-dark);}
.btn-ghost{background:var(--surface);color:var(--ink);border:1px solid var(--border);}
.btn-ghost:hover{background:var(--surface-soft);}
.btn svg{width:13px;height:13px;}

.enter{opacity:0;transform:translateY(10px);animation:enterUp .5s cubic-bezier(.2,.7,.3,1) forwards;}
@keyframes enterUp{to{opacity:1;transform:translateY(0);}}

.info-banner{background:var(--violet-soft);color:var(--violet-dark);font-size:12.5px;font-weight:500;padding:10px 16px;border-radius:10px;margin-bottom:18px;display:none;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;transition:background .2s ease, color .2s ease;}
.info-banner.show{display:flex;}

.stats-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px;}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 14px 12px;cursor:pointer;transition:background .2s ease, color .2s ease, border-color .2s ease, transform .15s ease, box-shadow .15s ease;}
.stat-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-card);}
.stat-card.active{border-color:var(--violet);box-shadow:0 0 0 3px var(--violet-soft);}
.stat-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s ease;}
.stat-icon svg{width:14px;height:14px;transition:stroke .2s ease;}
.stat-card.nuevo .stat-icon{background:var(--slate-soft);} .stat-card.nuevo .stat-icon svg{stroke:var(--slate);}
.stat-card.abierto .stat-icon{background:var(--violet-soft);} .stat-card.abierto .stat-icon svg{stroke:var(--violet);}
.stat-card.acuerdo .stat-icon{background:var(--amber-soft);} .stat-card.acuerdo .stat-icon svg{stroke:var(--amber);}
.stat-card.vencido .stat-icon{background:var(--coral-soft);} .stat-card.vencido .stat-icon svg{stroke:var(--coral);}
.stat-card.cerrado .stat-icon{background:var(--green-soft);} .stat-card.cerrado .stat-icon svg{stroke:var(--green);}
.stat-card .num{font-size:24px;font-weight:500;margin-top:10px;line-height:1;letter-spacing:-0.01em;}
.stat-card .lbl{font-size:11.5px;color:var(--ink-soft);margin-top:4px;}


.toolbar{display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;}
.toolbar select{border:1px solid var(--border);background:var(--surface);border-radius:9px;padding:9px 28px 9px 11px;font-size:12.5px;color:var(--ink);appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6F92' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;cursor:pointer;}
.toolbar .spacer{flex:1;}
.count-note{font-size:12px;color:var(--ink-faint);white-space:nowrap;}

.list{display:flex;flex-direction:column;gap:9px;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:15px 17px;display:grid;grid-template-columns:4px 1fr auto;gap:15px;align-items:stretch;cursor:pointer;transition:background .2s ease, color .2s ease, transform .15s ease, box-shadow .15s ease, border-color .2s ease;}
.card:hover{transform:translateY(-1px);box-shadow:var(--shadow-card);}
.card-bar{border-radius:4px;}
.card-bar.nuevo{background:var(--slate);} .card-bar.abierto{background:var(--violet);} .card-bar.acuerdo{background:var(--amber);} .card-bar.vencido{background:var(--coral);} .card-bar.cerrado{background:var(--green);}
.card-main .compromiso{font-size:13.5px;line-height:1.5;margin:0 0 8px;font-weight:500;}
.card-meta{display:flex;flex-wrap:wrap;gap:7px 14px;align-items:center;}
.chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--ink-soft);}
.chip .resp-avatar{width:17px;height:17px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7.5px;font-weight:700;color:#fff;}
.badge{display:inline-flex;align-items:center;font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:20px;}
.badge.nuevo{background:var(--slate-soft);color:var(--slate);}
.badge.abierto{background:var(--violet-soft);color:var(--violet-dark);}
.badge.acuerdo{background:var(--amber-soft);color:var(--amber);}
.badge.vencido{background:var(--coral-soft);color:var(--coral);}
.badge.cerrado{background:var(--green-soft);color:var(--green);}
.overdue-chip{color:var(--coral);font-weight:600;}
.card-side{display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;gap:8px;min-width:96px;}
.card-side .area-tag{font-size:10.5px;color:var(--ink-faint);text-align:right;}
.avance-pill{font-size:10.5px;color:var(--teal);background:var(--teal-soft);padding:3px 8px;border-radius:20px;font-weight:600;white-space:nowrap;transition:background .2s ease, color .2s ease;}
.empty{text-align:center;padding:60px 20px;color:var(--ink-soft);font-size:13.5px;}
.empty svg{width:36px;height:36px;stroke:var(--ink-faint);margin-bottom:10px;}

.cal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;}
.cal-header h2{font-size:18px;margin:0;text-transform:capitalize;}
.cal-nav{display:flex;align-items:center;gap:6px;}
.cal-grid{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--border);display:grid;grid-template-columns:repeat(7,1fr);gap:1px;transition:background .2s ease;}
.cal-weekday{background:var(--surface-soft);color:var(--ink-faint);font-size:11px;font-weight:600;text-align:center;padding:8px 4px;text-transform:uppercase;letter-spacing:.03em;}
.cal-cell{background:var(--surface);min-height:96px;padding:7px 6px;display:flex;flex-direction:column;gap:4px;cursor:pointer;transition:background .15s ease;}
.cal-cell:hover{background:var(--surface-soft);}
.cal-cell.outside{background:var(--bg);}
.cal-cell.outside .cal-daynum{color:var(--ink-faint);}
.cal-daynum{font-size:12px;font-weight:600;color:var(--ink);width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:50%;flex-shrink:0;}
.cal-cell.today .cal-daynum{background:var(--violet);color:#0b3d2e;}
.cal-events{display:flex;flex-direction:column;gap:3px;overflow:hidden;}
.cal-event{font-size:10px;font-weight:600;padding:2px 6px;border-radius:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background .2s ease, color .2s ease;}
.cal-event.nuevo{background:var(--slate-soft);color:var(--slate);}
.cal-event.abierto{background:var(--violet-soft);color:var(--violet-dark);}
.cal-event.acuerdo{background:var(--amber-soft);color:var(--amber);}
.cal-event.vencido{background:var(--coral-soft);color:var(--coral);}
.cal-event.cerrado{background:var(--green-soft);color:var(--green);}
.cal-more{font-size:10px;color:var(--ink-faint);font-weight:600;padding:0 6px;}

.cal-agenda{display:flex;flex-direction:column;gap:8px;}
.cal-agenda-day{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer;transition:background .15s ease, border-color .2s ease;}
.cal-agenda-day:hover{background:var(--surface-soft);}
.cal-agenda-day.empty-day{opacity:.55;}
.cal-agenda-head{display:flex;align-items:center;gap:8px;margin-bottom:2px;}
.cal-agenda-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--ink);flex-shrink:0;}
.cal-agenda-day.today .cal-agenda-num{background:var(--violet);color:#0b3d2e;}
.cal-agenda-dow{font-size:12.5px;font-weight:600;text-transform:capitalize;}
.cal-agenda-events{display:flex;flex-direction:column;gap:5px;margin-top:6px;margin-left:32px;}
.cal-agenda-empty{font-size:12px;color:var(--ink-faint);margin-left:32px;}

.day-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:background .15s ease, border-color .2s ease;}
.day-item:hover{background:var(--surface-soft);}
.day-item-bar{width:4px;align-self:stretch;border-radius:4px;flex-shrink:0;}
.day-item-text{font-size:13px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

@media (max-width:720px){
  .cal-grid{display:none;}
  .cal-header h2{font-size:16px;}
}
@media (min-width:721px){
  .cal-agenda{display:none;}
}

.reports-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.report-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;transition:background .2s ease, border-color .2s ease;}
.report-card h3{font-size:14px;margin:0 0 16px;font-weight:600;}
.report-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.report-row:last-child{margin-bottom:0;}
.report-label{width:130px;flex-shrink:0;font-size:12.5px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.report-bar-track{flex:1;height:10px;background:var(--surface-soft);border-radius:6px;overflow:hidden;transition:background .2s ease;}
.report-bar-fill{height:100%;border-radius:6px;width:0;transition:width .7s cubic-bezier(.2,.7,.2,1);}
.report-value{width:92px;flex-shrink:0;text-align:right;font-size:11.5px;color:var(--ink-soft);font-weight:600;}
.report-empty{font-size:12.5px;color:var(--ink-faint);font-style:italic;margin:0;}
@media (max-width:860px){
  .reports-grid{grid-template-columns:1fr;}
  .report-label{width:100px;}
  .report-value{width:76px;font-size:11px;}
}

.notif-wrap{position:relative;}
.notif-dropdown{position:absolute;top:calc(100% + 8px);right:0;width:300px;max-width:88vw;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-modal);z-index:200;overflow:hidden;opacity:0;transform:translateY(-6px) scale(.98);pointer-events:none;transition:opacity .18s ease, transform .18s ease, background .2s ease, border-color .2s ease;}
.notif-dropdown.show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}
.notif-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--border);font-size:12.5px;font-weight:600;}
.notif-clear{background:none;border:none;color:var(--violet);font-size:10.5px;font-weight:600;cursor:pointer;}
.notif-list{max-height:280px;overflow-y:auto;}
.notif-item{display:flex;align-items:flex-start;gap:9px;padding:10px 14px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s ease;}
.notif-item:last-child{border-bottom:none;}
.notif-item:hover{background:var(--surface-soft);}
.notif-dot-status{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.notif-text{font-size:12.5px;line-height:1.4;color:var(--ink);}
.notif-meta{font-size:10.5px;color:var(--ink-faint);margin-top:2px;}
.notif-empty{padding:26px 14px;text-align:center;font-size:12.5px;color:var(--ink-faint);}
@media (max-width:720px){
  .notif-dropdown{position:fixed;top:60px;right:10px;left:10px;width:auto;max-width:none;}
}

.assign-picker{position:relative;}
.assign-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}
.assign-chip{display:inline-flex;align-items:center;gap:6px;background:var(--violet-soft);color:var(--violet-dark);font-size:12px;font-weight:600;padding:4px 6px 4px 10px;border-radius:20px;transition:background .2s ease, color .2s ease;}
.assign-chip button{background:none;border:none;color:inherit;cursor:pointer;font-size:15px;line-height:1;padding:0 2px;opacity:.7;}
.assign-chip button:hover{opacity:1;}
.assign-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;max-height:220px;overflow-y:auto;background:var(--surface);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow-modal);z-index:80;display:none;}
.assign-dropdown.show{display:block;}
.assign-dropdown-item{padding:9px 12px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:9px;color:var(--ink);transition:background .15s ease;}
.assign-dropdown-item:hover{background:var(--surface-soft);}
.assign-dropdown-item.selected{color:var(--violet-dark);font-weight:600;}
.assign-dropdown-item .check{width:14px;flex-shrink:0;color:var(--violet);}
.assign-dropdown-empty{padding:14px 12px;font-size:12.5px;color:var(--ink-faint);font-style:italic;}

.priority-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:20px;}
.priority-badge.alta{background:var(--coral-soft);color:var(--coral);}
.priority-badge.media{background:var(--amber-soft);color:var(--amber);}
.priority-badge.baja{background:var(--green-soft);color:var(--green);}
.tipo-badge{display:inline-flex;align-items:center;font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:20px;background:var(--surface-soft);color:var(--ink-soft);border:1px solid var(--border);}


.fab{position:fixed;bottom:28px;right:24px;width:52px;height:52px;border-radius:50%;background:var(--violet);color:#0b3d2e;display:none;align-items:center;justify-content:center;box-shadow:0 10px 24px -6px rgba(31,156,108,.45);cursor:pointer;z-index:20;transition:transform .15s ease;}
.fab:active{transform:scale(.92);}
.fab svg{width:22px;height:22px;stroke:#0b3d2e;stroke-width:2.4;}

.overlay{position:fixed;inset:0;background:rgba(23,26,46,.42);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50;opacity:0;pointer-events:none;transition:opacity .2s ease;}
.overlay.show{opacity:1;pointer-events:auto;}
.modal{background:var(--surface);border-radius:16px;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;box-shadow:var(--shadow-modal);transform:scale(.94) translateY(10px);opacity:0;transition:transform .22s cubic-bezier(.2,.7,.2,1), opacity .2s ease, background .2s ease, color .2s ease;}
.overlay.show .modal{transform:scale(1) translateY(0);opacity:1;}
.modal-head{padding:20px 22px 0;}
.modal-body{padding:16px 22px 22px;}
.modal h2{font-size:17px;font-weight:600;margin:0 0 4px;}
.modal .modal-sub{font-size:12.5px;color:var(--ink-soft);line-height:1.5;margin:0;}
.field{margin-bottom:12px;display:flex;flex-direction:column;gap:5px;}
.field label{font-size:11.5px;color:var(--ink-soft);font-weight:500;}
.field select, .field input, .field textarea{width:100%;border:1px solid var(--border);border-radius:8px;padding:9px 10px;font-size:13px;color:var(--ink);background:var(--surface-soft);}
.field select:focus, .field input:focus, .field textarea:focus{outline:none;border-color:var(--violet);box-shadow:0 0 0 3px var(--violet-soft);background:var(--surface);}
.field textarea{resize:vertical;min-height:60px;font-family:inherit;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:6px;}
.divider{border-top:1px solid var(--border);margin:16px 0 14px;padding-top:14px;}
.divider h3{font-size:13px;font-weight:600;margin:0 0 10px;}

.timeline{display:flex;flex-direction:column;gap:0;margin-bottom:14px;max-height:200px;overflow-y:auto;padding-left:4px;}
.t-item{display:flex;gap:11px;position:relative;padding-bottom:14px;opacity:0;transform:translateX(-6px);animation:tIn .35s ease forwards;}
.t-item:last-child .t-line{display:none;}
@keyframes tIn{to{opacity:1;transform:translateX(0);}}
.t-rail{display:flex;flex-direction:column;align-items:center;}
.t-dot{width:8px;height:8px;border-radius:50%;background:var(--violet);flex-shrink:0;margin-top:3px;}
.t-line{width:1.5px;flex:1;background:var(--border);margin-top:2px;}
.t-content{flex:1;padding-bottom:2px;}
.t-date{font-size:10.5px;color:var(--ink-faint);font-weight:600;}
.t-text{font-size:12.5px;line-height:1.45;margin-top:2px;color:var(--ink);}
.timeline-empty{font-size:12.5px;color:var(--ink-faint);font-style:italic;margin-bottom:14px;}

.toast{position:fixed;bottom:24px;left:50%;transform:translate(-50%,12px);background:var(--ink);color:#fff;padding:10px 18px;border-radius:9px;font-size:12.5px;font-weight:500;opacity:0;pointer-events:none;transition:opacity .2s ease, transform .2s ease;z-index:60;display:flex;align-items:center;gap:8px;}
.toast svg{width:13px;height:13px;stroke:var(--green);flex-shrink:0;}
.toast.show{opacity:1;transform:translate(-50%,0);}

@media (max-width:1080px){
  .app{grid-template-columns:68px 1fr;}
  .brand-name,.brand-sub,.nav-item span:not(.count),.user-name,.user-role{display:none;}
  .brand{justify-content:center;padding:4px 0 20px;}
  .nav-item{justify-content:center;padding:10px;}
  .nav-item .count{position:absolute;top:4px;right:4px;margin:0;padding:0 4px;min-width:14px;text-align:center;}
  .user-chip{flex-direction:column;gap:6px;}
  .logout-btn{margin-left:0;}
}
@media (max-width:860px){
  .stats-row{grid-template-columns:repeat(3,1fr);}
  .stats-row .stat-card:nth-child(4),.stats-row .stat-card:nth-child(5){display:none;}
}
@media (max-width:720px){
  .app{grid-template-columns:1fr;}
  .sidebar{display:none;}
  .mobile-topbar{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:15;}
  .mobile-topbar .brand{padding:0;}
  .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;background:var(--surface);border-top:1px solid var(--border);padding:8px 6px calc(8px + env(safe-area-inset-bottom));justify-content:space-around;z-index:20;}
  .bottom-nav .bn-item{display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--ink-faint);font-size:9.5px;font-weight:500;cursor:pointer;}
  .bottom-nav .bn-item svg{width:18px;height:18px;stroke:var(--ink-faint);}
  .bottom-nav .bn-item.active{color:var(--violet);}
  .bottom-nav .bn-item.active svg{stroke:var(--violet);}
  .main{padding:16px 14px 100px;}
  .page-header{gap:10px;}
  .header-actions{width:100%;gap:8px;}
  .header-actions .icon-btn,.header-actions .btn-primary{display:none;}
  .header-actions .search-pill{flex:1;min-width:0;}
  .header-actions .search-pill input{width:100%;}
  .header-actions .btn-ghost{flex-shrink:0;}
  .stats-row{grid-template-columns:repeat(3,1fr);gap:7px;}
  .stat-card{padding:11px 9px 9px;}
  .stat-card .num{font-size:19px;margin-top:7px;}
  .stat-card .lbl{font-size:10px;}
  .stats-row .stat-card:nth-child(4),.stats-row .stat-card:nth-child(5){display:block;}
  .toolbar{gap:7px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px;margin-left:-14px;margin-right:-14px;padding-left:14px;padding-right:14px;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .toolbar::-webkit-scrollbar{display:none;}
  .toolbar select{flex:0 0 auto;width:auto;}
  .toolbar .count-note{flex:0 0 auto;}
  .card{grid-template-columns:4px 1fr;}
  .card-side{grid-column:span 2;flex-direction:row;align-items:center;justify-content:space-between;}
  .fab{display:flex;bottom:82px;}
  .row2{grid-template-columns:1fr;}
}
`;

const LOGO_SVG = '<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5.25C4 3.45508 5.45507 2 7.25 2H20.75C22.5449 2 24 3.45507 24 5.25V17.3787C23.8796 17.4592 23.7653 17.5527 23.659 17.659L22.5 18.818V5.25C22.5 4.2835 21.7165 3.5 20.75 3.5H7.25C6.2835 3.5 5.5 4.2835 5.5 5.25V22.7497C5.5 23.7162 6.2835 24.4997 7.25 24.4997H15.3177L16.8177 25.9997H7.25C5.45507 25.9997 4 24.5446 4 22.7497V5.25Z" fill="currentColor"></path><path d="M10.5 8.75C10.5 9.44036 9.94036 10 9.25 10C8.55964 10 8 9.44036 8 8.75C8 8.05964 8.55964 7.5 9.25 7.5C9.94036 7.5 10.5 8.05964 10.5 8.75Z" fill="currentColor"></path><path d="M9.25 15.2498C9.94036 15.2498 10.5 14.6902 10.5 13.9998C10.5 13.3095 9.94036 12.7498 9.25 12.7498C8.55964 12.7498 8 13.3095 8 13.9998C8 14.6902 8.55964 15.2498 9.25 15.2498Z" fill="currentColor"></path><path d="M9.25 20.5C9.94036 20.5 10.5 19.9404 10.5 19.25C10.5 18.5596 9.94036 18 9.25 18C8.55964 18 8 18.5596 8 19.25C8 19.9404 8.55964 20.5 9.25 20.5Z" fill="currentColor"></path><path d="M12.75 8C12.3358 8 12 8.33579 12 8.75C12 9.16421 12.3358 9.5 12.75 9.5H19.25C19.6642 9.5 20 9.16421 20 8.75C20 8.33579 19.6642 8 19.25 8H12.75Z" fill="currentColor"></path><path d="M12 13.9998C12 13.5856 12.3358 13.2498 12.75 13.2498H19.25C19.6642 13.2498 20 13.5856 20 13.9998C20 14.414 19.6642 14.7498 19.25 14.7498H12.75C12.3358 14.7498 12 14.414 12 13.9998Z" fill="currentColor"></path><path d="M12.75 18.5C12.3358 18.5 12 18.8358 12 19.25C12 19.6642 12.3358 20 12.75 20H19.25C19.6642 20 20 19.6642 20 19.25C20 18.8358 19.6642 18.5 19.25 18.5H12.75Z" fill="currentColor"></path><path d="M25.7803 19.7803L19.7803 25.7803C19.6397 25.921 19.4489 26 19.25 26C19.0511 26 18.8603 25.921 18.7197 25.7803L15.7216 22.7823C15.4287 22.4894 15.4287 22.0145 15.7216 21.7216C16.0145 21.4287 16.4894 21.4287 16.7823 21.7216L19.25 24.1893L24.7197 18.7197C25.0126 18.4268 25.4874 18.4268 25.7803 18.7197C26.0732 19.0126 26.0732 19.4874 25.7803 19.7803Z" fill="currentColor"></path></svg>';

const NAV_ICONS = {
  compromisos: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  reportes: '<path d="M3 3v18h18"/><path d="M7 15l4-6 3 3 5-8"/>',
  config: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 01-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H3a2 2 0 010-4h.09a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001-1.55V3a2 2 0 014 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9a1.7 1.7 0 001.55 1H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.55 1z"/>',
};

const STAT_ICONS = {
  Nuevo: '<circle cx="12" cy="12" r="9"/>',
  Abierto: '<path d="M12 7v5l3.5 3.5"/><circle cx="12" cy="12" r="9"/>',
  Acuerdo: '<path d="M9 11l3 3 6-6"/><path d="M21 12a9 9 0 11-2.6-6.4"/>',
  Vencido: '<path d="M12 9v4M12 16.5h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>',
  Cerrado: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
};

const AVATAR_COLORS = {
  Katia: '#23616B', Elvia: '#0BA6A0', 'Luis Enrique': '#E79A2E',
  Ernesto: '#E4534F', Brenda: '#7C86C9', Miguel: '#1E9E63', Todos: '#6B6C7C',
};

const NAV_ITEMS = [
  { key: 'compromisos', label: 'Compromisos', withCount: true },
  { key: 'calendario', label: 'Calendario' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'config', label: 'Configuración' },
];

function navItemsHtml(mobile) {
  return NAV_ITEMS.map((n, i) => `
    <div class="${mobile ? 'bn-item' : 'nav-item'}${i === 0 ? ' active' : ''}" data-nav="${n.key}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${NAV_ICONS[n.key]}</svg>
      ${mobile ? n.label : `<span>${n.label}</span>`}
      ${!mobile && n.withCount ? '<span class="count" id="navCount">0</span>' : ''}
    </div>
  `).join('');
}

const BODY_HTML = `
<div class="app">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">${LOGO_SVG}</div>
      <div>
        <div class="brand-name">Minuta</div>
        <div class="brand-sub">Ultrasonido</div>
      </div>
    </div>
    <nav class="nav">${navItemsHtml(false)}</nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="avatar" id="userAvatar">–</div>
        <div>
          <div class="user-name" id="userName">Cargando…</div>
          <div class="user-role" id="userRole"></div>
        </div>
        <button class="logout-btn" id="btnLogout" title="Cerrar sesión">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  </aside>

  <div class="mobile-topbar">
    <div class="brand">
      <div class="brand-mark" style="width:26px;height:26px;">${LOGO_SVG}</div>
      <div class="brand-name" style="font-size:14px;">Minuta</div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <div class="icon-btn" id="btnThemeMobile" style="width:32px;height:32px;">
        <span class="theme-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon-moon"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>
        </span>
      </div>
      <button class="icon-btn" id="btnLogoutMobile" title="Cerrar sesión" style="width:32px;height:32px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
      <div class="avatar" id="userAvatarMobile" style="width:28px;height:28px;font-size:11px;">–</div>
    </div>
  </div>

  <main class="main">
    <div class="info-banner" id="importBanner">
      <span>Aún no hay compromisos cargados. ¿Importar los datos del Excel original?</span>
      <button class="btn btn-primary" id="btnImportar">Importar compromisos iniciales</button>
    </div>
    <div class="info-banner" id="readOnlyBanner">
      <span>👁 Estás viendo esta minuta en modo solo lectura — no puedes agregar ni editar compromisos.</span>
    </div>

    <div class="page-header enter" style="animation-delay:.02s;" id="pageHeader">
      <div class="header-actions">
        <div class="search-pill" id="searchPillWrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" id="fBuscar" placeholder="Buscar compromiso, área...">
        </div>
        <div class="notif-wrap">
          <div class="icon-btn" id="btnBell" title="Notificaciones">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>
            <span class="dot" id="bellDot" style="display:none;"></span>
          </div>
          <div class="notif-dropdown" id="notifDropdown">
            <div class="notif-head">
              <span>Notificaciones</span>
              <button class="notif-clear" id="btnClearNotifs">Marcar todas como leídas</button>
            </div>
            <div class="notif-list" id="notifList"></div>
          </div>
        </div>
        <div class="icon-btn" id="btnTheme" title="Cambiar tema">
          <span class="theme-ico">
            <svg id="iconSun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg id="iconMoon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>
          </span>
        </div>
        <button class="btn btn-ghost" id="btnExportar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>
          Exportar
        </button>
        <button class="btn btn-primary" id="btnAdd">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo compromiso
        </button>
      </div>
    </div>

    <div id="listView">
      <div class="stats-row" id="stats"></div>

      <div class="toolbar">
        <select id="fResponsable"><option value="">Responsable: todos</option></select>
        <select id="fArea"><option value="">Área: todas</option></select>
        <select id="fStatus"><option value="">Estado: todos</option></select>
        <select id="fPrioridad"><option value="">Prioridad: todas</option></select>
        <select id="fTipo"><option value="">Tipo: todos</option></select>
        <div class="spacer"></div>
        <span class="count-note" id="countNote"></span>
      </div>

      <div class="list" id="list"></div>
    </div>

    <div id="calendarView" style="display:none;">
      <div class="cal-header">
        <h2 id="calMonthLabel">—</h2>
        <div class="cal-nav">
          <button class="btn btn-ghost btn-sm" id="calToday">Hoy</button>
          <button class="icon-btn" id="calPrev" title="Mes anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="icon-btn" id="calNext" title="Mes siguiente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div id="calBody"></div>
    </div>

    <div id="reportsView" style="display:none;">
      <div class="reports-grid">
        <div class="report-card">
          <h3>Compromisos por área</h3>
          <div id="reportArea"></div>
        </div>
        <div class="report-card">
          <h3>Cumplimiento por responsable</h3>
          <div id="reportResp"></div>
        </div>
      </div>
    </div>

    <div id="profileView" style="display:none;max-width:700px;margin:0 auto;">
      <div class="report-card">
        <div style="max-width:440px;">
        <h3>Mi perfil</h3>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
          <div class="avatar" id="profileAvatarPreview" style="width:56px;height:56px;font-size:18px;cursor:pointer;" title="Cambiar foto">–</div>
          <div>
            <button class="btn btn-ghost btn-sm" id="btnChangePhoto" type="button">Cambiar foto</button>
            <input type="file" id="photoInput" accept="image/*" style="display:none;">
          </div>
        </div>
        <div class="field">
          <label>Nombre</label>
          <input type="text" id="profileName">
        </div>
        <div class="field">
          <label>Usuario</label>
          <input type="text" id="profileUsername" disabled>
        </div>
        <div class="modal-actions" style="justify-content:flex-start;">
          <button class="btn btn-primary" id="btnSaveProfile">Guardar cambios</button>
        </div>

        <div class="divider">
          <h3>Cambiar contraseña</h3>
          <div class="field">
            <label>Contraseña actual</label>
            <input type="password" id="profileCurrentPass">
          </div>
          <div class="field">
            <label>Nueva contraseña (mínimo 6 caracteres)</label>
            <input type="password" id="profileNewPass">
          </div>
          <div class="modal-actions" style="justify-content:flex-start;">
            <button class="btn btn-primary" id="btnSavePassword">Cambiar contraseña</button>
          </div>
        </div>
        <p id="profileRoleNote" style="font-size:11.5px;color:var(--ink-faint);margin:16px 0 0;"></p>
        </div>
      </div>

      <div class="report-card" id="teamCard" style="display:none;margin-top:16px;">
        <h3>Mi equipo</h3>
        <div id="teamNoGroup" style="display:none;">
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 12px;">Aún no tienes un equipo propio.</p>
          <div class="row2" style="max-width:440px;">
            <div class="field" style="grid-column:1/-1;">
              <label>Nombre de tu equipo</label>
              <input type="text" id="newGroupName" placeholder="Ej. Equipo de Laura">
            </div>
          </div>
          <div class="modal-actions" style="justify-content:flex-start;">
            <button class="btn btn-primary" id="btnCreateGroup">Crear mi equipo</button>
          </div>
        </div>
        <div id="teamHasGroup" style="display:none;">
          <div id="teamMembersList" style="margin-bottom:16px;"></div>
          <div class="divider">
            <h3>Agregar persona a mi equipo</h3>
            <div class="row2" style="max-width:520px;">
              <div class="field">
                <label>Nombre</label>
                <input type="text" id="newMemberName">
              </div>
              <div class="field">
                <label>Usuario</label>
                <input type="text" id="newMemberUsername">
              </div>
            </div>
            <div class="row2" style="max-width:520px;">
              <div class="field">
                <label>Contraseña (si es cuenta nueva)</label>
                <input type="text" id="newMemberPassword">
              </div>
              <div class="field">
                <label>Rol en tu equipo</label>
                <select id="newMemberRole">
                  <option value="member">Miembro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div class="modal-actions" style="justify-content:flex-start;">
              <button class="btn btn-primary" id="btnAddTeamMember">Agregar a mi equipo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<div class="fab" id="fabAdd">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
</div>

<div class="bottom-nav">${navItemsHtml(true)}</div>

<div class="overlay" id="overlayAdd">
  <div class="modal">
    <div class="modal-head">
      <h2>Nuevo compromiso</h2>
      <p class="modal-sub">Se agregará a la lista de esta reunión.</p>
    </div>
    <div class="modal-body">
      <div class="field">
        <label>Compromiso / actividad</label>
        <textarea id="nCompromiso" placeholder="Describe el compromiso acordado en la reunión"></textarea>
      </div>
      <div class="field">
        <label>Área</label>
        <select id="nArea"></select>
      </div>
      <div class="field">
        <label>Asignado a (elige una o varias personas)</label>
        <div class="assign-picker" id="nAsignadoPicker">
          <div class="assign-chips" id="nAsignadoChips"></div>
          <button type="button" class="btn btn-ghost btn-sm" id="nAsignadoToggle">+ Agregar persona</button>
          <div class="assign-dropdown" id="nAsignadoDropdown"></div>
        </div>
      </div>
      <div class="row2">
        <div class="field">
          <label>Solicitado por (opcional, una o varias)</label>
          <div class="assign-picker" id="nSolicitadoPicker">
            <div class="assign-chips" id="nSolicitadoChips"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="nSolicitadoToggle">+ Agregar persona</button>
            <div class="assign-dropdown" id="nSolicitadoDropdown"></div>
          </div>
        </div>
        <div class="field">
          <label>Promesa de cierre</label>
          <input type="date" id="nPromesa">
        </div>
      </div>
      <div class="row2">
        <div class="field">
          <label>Prioridad</label>
          <select id="nPrioridad">
            <option value="">Elige una prioridad…</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div class="field">
          <label>Tipo</label>
          <select id="nTipo">
            <option value="General">General</option>
            <option value="1:1">1:1</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Comentarios (opcional)</label>
        <textarea id="nComentarios"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="btnCancelAdd">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveAdd">Guardar compromiso</button>
      </div>
    </div>
  </div>
</div>

<div class="overlay" id="overlayEdit">
  <div class="modal">
    <div class="modal-head">
      <h2>Seguimiento del compromiso</h2>
      <p class="modal-sub" id="editCompromisoTexto"></p>
    </div>
    <div class="modal-body">
      <div class="row2">
        <div class="field">
          <label>Estado</label>
          <select id="eStatus"></select>
        </div>
        <div class="field">
          <label>Promesa de cierre</label>
          <input type="date" id="ePromesa">
        </div>
      </div>
      <div class="row2">
        <div class="field">
          <label>Prioridad</label>
          <select id="ePrioridad">
            <option value="">Elige una prioridad…</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div class="field">
          <label>Tipo</label>
          <select id="eTipo">
            <option value="General">General</option>
            <option value="1:1">1:1</option>
          </select>
        </div>
      </div>
      <div class="field" id="eAsignadoField">
        <label>Asignado a</label>
        <div class="assign-picker" id="eAsignadoPicker">
          <div class="assign-chips" id="eAsignadoChips"></div>
          <button type="button" class="btn btn-ghost btn-sm" id="eAsignadoToggle">+ Agregar persona</button>
          <div class="assign-dropdown" id="eAsignadoDropdown"></div>
        </div>
        <p id="eAsignadoReadonly" style="font-size:12.5px;color:var(--ink-soft);margin:4px 0 0;display:none;"></p>
      </div>
      <div class="field" id="eSolicitadoField">
        <label>Solicitado por</label>
        <div class="assign-picker" id="eSolicitadoPicker">
          <div class="assign-chips" id="eSolicitadoChips"></div>
          <button type="button" class="btn btn-ghost btn-sm" id="eSolicitadoToggle">+ Agregar persona</button>
          <div class="assign-dropdown" id="eSolicitadoDropdown"></div>
        </div>
        <p id="eSolicitadoReadonly" style="font-size:12.5px;color:var(--ink-soft);margin:4px 0 0;display:none;"></p>
      </div>
      <div class="modal-actions" id="editActions" style="margin-bottom:2px;">
        <button class="btn btn-primary" id="btnSaveEdit">Guardar cambios</button>
      </div>

      <div class="divider">
        <h3>Historial de avances</h3>
        <div class="timeline" id="timeline"></div>
        <div class="field" id="avanceField">
          <label>Agregar avance de esta reunión</label>
          <textarea id="eAvance" placeholder="Ej. 60% completado, falta validar con RH…"></textarea>
        </div>
        <div class="modal-actions" id="avanceActions" style="margin-top:0;">
          <button class="btn btn-ghost" id="btnCancelEdit">Cerrar</button>
          <button class="btn btn-primary" id="btnSaveAvance">Agregar avance</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="overlay" id="overlayDay">
  <div class="modal">
    <div class="modal-head">
      <h2 id="dayModalTitle">Compromisos del día</h2>
      <p class="modal-sub" id="dayModalSub"></p>
    </div>
    <div class="modal-body">
      <div id="dayModalList" style="display:flex;flex-direction:column;gap:8px;"></div>
      <div class="modal-actions" style="margin-top:16px;">
        <button class="btn btn-ghost" id="btnCloseDay">Cerrar</button>
        <button class="btn btn-primary" id="btnAddOnDay">+ Agregar en este día</button>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
  <span id="toastMsg"></span>
</div>
`;

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    let ALL = [];
    let CATALOGO = { areas: [], responsables: [], status: [] };
    let editingId = null;
    let activeStatFilter = '';
    let IS_EDITOR = false;

    const STATUS_ORDER = ['Nuevo', 'Abierto', 'Acuerdo', 'Vencido', 'Cerrado'];
    const PRIORIDAD_ORDER = ['Alta', 'Media', 'Baja'];
    const TIPO_ORDER = ['1:1', 'General'];

    function slug(s) {
      return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }
    function initials(name) {
      return String(name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    }
    function avatarColor(name) {
      return AVATAR_COLORS[name] || '#7C86C9';
    }
    function fillSelect(sel, options, withEmpty, emptyLabel) {
      sel.innerHTML = '';
      if (withEmpty) {
        const o = document.createElement('option');
        o.value = '';
        o.textContent = emptyLabel;
        sel.appendChild(o);
      }
      options.forEach((v) => {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });
    }
    function initMultiPicker({ toggleBtn, chipsEl, dropdownEl, getOptions }) {
      let selected = [];
      function render() {
        const options = getOptions();
        chipsEl.innerHTML = selected.length
          ? selected
              .map((u) => {
                const opt = options.find((o) => o.username === u);
                return `<span class="assign-chip" data-u="${u}">${escapeHtml(opt ? opt.name : u)}<button type="button" data-remove="${u}">×</button></span>`;
              })
              .join('')
          : '';
        dropdownEl.innerHTML = options.length
          ? options
              .map(
                (o) => `
            <div class="assign-dropdown-item${selected.includes(o.username) ? ' selected' : ''}" data-u="${o.username}">
              <span class="check">${selected.includes(o.username) ? '✓' : ''}</span>${escapeHtml(o.name)}
            </div>`
              )
              .join('')
          : '<div class="assign-dropdown-empty">No tienes a nadie en tu equipo todavía.</div>';

        chipsEl.querySelectorAll('[data-remove]').forEach((btn) => {
          btn.addEventListener('click', () => {
            selected = selected.filter((x) => x !== btn.getAttribute('data-remove'));
            render();
          });
        });
        dropdownEl.querySelectorAll('.assign-dropdown-item').forEach((item) => {
          item.addEventListener('click', () => {
            const u = item.getAttribute('data-u');
            selected = selected.includes(u) ? selected.filter((x) => x !== u) : [...selected, u];
            render();
          });
        });
      }
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownEl.classList.toggle('show');
      });
      document.addEventListener('click', (e) => {
        if (!dropdownEl.contains(e.target) && !toggleBtn.contains(e.target)) dropdownEl.classList.remove('show');
      });
      return {
        setSelected(next) {
          selected = next || [];
          render();
        },
        getSelected: () => selected,
        render,
      };
    }

    function initSinglePicker({ toggleBtn, labelEl, dropdownEl, getOptions, placeholder }) {
      let selected = '';
      function render() {
        const options = getOptions();
        const current = options.find((o) => o.username === selected);
        labelEl.textContent = current ? current.name : placeholder;
        const noneItem = `<div class="assign-dropdown-item${!selected ? ' selected' : ''}" data-u=""><span class="check">${!selected ? '✓' : ''}</span>Ninguno</div>`;
        const rest = options.length
          ? options
              .map(
                (o) => `
            <div class="assign-dropdown-item${selected === o.username ? ' selected' : ''}" data-u="${o.username}">
              <span class="check">${selected === o.username ? '✓' : ''}</span>${escapeHtml(o.name)}
            </div>`
              )
              .join('')
          : '<div class="assign-dropdown-empty">No tienes a nadie en tu equipo todavía.</div>';
        dropdownEl.innerHTML = noneItem + rest;

        dropdownEl.querySelectorAll('.assign-dropdown-item').forEach((item) => {
          item.addEventListener('click', () => {
            selected = item.getAttribute('data-u') || '';
            render();
            dropdownEl.classList.remove('show');
          });
        });
      }
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownEl.classList.toggle('show');
      });
      document.addEventListener('click', (e) => {
        if (!dropdownEl.contains(e.target) && !toggleBtn.contains(e.target)) dropdownEl.classList.remove('show');
      });
      return {
        setSelected(next) {
          selected = next || '';
          render();
        },
        getSelected: () => selected,
        render,
      };
    }

    const nAsignadoPicker = initMultiPicker({
      toggleBtn: document.getElementById('nAsignadoToggle'),
      chipsEl: document.getElementById('nAsignadoChips'),
      dropdownEl: document.getElementById('nAsignadoDropdown'),
      getOptions: () => CATALOGO.asignables || [],
    });
    const nSolicitadoPicker = initMultiPicker({
      toggleBtn: document.getElementById('nSolicitadoToggle'),
      chipsEl: document.getElementById('nSolicitadoChips'),
      dropdownEl: document.getElementById('nSolicitadoDropdown'),
      getOptions: () => CATALOGO.asignables || [],
    });
    const eAsignadoPicker = initMultiPicker({
      toggleBtn: document.getElementById('eAsignadoToggle'),
      chipsEl: document.getElementById('eAsignadoChips'),
      dropdownEl: document.getElementById('eAsignadoDropdown'),
      getOptions: () => CATALOGO.asignables || [],
    });
    const eSolicitadoPicker = initMultiPicker({
      toggleBtn: document.getElementById('eSolicitadoToggle'),
      chipsEl: document.getElementById('eSolicitadoChips'),
      dropdownEl: document.getElementById('eSolicitadoDropdown'),
      getOptions: () => CATALOGO.asignables || [],
    });

    function toast(msg) {
      const t = document.getElementById('toast');
      document.getElementById('toastMsg').textContent = msg;
      t.classList.add('show');
      clearTimeout(window.__toastT);
      window.__toastT = setTimeout(() => t.classList.remove('show'), 2400);
    }
    function isoToday() {
      return new Date().toISOString().slice(0, 10);
    }
    function ddmmyyyyToIso(s) {
      if (!s) return '';
      const p = s.split('/');
      return p.length === 3 ? p[2] + '-' + p[1].padStart(2, '0') + '-' + p[0].padStart(2, '0') : '';
    }
    function isoToDdmmyyyy(s) {
      if (!s) return '';
      const p = s.split('-');
      return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '';
    }
    function parseDdmmyyyy(s) {
      if (!s) return null;
      const p = String(s).split('/');
      if (p.length !== 3) return null;
      const d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
      return isNaN(d.getTime()) ? null : d;
    }

    async function apiGet(url) {
      const res = await fetch(url);
      if (res.status === 401) {
        router.push('/login');
        throw new Error('No autenticado');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      return data;
    }
    async function apiSend(url, method, body) {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      if (res.status === 401) {
        router.push('/login');
        throw new Error('No autenticado');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      return data;
    }

    function renderStats() {
      const counts = { Nuevo: 0, Abierto: 0, Acuerdo: 0, Vencido: 0, Cerrado: 0 };
      ALL.forEach((c) => {
        if (counts[c.status] !== undefined) counts[c.status]++;
      });
      const box = document.getElementById('stats');
      box.innerHTML = '';
      STATUS_ORDER.forEach((st, i) => {
        const el = document.createElement('div');
        el.className = 'stat-card enter ' + slug(st) + (activeStatFilter === st ? ' active' : '');
        el.style.animationDelay = 0.02 * i + 's';
        el.innerHTML = `
          <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${STAT_ICONS[st]}</svg></div>
          <div class="num">${counts[st]}</div>
          <div class="lbl">${st}</div>
        `;
        el.addEventListener('click', () => {
          activeStatFilter = activeStatFilter === st ? '' : st;
          document.getElementById('fStatus').value = '';
          renderStats();
          renderList();
        });
        box.appendChild(el);
      });
      const navCount = document.getElementById('navCount');
      if (navCount) navCount.textContent = counts.Vencido;
    }

    // ---- Notificaciones (Nuevo / Abierto) ----
    const NOTIF_STATUSES = ['Nuevo', 'Abierto'];
    const NOTIF_KEY = 'minuta-dismissed-notifs';
    function getDismissed() {
      try {
        return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      } catch (e) {
        return [];
      }
    }
    function setDismissed(arr) {
      try {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(arr));
      } catch (e) {
        /* sin storage disponible */
      }
    }
    function getNotifications() {
      const dismissed = getDismissed();
      return ALL.filter((c) => NOTIF_STATUSES.includes(c.status) && !dismissed.includes(c.id));
    }
    function updateBellDot() {
      const count = getNotifications().length;
      const dot = document.getElementById('bellDot');
      if (dot) dot.style.display = count > 0 ? 'block' : 'none';
    }
    function renderNotifDropdown() {
      const notifs = getNotifications();
      const list = document.getElementById('notifList');
      const dotColor = { Nuevo: '--slate', Abierto: '--violet' };
      list.innerHTML = notifs.length
        ? notifs
            .map(
              (c) => `
        <div class="notif-item" data-notifid="${c.id}">
          <span class="notif-dot-status" style="background:var(${dotColor[c.status] || '--slate'});"></span>
          <div>
            <div class="notif-text">${escapeHtml(c.compromiso)}</div>
            <div class="notif-meta">${c.status} · ${escapeHtml(c.responsable || '—')}</div>
          </div>
        </div>
      `
            )
            .join('')
        : '<div class="notif-empty">No tienes notificaciones nuevas.</div>';
      list.querySelectorAll('[data-notifid]').forEach((el) => {
        el.addEventListener('click', () => {
          const id = Number(el.getAttribute('data-notifid'));
          dismissNotif(id);
          closeNotifDropdown();
          openEdit(id);
        });
      });
      updateBellDot();
    }
    function dismissNotif(id) {
      const dismissed = getDismissed();
      if (!dismissed.includes(id)) {
        dismissed.push(id);
        setDismissed(dismissed);
      }
    }
    function toggleNotifDropdown() {
      const el = document.getElementById('notifDropdown');
      if (el.classList.contains('show')) {
        closeNotifDropdown();
      } else {
        renderNotifDropdown();
        el.classList.add('show');
      }
    }
    function closeNotifDropdown() {
      document.getElementById('notifDropdown').classList.remove('show');
    }


    function renderList() {
      const fr = document.getElementById('fResponsable').value;
      const fa = document.getElementById('fArea').value;
      const fs = document.getElementById('fStatus').value || activeStatFilter;
      const fp = document.getElementById('fPrioridad').value;
      const ft = document.getElementById('fTipo').value;
      const fb = document.getElementById('fBuscar').value.trim().toLowerCase();

      let filtered = ALL.filter((c) => {
        if (fr && !(c.responsable || '').split(', ').includes(fr)) return false;
        if (fa && c.area !== fa) return false;
        if (fs && c.status !== fs) return false;
        if (fp && c.prioridad !== fp) return false;
        if (ft && (c.tipo || 'General') !== ft) return false;
        if (fb) {
          const hay = [c.compromiso, c.area, c.responsable, c.solicitadoPor, c.comentarios, ...(c.historial || []).map((h) => h.avance)]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(fb)) return false;
        }
        return true;
      });

      document.getElementById('countNote').textContent = `${filtered.length} de ${ALL.length} compromisos`;

      const list = document.getElementById('list');
      list.innerHTML = '';
      if (filtered.length === 0) {
        list.innerHTML = `<div class="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <div>No hay compromisos con estos filtros.</div>
        </div>`;
        return;
      }

      filtered.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'card enter';
        div.style.animationDelay = Math.min(i * 0.03, 0.3) + 's';
        const nAvances = (c.historial || []).length;
        const overdue = c.diasVencido ? `<span class="chip overdue-chip">${c.diasVencido} día(s) vencido</span>` : '';
        const respNames = (c.responsable || '').split(', ').filter(Boolean);
        const firstResp = respNames[0] || '—';
        const respLabel = respNames.length > 1 ? `${escapeHtml(firstResp)} +${respNames.length - 1}` : escapeHtml(firstResp);
        const prioridadTag = c.prioridad
          ? `<span class="priority-badge ${slug(c.prioridad)}">${c.prioridad}</span>`
          : '';
        const tipoTag = `<span class="tipo-badge">${escapeHtml(c.tipo || 'General')}</span>`;
        div.innerHTML = `
          <div class="card-bar ${slug(c.status)}"></div>
          <div class="card-main">
            <p class="compromiso">${escapeHtml(c.compromiso)}</p>
            <div class="card-meta">
              <span class="badge ${slug(c.status)}">${c.status}</span>
              ${prioridadTag}
              ${tipoTag}
              <span class="chip"><span class="resp-avatar" style="background:${avatarColor(firstResp)};">${initials(firstResp)}</span>${respLabel}</span>
              <span class="chip">Cierre: ${c.promesaCierre || 'sin fecha'}</span>
              ${overdue}
              ${nAvances ? `<span class="avance-pill">${nAvances} avance${nAvances > 1 ? 's' : ''}</span>` : ''}
            </div>
          </div>
          <div class="card-side">
            <span class="area-tag">${escapeHtml(c.area || 'Sin área')}</span>
          </div>
        `;
        div.addEventListener('click', () => openEdit(c.id));
        list.appendChild(div);
      });
    }

    // ---- Calendario ----
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    let calYear = today0.getFullYear();
    let calMonth = today0.getMonth(); // 0-indexed
    let currentView = 'list';
    const MONTH_NAMES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const DOW_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    const DOW_NAMES_LONG = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];

    function dateKey(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function isSameDay(a, b) {
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }
    function buildEventsByDate() {
      const map = {};
      ALL.forEach((c) => {
        const d = parseDdmmyyyy(c.promesaCierre);
        if (!d) return;
        const key = dateKey(d);
        if (!map[key]) map[key] = [];
        map[key].push(c);
      });
      return map;
    }

    function showView(view) {
      currentView = view;
      document.getElementById('listView').style.display = view === 'list' ? 'block' : 'none';
      document.getElementById('calendarView').style.display = view === 'calendar' ? 'block' : 'none';
      document.getElementById('reportsView').style.display = view === 'reports' ? 'block' : 'none';
      document.getElementById('profileView').style.display = view === 'profile' ? 'block' : 'none';
      document.getElementById('searchPillWrap').style.display = view === 'list' ? 'block' : 'none';
      if (view === 'calendar') renderCalendar();
      if (view === 'reports') renderReports();
      if (view === 'profile') fillProfileForm();
    }

    function renderReports() {
      renderReportArea();
      renderReportResp();
    }

    function renderReportArea() {
      const counts = {};
      ALL.forEach((c) => {
        const a = c.area || 'Sin área';
        counts[a] = (counts[a] || 0) + 1;
      });
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const max = entries.length ? entries[0][1] : 1;
      const box = document.getElementById('reportArea');
      box.innerHTML = entries.length
        ? entries
            .map(
              ([area, count]) => `
        <div class="report-row">
          <div class="report-label">${escapeHtml(area)}</div>
          <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round((count / max) * 100)}%;background:var(--violet);"></div></div>
          <div class="report-value">${count} compromiso${count > 1 ? 's' : ''}</div>
        </div>
      `
            )
            .join('')
        : '<p class="report-empty">Aún no hay compromisos.</p>';
    }

    function renderReportResp() {
      const byResp = {};
      ALL.forEach((c) => {
        const names = (c.responsable || 'Sin asignar').split(', ').filter(Boolean);
        names.forEach((r) => {
          if (!byResp[r]) byResp[r] = { total: 0, cerrados: 0 };
          byResp[r].total++;
          if (c.status === 'Cerrado') byResp[r].cerrados++;
        });
      });
      const entries = Object.entries(byResp).sort((a, b) => b[1].cerrados / b[1].total - a[1].cerrados / a[1].total);
      const box = document.getElementById('reportResp');
      box.innerHTML = entries.length
        ? entries
            .map(([name, d]) => {
              const pct = d.total ? Math.round((d.cerrados / d.total) * 100) : 0;
              return `
          <div class="report-row">
            <div class="report-label">${escapeHtml(name)}</div>
            <div class="report-bar-track"><div class="report-bar-fill" style="width:${pct}%;background:${avatarColor(name)};"></div></div>
            <div class="report-value">${pct}% (${d.cerrados}/${d.total})</div>
          </div>
        `;
            })
            .join('')
        : '<p class="report-empty">Aún no hay compromisos.</p>';
    }

    function renderCalendar() {
      const label = MONTH_NAMES[calMonth] + ' ' + calYear;
      document.getElementById('calMonthLabel').textContent = label.charAt(0).toUpperCase() + label.slice(1);
      const eventsByDate = buildEventsByDate();
      const isMobile = window.innerWidth <= 720;
      const body = document.getElementById('calBody');
      body.innerHTML = isMobile ? renderAgendaHtml(eventsByDate) : renderGridHtml(eventsByDate);
      attachCalendarClicks();
    }

    function eventChipsHtml(list, max) {
      const shown = list.slice(0, max);
      let html = shown.map((c) => `<div class="cal-event ${slug(c.status)}">${escapeHtml(c.compromiso)}</div>`).join('');
      if (list.length > shown.length) html += `<div class="cal-more">+${list.length - shown.length} más</div>`;
      return html;
    }

    function renderGridHtml(eventsByDate) {
      const first = new Date(calYear, calMonth, 1);
      const startOffset = (first.getDay() + 6) % 7; // lunes=0
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

      let html = DOW_NAMES.map((d) => `<div class="cal-weekday">${d}</div>`).join('');
      for (let i = 0; i < totalCells; i++) {
        const dayNum = i - startOffset + 1;
        let cellDate, outside = false;
        if (dayNum < 1) {
          cellDate = new Date(calYear, calMonth, dayNum);
          outside = true;
        } else if (dayNum > daysInMonth) {
          cellDate = new Date(calYear, calMonth, dayNum);
          outside = true;
        } else {
          cellDate = new Date(calYear, calMonth, dayNum);
        }
        const key = dateKey(cellDate);
        const isToday = isSameDay(cellDate, today0);
        const dayEvents = eventsByDate[key] || [];
        html += `
          <div class="cal-cell${outside ? ' outside' : ''}${isToday ? ' today' : ''}" data-daykey="${key}">
            <div class="cal-daynum">${cellDate.getDate()}</div>
            <div class="cal-events">${eventChipsHtml(dayEvents, 3)}</div>
          </div>
        `;
      }
      return `<div class="cal-grid">${html}</div>`;
    }

    function renderAgendaHtml(eventsByDate) {
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      let html = '';
      for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(calYear, calMonth, d);
        const key = dateKey(cellDate);
        const isToday = isSameDay(cellDate, today0);
        const dayEvents = eventsByDate[key] || [];
        html += `
          <div class="cal-agenda-day${isToday ? ' today' : ''}${dayEvents.length ? '' : ' empty-day'}" data-daykey="${key}">
            <div class="cal-agenda-head">
              <div class="cal-agenda-num">${d}</div>
              <div class="cal-agenda-dow">${DOW_NAMES_LONG[(cellDate.getDay() + 6) % 7]}</div>
            </div>
            ${
              dayEvents.length
                ? `<div class="cal-agenda-events">${eventChipsHtml(dayEvents, 4)}</div>`
                : '<div class="cal-agenda-empty">Sin compromisos</div>'
            }
          </div>
        `;
      }
      return `<div class="cal-agenda">${html}</div>`;
    }

    function attachCalendarClicks() {
      document.querySelectorAll('[data-daykey]').forEach((el) => {
        el.addEventListener('click', () => openDayModal(el.getAttribute('data-daykey')));
      });
    }

    let dayModalKey = null;
    function openDayModal(key) {
      dayModalKey = key;
      const eventsByDate = buildEventsByDate();
      const dayEvents = eventsByDate[key] || [];
      const [y, m, d] = key.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const label = DOW_NAMES_LONG[(dateObj.getDay() + 6) % 7] + ' ' + d + ' de ' + MONTH_NAMES[m - 1] + ' de ' + y;
      document.getElementById('dayModalTitle').textContent = label.charAt(0).toUpperCase() + label.slice(1);
      document.getElementById('dayModalSub').textContent = dayEvents.length
        ? `${dayEvents.length} compromiso(s) con cierre este día`
        : 'No hay compromisos con cierre este día.';

      const list = document.getElementById('dayModalList');
      list.innerHTML = dayEvents
        .map(
          (c) => `
        <div class="day-item" data-editid="${c.id}">
          <div class="day-item-bar" style="background:var(${
            { Nuevo: '--slate', Abierto: '--violet', Acuerdo: '--amber', Vencido: '--coral', Cerrado: '--green' }[c.status] || '--slate'
          });"></div>
          <div class="day-item-text">${escapeHtml(c.compromiso)}</div>
          <span class="badge ${slug(c.status)}">${c.status}</span>
        </div>
      `
        )
        .join('');
      list.querySelectorAll('[data-editid]').forEach((el) => {
        el.addEventListener('click', () => {
          closeDayModal();
          openEdit(el.getAttribute('data-editid'));
        });
      });

      document.getElementById('btnAddOnDay').style.display = IS_EDITOR ? 'inline-flex' : 'none';
      document.getElementById('overlayDay').classList.add('show');
    }
    function closeDayModal() {
      document.getElementById('overlayDay').classList.remove('show');
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (currentView === 'calendar') renderCalendar();
      }, 200);
    });

    function onData(res) {
      ALL = res.compromisos;
      CATALOGO = res.catalogo;
      fillSelect(document.getElementById('fResponsable'), CATALOGO.responsables, true, 'Responsable: todos');
      fillSelect(document.getElementById('fArea'), CATALOGO.areas, true, 'Área: todas');
      fillSelect(document.getElementById('fStatus'), STATUS_ORDER, true, 'Estado: todos');
      fillSelect(document.getElementById('fPrioridad'), PRIORIDAD_ORDER, true, 'Prioridad: todas');
      fillSelect(document.getElementById('fTipo'), TIPO_ORDER, true, 'Tipo: todos');
      fillSelect(document.getElementById('nArea'), CATALOGO.areas, false);
      nAsignadoPicker.render();
      nSolicitadoPicker.render();
      eAsignadoPicker.render();
      eSolicitadoPicker.render();
      fillSelect(document.getElementById('eStatus'), STATUS_ORDER, false);

      renderStats();
      renderList();

      const banner = document.getElementById('importBanner');
      banner.classList.toggle('show', !!(ME && ME.canImportLegacy) && ALL.length === 0);

      if (editingId) {
        const c = ALL.find((x) => String(x.id) === String(editingId));
        if (c) renderTimeline(c.historial || []);
      }
      if (currentView === 'calendar') renderCalendar();
      if (currentView === 'reports') renderReports();
      updateBellDot();
    }

    function onErrorMsg(err) {
      document.getElementById('list').innerHTML = '<div class="empty">Error al cargar: ' + (err.message || err) + '</div>';
    }

    let ME = null;

    function applyAvatar(el, name, photo) {
      if (!el) return;
      if (photo) {
        el.style.backgroundImage = `url(${photo})`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.textContent = '';
      } else {
        el.style.backgroundImage = '';
        el.textContent = initials(name);
      }
    }

    async function loadAll() {
      try {
        const me = await apiGet('/api/me');
        ME = me;
        IS_EDITOR = !!me.isEditor;
        document.getElementById('fabAdd').classList.toggle('hidden-role', !IS_EDITOR);
        document.getElementById('btnAdd').classList.toggle('hidden-role', !IS_EDITOR);
        document.getElementById('readOnlyBanner').classList.toggle('show', !IS_EDITOR);
        document.getElementById('userName').textContent = me.name || me.username;
        document.getElementById('userRole').textContent = me.isAdmin ? 'Administrador' : 'Miembro';
        applyAvatar(document.getElementById('userAvatar'), me.name, me.photo);
        applyAvatar(document.getElementById('userAvatarMobile'), me.name, me.photo);
      } catch (e) {
        return;
      }
      try {
        const data = await apiGet('/api/data');
        onData(data);
      } catch (e) {
        onErrorMsg(e);
      }
    }

    // ---- Perfil ----
    let pendingPhoto = null; // data URL nueva, pendiente de guardar

    function fillProfileForm() {
      if (!ME) return;
      pendingPhoto = null;
      document.getElementById('profileName').value = ME.name || '';
      document.getElementById('profileUsername').value = ME.username || '';
      document.getElementById('profileCurrentPass').value = '';
      document.getElementById('profileNewPass').value = '';
      applyAvatar(document.getElementById('profileAvatarPreview'), ME.name, ME.photo);
      document.getElementById('profileRoleNote').textContent =
        (ME.isAdmin ? 'Administras al menos un equipo.' : 'No administras ningún equipo todavía.') +
        (ME.canCreateGroups ? '' : ' Si necesitas crear tu propio equipo, pide al operador de la app que te dé permiso.');
      loadMyTeam();
    }

    let myTeamGroups = [];

    async function loadMyTeam() {
      const card = document.getElementById('teamCard');
      if (!ME || !ME.canCreateGroups) {
        card.style.display = 'none';
        return;
      }
      card.style.display = 'block';
      try {
        const data = await apiGet('/api/team/members');
        myTeamGroups = data.groups || [];
        const noGroup = document.getElementById('teamNoGroup');
        const hasGroup = document.getElementById('teamHasGroup');
        if (myTeamGroups.length === 0) {
          noGroup.style.display = 'block';
          hasGroup.style.display = 'none';
        } else {
          noGroup.style.display = 'none';
          hasGroup.style.display = 'block';
          renderTeamMembers();
        }
      } catch (e) {
        toast(e.message || 'No se pudo cargar tu equipo');
      }
    }

    function renderTeamMembers() {
      const box = document.getElementById('teamMembersList');
      box.innerHTML = myTeamGroups
        .map(
          (g) => `
        <div style="margin-bottom:14px;">
          <div style="font-size:13px;font-weight:600;margin-bottom:6px;">${escapeHtml(g.name)}</div>
          ${g.members
            .map(
              (m) => `
            <div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-soft);padding:3px 0;">
              <span class="avatar" style="width:22px;height:22px;font-size:9.5px;">${initials(m.name)}</span>
              ${escapeHtml(m.name)} <code style="font-size:11px;color:var(--ink-faint);">(${m.username})</code>
              <span class="badge ${m.role === 'admin' ? 'abierto' : 'nuevo'}" style="margin-left:auto;">${m.role === 'admin' ? 'Administrador' : 'Miembro'}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `
        )
        .join('');
    }

    async function createMyGroup() {
      const groupName = document.getElementById('newGroupName').value.trim();
      if (!groupName) {
        toast('Escribe el nombre de tu equipo');
        return;
      }
      try {
        await apiSend('/api/team/create', 'POST', { groupName });
        toast('Equipo creado');
        document.getElementById('newGroupName').value = '';
        await loadMyTeam();
        loadAll();
      } catch (e) {
        toast(e.message || 'No se pudo crear el equipo');
      }
    }

    async function addMyTeamMember() {
      if (myTeamGroups.length === 0) return;
      const groupId = myTeamGroups[0].groupId;
      const name = document.getElementById('newMemberName').value.trim();
      const username = document.getElementById('newMemberUsername').value.trim();
      const password = document.getElementById('newMemberPassword').value;
      const role = document.getElementById('newMemberRole').value;
      if (!name || !username) {
        toast('Falta el nombre o el usuario');
        return;
      }
      try {
        await apiSend('/api/team/add-member', 'POST', { groupId, name, username, password, role });
        toast('Persona agregada a tu equipo');
        document.getElementById('newMemberName').value = '';
        document.getElementById('newMemberUsername').value = '';
        document.getElementById('newMemberPassword').value = '';
        await loadMyTeam();
        loadAll();
      } catch (e) {
        toast(e.message || 'No se pudo agregar a la persona');
      }
    }

    function resizeImageFile(file, maxSize, callback) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    async function saveProfile() {
      const name = document.getElementById('profileName').value.trim();
      if (!name) {
        toast('El nombre no puede estar vacío');
        return;
      }
      const payload = { name };
      if (pendingPhoto) payload.photo = pendingPhoto;
      try {
        const updated = await apiSend('/api/profile', 'POST', payload);
        ME = { ...ME, name: updated.name, photo: updated.photo };
        pendingPhoto = null;
        document.getElementById('userName').textContent = ME.name;
        applyAvatar(document.getElementById('userAvatar'), ME.name, ME.photo);
        applyAvatar(document.getElementById('userAvatarMobile'), ME.name, ME.photo);
        applyAvatar(document.getElementById('profileAvatarPreview'), ME.name, ME.photo);
        toast('Perfil actualizado');
        loadAll();
      } catch (e) {
        toast(e.message || 'No se pudo guardar el perfil');
      }
    }

    async function savePassword() {
      const currentPassword = document.getElementById('profileCurrentPass').value;
      const newPassword = document.getElementById('profileNewPass').value;
      if (!currentPassword || !newPassword) {
        toast('Completa ambos campos de contraseña');
        return;
      }
      if (newPassword.length < 6) {
        toast('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      try {
        await apiSend('/api/profile', 'POST', { currentPassword, newPassword });
        document.getElementById('profileCurrentPass').value = '';
        document.getElementById('profileNewPass').value = '';
        toast('Contraseña actualizada');
      } catch (e) {
        toast(e.message || 'No se pudo cambiar la contraseña');
      }
    }

    async function importarInicial() {
      const btn = document.getElementById('btnImportar');
      btn.disabled = true;
      btn.textContent = 'Importando…';
      try {
        const res = await apiSend('/api/import-once', 'POST', {});
        onData(res);
        toast('Compromisos importados');
      } catch (e) {
        toast(e.message || 'No se pudo importar');
        btn.disabled = false;
        btn.textContent = 'Importar compromisos iniciales';
      }
    }

    function openAdd(presetIsoDate) {
      document.getElementById('nCompromiso').value = '';
      document.getElementById('nPromesa').value = presetIsoDate || '';
      document.getElementById('nComentarios').value = '';
      document.getElementById('nPrioridad').value = '';
      document.getElementById('nTipo').value = 'General';
      nAsignadoPicker.setSelected(ME ? [ME.username] : []);
      nSolicitadoPicker.setSelected([]);
      document.getElementById('overlayAdd').classList.add('show');
    }
    function closeAdd() {
      document.getElementById('overlayAdd').classList.remove('show');
    }
    async function saveAdd() {
      const compromiso = document.getElementById('nCompromiso').value.trim();
      if (!compromiso) {
        toast('Escribe el compromiso');
        return;
      }
      const assignedTo = nAsignadoPicker.getSelected();
      if (assignedTo.length === 0) {
        toast('Elige al menos una persona en "Asignado a"');
        return;
      }
      const prioridad = document.getElementById('nPrioridad').value;
      if (!prioridad) {
        toast('Elige una prioridad');
        return;
      }
      const payload = {
        fecha: isoToDdmmyyyy(isoToday()),
        area: document.getElementById('nArea').value,
        tema: '',
        compromiso,
        assignedTo,
        solicitadoPor: nSolicitadoPicker.getSelected(),
        prioridad,
        tipo: document.getElementById('nTipo').value,
        promesaCierre: isoToDdmmyyyy(document.getElementById('nPromesa').value),
        status: 'Nuevo',
        comentarios: document.getElementById('nComentarios').value,
      };
      try {
        const res = await apiSend('/api/compromiso', 'POST', payload);
        onData(res);
        closeAdd();
        toast('Compromiso agregado');
      } catch (e) {
        toast(e.message || 'No se pudo guardar');
      }
    }

    function renderTimeline(historial) {
      const box = document.getElementById('timeline');
      if (!historial || historial.length === 0) {
        box.innerHTML = '<div class="timeline-empty">Aún no hay avances registrados para este compromiso.</div>';
        return;
      }
      box.innerHTML = historial
        .map(
          (h, i) => `
        <div class="t-item" style="animation-delay:${i * 0.05}s;">
          <div class="t-rail"><div class="t-dot"></div><div class="t-line"></div></div>
          <div class="t-content">
            <div class="t-date">${h.fecha}</div>
            <div class="t-text">${escapeHtml(h.avance)}</div>
          </div>
        </div>
      `
        )
        .join('');
    }

    let editingIsCreator = false;
    function openEdit(id) {
      const c = ALL.find((x) => String(x.id) === String(id));
      if (!c) return;
      editingId = id;
      editingIsCreator = !!(ME && c.assignedBy === ME.username);
      document.getElementById('editCompromisoTexto').textContent = c.compromiso;
      document.getElementById('eStatus').value = c.status;
      document.getElementById('ePromesa').value = ddmmyyyyToIso(c.promesaCierre);
      document.getElementById('ePrioridad').value = c.prioridad || '';
      document.getElementById('eTipo').value = c.tipo || 'General';
      document.getElementById('eAvance').value = '';
      renderTimeline(c.historial || []);

      document.getElementById('eStatus').disabled = !IS_EDITOR;
      document.getElementById('ePromesa').disabled = !IS_EDITOR;
      document.getElementById('ePrioridad').disabled = !IS_EDITOR;
      document.getElementById('eTipo').disabled = !IS_EDITOR;
      document.getElementById('editActions').style.display = IS_EDITOR ? 'flex' : 'none';
      document.getElementById('avanceField').style.display = IS_EDITOR ? 'flex' : 'none';
      document.getElementById('btnSaveAvance').style.display = IS_EDITOR ? 'inline-flex' : 'none';

      document.getElementById('eAsignadoPicker').style.display = editingIsCreator ? 'block' : 'none';
      document.getElementById('eAsignadoReadonly').style.display = editingIsCreator ? 'none' : 'block';
      document.getElementById('eSolicitadoPicker').style.display = editingIsCreator ? 'block' : 'none';
      document.getElementById('eSolicitadoReadonly').style.display = editingIsCreator ? 'none' : 'block';
      if (editingIsCreator) {
        eAsignadoPicker.setSelected(c.assignedTo || []);
        eSolicitadoPicker.setSelected(c.solicitadoPorUsernames || []);
      } else {
        document.getElementById('eAsignadoReadonly').textContent = c.responsable || '—';
        document.getElementById('eSolicitadoReadonly').textContent = c.solicitadoPor || 'Nadie';
      }

      document.getElementById('overlayEdit').classList.add('show');
    }
    function closeEdit() {
      document.getElementById('overlayEdit').classList.remove('show');
      editingId = null;
    }
    async function saveEdit() {
      if (!editingId) return;
      const prioridad = document.getElementById('ePrioridad').value;
      if (!prioridad) {
        toast('Elige una prioridad');
        return;
      }
      const updates = {
        status: document.getElementById('eStatus').value,
        promesaCierre: isoToDdmmyyyy(document.getElementById('ePromesa').value),
        prioridad,
        tipo: document.getElementById('eTipo').value,
      };
      if (editingIsCreator) {
        const assignedTo = eAsignadoPicker.getSelected();
        if (assignedTo.length > 0) updates.assignedTo = assignedTo;
        updates.solicitadoPor = eSolicitadoPicker.getSelected();
      }
      try {
        const res = await apiSend('/api/compromiso-update', 'POST', { id: editingId, ...updates });
        onData(res);
        toast('Cambios guardados');
      } catch (e) {
        toast(e.message || 'No se pudo actualizar');
      }
    }
    async function saveAvance() {
      if (!editingId) return;
      const texto = document.getElementById('eAvance').value.trim();
      if (!texto) {
        toast('Escribe el avance antes de guardar');
        return;
      }
      try {
        const res = await apiSend('/api/compromiso-avance', 'POST', { id: editingId, avance: texto });
        onData(res);
        document.getElementById('eAvance').value = '';
        toast('Avance agregado');
      } catch (e) {
        toast(e.message || 'No se pudo agregar el avance');
      }
    }

    async function logout() {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    }

    function getStoredTheme() {
      try {
        return localStorage.getItem('minuta-theme');
      } catch (e) {
        return null;
      }
    }
    function storeTheme(v) {
      try {
        localStorage.setItem('minuta-theme', v);
      } catch (e) {
        /* sin storage disponible */
      }
    }
    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
    }
    (function initTheme() {
      const stored = getStoredTheme();
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(stored || (prefersDark ? 'dark' : 'light'));
    })();

    document.getElementById('fResponsable').addEventListener('change', renderList);
    document.getElementById('fArea').addEventListener('change', renderList);
    document.getElementById('fStatus').addEventListener('change', () => {
      activeStatFilter = '';
      renderStats();
      renderList();
    });
    document.getElementById('fBuscar').addEventListener('input', renderList);
    document.getElementById('fPrioridad').addEventListener('change', renderList);
    document.getElementById('fTipo').addEventListener('change', renderList);

    document.getElementById('btnAdd').addEventListener('click', () => openAdd());
    document.getElementById('fabAdd').addEventListener('click', () => openAdd());
    document.getElementById('btnCancelAdd').addEventListener('click', closeAdd);
    document.getElementById('btnSaveAdd').addEventListener('click', saveAdd);
    document.getElementById('btnCancelEdit').addEventListener('click', closeEdit);
    document.getElementById('btnSaveEdit').addEventListener('click', saveEdit);
    document.getElementById('btnSaveAvance').addEventListener('click', saveAvance);
    document.getElementById('btnImportar').addEventListener('click', importarInicial);
    document.getElementById('btnChangePhoto').addEventListener('click', () => document.getElementById('photoInput').click());
    document.getElementById('profileAvatarPreview').addEventListener('click', () => document.getElementById('photoInput').click());
    document.getElementById('photoInput').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      resizeImageFile(file, 240, (dataUrl) => {
        pendingPhoto = dataUrl;
        const preview = document.getElementById('profileAvatarPreview');
        preview.style.backgroundImage = `url(${dataUrl})`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
        preview.textContent = '';
      });
    });
    document.getElementById('btnSaveProfile').addEventListener('click', saveProfile);
    document.getElementById('btnSavePassword').addEventListener('click', savePassword);
    document.getElementById('btnCreateGroup').addEventListener('click', createMyGroup);
    document.getElementById('btnAddTeamMember').addEventListener('click', addMyTeamMember);
    document.getElementById('btnExportar').addEventListener('click', () => {
      window.location.href = '/api/export';
    });
    document.getElementById('btnLogout').addEventListener('click', logout);
    document.getElementById('btnLogoutMobile').addEventListener('click', logout);
    document.getElementById('btnTheme').addEventListener('click', toggleTheme);
    document.getElementById('btnThemeMobile').addEventListener('click', toggleTheme);
    document.getElementById('btnBell').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotifDropdown();
    });
    document.getElementById('btnClearNotifs').addEventListener('click', () => {
      const ids = getNotifications().map((c) => c.id);
      const dismissed = getDismissed();
      ids.forEach((id) => {
        if (!dismissed.includes(id)) dismissed.push(id);
      });
      setDismissed(dismissed);
      renderNotifDropdown();
    });
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('notifDropdown');
      const bell = document.getElementById('btnBell');
      if (dropdown.classList.contains('show') && !dropdown.contains(e.target) && !bell.contains(e.target)) {
        closeNotifDropdown();
      }
    });
    ['overlayAdd', 'overlayEdit'].forEach((id) => {
      document.getElementById(id).addEventListener('click', (e) => {
        if (e.target.id === id) {
          id === 'overlayAdd' ? closeAdd() : closeEdit();
        }
      });
    });
    document.querySelectorAll('.nav-item, .bn-item').forEach((el) => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.nav-item, .bn-item').forEach((n) => n.classList.remove('active'));
        document.querySelectorAll(`[data-nav="${el.dataset.nav}"]`).forEach((n) => n.classList.add('active'));
        const nav = el.dataset.nav;
        if (nav === 'calendario') {
          showView('calendar');
        } else if (nav === 'reportes') {
          showView('reports');
        } else if (nav === 'config') {
          showView('profile');
        } else if (nav === 'compromisos') {
          showView('list');
        } else {
          toast('Próximamente');
        }
      });
    });

    document.getElementById('calPrev').addEventListener('click', () => {
      calMonth--;
      if (calMonth < 0) {
        calMonth = 11;
        calYear--;
      }
      renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', () => {
      calMonth++;
      if (calMonth > 11) {
        calMonth = 0;
        calYear++;
      }
      renderCalendar();
    });
    document.getElementById('calToday').addEventListener('click', () => {
      calYear = today0.getFullYear();
      calMonth = today0.getMonth();
      renderCalendar();
    });
    document.getElementById('btnCloseDay').addEventListener('click', closeDayModal);
    document.getElementById('btnAddOnDay').addEventListener('click', () => {
      const key = dayModalKey;
      closeDayModal();
      openAdd(key || '');
    });
    document.getElementById('overlayDay').addEventListener('click', (e) => {
      if (e.target.id === 'overlayDay') closeDayModal();
    });

    loadAll();
  }, [router]);

  return (
    <>
      <Head>
        <title>Minuta Ultrasonido — Seguimiento de Compromisos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{PAGE_STYLES}</style>
      </Head>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </>
  );
}
