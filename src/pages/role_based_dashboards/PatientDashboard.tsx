// components/dashboards/PatientDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";

const C = {
  blue1:"#1378e5",blue2:"#177fed",blue3:"#0f5fc4",red:"#e53935",white:"#ffffff",
  slate:"#f0f4fa",muted:"#8aa0ba",text:"#0d1b2e",soft:"#e8f0fc",
  green:"#12b76a",amber:"#f59e0b",purple:"#7c3aed",emerald:"#059669",
};

const I: Record<string, (p: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  Logo: p=><svg viewBox="0 0 32 32" {...p}><rect width="32" height="32" rx="8" fill="#177fed"/><path d="M16 6v20M6 16h20" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/></svg>,
  Home: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Plus: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  FileText: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  History: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
  Clock: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
  Check: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Calendar: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Download: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  Activity: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Shield: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Bell: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Search: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
  ChevDown: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  ChevLeft: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 18l-6-6 6-6"/></svg>,
  X: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Filter: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  User: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

interface Appointment {
  id:number;name:string;age:number;sex:string;address:string;message:string;
  status:string;booked_at:string;medical_report?:any;vitals?:any;lab_results?:any[];doctor?:any;
}

const ST: Record<string,{label:string;bg:string;color:string;dot:string}> = {
  COMPLETED:        {label:"Completed",       bg:"#ecfdf5",color:"#059669",dot:"#12b76a"},
  IN_REVIEW:        {label:"In Review",        bg:"#eff6ff",color:"#1378e5",dot:"#177fed"},
  AWAITING_RESULTS: {label:"Awaiting Results", bg:"#fffbeb",color:"#b45309",dot:"#f59e0b"},
  PENDING:          {label:"Pending",          bg:"#f8fafc",color:"#64748b",dot:"#94a3b8"},
};

const ls:React.CSSProperties={display:"block",fontSize:12.5,fontWeight:600,color:"#0d1b2e",marginBottom:6};
const is:React.CSSProperties={width:"100%",height:40,padding:"0 12px",border:"1.5px solid #e8f0fc",borderRadius:10,fontSize:13,color:"#0d1b2e",background:"#f0f4fa",outline:"none",fontFamily:"inherit",marginBottom:16};
const ts:React.CSSProperties={width:"100%",padding:"10px 12px",border:"1.5px solid #e8f0fc",borderRadius:10,fontSize:13,color:"#0d1b2e",background:"#f0f4fa",outline:"none",fontFamily:"inherit",resize:"vertical" as const,marginBottom:16};

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(13,27,46,0.55)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(23,127,237,0.2)",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e8f0fc",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",borderRadius:"18px 18px 0 0",zIndex:1}}>
          <span style={{fontSize:16,fontWeight:700,color:"#0d1b2e"}}>{title}</span>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:"none",background:"#f0f4fa",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <I.X style={{width:14,height:14,color:"#8aa0ba"}}/>
          </button>
        </div>
        <div style={{padding:"20px 24px"}}>{children}</div>
      </div>
    </div>
  );
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<"all"|"book"|"reports"|"appointments">("all");
  const [collapsed, setCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({name:"",age:"",sex:"M",address:"",message:""});

  const imgUrl=(p:any)=>p?.profile_pix?(p.profile_pix.startsWith("http")?p.profile_pix:`https://hospitalback-clean.onrender.com${p.profile_pix}`):null;
  const pName=(a:Appointment)=>a.name||user?.profile?.fullname||"Patient";

  const navItems=[
    {id:"all",          label:"Overview",         icon:"Home",     count:undefined},
    {id:"book",         label:"Book Appointment", icon:"Plus",     count:undefined},
    {id:"reports",      label:"Medical Reports",  icon:"FileText", count:appointments.filter(a=>a.medical_report).length},
    {id:"appointments", label:"My Appointments",  icon:"History",  count:appointments.length},
  ];

  useEffect(()=>{load();const t=setInterval(load,30000);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    let f=appointments;
    if(tab==="reports")      f=f.filter(a=>a.medical_report);
    else if(tab==="appointments") f=f;
    else{setFiltered([]);return;}
    if(statusFilter!=="all") f=f.filter(a=>a.status===statusFilter);
    if(q.trim()){const lq=q.toLowerCase();f=f.filter(a=>pName(a).toLowerCase().includes(lq)||(a.message&&a.message.toLowerCase().includes(lq))||(a.medical_report?.medical_condition&&a.medical_report.medical_condition.toLowerCase().includes(lq)));}
    setFiltered(f);
  },[appointments,tab,statusFilter,q]);

  async function load(){try{const d=await apiService.getAppointments();setAppointments((d||[]) as Appointment[]);}catch{setAppointments([]);}finally{setLoading(false);}}

  async function submitAppt(e:React.FormEvent){
    e.preventDefault();
    try{
      await apiService.createAppointment({
        name:formData.name||user?.profile?.fullname||user?.username||"Patient",
        age:parseInt(formData.age),sex:formData.sex,address:formData.address,message:formData.message||"",
      });
      setShowForm(false);setFormData({name:"",age:"",sex:"M",address:"",message:""});
      await load();alert("Appointment booked successfully!");
    }catch{alert("Failed to book appointment. Please check your data.");}
  }

  function downloadReport(a:Appointment){
    if(!a.medical_report)return;
    const r=a.medical_report;
    const txt=`MEDICAL REPORT\n==============\n\nPatient: ${pName(a)}\nAge: ${a.age} | Gender: ${a.sex==="M"?"Male":"Female"}\nDate: ${new Date().toLocaleDateString()}\n\nDIAGNOSIS\n---------\n${r.medical_condition}\n\nPRESCRIPTION\n-----------\n${r.drug_prescription||"None"}\n\nADVICE\n------\n${r.advice||"None"}\n\n${r.next_appointment?`Next Appointment: ${r.next_appointment}`:""}`;
    const blob=new Blob([txt],{type:"text/plain"});const url=URL.createObjectURL(blob);
    const el=document.createElement("a");el.href=url;el.download=`report-${pName(a).replace(/ /g,"-")}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(el);el.click();document.body.removeChild(el);URL.revokeObjectURL(url);
  }

  const sw=collapsed?72:248;
  const recent=appointments.slice(0,3);

  if(loading)return(
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:C.slate,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}><div style={{width:44,height:44,border:`3px solid ${C.soft}`,borderTopColor:C.blue2,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}}/><p style={{color:C.muted,fontSize:13}}>Loading patient dashboard…</p></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",WebkitFontSmoothing:"antialiased",minHeight:"100vh",background:C.slate,display:"flex"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#e8f0fc;border-radius:4px}
        .nh:hover{background:#f0f4fa!important}.rh:hover{background:#f0f4fa!important}
        .bgh:hover{background:#059669!important}.bph:hover{background:#6d28d9!important}.bth:hover{background:#0f5fc4!important}
        .xh:hover{background:#f0f4fa!important}.ch:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(23,127,237,0.12)!important}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.fi{animation:fi 0.2s ease forwards}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{width:sw,minHeight:"100vh",background:C.white,display:"flex",flexDirection:"column",borderRight:`1px solid ${C.soft}`,position:"sticky",top:0,height:"100vh",overflow:"hidden",flexShrink:0,transition:"width 0.25s cubic-bezier(.4,0,.2,1)",boxShadow:"2px 0 10px rgba(23,127,237,0.05)"}}>
        <div style={{padding:"18px 14px 14px",borderBottom:`1px solid ${C.soft}`,display:"flex",alignItems:"center",gap:10,minHeight:62}}>
          <I.Logo style={{width:30,height:30,flexShrink:0}}/>
          {!collapsed&&<div><div style={{fontWeight:700,fontSize:14,color:C.text,lineHeight:1.2,whiteSpace:"nowrap"}}>Etha-Atlantic</div><div style={{fontSize:11,color:C.muted}}>Patient Portal</div></div>}
        </div>
        <nav style={{flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",gap:3}}>
          {navItems.map(n=>{const A=I[n.icon];const act=tab===n.id;return(
            <button key={n.id} className="nh" onClick={()=>setTab(n.id as any)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:collapsed?"10px":"10px 12px",borderRadius:10,border:"none",cursor:"pointer",background:act?C.soft:"transparent",justifyContent:collapsed?"center":"flex-start",transition:"all 0.15s"}}>
              <A style={{width:17,height:17,color:act?C.blue2:C.muted,flexShrink:0}}/>
              {!collapsed&&<><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:act?600:400,color:act?C.text:C.muted,whiteSpace:"nowrap"}}>{n.label}</span>{n.count!==undefined&&<span style={{fontSize:11,fontWeight:600,minWidth:20,height:20,borderRadius:10,background:act?C.blue2:"#eef2f7",color:act?C.white:C.muted,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px"}}>{n.count}</span>}</>}
            </button>
          );})}
        </nav>
        <div style={{borderTop:`1px solid ${C.soft}`,padding:"10px 8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:C.slate}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue1},${C.blue2})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
              {imgUrl(user?.profile)?<img src={imgUrl(user?.profile)!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:C.white,fontSize:12,fontWeight:600}}>{user?.profile?.fullname?.charAt(0)||user?.username?.charAt(0)||"P"}</span>}
            </div>
            {!collapsed&&<div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:12.5,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.profile?.fullname||user?.username||"Patient"}</div><div style={{fontSize:11,color:C.muted}}>Patient</div></div>}
          </div>
          <button className="nh" onClick={()=>setCollapsed(!collapsed)} style={{marginTop:6,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"7px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:C.muted,fontSize:12,transition:"all 0.15s"}}>
            <I.ChevLeft style={{width:13,height:13,transition:"transform 0.25s",transform:collapsed?"rotate(180deg)":"none"}}/>{!collapsed&&<span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{background:C.white,borderBottom:`1px solid ${C.soft}`,padding:"0 28px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 8px rgba(23,127,237,0.05)"}}>
          <div><div style={{fontSize:17,fontWeight:700,color:C.text}}>{navItems.find(n=>n.id===tab)?.label}</div><div style={{fontSize:12,color:C.muted}}>Welcome back, {user?.profile?.fullname?.split(" ")[0]||user?.username}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative"}}>
              <I.Search style={{width:14,height:14,color:C.muted,position:"absolute",left:11,top:"50%",transform:"translateY(-50%)"}}/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={{paddingLeft:32,paddingRight:14,height:37,border:`1.5px solid ${C.soft}`,borderRadius:10,fontSize:13,color:C.text,background:C.slate,outline:"none",width:200,fontFamily:"inherit"}}/>
            </div>
            <button className="xh" style={{width:37,height:37,borderRadius:10,border:`1.5px solid ${C.soft}`,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"all 0.15s"}}>
              <I.Bell style={{width:16,height:16,color:C.muted}}/><span style={{position:"absolute",top:8,right:8,width:6,height:6,borderRadius:"50%",background:C.red,border:`1.5px solid ${C.white}`}}/>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px 5px 5px",borderRadius:10,background:C.slate,border:`1.5px solid ${C.soft}`}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue1},${C.blue2})`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                {imgUrl(user?.profile)?<img src={imgUrl(user?.profile)!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:C.white,fontSize:12,fontWeight:600}}>{user?.profile?.fullname?.charAt(0)||"P"}</span>}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:C.text}}>{user?.profile?.fullname?.split(" ")[0]||user?.username}</span>
              <I.ChevDown style={{width:13,height:13,color:C.muted}}/>
            </div>
          </div>
        </header>

        <main style={{flex:1,padding:"26px 28px",overflowY:"auto"}}>

          {/* OVERVIEW */}
          {tab==="all"&&(
            <div className="fi">
              {/* Welcome banner */}
              <div style={{background:`linear-gradient(135deg,${C.blue1},${C.blue2})`,borderRadius:18,padding:"26px 28px",marginBottom:22,color:C.white,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:`0 8px 32px ${C.blue1}44`}}>
                <div>
                  <div style={{fontSize:22,fontWeight:700,marginBottom:6}}>Welcome back, {user?.profile?.fullname||user?.username||"Patient"}!</div>
                  <div style={{fontSize:13.5,opacity:0.85}}>Track your health journey and manage appointments in one place.</div>
                </div>
                <button className="bgh" onClick={()=>setShowForm(true)} style={{padding:"10px 22px",background:C.white,color:C.blue1,borderRadius:10,border:"none",cursor:"pointer",fontSize:13.5,fontWeight:700,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 12px rgba(0,0,0,0.12)",transition:"all 0.15s",flexShrink:0}}>
                  <I.Plus style={{width:15,height:15}}/>Book Appointment
                </button>
              </div>

              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:22}}>
                {[
                  {label:"Book Appointment",   icon:"Plus",      grad:`135deg,${C.green},#10b981`,  value:null, cta:"Book Now",  ctaBg:C.green,   cb:()=>setShowForm(true)},
                  {label:"Medical Reports",     icon:"FileText",  grad:`135deg,${C.purple},#9333ea`, value:appointments.filter(a=>a.medical_report).length, sub:"Available",   ctaBg:null, cb:()=>setTab("reports")},
                  {label:"Total Appointments",  icon:"History",   grad:`135deg,#d97706,${C.amber}`,  value:appointments.length, sub:"All visits",    ctaBg:null, cb:()=>setTab("appointments")},
                ].map((s,i)=>{const IC=I[s.icon];return(
                  <div key={i} className="ch" style={{background:C.white,borderRadius:16,padding:"18px 20px",border:`1px solid ${C.soft}`,boxShadow:"0 1px 4px rgba(23,127,237,0.05)",transition:"all 0.2s",cursor:"pointer"}} onClick={s.cb}>
                    <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(${s.grad})`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,boxShadow:"0 4px 10px rgba(0,0,0,0.1)"}}><IC style={{width:17,height:17,color:C.white}}/></div>
                    {s.value!==null?<><div style={{fontSize:28,fontWeight:700,color:C.text,lineHeight:1}}>{s.value}</div><div style={{fontSize:12.5,color:C.muted,marginTop:4}}>{s.label}</div><div style={{fontSize:12,color:C.muted}}>{s.sub}</div></>
                    :<><div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:8}}>{s.label}</div><button className="bgh" style={{padding:"7px 16px",background:s.ctaBg!,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,transition:"all 0.15s"}}>{s.cta}</button></>}
                  </div>
                );})}
              </div>

              {/* Grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                {/* Recent appointments */}
                <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.soft}`,overflow:"hidden",boxShadow:"0 1px 6px rgba(23,127,237,0.05)"}}>
                  <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.soft}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>Recent Appointments</div>
                    <button className="xh" onClick={()=>setTab("appointments")} style={{fontSize:12,color:C.blue2,padding:"4px 10px",borderRadius:6,border:"none",background:C.soft,cursor:"pointer",fontWeight:600,transition:"all 0.15s"}}>View All</button>
                  </div>
                  {recent.length===0?(
                    <div style={{padding:"40px 20px",textAlign:"center"}}><I.Calendar style={{width:32,height:32,color:"#dce7f5",margin:"0 auto 8px"}}/><div style={{fontSize:13,color:C.muted}}>No appointments yet</div></div>
                  ):recent.map((a,i)=>{
                    const st=ST[a.status]||ST.PENDING;
                    return(<div key={a.id} style={{padding:"12px 20px",borderBottom:i<recent.length-1?`1px solid ${C.soft}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue1},${C.blue2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.white,flexShrink:0}}>{pName(a).charAt(0)}</div>
                        <div><div style={{fontSize:13.5,fontWeight:600,color:C.text}}>{pName(a)}</div><div style={{fontSize:12,color:C.muted}}>{new Date(a.booked_at).toLocaleDateString()}</div></div>
                      </div>
                      <span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:20,background:st.bg,color:st.color,whiteSpace:"nowrap"}}>{st.label}</span>
                    </div>);
                  })}
                </div>

                {/* Health summary */}
                <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.soft}`,overflow:"hidden",boxShadow:"0 1px 6px rgba(23,127,237,0.05)"}}>
                  <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.soft}`}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>Health Summary</div>
                  </div>
                  <div style={{padding:"18px 20px"}}>
                    {[
                      {icon:"Activity",label:"Vitals Recorded",   value:appointments.filter(a=>a.vitals).length,                                          bg:"#ecfdf5",ic:"#059669"},
                      {icon:"FileText",label:"Lab Tests Done",    value:appointments.reduce((n,a)=>n+(a.lab_results?.length||0),0),                        bg:"#eff6ff",ic:C.blue1},
                      {icon:"Shield",  label:"Active Prescriptions",value:appointments.filter(a=>a.medical_report?.drug_prescription).length,               bg:"#faf5ff",ic:C.purple},
                    ].map((s,i)=>{const IC=I[s.icon];return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<2?14:0}}>
                        <div style={{width:36,height:36,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IC style={{width:16,height:16,color:s.ic}}/></div>
                        <div><div style={{fontSize:12.5,color:C.muted}}>{s.label}</div><div style={{fontSize:20,fontWeight:700,color:C.text}}>{s.value}</div></div>
                      </div>
                    );})}
                    <div style={{marginTop:18,paddingTop:16,borderTop:`1px solid ${C.soft}`}}>
                      <div style={{fontSize:12.5,color:C.muted,marginBottom:8,textAlign:"center"}}>Need medical attention?</div>
                      <button className="bth" onClick={()=>setShowForm(true)} style={{width:"100%",padding:"10px",background:C.blue2,color:C.white,borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,transition:"all 0.15s",boxShadow:`0 4px 12px ${C.blue2}44`}}>Book Appointment</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOOK */}
          {tab==="book"&&(
            <div className="fi" style={{background:C.white,borderRadius:18,border:`1px solid ${C.soft}`,padding:"48px 32px",textAlign:"center",boxShadow:"0 1px 6px rgba(23,127,237,0.05)"}}>
              <div style={{width:60,height:60,borderRadius:18,background:`linear-gradient(135deg,${C.green},#10b981)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 8px 20px ${C.green}44`}}>
                <I.Calendar style={{width:26,height:26,color:C.white}}/>
              </div>
              <div style={{fontSize:22,fontWeight:700,color:C.text,marginBottom:8}}>Book New Appointment</div>
              <div style={{fontSize:13.5,color:C.muted,marginBottom:28,maxWidth:360,margin:"0 auto 28px"}}>Schedule your medical appointment with our healthcare professionals</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,maxWidth:440,margin:"0 auto"}}>
                <button className="bgh" onClick={()=>setShowForm(true)} style={{padding:"20px 16px",background:C.green,color:C.white,borderRadius:12,border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"all 0.15s",boxShadow:`0 4px 16px ${C.green}44`}}>
                  <I.Plus style={{width:22,height:22}}/><div style={{fontWeight:700,fontSize:14}}>Regular Checkup</div><div style={{fontSize:12,opacity:0.85}}>Schedule with any doctor</div>
                </button>
                <button onClick={()=>setShowForm(true)} style={{padding:"20px 16px",background:C.red,color:C.white,borderRadius:12,border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"all 0.15s",boxShadow:`0 4px 16px ${C.red}44`}}>
                  <I.Alert style={{width:22,height:22}}/><div style={{fontWeight:700,fontSize:14}}>Emergency</div><div style={{fontSize:12,opacity:0.85}}>Immediate attention</div>
                </button>
              </div>
            </div>
          )}

          {/* REPORTS */}
          {tab==="reports"&&(
            <div className="fi" style={{background:C.white,borderRadius:16,border:`1px solid ${C.soft}`,overflow:"hidden",boxShadow:"0 1px 6px rgba(23,127,237,0.05)"}}>
              <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.soft}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:`linear-gradient(135deg,${C.purple}08,${C.purple}14)`}}>
                <div><div style={{fontSize:15,fontWeight:700,color:C.text}}>Medical Reports</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{filtered.length} reports available</div></div>
                <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                  <I.Filter style={{width:12,height:12,color:C.muted,position:"absolute",left:9,pointerEvents:"none"}}/>
                  <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{paddingLeft:26,paddingRight:10,height:34,border:`1.5px solid ${C.soft}`,borderRadius:8,fontSize:12.5,background:C.white,color:C.text,cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
                    <option value="all">All</option><option value="COMPLETED">Completed</option><option value="IN_REVIEW">In Review</option>
                  </select>
                </div>
              </div>
              {filtered.length===0?(
                <div style={{padding:"60px 24px",textAlign:"center"}}><I.FileText style={{width:38,height:38,color:"#dce7f5",margin:"0 auto 10px"}}/><div style={{fontSize:15,fontWeight:600,color:C.muted}}>No reports found</div><div style={{fontSize:12.5,color:"#b0bec5",marginTop:4}}>Reports appear here after completed appointments.</div></div>
              ):filtered.map((a,i)=>(
                <div key={a.id} className="rh fi" style={{padding:"18px 22px",borderBottom:i<filtered.length-1?`1px solid ${C.soft}`:"none",transition:"background 0.15s"}}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},#9333ea)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15,fontWeight:700,color:C.white}}>{pName(a).charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontSize:14.5,fontWeight:700,color:C.text}}>{pName(a)}</span><span style={{fontSize:11.5,fontWeight:600,padding:"2px 10px",borderRadius:20,background:"#ecfdf5",color:"#059669"}}>Completed</span></div>
                      <div style={{fontSize:12.5,color:C.muted,marginBottom:10}}>Age {a.age} · {a.sex==="M"?"Male":"Female"} · {new Date(a.booked_at).toLocaleDateString()}</div>
                      {a.medical_report&&<div style={{background:"#ecfdf5",borderRadius:12,padding:"14px 16px",border:"1px solid #bbf7d0"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:a.medical_report.advice?12:0}}>
                          <div><div style={{fontSize:11.5,fontWeight:700,color:"#059669",marginBottom:4}}>DIAGNOSIS</div><div style={{fontSize:13,color:C.text,background:C.white,padding:"8px 10px",borderRadius:8,border:"1px solid #bbf7d0"}}>{a.medical_report.medical_condition}</div></div>
                          {a.medical_report.drug_prescription&&<div><div style={{fontSize:11.5,fontWeight:700,color:"#059669",marginBottom:4}}>PRESCRIPTION</div><div style={{fontSize:13,color:C.text,background:C.white,padding:"8px 10px",borderRadius:8,border:"1px solid #bbf7d0"}}>{a.medical_report.drug_prescription}</div></div>}
                        </div>
                        {a.medical_report.advice&&<div><div style={{fontSize:11.5,fontWeight:700,color:"#059669",marginBottom:4}}>ADVICE</div><div style={{fontSize:13,color:C.text,background:C.white,padding:"8px 10px",borderRadius:8,border:"1px solid #bbf7d0"}}>{a.medical_report.advice}</div></div>}
                      </div>}
                    </div>
                    <button className="bph" onClick={()=>downloadReport(a)} style={{padding:"8px 14px",background:C.purple,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:6,flexShrink:0,transition:"all 0.15s",boxShadow:`0 2px 8px ${C.purple}44`}}>
                      <I.Download style={{width:13,height:13}}/>Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* APPOINTMENTS */}
          {tab==="appointments"&&(
            <div className="fi" style={{background:C.white,borderRadius:16,border:`1px solid ${C.soft}`,overflow:"hidden",boxShadow:"0 1px 6px rgba(23,127,237,0.05)"}}>
              <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.soft}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:`linear-gradient(135deg,${C.amber}08,${C.amber}14)`}}>
                <div><div style={{fontSize:15,fontWeight:700,color:C.text}}>My Appointments</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{filtered.length} total</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                    <I.Filter style={{width:12,height:12,color:C.muted,position:"absolute",left:9,pointerEvents:"none"}}/>
                    <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{paddingLeft:26,paddingRight:10,height:34,border:`1.5px solid ${C.soft}`,borderRadius:8,fontSize:12.5,background:C.white,color:C.text,cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
                      <option value="all">All Status</option><option value="PENDING">Pending</option><option value="IN_REVIEW">In Review</option><option value="AWAITING_RESULTS">Awaiting</option><option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <button className="bgh" onClick={()=>setShowForm(true)} style={{padding:"7px 14px",background:C.green,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
                    <I.Plus style={{width:13,height:13}}/>New
                  </button>
                </div>
              </div>
              {filtered.length===0?(
                <div style={{padding:"60px 24px",textAlign:"center"}}><I.Calendar style={{width:38,height:38,color:"#dce7f5",margin:"0 auto 10px"}}/><div style={{fontSize:15,fontWeight:600,color:C.muted}}>No appointments found</div><button className="bgh" onClick={()=>setShowForm(true)} style={{marginTop:14,padding:"9px 20px",background:C.blue2,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.15s"}}>Book Appointment</button></div>
              ):filtered.map((a,i)=>{
                const st=ST[a.status]||ST.PENDING;
                return(<div key={a.id} className="rh fi" style={{padding:"18px 22px",borderBottom:i<filtered.length-1?`1px solid ${C.soft}`:"none",transition:"background 0.15s"}}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue1},${C.blue2})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15,fontWeight:700,color:C.white}}>{pName(a).charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:14.5,fontWeight:700,color:C.text}}>{pName(a)}</span>
                        <span style={{fontSize:11.5,fontWeight:600,padding:"2px 10px",borderRadius:20,background:st.bg,color:st.color,display:"flex",alignItems:"center",gap:5}}><span style={{width:5,height:5,borderRadius:"50%",background:st.dot,flexShrink:0}}/>{st.label}</span>
                      </div>
                      <div style={{fontSize:12.5,color:C.muted,marginBottom:6}}>Age {a.age} · {a.sex==="M"?"Male":"Female"} · #{a.id}</div>
                      {a.doctor&&<div style={{fontSize:12.5,color:C.muted,marginBottom:4}}>Doctor: {a.doctor.fullname}</div>}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:6}}>
                        {a.address&&<div style={{fontSize:12.5,color:C.muted,background:C.slate,padding:"6px 10px",borderRadius:8}}><b>Address:</b> {a.address}</div>}
                        {a.message&&<div style={{fontSize:12.5,color:C.muted,background:C.slate,padding:"6px 10px",borderRadius:8}}><b>Message:</b> {a.message}</div>}
                      </div>
                      <div style={{fontSize:11.5,color:"#b0bec5"}}>Booked {new Date(a.booked_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                      {a.status!=="COMPLETED"&&<div style={{marginTop:10,padding:"8px 12px",background:"#fffbeb",borderRadius:8,border:"1px solid #fde68a",fontSize:12.5,color:"#92400e"}}>
                        <b>Status Update:</b> {a.status==="IN_REVIEW"?"Doctor is reviewing your case.":a.status==="AWAITING_RESULTS"?"Waiting for lab/vital results.":"Your appointment is queued for assignment."}
                      </div>}
                    </div>
                    {a.status==="COMPLETED"&&a.medical_report&&(
                      <button className="bth" onClick={()=>downloadReport(a)} style={{padding:"8px 14px",background:C.blue2,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:6,flexShrink:0,transition:"all 0.15s"}}>
                        <I.Download style={{width:13,height:13}}/>Report
                      </button>
                    )}
                  </div>
                </div>);
              })}
            </div>
          )}
        </main>
      </div>

      {/* APPOINTMENT FORM MODAL */}
      {showForm&&(
        <Modal title="Book New Appointment" onClose={()=>setShowForm(false)}>
          <form onSubmit={submitAppt}>
            <label style={ls}>Full Name *</label>
            <input required type="text" value={formData.name||user?.profile?.fullname||user?.username||""} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="Your full name" style={is}/>
            <label style={ls}>Age *</label>
            <input required type="number" min="1" max="120" value={formData.age} onChange={e=>setFormData({...formData,age:e.target.value})} placeholder="Your age" style={is}/>
            <label style={ls}>Gender *</label>
            <select value={formData.sex} onChange={e=>setFormData({...formData,sex:e.target.value})} style={is}><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select>
            <label style={ls}>Address *</label>
            <textarea required value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} rows={2} style={ts} placeholder="Your complete address…"/>
            <label style={ls}>Symptoms / Message (Optional)</label>
            <textarea value={formData.message} onChange={e=>setFormData({...formData,message:e.target.value})} rows={3} style={ts} placeholder="Describe your symptoms…"/>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:4}}>
              <button type="button" onClick={()=>setShowForm(false)} style={{padding:"9px 20px",borderRadius:9,border:"1.5px solid #e8f0fc",background:"#fff",color:"#8aa0ba",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button type="submit" style={{padding:"9px 20px",borderRadius:9,border:"none",background:C.green,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 12px ${C.green}55`}}>Book Appointment</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PatientDashboard;