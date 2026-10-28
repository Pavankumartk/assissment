"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { assessmentStorage, viewerPath } from "@/modules/assessments/storage/assessment-storage";
import Sidebar from "../../common/sidebar/page";
import Header from "../../common/header/Header";
import "./matchthefollowing.css";

type Result = { title?: string; score?: number; totalMarks?: number; answered?: number; total?: number;
  questions?: {text:string;terms:{label:string}[];options:{text:string}[];correct:number[];selected:number[];points:number}[] };
export default function MatchFollowingResult() {
  const router = useRouter();
  const [result,setResult] = useState<Result | null>(null);
  useEffect(() => {
    try { const raw = assessmentStorage.getItem("matchFollowingViewerResult"); if(raw) setResult(JSON.parse(raw) as Result); } catch { /* No saved result. */ }
  }, []);
  const total = result?.totalMarks ?? 0;
  const score = result?.score ?? 0;
  const percent = total > 0 ? Math.round(score / total * 100) : 0;
  return <main className="superAdminPage institutionAdminPage viewerAppShell viewMatchFollowingApp">
    <div className="dashboardLayout viewerLayout"><Sidebar/><section className="mainContent viewerMainContent">
      <div className="viewerSharedHeader"><Header/></div><div className="institutionScrollArea viewerScroll">
        <div className="pageContent institutionPageContent viewerContent">
          <nav className="viewerBreadcrumb" aria-label="Breadcrumb"><Link href="/learner">Assessments</Link><strong>Match the Following Result</strong></nav>
          <div className="viewerExamCard" style={{padding:24,marginTop:24}}>
            <h1 style={{fontSize:24,fontWeight:600}}>Assessment Result</h1>
            {result ? <>
              <h2 style={{fontSize:20,marginTop:14}}>{result.title || "Match the Following"}</h2>
              <p style={{marginTop:14}}>Score: <strong>{score.toFixed(2)} / {total.toFixed(2)} marks</strong> ({percent}%)</p>
              <p>Questions answered: {result.answered ?? 0} / {result.total ?? 0}</p>
              <div style={{marginTop:24,display:"grid",gap:12}}>
                {(result.questions ?? []).map((q,i) => <section key={i} style={{padding:16,borderRadius:12,boxShadow:"inset 2px 2px 4px #c4c4c4,inset -2px -2px 4px #fff"}}>
                  <h3 style={{fontSize:17}}>Question {i+1}: {q.text}</h3>
                  {q.terms.map((term,row) => <p key={row} style={{marginTop:8}}>
                    {term.label}: {q.options[q.selected[row]]?.text ?? "Not answered"}
                    {q.selected[row] === q.correct[row] ? " ✓" : ` — Correct: ${q.options[q.correct[row]]?.text ?? "—"}`}
                  </p>)}
                </section>)}
              </div>
            </> : <p style={{marginTop:14}}>No submitted matching assessment result was found.</p>}
            <div className="viewerExamActions" style={{marginTop:24}}>
              <button type="button" className="viewerExamButton" onClick={()=>router.push("/learner")}>Back to Assessments</button>
              {result && <button type="button" className="viewerExamButton viewerNext" onClick={()=>router.push(viewerPath())}>View Assessment</button>}
            </div>
          </div>
        </div>
      </div></section></div>
  </main>;
}
