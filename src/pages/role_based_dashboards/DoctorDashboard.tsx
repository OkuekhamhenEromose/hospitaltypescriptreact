// components/dashboards/DoctorDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { UniversalIcon } from "../../components/Modernicon";

const C = {
  blue1: "#1378e5", blue2: "#177fed", blue3: "#0f5fc4",
  red: "#e53935", white: "#ffffff", slate: "#f0f4fa",
  muted: "#8aa0ba", text: "#0d1b2e", soft: "#e8f0fc",
  green: "#12b76a", amber: "#f59e0b", purple: "#7c3aed",
};

interface Appointment {
  id:number; patient:any; name:string; age:number; sex:string;
  address:string; message:string; status:string; booked_at:string;
  medical_report?:any; vitals?:any; lab_results?:any[]; test_requests?:any; vital_requests?:any;
}

const ST: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  COMPLETED:        { label: "Completed",       bg: "#ecfdf5", color: "#059669", dot: "#12b76a" },
  IN_REVIEW:        { label: "In Review",        bg: "#eff6ff", color: "#1378e5", dot: "#177fed" },
  AWAITING_RESULTS: { label: "Awaiting Results", bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  PENDING:          { label: "Pending",          bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" },
};

const ls: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 6 };
const is: React.CSSProperties = { width: "100%", height: 40, padding: "0 12px", border: `1.5px solid ${C.soft}`, borderRadius: 10, fontSize: 13, color: C.text, background: C.slate, outline: "none", fontFamily: "inherit", marginBottom: 16 };
const ts: React.CSSProperties = { width: "100%", padding: "10px 12px", border: `1.5px solid ${C.soft}`, borderRadius: 10, fontSize: 13, color: C.text, background: C.slate, outline: "none", fontFamily: "inherit", resize: "vertical" as const, marginBottom: 16 };

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,46,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(3px)" }}>
      <div style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: wide ? 580 : 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(23,127,237,0.2)", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.soft}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: C.white, borderRadius: "18px 18px 0 0", zIndex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: C.slate, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UniversalIcon name="X" size={14} style={{ color: C.muted }} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Actions({ onCancel, label, color = C.blue2 }: { onCancel: () => void; label: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
      <button type="button" onClick={onCancel} style={{ padding: "9px 20px", borderRadius: 9, border: `1.5px solid ${C.soft}`, background: C.white, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
      <button type="submit" style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: color, color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 12px ${color}55` }}>{label}</button>
    </div>
  );
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [tab, setTab] = useState<"all"|"awaiting"|"in_review"|"completed">("all");
  const [collapsed, setCollapsed] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showVital, setShowVital] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [testData, setTestData] = useState({ tests: "", note: "" });
  const [vitalData, setVitalData] = useState({ note: "" });
  const [reportData, setReportData] = useState({ medical_condition: "", drug_prescription: "", advice: "", next_appointment: "" });

  const testOptions = ["Glucose","Blood Test","Blood Count","Urinalysis","Electrolyte","HIV","Tumour Marker","Protein","Serum","Lipid Panel","Blood Lead"];

  const imgUrl = (p: any) => p?.profile_pix ? (p.profile_pix.startsWith("http") ? p.profile_pix : `https://hospitalback-clean.onrender.com${p.profile_pix}`) : null;

  const navItems = [
    { id: "all",       label: "All Appointments", icon: "Calendar", count: appointments.length },
    { id: "awaiting",  label: "Awaiting Results",  icon: "Clock",    count: appointments.filter(a=>a.status==="AWAITING_RESULTS").length },
    { id: "in_review", label: "In Review",         icon: "Eye",      count: appointments.filter(a=>a.status==="IN_REVIEW").length },
    { id: "completed", label: "Completed",         icon: "Check",    count: appointments.filter(a=>a.status==="COMPLETED").length },
  ];

  const stats = [
    { label: "Total",    value: appointments.length, sub: `+${appointments.filter(a=>a.status==="PENDING").length} new`, grad: `135deg,${C.blue1},${C.blue2}`, icon: "Users" },
    { label: "In Review",value: appointments.filter(a=>a.status==="IN_REVIEW").length, sub: "Under assessment",    grad: "135deg,#059669,#10b981",          icon: "Eye" },
    { label: "Awaiting", value: appointments.filter(a=>a.status==="AWAITING_RESULTS").length, sub: "Pending results",     grad: `135deg,#d97706,${C.amber}`,       icon: "Clock" },
    { label: "Completed",value: appointments.filter(a=>a.status==="COMPLETED").length, sub: "Fully resolved",      grad: `135deg,${C.purple},#9333ea`,     icon: "Check" },
  ];

  useEffect(() => { load(); return undefined; }, []);
  useEffect(() => {
    let f = appointments;
    if (tab === "awaiting")  f = f.filter(a=>a.status==="AWAITING_RESULTS");
    if (tab === "in_review") f = f.filter(a=>a.status==="IN_REVIEW");
    if (tab === "completed") f = f.filter(a=>a.status==="COMPLETED");
    if (q.trim()) { const lq=q.toLowerCase(); f=f.filter(a=>a.name.toLowerCase().includes(lq)||a.address?.toLowerCase().includes(lq)||a.status.toLowerCase().includes(lq)); }
    setFiltered(f);
  }, [appointments, tab, q]);

  async function load() {
    try { const d = await apiService.getAppointments(); setAppointments(d as Appointment[]); } catch {} finally { setLoading(false); }
  }

  async function submitTest(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return;
    try { await apiService.createTestRequest({ appointment: selected.id, ...testData }); setShowTest(false); setTestData({tests:"",note:""}); load(); alert("Test request sent!"); } catch { alert("Failed to send test request."); }
  }
  async function submitVital(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return;
    try { await apiService.createVitalRequest({ appointment: selected.id, ...vitalData }); setShowVital(false); setVitalData({note:""}); load(); alert("Vital request sent!"); } catch { alert("Failed to send vital request."); }
  }
  async function submitReport(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return;
    try { await apiService.createMedicalReport({ appointment: selected.id, ...reportData }); setShowReport(false); setReportData({medical_condition:"",drug_prescription:"",advice:"",next_appointment:""}); load(); alert("Report created!"); } catch { alert("Failed to create report."); }
  }

  function exportCSV(a: Appointment) {
    const rows = { "Patient":a.name,"Age":a.age,"Gender":a.sex==="M"?"Male":"Female","Status":a.status,"Booked":new Date(a.booked_at).toLocaleDateString() };
    const csv = Object.entries(rows).map(([k,v])=>`"${k}","${v}"`).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob); const el = document.createElement("a");
    el.href=url; el.download=`patient_${a.id}.csv`; el.click(); URL.revokeObjectURL(url);
  }

  const sw = collapsed ? 72 : 248;

  if (loading) return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:"100vh", background:C.slate, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{textAlign:"center"}}>
        <div style={{width:44,height:44,border:`3px solid ${C.soft}`,borderTopColor:C.blue2,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}}/>
        <p style={{color:C.muted,fontSize:13}}>Loading doctor dashboard…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", WebkitFontSmoothing:"antialiased", minHeight:"100vh", background:C.slate, display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:${C.soft};border-radius:4px}
        .nh:hover{background:${C.soft}!important}.rh:hover{background:${C.slate}!important}
        .bp:hover{background:${C.blue3}!important}.gh:hover{background:#059669!important}.ph:hover{background:#6d28d9!important}
        .xh:hover{background:${C.soft}!important}.ch:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(23,127,237,0.12)!important}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fi 0.2s ease forwards}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width:sw, minHeight:"100vh", background:C.white, display:"flex", flexDirection:"column", borderRight:`1px solid ${C.soft}`, position:"sticky", top:0, height:"100vh", overflow:"hidden", flexShrink:0, transition:"width 0.25s cubic-bezier(.4,0,.2,1)", boxShadow:"2px 0 10px rgba(23,127,237,0.05)" }}>
        <div style={{ padding:"18px 14px 14px", borderBottom:`1px solid ${C.soft}`, display:"flex", alignItems:"center", gap:10, minHeight:62 }}>
          <UniversalIcon name="Logo" size={30} style={{flexShrink:0}} />
          {!collapsed && <div><div style={{fontWeight:700,fontSize:14,color:C.text,lineHeight:1.2,whiteSpace:"nowrap"}}>Etha-Atlantic</div><div style={{fontSize:11,color:C.muted}}>Doctor Panel</div></div>}
        </div>
        <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:3 }}>
          {navItems.map(n => { const act = tab===n.id; return (
            <button key={n.id} className="nh" onClick={() => setTab(n.id as any)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:collapsed?"10px":"10px 12px", borderRadius:10, border:"none", cursor:"pointer", background:act?C.soft:"transparent", justifyContent:collapsed?"center":"flex-start", transition:"all 0.15s" }}>
              <UniversalIcon name={n.icon} size={17} style={{color:act?C.blue2:C.muted,flexShrink:0}} />
              {!collapsed && <><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:act?600:400,color:act?C.text:C.muted,whiteSpace:"nowrap"}}>{n.label}</span><span style={{fontSize:11,fontWeight:600,minWidth:20,height:20,borderRadius:10,background:act?C.blue2:"#eef2f7",color:act?C.white:C.muted,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px"}}>{n.count}</span></>}
            </button>
          );})}
        </nav>
        <div style={{ borderTop:`1px solid ${C.soft}`, padding:"10px 8px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:10, background:C.slate }}>
            <div style={{ width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue1},${C.blue2})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden" }}>
              {imgUrl(user?.profile)?<img src={imgUrl(user?.profile)!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:C.white,fontSize:12,fontWeight:600}}>{user?.profile?.fullname?.charAt(0)||"D"}</span>}
            </div>
            {!collapsed && <div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:12.5,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Dr. {user?.profile?.fullname||user?.username}</div><div style={{fontSize:11,color:C.muted}}>Doctor</div></div>}
          </div>
          <button className="nh" onClick={() => setCollapsed(!collapsed)} style={{ marginTop:6,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"7px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:C.muted,fontSize:12,transition:"all 0.15s" }}>
            <UniversalIcon name="ChevLeft" size={13} style={{transition:"transform 0.25s",transform:collapsed?"rotate(180deg)":"none"}} />
            {!collapsed&&<span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Topbar */}
        <header style={{ background:C.white, borderBottom:`1px solid ${C.soft}`, padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:30, boxShadow:"0 1px 8px rgba(23,127,237,0.05)" }}>
          <div><div style={{fontSize:17,fontWeight:700,color:C.text}}>{navItems.find(n=>n.id===tab)?.label}</div><div style={{fontSize:12,color:C.muted}}>{filtered.length} appointments</div></div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ position:"relative" }}>
              <UniversalIcon name="Search" size={14} style={{color:C.muted,position:"absolute",left:11,top:"50%",transform:"translateY(-50%)"}} />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={{paddingLeft:32,paddingRight:14,height:37,border:`1.5px solid ${C.soft}`,borderRadius:10,fontSize:13,color:C.text,background:C.slate,outline:"none",width:210,fontFamily:"inherit"}}/>
            </div>
            <button className="xh" style={{width:37,height:37,borderRadius:10,border:`1.5px solid ${C.soft}`,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"all 0.15s"}}>
              <UniversalIcon name="Bell" size={16} style={{color:C.muted}} />
              <span style={{position:"absolute",top:8,right:8,width:6,height:6,borderRadius:"50%",background:C.red,border:`1.5px solid ${C.white}`}}/>
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px 5px 5px", borderRadius:10, background:C.slate, border:`1.5px solid ${C.soft}` }}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue1},${C.blue2})`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                {imgUrl(user?.profile)?<img src={imgUrl(user?.profile)!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:C.white,fontSize:12,fontWeight:600}}>{user?.profile?.fullname?.charAt(0)||"D"}</span>}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:C.text}}>Dr. {user?.profile?.fullname?.split(" ")[0]||user?.username}</span>
              <UniversalIcon name="ChevDown" size={13} style={{color:C.muted}} />
            </div>
          </div>
        </header>

        <main style={{ flex:1, padding:"26px 28px", overflowY:"auto" }}>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:22 }}>
            {stats.map((s,i) => (
              <div key={i} className="ch" style={{ background:C.white, borderRadius:16, padding:"18px 20px", border:`1px solid ${C.soft}`, boxShadow:"0 1px 4px rgba(23,127,237,0.05)", transition:"all 0.2s" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(${s.grad})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 10px rgba(0,0,0,0.1)"}}>
                    <UniversalIcon name={s.icon} size={17} style={{color:C.white}} />
                  </div>
                  <span style={{fontSize:11,fontWeight:600,color:C.green,background:"#ecfdf5",padding:"2px 8px",borderRadius:20}}>{s.sub}</span>
                </div>
                <div style={{fontSize:28,fontWeight:700,color:C.text,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:12.5,color:C.muted,marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Summary bar */}
          <div style={{ background:`linear-gradient(135deg,${C.blue1}08,${C.blue2}14)`, border:`1px solid ${C.soft}`, borderRadius:14, padding:"14px 20px", marginBottom:22, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div><div style={{fontSize:14,fontWeight:600,color:C.text}}>Patient Overview</div><div style={{fontSize:12.5,color:C.muted,marginTop:2}}>{filtered.length} records{q&&` · "${q}"`}</div></div>
            <div style={{display:"flex",gap:24}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.blue2}}>{appointments.filter(a=>new Date(a.booked_at).toDateString()===new Date().toDateString()).length}</div><div style={{fontSize:11,color:C.muted}}>Today's Patients</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.text}}>20 min</div><div style={{fontSize:11,color:C.muted}}>Avg. Consult</div></div>
            </div>
          </div>

          {/* Appointments list */}
          <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.soft}`, overflow:"hidden", boxShadow:"0 1px 6px rgba(23,127,237,0.05)" }}>
            <div style={{ padding:"16px 22px", borderBottom:`1px solid ${C.soft}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div><div style={{fontSize:15,fontWeight:700,color:C.text}}>Patient Appointments</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{filtered.length} records</div></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {q&&<button onClick={()=>setQ("")} className="xh" style={{fontSize:12,color:C.blue1,padding:"4px 10px",borderRadius:6,border:"none",background:C.soft,cursor:"pointer",transition:"all 0.15s"}}>Clear</button>}
                <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                  <UniversalIcon name="Filter" size={12} style={{color:C.muted,position:"absolute",left:9,pointerEvents:"none"}} />
                  <select value={tab} onChange={e=>setTab(e.target.value as any)} style={{paddingLeft:26,paddingRight:10,height:34,border:`1.5px solid ${C.soft}`,borderRadius:8,fontSize:12.5,background:C.white,color:C.text,cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
                    <option value="all">All Status</option><option value="in_review">In Review</option><option value="awaiting">Awaiting</option><option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {filtered.length===0 ? (
              <div style={{padding:"60px 24px",textAlign:"center"}}>
                <UniversalIcon name="Calendar" size={38} style={{color:"#dce7f5",margin:"0 auto 10px"}} />
                <div style={{fontSize:15,fontWeight:600,color:C.muted}}>No appointments found</div>
                <div style={{fontSize:12.5,color:"#b0bec5",marginTop:4}}>{q?`No results for "${q}"`:"Try changing the filter above"}</div>
              </div>
            ) : filtered.map((a,i)=>{
              const st = ST[a.status]||ST.PENDING;
              return (
                <div key={a.id} className="rh fi" style={{padding:"18px 22px",borderBottom:i<filtered.length-1?`1px solid ${C.soft}`:"none",transition:"background 0.15s"}}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue1},${C.blue2})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15,fontWeight:700,color:C.white}}>{a.name.charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:14.5,fontWeight:700,color:C.text}}>{a.name}</span>
                        <span style={{fontSize:11.5,fontWeight:600,padding:"2px 10px",borderRadius:20,background:st.bg,color:st.color,display:"flex",alignItems:"center",gap:5}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:st.dot,flexShrink:0}}/>{st.label}
                        </span>
                      </div>
                      <div style={{fontSize:12.5,color:C.muted,marginBottom:6}}>Age {a.age} · {a.sex==="M"?"Male":a.sex==="F"?"Female":"Other"} · #{a.id}</div>
                      {a.address&&<div style={{fontSize:12.5,color:C.muted,marginBottom:5}}><b>Address:</b> {a.address}</div>}
                      {a.message&&<div style={{background:C.slate,borderRadius:8,padding:"8px 12px",marginBottom:7,fontSize:12.5,color:C.muted,borderLeft:`3px solid ${C.blue2}40`}}><b style={{color:C.text}}>Message:</b> {a.message}</div>}
                      <div style={{fontSize:11.5,color:"#b0bec5"}}>Booked {new Date(a.booked_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                      {a.test_requests&&<div style={{marginTop:10,padding:"9px 13px",background:`${C.blue2}08`,borderRadius:10,border:`1px solid ${C.soft}`}}><div style={{fontSize:12,fontWeight:700,color:C.blue1,marginBottom:3}}>Test Requests</div><div style={{fontSize:12.5,color:C.muted}}>Tests: {a.test_requests.tests}</div>{a.test_requests.note&&<div style={{fontSize:12.5,color:C.muted}}>Note: {a.test_requests.note}</div>}</div>}
                      {a.vitals&&<div style={{marginTop:8,padding:"9px 13px",background:"#ecfdf5",borderRadius:10,border:"1px solid #bbf7d0"}}><div style={{fontSize:12,fontWeight:700,color:"#059669",marginBottom:4}}>Vital Signs</div><div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{[["BP",a.vitals.blood_pressure],["Pulse",a.vitals.pulse_rate],["Temp",`${a.vitals.body_temperature}°C`],["Resp",a.vitals.respiration_rate]].filter(v=>v[1]).map((v,vi)=><span key={vi} style={{fontSize:12.5,color:C.muted}}><b style={{color:C.text}}>{v[0]}:</b> {v[1]}</span>)}</div></div>}
                      {a.lab_results&&a.lab_results.length>0&&<div style={{marginTop:8,padding:"9px 13px",background:"#faf5ff",borderRadius:10,border:"1px solid #e9d5ff"}}><div style={{fontSize:12,fontWeight:700,color:C.purple,marginBottom:3}}>Lab Results</div>{a.lab_results.slice(0,2).map((r,ri)=><div key={ri} style={{fontSize:12.5,color:C.muted}}><b style={{color:C.text}}>{r.test_name}:</b> {r.result} {r.units}</div>)}{a.lab_results.length>2&&<div style={{fontSize:11.5,color:C.purple}}>+{a.lab_results.length-2} more</div>}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:7,flexShrink:0}}>
                      {a.status!=="COMPLETED"&&<>
                        <button className="bp" onClick={()=>{setSelected(a);setShowTest(true);}} style={{padding:"7px 13px",background:C.blue2,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",boxShadow:`0 2px 8px ${C.blue2}44`}}>
                          <UniversalIcon name="FileText" size={13} />Request Tests
                        </button>
                        <button className="gh" onClick={()=>{setSelected(a);setShowVital(true);}} style={{padding:"7px 13px",background:C.green,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
                          <UniversalIcon name="Activity" size={13} />Request Vitals
                        </button>
                        {(a.vitals||(a.lab_results&&a.lab_results.length>0))&&<button className="ph" onClick={()=>{setSelected(a);setShowReport(true);}} style={{padding:"7px 13px",background:C.purple,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
                          <UniversalIcon name="Stethoscope" size={13} />Create Report
                        </button>}
                      </>}
                      <button className="xh" onClick={()=>exportCSV(a)} style={{padding:"7px 13px",background:C.white,color:C.muted,borderRadius:8,border:`1.5px solid ${C.soft}`,cursor:"pointer",fontSize:12.5,fontWeight:500,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
                        <UniversalIcon name="Download" size={13} />Export
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* TEST REQUEST MODAL */}
      {showTest&&selected&&<Modal title="Request Lab Tests" onClose={()=>setShowTest(false)}>
        <form onSubmit={submitTest}>
          <label style={ls}>Select Tests</label>
          <div style={{border:`1.5px solid ${C.soft}`,borderRadius:10,padding:"8px 12px",maxHeight:170,overflowY:"auto",marginBottom:16,background:C.slate}}>
            {testOptions.map(t=><label key={t} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 4px",cursor:"pointer"}}>
              <input type="checkbox" value={t} style={{accentColor:C.blue2}} onChange={e=>{const sel=testData.tests.split(",").filter(x=>x.trim()).filter(x=>x!==t);if(e.target.checked)sel.push(t);setTestData({...testData,tests:sel.join(", ")});}}/>
              <span style={{fontSize:13,color:C.text}}>{t}</span>
            </label>)}
          </div>
          <label style={ls}>Note (Optional)</label>
          <textarea value={testData.note} onChange={e=>setTestData({...testData,note:e.target.value})} rows={3} style={ts} placeholder="Notes for the lab…"/>
          <Actions onCancel={()=>setShowTest(false)} label="Send Request"/>
        </form>
      </Modal>}

      {/* VITAL REQUEST MODAL */}
      {showVital&&selected&&<Modal title="Request Vital Signs" onClose={()=>setShowVital(false)}>
        <form onSubmit={submitVital}>
          <label style={ls}>Note (Optional)</label>
          <textarea value={vitalData.note} onChange={e=>setVitalData({note:e.target.value})} rows={4} style={ts} placeholder="Notes for the nurse…"/>
          <Actions onCancel={()=>setShowVital(false)} label="Send Request" color={C.green}/>
        </form>
      </Modal>}

      {/* MEDICAL REPORT MODAL */}
      {showReport&&selected&&<Modal title="Create Medical Report" onClose={()=>setShowReport(false)} wide>
        <form onSubmit={submitReport}>
          <label style={ls}>Medical Condition / Diagnosis *</label>
          <select required value={reportData.medical_condition} onChange={e=>setReportData({...reportData,medical_condition:e.target.value})} style={is}>
            <option value="">Select condition…</option>
            {["HIV","Cancer","Kidney Stone","Chronic Heart Failure","Leukaemia","Diabetes","Liver Disease","Tuberculosis","Hernia","Hypertension","Asthma","Other"].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <label style={ls}>Drug Prescription</label>
          <textarea value={reportData.drug_prescription} onChange={e=>setReportData({...reportData,drug_prescription:e.target.value})} rows={3} style={ts} placeholder="Medications and dosage…"/>
          <label style={ls}>Health Advice & Recommendations</label>
          <textarea value={reportData.advice} onChange={e=>setReportData({...reportData,advice:e.target.value})} rows={3} style={ts} placeholder="Lifestyle changes, diet…"/>
          <label style={ls}>Next Appointment (Optional)</label>
          <input type="date" value={reportData.next_appointment} onChange={e=>setReportData({...reportData,next_appointment:e.target.value})} style={is}/>
          <Actions onCancel={()=>setShowReport(false)} label="Create Report" color={C.purple}/>
        </form>
      </Modal>}
    </div>
  );
};

export default DoctorDashboard;