"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { assessmentStorage, getActiveAssessmentId, getAssessment } from "@/modules/assessments/storage/assessment-storage";
import { IMAGE_RESULT_KEY, imageCorrectIndices, imageGrade, imageQuestionValid, readImageDraft, type ImageQuestion, type ImageResult } from "./image-based-data";
import "./image-based.css";

export default function ImageBasedResult(){
  const router=useRouter();
  const [result,setResult]=useState<ImageResult|null>(null);
  const [questions,setQuestions]=useState<ImageQuestion[]>([]);
  useEffect(()=>{
    try{const value=assessmentStorage.getItem(IMAGE_RESULT_KEY);if(value)setResult(JSON.parse(value));}catch{/* no result */}
    setQuestions(readImageDraft().questions.filter(imageQuestionValid));
  },[]);
  if(!result)return <main className="ibqLearner"><div className="ibqLearnerCard"><h1>No submitted result found</h1><button onClick={()=>router.push("/learner")}>Back to assessments</button></div></main>;
  const percent=result.maxScore>0?Math.round(result.score/result.maxScore*100):0;
  const record=getAssessment(getActiveAssessmentId()||"");
  return <main className="ibqLearner"><div className="ibqLearnerShell"><header className="ibqLearnerHeader"><div><span>Assessment Results</span><h1>{record?.title||"Image-Based Assessment"}</h1></div></header><section className="ibqLearnerCard ibqResultCard"><h2>Assessment Submitted</h2><div className="ibqResultScore">{percent}%</div><p>{result.score} / {result.maxScore} marks · {result.correctCount} of {result.questionCount} correct</p><p>Submitted {new Date(result.submittedAt).toLocaleString()}</p></section>
    <section className="ibqLearnerCard ibqResultQuestions"><h2>Question Review</h2>{questions.map((q,index)=>{
      const raw=result.answers[q.id];const selected: number[]=typeof raw==="number"?[raw]:Array.isArray(raw)?raw.filter((value): value is number=>typeof value==="number"):[];
      const awarded=imageGrade(q,selected);const correct=selected.length>0&&awarded===q.points;
      const partial=awarded>0&&awarded<q.points;
      const fullFeedback=q.feedbackFull||q.feedback;
      const feedback=correct?fullFeedback:partial?q.feedbackPartial:q.feedbackZero;
      const optionNames=(indices:number[])=>indices.map(i=>q.options[i]?.text||`Option ${i+1}`).join(", ");
      return <div key={q.id} className="ibqResultQuestion"><h3>{correct?<CheckCircle2 color="#2c7915" size={19}/>:<XCircle color="#c62a56" size={19}/>} {index+1}. {q.text}</h3>
      {q.image&&<img className="ibqResultQuestionImage" src={q.image} alt={`Question ${index+1}`}/>}
      <p>Marks awarded: {Number(awarded.toFixed(2))} / {q.points}</p>
      <p>Your answer: {selected.length?optionNames(selected):"Not answered"} {correct?"(Correct)":partial?"(Partially correct)":"(Incorrect)"}</p>
      <p>Correct answer: {optionNames(imageCorrectIndices(q))}</p>
      {selected.map(i=>q.options[i]?.explanation?<p key={i}>Option feedback: {q.options[i].explanation}</p>:null)}
      {q.explanation&&<p>Explanation: {q.explanation}</p>}{feedback&&<p>Feedback: {feedback}</p>}
      </div>;
    })}</section>
    <button className="ibqResultBack" onClick={()=>router.push("/learner")}><ChevronLeft size={18}/> Back to Assessments</button></div></main>;
}
