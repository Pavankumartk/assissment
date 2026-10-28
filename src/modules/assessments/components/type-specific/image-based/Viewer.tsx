"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Flag, Image as ImageIcon, Send } from "lucide-react";
import { assessmentStorage, getActiveAssessmentId, getAssessment, resultPath, updateAssessment } from "@/modules/assessments/storage/assessment-storage";
import { getDemoSession } from "@/modules/assessments/auth/demo-auth";
import { IMAGE_ANSWERS_KEY, IMAGE_RESULT_KEY, imageQuestionValid, readImageDraft, type ImageQuestion, type ImageResult } from "./image-based-data";
import "./image-based.css";

export default function ImageBasedViewer() {
  const router = useRouter();
  const [questions,setQuestions]=useState<ImageQuestion[]>([]);
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [flagged,setFlagged]=useState<string[]>([]);
  const [current,setCurrent]=useState(0);
  const [ready,setReady]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const [error,setError]=useState("");
  const [isPreview,setIsPreview]=useState(false);
  useEffect(()=>{
    setQuestions(readImageDraft().questions.filter(imageQuestionValid));
    const preview=new URLSearchParams(window.location.search).get("preview")==="true";
    setIsPreview(preview);
    if(!preview){
      try {const saved=JSON.parse(assessmentStorage.getItem(IMAGE_ANSWERS_KEY)||"{}");setAnswers(saved.answers||{});setFlagged(saved.flagged||[]);setCurrent(Math.max(0,Number(saved.current)||0));} catch {/* start fresh */}
    }
    setReady(true);
  },[]);
  useEffect(()=>{
    if(!ready||isPreview)return;
    try{assessmentStorage.setItem(IMAGE_ANSWERS_KEY,JSON.stringify({answers,flagged,current}));}catch{/* local storage unavailable */}
  },[answers,flagged,current,ready,isPreview]);
  const question=questions[current];
  const answered=questions.filter(q=>answers[q.id]!==undefined).length;
  const submit=()=>{
    const id=getActiveAssessmentId();const record=id?getAssessment(id):undefined;const session=getDemoSession();
    if(!id||!record||session?.role!=="learner"){setError("Please sign in as a learner to submit.");return;}
    const maxScore=questions.reduce((n,q)=>n+q.points,0);
    const score=questions.reduce((n,q)=>n+(answers[q.id]===q.correct?q.points:0),0);
    const result:ImageResult={assessmentId:id,answers,score,maxScore,questionCount:questions.length,correctCount:questions.filter(q=>answers[q.id]===q.correct).length,submittedAt:new Date().toISOString()};
    try {assessmentStorage.setItem(IMAGE_RESULT_KEY,JSON.stringify(result));updateAssessment({attemptCount:(record.attemptCount||0)+1});router.push(resultPath(id));} catch {setError("Unable to save your answers. Please try again.");}
  };
  if(!ready)return null;
  if(!questions.length)return <div className="ibqLearner"><div className="ibqLearnerCard"><h2>No image questions are available</h2><p>Ask your instructor to complete this assessment.</p><button onClick={()=>router.push(isPreview?"/assessments":"/learner")}>Back</button></div></div>;
  return <main className="ibqLearner"><div className="ibqLearnerShell"><header className="ibqLearnerHeader"><div><span>Image-Based Assessment</span><h1>{getAssessment(getActiveAssessmentId()||"")?.title || "Image-Based Questions"}</h1></div><div>{isPreview?<b>Creator Preview</b>:<b>{answered} of {questions.length} Answered</b>}</div></header>
    <div className="ibqLearnerProgress"><span style={{width:`${answered/questions.length*100}%`}}/></div>
    <div className="ibqLearnerGrid"><section className="ibqLearnerCard"><div className="ibqLearnerQuestionHead"><strong>Question {current+1} of {questions.length}</strong><span>{question.points} {question.points===1?"Mark":"Marks"}</span></div>
      <h2>{question.text}</h2><div className="ibqLearnerImage">{question.image?<img src={question.image} alt={`Image for question ${current+1}`}/>:<ImageIcon size={48}/>}</div>
      <p className="ibqLearnerInstruction">Select the correct answer.</p><div className="ibqLearnerOptions">{question.options.map((option,index)=><button type="button" key={index} className={answers[question.id]===index?"isSelected":""} onClick={()=>setAnswers(a=>({...a,[question.id]:index}))}><span className="ibqLearnerLetter">{String.fromCharCode(65+index)}</span><span className="ibqLearnerOptionContent">{option.text}{option.image&&<img src={option.image} alt={`Option ${String.fromCharCode(65+index)}`}/>}</span>{answers[question.id]===index&&<Check size={19}/>}</button>)}</div>
      {question.hint&&<details className="ibqLearnerHint"><summary>View hint</summary><p>{question.hint}</p></details>}
      <div className="ibqLearnerActions"><button type="button" disabled={current===0} onClick={()=>setCurrent(x=>x-1)}><ChevronLeft size={18}/> Previous</button><button type="button" className="ibqLearnerFlag" onClick={()=>setFlagged(f=>f.includes(question.id)?f.filter(id=>id!==question.id):[...f,question.id])}><Flag size={17}/>{flagged.includes(question.id)?"Unflag":"Flag"}</button>{current<questions.length-1?<button type="button" onClick={()=>setCurrent(x=>x+1)}>Next <ChevronRight size={18}/></button>:<button type="button" onClick={()=>setConfirm(true)}>{isPreview?"Finish Preview":"Submit"} <Send size={18}/></button>}</div>
    </section><aside className="ibqLearnerCard ibqLearnerNavigation"><h3>Question Navigator</h3><div className="ibqLearnerNumbers">{questions.map((q,index)=><button key={q.id} onClick={()=>setCurrent(index)} className={`${index===current?"isCurrent ":""}${answers[q.id]!==undefined?"isAnswered ":""}${flagged.includes(q.id)?"isFlagged":""}`} aria-label={`Go to question ${index+1}`}>{index+1}</button>)}</div><p>Answered: {answered} / {questions.length}</p><p>Flagged: {flagged.length}</p><button className="ibqLearnerSubmit" onClick={()=>setConfirm(true)}>{isPreview?"Finish Preview":"Submit Assessment"}</button></aside></div>
    {error&&<p className="ibqError" role="alert">{error}</p>}
    {confirm&&<div className="ibqConfirmOverlay"><section className="ibqConfirmDialog" role="dialog" aria-modal="true" aria-label="Confirm assessment submission"><h2>{isPreview?"Finish preview?":"Submit assessment?"}</h2><p>{answered} of {questions.length} questions answered. {questions.length-answered>0?"Unanswered questions will receive zero marks.":"All questions are answered."}</p><div><button onClick={()=>setConfirm(false)}>Go Back</button><button onClick={()=>{if(isPreview)router.push("/assessments");else submit();}}>{isPreview?"Finish Preview":"Confirm Submit"}</button></div></section></div>}
    </div></main>;
}
