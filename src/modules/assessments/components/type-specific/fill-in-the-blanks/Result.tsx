"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Sidebar from "@/modules/assessments/components/common/sidebar/page";
import Header from "@/modules/assessments/components/common/header/Header";
import {assessmentStorage} from "@/modules/assessments/storage/assessment-storage";
import "./fill-flow.css";
type Result={title:string;score:number;total:number;totalMarks:number;answered:number;scorePercent:number;questions:{text:string;options:string[];blankCorrect:number[];points:number}[];answers:Record<number,number[]>};
export default function FillResult(){
 const router=useRouter();const [result,setResult]=useState<Result|null>(null);const [loaded,setLoaded]=useState(false);const [showResult,setShowResult]=useState(false);const [showAnswers,setShowAnswers]=useState(false);
 useEffect(()=>{try{
  const saved=assessmentStorage.getItem("fillBlanksViewerResult");if(saved)setResult(JSON.parse(saved));
  const evaluation=JSON.parse(assessmentStorage.getItem("fillBlanksEvaluationDraft")||"{}");
  const release=String(evaluation.reviewAvailability||evaluation.resultAvailable||"Immediately").toLowerCase();
  const enabled=String(evaluation.showResults||"yes").toLowerCase();
  const immediate=!/never|manual|scheduled|after clos|after grad/.test(release)&&!/[Nn]o|off|false/.test(enabled);
  setShowResult(immediate);setShowAnswers(immediate && String(evaluation.showCorrectAnswers||"yes").toLowerCase()!=="no");
 }catch{}setLoaded(true);},[]);
 return <main className="superAdminPage institutionAdminPage fillStartApp"><div className="dashboardLayout fillStartLayout"><Sidebar/><section className="mainContent fillStartMain"><div className="fillStartHeader"><Header/></div><div className="institutionScrollArea fillStartScroll"><div className="pageContent institutionPageContent fillStartContent fillResultContent">
 <nav className="fillStartCrumb"><button onClick={()=>router.push("/dashboard")}>Dashboard</button> › <button onClick={()=>router.push("/assessments")}>Assessment</button> › <strong>Results</strong></nav>
 <h1>Assessment Completed</h1><p className="fillStartSubtype">{result?.title||"Fill in the Blanks"}</p>
 {!loaded?null:!result?<section className="fillStartCard"><h2>No submission found</h2><p>Complete an assessment to see its result.</p><button onClick={()=>router.push("/assessments")}>Back to Assessments</button></section>:<>
 {showResult?<><div className="fillResultSummary"><div className="fillStartCard"><span>Score</span><strong>{result.score} / {result.totalMarks}</strong></div><div className="fillStartCard"><span>Accuracy</span><strong>{result.scorePercent}%</strong></div><div className="fillStartCard"><span>Answered</span><strong>{result.answered} / {result.total}</strong></div></div>
 {showAnswers&&<section className="fillStartCard fillResultReview"><h2>Detailed Question Review</h2>
 {result.questions.map((q,i)=>{
  const correct=q.blankCorrect.every((choice,j)=>result.answers[i]?.[j]===choice);
  const answered=q.blankCorrect.every((_,j)=>Number.isInteger(result.answers[i]?.[j])&&result.answers[i][j]>=0);
  return <div className="fillResultQuestion" key={i}><h3>Question {i+1} <span className={correct?"is-correct":answered?"is-wrong":"is-unanswered"}>{correct?"Correct":answered?"Incorrect":"Unanswered"}</span></h3><p>{q.text}</p>
   {q.blankCorrect.map((index,j)=><div className="fillResultAnswer" key={j}>Blank {j+1}: Your answer — <strong>{q.options[result.answers[i]?.[j]]||"Unanswered"}</strong> · Correct — <strong>{q.options[index]||"—"}</strong></div>)}
  </div>})}
 </section>}</>:<section className="fillStartCard"><h2>Assessment submitted</h2><p>Your results are not yet available according to this assessment’s Evaluation settings.</p></section>}<div className="fillResultActions"><button onClick={()=>router.push("/assessments")}>Back to Assessments</button></div></>}
 </div></div></section></div></main>;
}
