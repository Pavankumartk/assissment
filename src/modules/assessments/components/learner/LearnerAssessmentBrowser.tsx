"use client";

import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import {getAssessments,setActiveAssessmentId,viewerPath} from "@/modules/assessments/storage/assessment-storage";
import type {LearnerAssessment,LearnerStatus} from "./learner-assessment-data";
import {learnerAssessmentsForTenant} from "./learner-assessment-data";
import "./learner-assessment.css";

type Filter = "All" | LearnerStatus;
const filters: Filter[] = ["All", "Live", "Upcoming", "Completed"];
const dateText = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined,{day:"2-digit",month:"short",year:"numeric"}).format(date);
};

export default function LearnerAssessmentBrowser(){
  const router=useRouter();
  const [items,setItems]=useState<LearnerAssessment[]>([]);
  const [chosen,setChosen]=useState<string>("");
  const [filter,setFilter]=useState<Filter>("All");
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const session=getDemoSession();
    if (!session) {router.replace("/login");return;}
    if (session.role!=="learner") {router.replace("/assessments");return;}
    const requested=new URLSearchParams(window.location.search).get("selected");
    const update=()=>{
      const next=learnerAssessmentsForTenant(getAssessments(),session.tenantId);
      setItems(next);
      setChosen(previous=>next.some(item=>item.record.id===previous)?previous:next.some(item=>item.record.id===requested)?requested!:next[0]?.record.id || "");
      setReady(true);
    };
    update();
    window.addEventListener("storage",update);
    window.addEventListener("neurolxp-assessments-changed",update);
    return ()=>{window.removeEventListener("storage",update);window.removeEventListener("neurolxp-assessments-changed",update);};
  },[router]);
  const selected=items.find(item=>item.record.id===chosen);
  const visible=useMemo(()=>items.filter(item=>filter==="All"||item.status===filter),[items,filter]);
  const proceed=()=>{
    if(!selected?.canStart)return;
    setActiveAssessmentId(selected.record.id);
    router.push(viewerPath(selected.record.id));
  };
  if(!ready)return null;
  return <div className="portalScreen learnerAssessmentRoot">
    <nav aria-label="Breadcrumb" className="learnerAssessmentBreadcrumb"><a href="/dashboard">Dashboard</a><span aria-hidden="true">›</span><strong>Assessment</strong></nav>
    <div className="learnerAssessmentHeading"><h1>Assessment</h1><p>Pick an assessment to see its details</p></div>
    <div className="learnerAssessmentFilters" role="group" aria-label="Filter assessments">
      {filters.map(option=><button type="button" key={option} className={option===filter?"selected":""} aria-pressed={option===filter} onClick={()=>{setFilter(option);if(option!=="All"&&selected?.status!==option){const first=items.find(item=>item.status===option);if(first)setChosen(first.record.id);}}}>{option}</button>)}
    </div>
    {items.length===0?<div className="learnerEmptyState"><h2>No assessments available</h2><p>Your institute has not published an assessment for you yet.</p></div>:
    <div className="learnerAssessmentTwoColumn">
      <div className="learnerAssessmentList" aria-label="Assessments">
        {visible.length?visible.map(item=><button type="button" key={item.record.id} className={`learnerAssessmentListCard ${chosen===item.record.id?"is-selected":""}`} aria-pressed={chosen===item.record.id} onClick={()=>setChosen(item.record.id)}>
          <span className="learnerListTitleRow"><strong>{item.record.title}</strong><span className={`learnerStatusBadge is-${item.status.toLowerCase()}`}>{item.status}</span></span>
          <span className="learnerCardSubtitle">{item.course} · {item.record.typeLabel}</span>
          <span className="learnerCardSubtitle">{item.totalQuestions} Qs · {item.totalMarks} marks · {item.duration?`${item.duration} min`:"Untimed"}</span>
        </button>):<div className="learnerEmptyFilter">No {filter.toLowerCase()} assessments.</div>}
      </div>
      <div className="learnerAssessmentDetail">
        {selected? <>
          <section className="learnerDetailCard learnerOverview">
            <div className="learnerDetailTitle"><h2>{selected.record.title}</h2><span className={`learnerStatusBadge is-${selected.status.toLowerCase()}`}>{selected.status}</span></div>
            <p className="learnerCardSubtitle">{selected.course} · {selected.record.typeLabel}{selected.module?` · ${selected.module}`:""}</p>
            <div className="learnerMetricGrid">
              <div><span>Total questions</span><strong>{selected.totalQuestions}</strong></div>
              <div><span>Total marks</span><strong>{selected.totalMarks}</strong></div>
              <div><span>Duration</span><strong>{selected.duration?`${selected.duration} min`:"Untimed"}</strong></div>
              <div><span>Passing score</span><strong>{selected.passingScore}</strong></div>
              <div><span>Negative marking</span><strong>{selected.negativeMarking}</strong></div>
              <div><span>Attempts used</span><strong>{selected.attempts.length||selected.record.attemptCount||0} / {selected.maxAttempts ?? "Unlimited"}</strong></div>
            </div>
          </section>
          <section className="learnerDetailCard"><h3>Schedule</h3><div className="learnerScheduleGrid"><div><span>Available window</span><strong>{selected.schedule}</strong></div><div><span>Mode</span><strong>{selected.mode}</strong></div></div></section>
          <section className="learnerDetailCard"><h3>Attempt history</h3><div className="learnerTableScroll"><table className="learnerAttemptsTable"><thead><tr><th>Attempt</th><th>Date</th><th>Score</th><th>Result</th></tr></thead><tbody>{selected.attempts.length?selected.attempts.map((attempt,index)=><tr key={attempt.attemptId||index}><td>{index+1}</td><td>{dateText(attempt.submittedAt)}</td><td>{Number.isFinite(attempt.scorePercent)?`${attempt.scorePercent}%`:"Awaiting grading"}</td><td>{Number(attempt.pendingCount)>0?"Pending review":"Submitted"}</td></tr>):<tr><td colSpan={4}>No attempts yet</td></tr>}</tbody></table></div></section>
          <section className="learnerDetailCard learnerReadyCard"><h3>Ready to begin?</h3><div className="learnerReadyChecks"><p className={selected.canStart?"is-positive":"is-muted"}>{selected.canStart?"✓ Assessment is open now":selected.status==="Upcoming"?"• Assessment is not open yet":"• Assessment is closed or completed"}</p><p className="is-positive">✓ {selected.maxAttempts===null?"Attempts are available":`${Math.max(0,selected.maxAttempts-(selected.attempts.length||selected.record.attemptCount||0))} attempt(s) remaining`}</p><p>• Stable internet connection</p><p>• Quiet place{selected.duration?`, ${selected.duration} minutes free`:""}</p></div>
            <div className="learnerReadyActions"><button type="button" disabled={!selected.canStart} onClick={proceed}>Proceed to instructions <span aria-hidden="true">→</span></button></div>
            {!selected.canStart&&<p className="learnerUnavailableNote">{selected.status==="Upcoming"?`Available when the assessment opens${selected.startAt?` on ${dateText(selected.startAt.toISOString())}`:""}.`:"This assessment is no longer available to start."}</p>}
          </section>
        </>:<div className="learnerEmptyState"><h2>Select an assessment</h2><p>Choose an assessment from the list to view its details.</p></div>}
      </div>
    </div>}
  </div>;
}
