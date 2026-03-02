// components/dashboards/LabScientistDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";

const C = {
  blue1:"#1378e5",blue2:"#177fed",blue3:"#0f5fc4",red:"#e53935",white:"#ffffff",
  slate:"#f0f4fa",muted:"#8aa0ba",text:"#0d1b2e",soft:"#e8f0fc",
  green:"#12b76a",amber:"#f59e0b",purple:"#7c3aed",indigo:"#4f46e5",
};

const I: Record<string, (p: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  Logo: p=><svg viewBox="0 0 32 32" {...p}><rect width="32" height="32" rx="8" fill="#177fed"/><path d="M16 6v20M6 16h20" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/></svg>,
  Beaker: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 3h6M10 3v7L6.5 16.5A3 3 0 009.5 21h5a3 3 0 003-4.5L14 10V3"/><path d="M7.5 16h9" strokeWidth="1.4"/></svg>,
  Clipboard: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  Clock: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
  Alert: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  FileText: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Bell: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Search: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
  ChevDown: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  ChevLeft: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 18l-6-6 6-6"/></svg>,
  X: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Filter: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  RefreshCw: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
};

interface TestRequest {
  id: number;
  appointment: { id: number; name: string; age: number; sex: string; };
  tests: string; note: string; status: string; created_at: string; assigned_to?: any;
}

const ST: Record<string,{label:string;bg:string;color:string;dot:string}> = {
  DONE:        {label:"Completed",  bg:"#ecfdf5",color:"#059669",dot:"#12b76a"},
  IN_PROGRESS: {label:"In Progress",bg:"#eff6ff",color:"#4f46e5",dot:"#6366f1"},
  PENDING:     {label:"Pending",    bg:"#fffbeb",color:"#b45309",dot:"#f59e0b"},
};

const ls:React.CSSProperties={display:"block",fontSize:12.5,fontWeight:600,color:"#0d1b2e",marginBottom:6};
const is:React.CSSProperties={width:"100%",height:40,padding:"0 12px",border:"1.5px solid #e8f0fc",borderRadius:10,fontSize:13,color:"#0d1b2e",background:"#f0f4fa",outline:"none",fontFamily:"inherit",marginBottom:16};
// const ts:React.CSSProperties={width:"100%",padding:"10px 12px",border:"1.5px solid #e8f0fc",borderRadius:10,fontSize:13,color:"#0d1b2e",background:"#f0f4fa",outline:"none",fontFamily:"inherit",resize:"vertical" as const,marginBottom:16};

function Modal({title,onClose,children,wide}:{title:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(13,27,46,0.55)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:wide?540:440,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(79,70,229,0.2)",fontFamily:"'DM Sans',sans-serif"}}>
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

function Actions({onCancel,label,color="#177fed"}:{onCancel:()=>void;label:string;color?:string}) {
  return (
    <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:4}}>
      <button type="button" onClick={onCancel} style={{padding:"9px 20px",borderRadius:9,border:"1.5px solid #e8f0fc",background:"#fff",color:"#8aa0ba",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
      <button type="submit" style={{padding:"9px 20px",borderRadius:9,border:"none",background:color,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 12px ${color}55`}}>{label}</button>
    </div>
  );
}

const LabScientistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TestRequest[]>([]);
  const [filtered, setFiltered] = useState<TestRequest[]>([]);
  const [selected, setSelected] = useState<TestRequest|null>(null);
  const [tab, setTab] = useState<"all"|"pending"|"in_progress"|"completed">("all");
  const [collapsed, setCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [resultData, setResultData] = useState({test_name:"",result:"",units:"",reference_range:""});

  const imgUrl=(p:any)=>p?.profile_pix?(p.profile_pix.startsWith("http")?p.profile_pix:`https://hospitalback-clean.onrender.com${p.profile_pix}`):null;
  const pName=(r:TestRequest)=>r.appointment?.name||"Unknown Patient";
  const pAge=(r:TestRequest)=>r.appointment?.age||"N/A";
  const pSex=(r:TestRequest)=>{const s=r.appointment?.sex;return s==="M"?"Male":s==="F"?"Female":"Unknown";};

  const navItems=[
    {id:"all",         label:"All Requests",icon:"FileText", count:requests.length},
    {id:"pending",     label:"Pending",     icon:"Clock",    count:requests.filter(r=>r.status==="PENDING").length},
    {id:"in_progress", label:"In Progress", icon:"Alert",    count:requests.filter(r=>r.status==="IN_PROGRESS").length},
    {id:"completed",   label:"Completed",   icon:"Check",    count:requests.filter(r=>r.status==="DONE").length},
  ];

  const stats=[
    {label:"Total Requests",value:requests.length,                                          sub:`+${requests.filter(r=>r.status==="PENDING").length} new`,  grad:`135deg,${C.blue1},${C.blue2}`,  icon:"Beaker"},
    {label:"Pending",       value:requests.filter(r=>r.status==="PENDING").length,          sub:"Awaiting analysis",                                          grad:"135deg,#d97706,#f59e0b",          icon:"Clock"},
    {label:"In Progress",   value:requests.filter(r=>r.status==="IN_PROGRESS").length,      sub:"Being analyzed",                                             grad:`135deg,${C.indigo},#6366f1`,     icon:"Alert"},
    {label:"Completed",     value:requests.filter(r=>r.status==="DONE").length,             sub:"Results delivered",                                          grad:`135deg,#059669,${C.green}`,      icon:"Check"},
  ];

  useEffect(()=>{load();// FIX: removed 30s polling — click Refresh button instead
        return undefined;},[]);
  useEffect(()=>{
    let f=requests;
    if(tab==="pending")     f=f.filter(r=>r.status==="PENDING");
    if(tab==="in_progress") f=f.filter(r=>r.status==="IN_PROGRESS");
    if(tab==="completed")   f=f.filter(r=>r.status==="DONE");
    if(q.trim()){const lq=q.toLowerCase();f=f.filter(r=>pName(r).toLowerCase().includes(lq)||(r.tests&&r.tests.toLowerCase().includes(lq))||(r.note&&r.note.toLowerCase().includes(lq)));}
    setFiltered(f);
  },[requests,tab,q]);

  async function load(){
  try{
    const d = await apiService.getTestRequests();
    setRequests((d || []) as TestRequest[]);
  } catch {
    setRequests([]);
  } finally {
    setLoading(false);
  }
}

  async function submitResult(e:React.FormEvent){
    e.preventDefault();if(!selected)return;
    try{
      await apiService.createLabResult({test_request:selected.id,...resultData});
      setShowForm(false);setResultData({test_name:"",result:"",units:"",reference_range:""});
      await load();alert("Lab result submitted!");
    }catch{alert("Failed to submit result.");}
  }

  function markInProgress(id:number){setRequests(p=>p.map(r=>r.id===id?{...r,status:"IN_PROGRESS"}:r));}
  function markDone(id:number){setRequests(p=>p.map(r=>r.id===id?{...r,status:"DONE"}:r));}

  const sw=collapsed?72:248;

  if(loading)return(
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:C.slate,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}><div style={{width:44,height:44,border:`3px solid ${C.soft}`,borderTopColor:C.indigo,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}}/><p style={{color:C.muted,fontSize:13}}>Loading lab dashboard…</p></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",WebkitFontSmoothing:"antialiased",minHeight:"100vh",background:C.slate,display:"flex"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#e8f0fc;border-radius:4px}
        .nh:hover{background:#f0f4fa!important}.rh:hover{background:#f0f4fa!important}
        .bih:hover{background:#4338ca!important}.bph:hover{background:#059669!important}.byh:hover{background:#b45309!important}
        .xh:hover{background:#f0f4fa!important}.ch:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(79,70,229,0.12)!important}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.fi{animation:fi 0.2s ease forwards}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{width:sw,minHeight:"100vh",background:C.white,display:"flex",flexDirection:"column",borderRight:`1px solid ${C.soft}`,position:"sticky",top:0,height:"100vh",overflow:"hidden",flexShrink:0,transition:"width 0.25s cubic-bezier(.4,0,.2,1)",boxShadow:"2px 0 10px rgba(79,70,229,0.06)"}}>
        <div style={{padding:"18px 14px 14px",borderBottom:`1px solid ${C.soft}`,display:"flex",alignItems:"center",gap:10,minHeight:62}}>
          <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.indigo},#6366f1)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.Beaker style={{width:16,height:16,color:C.white}}/></div>
          {!collapsed&&<div><div style={{fontWeight:700,fontSize:14,color:C.text,lineHeight:1.2,whiteSpace:"nowrap"}}>Etha-Atlantic</div><div style={{fontSize:11,color:C.muted}}>Lab Scientist Panel</div></div>}
        </div>
        <nav style={{flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",gap:3}}>
          {navItems.map(n=>{const A=I[n.icon];const act=tab===n.id;return(
            <button key={n.id} className="nh" onClick={()=>setTab(n.id as any)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:collapsed?"10px":"10px 12px",borderRadius:10,border:"none",cursor:"pointer",background:act?`${C.indigo}12`:"transparent",justifyContent:collapsed?"center":"flex-start",transition:"all 0.15s"}}>
              <A style={{width:17,height:17,color:act?C.indigo:C.muted,flexShrink:0}}/>
              {!collapsed&&<><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:act?600:400,color:act?C.text:C.muted,whiteSpace:"nowrap"}}>{n.label}</span><span style={{fontSize:11,fontWeight:600,minWidth:20,height:20,borderRadius:10,background:act?C.indigo:"#eef2f7",color:act?C.white:C.muted,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px"}}>{n.count}</span></>}
            </button>
          );})}
        </nav>
        <div style={{borderTop:`1px solid ${C.soft}`,padding:"10px 8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:C.slate}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},#6366f1)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
              {imgUrl(user?.profile)?<img src={imgUrl(user?.profile)!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:C.white,fontSize:12,fontWeight:600}}>{user?.profile?.fullname?.charAt(0)||"L"}</span>}
            </div>
            {!collapsed&&<div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:12.5,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.profile?.fullname||user?.username}</div><div style={{fontSize:11,color:C.muted}}>Lab Scientist</div></div>}
          </div>
          <button className="nh" onClick={()=>setCollapsed(!collapsed)} style={{marginTop:6,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"7px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:C.muted,fontSize:12,transition:"all 0.15s"}}>
            <I.ChevLeft style={{width:13,height:13,transition:"transform 0.25s",transform:collapsed?"rotate(180deg)":"none"}}/>{!collapsed&&<span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{background:C.white,borderBottom:`1px solid ${C.soft}`,padding:"0 28px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 8px rgba(79,70,229,0.06)"}}>
          <div><div style={{fontSize:17,fontWeight:700,color:C.text}}>{navItems.find(n=>n.id===tab)?.label}</div><div style={{fontSize:12,color:C.muted}}>{filtered.length} test requests</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative"}}>
              <I.Search style={{width:14,height:14,color:C.muted,position:"absolute",left:11,top:"50%",transform:"translateY(-50%)"}}/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search requests…" style={{paddingLeft:32,paddingRight:14,height:37,border:`1.5px solid ${C.soft}`,borderRadius:10,fontSize:13,color:C.text,background:C.slate,outline:"none",width:210,fontFamily:"inherit"}}/>
            </div>
            <button onClick={load} className="xh" style={{width:37,height:37,borderRadius:10,border:`1.5px solid ${C.soft}`,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
              <I.RefreshCw style={{width:15,height:15,color:C.muted}}/>
            </button>
            <button className="xh" style={{width:37,height:37,borderRadius:10,border:`1.5px solid ${C.soft}`,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"all 0.15s"}}>
              <I.Bell style={{width:16,height:16,color:C.muted}}/><span style={{position:"absolute",top:8,right:8,width:6,height:6,borderRadius:"50%",background:C.red,border:`1.5px solid ${C.white}`}}/>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px 5px 5px",borderRadius:10,background:C.slate,border:`1.5px solid ${C.soft}`}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},#6366f1)`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                {imgUrl(user?.profile)?<img src={imgUrl(user?.profile)!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:C.white,fontSize:12,fontWeight:600}}>{user?.profile?.fullname?.charAt(0)||"L"}</span>}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:C.text}}>{user?.profile?.fullname?.split(" ")[0]||user?.username}</span>
              <I.ChevDown style={{width:13,height:13,color:C.muted}}/>
            </div>
          </div>
        </header>

        <main style={{flex:1,padding:"26px 28px",overflowY:"auto"}}>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:22}}>
            {stats.map((s,i)=>{const IC=I[s.icon];return(
              <div key={i} className="ch" style={{background:C.white,borderRadius:16,padding:"18px 20px",border:`1px solid ${C.soft}`,boxShadow:"0 1px 4px rgba(79,70,229,0.05)",transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(${s.grad})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 10px rgba(0,0,0,0.1)"}}><IC style={{width:17,height:17,color:C.white}}/></div>
                  <span style={{fontSize:11,fontWeight:600,color:C.indigo,background:`${C.indigo}12`,padding:"2px 8px",borderRadius:20}}>{s.sub}</span>
                </div>
                <div style={{fontSize:28,fontWeight:700,color:C.text,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:12.5,color:C.muted,marginTop:4}}>{s.label}</div>
              </div>
            );})}
          </div>

          {/* Lab performance bar */}
          <div style={{background:`linear-gradient(135deg,${C.indigo}08,${C.indigo}14)`,border:`1px solid ${C.soft}`,borderRadius:14,padding:"14px 20px",marginBottom:22,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:14,fontWeight:600,color:C.text}}>Lab Performance Overview</div><div style={{fontSize:12.5,color:C.muted,marginTop:2}}>{filtered.length} requests match current filters</div></div>
            <div style={{display:"flex",gap:28,alignItems:"center"}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:C.indigo}}>99.8%</div><div style={{fontSize:11,color:C.muted}}>Accuracy Rate</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:C.text}}>24 hrs</div><div style={{fontSize:11,color:C.muted}}>Avg. Turnaround</div></div>
              <button onClick={load} className="xh" style={{padding:"7px 14px",borderRadius:8,border:`1.5px solid ${C.soft}`,background:C.white,cursor:"pointer",fontSize:12.5,fontWeight:600,color:C.muted,display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
                <I.RefreshCw style={{width:13,height:13}}/>Refresh
              </button>
            </div>
          </div>

          {/* Test requests list */}
          <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.soft}`,overflow:"hidden",boxShadow:"0 1px 6px rgba(79,70,229,0.05)"}}>
            <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.soft}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:15,fontWeight:700,color:C.text}}>Laboratory Test Requests</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{filtered.length} requests · auto-refreshing</div></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {q&&<button onClick={()=>setQ("")} className="xh" style={{fontSize:12,color:C.indigo,padding:"4px 10px",borderRadius:6,border:"none",background:`${C.indigo}12`,cursor:"pointer",transition:"all 0.15s"}}>Clear</button>}
                <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                  <I.Filter style={{width:12,height:12,color:C.muted,position:"absolute",left:9,pointerEvents:"none"}}/>
                  <select value={tab} onChange={e=>setTab(e.target.value as any)} style={{paddingLeft:26,paddingRight:10,height:34,border:`1.5px solid ${C.soft}`,borderRadius:8,fontSize:12.5,background:C.white,color:C.text,cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
                    <option value="all">All Status</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {filtered.length===0?(
              <div style={{padding:"60px 24px",textAlign:"center"}}>
                <I.Beaker style={{width:38,height:38,color:"#dce7f5",margin:"0 auto 10px"}}/><div style={{fontSize:15,fontWeight:600,color:C.muted}}>No test requests found</div>
                <div style={{fontSize:12.5,color:"#b0bec5",marginTop:4}}>{q?`No results for "${q}"`:"Try changing the filter above"}</div>
              </div>
            ):filtered.map((r,i)=>{
              const st=ST[r.status]||ST.PENDING;
              const testTags=r.tests?.split(",").map(t=>t.trim()).filter(Boolean)||[];
              return(
                <div key={r.id} className="rh fi" style={{padding:"18px 22px",borderBottom:i<filtered.length-1?`1px solid ${C.soft}`:"none",transition:"background 0.15s"}}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},#6366f1)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15,fontWeight:700,color:C.white}}>{pName(r).charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:14.5,fontWeight:700,color:C.text}}>{pName(r)}</span>
                        <span style={{fontSize:11.5,fontWeight:600,padding:"2px 10px",borderRadius:20,background:st.bg,color:st.color,display:"flex",alignItems:"center",gap:5}}><span style={{width:5,height:5,borderRadius:"50%",background:st.dot,flexShrink:0}}/>{st.label}</span>
                      </div>
                      <div style={{fontSize:12.5,color:C.muted,marginBottom:8}}>Age {pAge(r)} · {pSex(r)} · Appt #{r.appointment?.id||"N/A"}</div>

                      {/* Test tags */}
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:5}}>Tests Required</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {testTags.length>0?testTags.map((t,ti)=>(
                            <span key={ti} style={{fontSize:11.5,fontWeight:600,padding:"3px 10px",borderRadius:20,background:`${C.indigo}10`,color:C.indigo,border:`1px solid ${C.indigo}25`,display:"flex",alignItems:"center",gap:4}}>
                              <I.Beaker style={{width:10,height:10}}/>{t}
                            </span>
                          )):<span style={{fontSize:12.5,color:C.muted}}>No tests specified</span>}
                        </div>
                      </div>

                      {r.note&&<div style={{background:`${C.indigo}08`,borderRadius:8,padding:"8px 12px",marginBottom:7,fontSize:12.5,color:C.muted,borderLeft:`3px solid ${C.indigo}40`}}><b style={{color:C.text}}>Doctor's Note:</b> {r.note}</div>}
                      <div style={{fontSize:11.5,color:"#b0bec5"}}>Requested {new Date(r.created_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                    </div>

                    {/* Actions */}
                    <div style={{display:"flex",flexDirection:"column",gap:7,flexShrink:0}}>
                      {(r.status==="PENDING"||r.status==="IN_PROGRESS")&&<>
                        {r.status==="PENDING"&&<button className="byh" onClick={()=>markInProgress(r.id)} style={{padding:"7px 13px",background:C.amber,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}><I.Clock style={{width:13,height:13}}/>Start Work</button>}
                        <button className="bih" onClick={()=>{setSelected(r);setShowForm(true);}} style={{padding:"7px 13px",background:r.status==="PENDING"?C.blue2:C.indigo,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",boxShadow:`0 2px 8px ${C.indigo}44`}}>
                          <I.Beaker style={{width:13,height:13}}/>{r.status==="PENDING"?"Submit Results":"Update Results"}
                        </button>
                        {r.status==="IN_PROGRESS"&&<button className="bph" onClick={()=>markDone(r.id)} style={{padding:"7px 13px",background:C.green,color:C.white,borderRadius:8,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}><I.Check style={{width:13,height:13}}/>Mark Done</button>}
                      </>}
                      {r.status==="DONE"&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",background:"#ecfdf5",borderRadius:8,border:"1px solid #bbf7d0",color:"#059669",fontSize:12.5,fontWeight:600}}><I.Check style={{width:13,height:13}}/>Completed</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* LAB RESULT MODAL */}
      {showForm&&selected&&(
        <Modal title="Submit Lab Results" onClose={()=>setShowForm(false)}>
          <div style={{marginBottom:16,padding:"10px 14px",background:`${C.indigo}0e`,borderRadius:10,border:`1px solid ${C.indigo}25`}}>
            <div style={{fontSize:13,fontWeight:600,color:C.indigo}}>Patient: {pName(selected)}</div>
            <div style={{fontSize:12.5,color:C.muted,marginTop:2}}>Tests: {selected.tests||"None specified"}</div>
            {selected.note&&<div style={{fontSize:12.5,color:C.muted,marginTop:4}}><b>Note:</b> {selected.note}</div>}
          </div>
          <form onSubmit={submitResult}>
            <label style={ls}>Test Name *</label>
            <select required value={resultData.test_name} onChange={e=>setResultData({...resultData,test_name:e.target.value})} style={is}>
              <option value="">Select test…</option>
              {selected.tests?.split(",").map((t,i)=><option key={i} value={t.trim()}>{t.trim()}</option>)||<option value="">No tests</option>}
            </select>
            <label style={ls}>Result *</label>
            <input required type="text" value={resultData.result} onChange={e=>setResultData({...resultData,result:e.target.value})} placeholder="e.g. 95, Negative, 14.5" style={is}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <label style={ls}>Units</label>
                <input type="text" value={resultData.units} onChange={e=>setResultData({...resultData,units:e.target.value})} placeholder="mg/dL, mmol/L" style={is}/>
              </div>
              <div>
                <label style={ls}>Reference Range</label>
                <input type="text" value={resultData.reference_range} onChange={e=>setResultData({...resultData,reference_range:e.target.value})} placeholder="70-100 mg/dL" style={is}/>
              </div>
            </div>
            <Actions onCancel={()=>setShowForm(false)} label="Submit Result" color={C.indigo}/>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LabScientistDashboard;