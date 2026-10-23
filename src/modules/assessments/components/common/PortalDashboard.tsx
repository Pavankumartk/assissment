"use client";
import {useEffect,useState} from "react";
import {getDemoSession,type DemoSession} from "@/modules/assessments/auth/demo-auth";
import {getAssessments} from "@/modules/assessments/storage/assessment-storage";
export default function PortalDashboard(){
 const [session,setSession]=useState<DemoSession|null>(null);
 const [counts,setCounts]=useState({total:0,published:0});
 useEffect(()=>{
  const refresh=()=>{
   const account=getDemoSession();setSession(account);
   if(!account){setCounts({total:0,published:0});return;}
   const own=getAssessments().filter(a=>(a.tenantId||"north")===account.tenantId);
   const visible=account.role==="admin"?own:own.filter(a=>a.status==="Published");
   setCounts({total:visible.length,published:visible.filter(a=>a.status==="Published").length});
  };
  refresh();window.addEventListener("storage",refresh);window.addEventListener("neurolxp-assessments-changed",refresh);
  return()=>{window.removeEventListener("storage",refresh);window.removeEventListener("neurolxp-assessments-changed",refresh);};
 },[]);
 if(!session)return null;
 return <div className="portalScreen">
  <div className="portalPageHeading"><h1>Dashboard</h1><p>Welcome, {session.displayName}. {session.tenantId==="south"?"South Institute":"North Institute"} · {session.role==="admin"?"Institute Admin":"Student / Learner"}</p></div>
  <section className="portalStats" aria-label="Assessment overview">
   <div className="portalStat"><span>{session.role==="admin"?"Total Assessments":"Available Assessments"}</span><strong>{counts.total}</strong></div>
   <div className="portalStat"><span>Published Assessments</span><strong>{counts.published}</strong></div>
  </section>
  <section className="portalWelcome"><h2>Welcome to your Dashboard</h2><p>Use <strong>Assessment</strong> in the left Sidebar to {session.role==="admin"?"create and manage your assessments.":"view and start assessments published by your institute."}</p></section>
 </div>;
}
