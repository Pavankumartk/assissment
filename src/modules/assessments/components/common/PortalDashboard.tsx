"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {getDemoSession,type DemoSession} from "@/modules/assessments/auth/demo-auth";
import {getAssessments} from "@/modules/assessments/storage/assessment-storage";
import type {LearnerAssessment} from "@/modules/assessments/components/learner/learner-assessment-data";
import {formatDue,learnerAssessmentsForTenant} from "@/modules/assessments/components/learner/learner-assessment-data";
import "@/modules/assessments/components/learner/learner-assessment.css";

type LearnerDashboardData = {
  liveCount: number;
  averageScore: number | null;
  reminder: LearnerAssessment | null;
};

export default function PortalDashboard({assessmentLanding=false}:{assessmentLanding?:boolean}){
  const [session,setSession]=useState<DemoSession|null>(null);
  const [counts,setCounts]=useState({total:0,published:0});
  const [learner,setLearner]=useState<LearnerDashboardData>({liveCount:0,averageScore:null,reminder:null});

  useEffect(()=>{
    const refresh=()=>{
      const account=getDemoSession();
      setSession(account);
      if(!account){
        setCounts({total:0,published:0});
        setLearner({liveCount:0,averageScore:null,reminder:null});
        return;
      }
      const own=getAssessments().filter(a=>(a.tenantId||"north")===account.tenantId);
      const visible=account.role==="admin"?own:own.filter(a=>a.status==="Published"||a.status==="Scheduled");
      setCounts({total:visible.length,published:visible.filter(a=>a.status==="Published").length});
      if(account.role==="learner"){
        const selections=learnerAssessmentsForTenant(visible,account.tenantId);
        const scored=selections.flatMap(item=>item.attempts)
          .map(attempt=>attempt.scorePercent)
          .filter((value):value is number=>typeof value==="number"&&Number.isFinite(value));
        setLearner({
          liveCount:selections.filter(item=>item.status==="Live").length,
          averageScore:scored.length?Math.round(scored.reduce((sum,score)=>sum+score,0)/scored.length):null,
          reminder:selections.find(item=>item.status==="Live")||selections.find(item=>item.status==="Upcoming")||null,
        });
      }else{
        setLearner({liveCount:0,averageScore:null,reminder:null});
      }
    };
    refresh();
    window.addEventListener("storage",refresh);
    window.addEventListener("neurolxp-assessments-changed",refresh);
    return()=>{
      window.removeEventListener("storage",refresh);
      window.removeEventListener("neurolxp-assessments-changed",refresh);
    };
  },[]);

  if(!session)return null;

  if(session.role==="learner"&&!assessmentLanding){
    return <div className="portalScreen">
      <div className="portalPageHeading">
        <h1>Dashboard</h1>
        <p>Welcome Back, {session.displayName?.trim()||"Learner"}</p>
      </div>
    </div>;
  }

  if(session.role==="learner"&&assessmentLanding){
    const reminder=learner.reminder;
    const dueToday=reminder?.endAt?.toDateString()===new Date().toDateString();
    const greetingName=session.displayName?.trim()||"Learner";
    return <div className="portalScreen learnerDashboardStart">
      <header className="learnerDashboardHeading">
        <h1>Dashboard</h1>
        <p>Welcome Back, {greetingName}</p>
      </header>
      <section className="learnerDashboardStats" aria-label="Learner dashboard overview">
        <div className="learnerDashboardStat"><span>Course Enrolled</span><strong className="is-blue" title="Enrollment information is not available">—</strong></div>
        <div className="learnerDashboardStat"><span>Assessment live</span><strong className="is-purple">{String(learner.liveCount).padStart(2,"0")}</strong></div>
        <div className="learnerDashboardStat"><span>Average Score</span><strong className="is-orange">{learner.averageScore===null?"—":`${learner.averageScore}%`}</strong></div>
        <div className="learnerDashboardStat"><span>Attendance</span><strong className="is-green" title="Attendance information is not available">—</strong></div>
      </section>
      {reminder?<section className="learnerDueCard" aria-label="Assessment reminder">
        <div className="learnerDueInfo">
          <h2>{reminder.status==="Upcoming"?"Upcoming assessment":dueToday?"Assessment due today":"Assessment ready to begin"}</h2>
          <p>{reminder.record.title} · {reminder.record.typeLabel}{reminder.endAt?` · closes ${formatDue(reminder.endAt)}`:""}</p>
        </div>
        <Link className="learnerDueButton" href={`/assessments/list?selected=${encodeURIComponent(reminder.record.id)}`}>Go to Assessment</Link>
      </section>:<section className="learnerDueCard" aria-label="Assessment reminder">
        <div className="learnerDueInfo"><h2>No upcoming assessment</h2><p>Your institute has no live or upcoming assessments at the moment.</p></div>
        <Link className="learnerDueButton" href="/assessments/list">View Assessments</Link>
      </section>}
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
