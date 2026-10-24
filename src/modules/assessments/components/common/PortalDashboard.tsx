"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {getDemoSession,type DemoSession} from "@/modules/assessments/auth/demo-auth";
import {getAssessments} from "@/modules/assessments/storage/assessment-storage";
import type {LearnerAssessment} from "@/modules/assessments/components/learner/learner-assessment-data";
import {formatDue,learnerAssessmentsForTenant} from "@/modules/assessments/components/learner/learner-assessment-data";
import "@/modules/assessments/components/learner/learner-assessment.css";

export default function PortalDashboard(){
 const [session,setSession]=useState<DemoSession|null>(null);
 const [counts,setCounts]=useState({total:0,published:0});
 const [reminder,setReminder]=useState<LearnerAssessment|null>(null);
 useEffect(()=>{
  const refresh=()=>{
   const account=getDemoSession();setSession(account);
   if(!account){setCounts({total:0,published:0});setReminder(null);return;}
   const own=getAssessments().filter(a=>(a.tenantId||"north")===account.tenantId);
   const visible=account.role==="admin"?own:own.filter(a=>a.status==="Published"||a.status==="Scheduled");
   setCounts({total:visible.length,published:visible.filter(a=>a.status==="Published").length});
   if(account.role==="learner"){
     const selections=learnerAssessmentsForTenant(visible,account.tenantId);
     setReminder(selections.find(item=>item.status==="Live")||selections.find(item=>item.status==="Upcoming")||null);
   }else setReminder(null);
  };
  refresh();window.addEventListener("storage",refresh);window.addEventListener("neurolxp-assessments-changed",refresh);
  return()=>{window.removeEventListener("storage",refresh);window.removeEventListener("neurolxp-assessments-changed",refresh);};
 },[]);
 if(!session)return null;
 if(session.role==="learner"){
  const dueToday=reminder?.endAt?.toDateString()===new Date().toDateString();
  return <div className="portalScreen learnerDashboardStart">
    {reminder?<section className="learnerDueCard" aria-label="Assessment reminder">
      <div className="learnerDueInfo"><h1>{reminder.status==="Upcoming"?"Upcoming assessment":dueToday?"Assessment due today":"Assessment ready to begin"}</h1>
      <p>{reminder.record.title} · {reminder.record.typeLabel}{reminder.endAt?` · closes ${formatDue(reminder.endAt)}`:""}</p></div>
      <Link className="learnerDueButton" href={`/assessments?selected=${encodeURIComponent(reminder.record.id)}`}>Go to Assessment</Link>
    </section>:<section className="learnerDueCard"><div className="learnerDueInfo"><h1>No upcoming assessment</h1><p>Your institute has no live or upcoming assessments at the moment.</p></div><Link className="learnerDueButton" href="/assessments">View Assessments</Link></section>}
  </div>;
 }
 return <div className="portalScreen">
  <div className="portalPageHeading"><h1>Dashboard</h1><p>Welcome, {session.displayName}. {session.tenantId==="south"?"South Institute":"North Institute"} · Institute Admin</p></div>
  <section className="portalStats" aria-label="Assessment overview">
   <div className="portalStat"><span>Total Assessments</span><strong>{counts.total}</strong></div>
   <div className="portalStat"><span>Published Assessments</span><strong>{counts.published}</strong></div>
  </section>
  <section className="portalWelcome"><h2>Welcome to your Dashboard</h2><p>Use <strong>Assessment</strong> in the left Sidebar to create and manage your assessments.</p></section>
 </div>;
}
