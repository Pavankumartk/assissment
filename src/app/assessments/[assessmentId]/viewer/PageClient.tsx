"use client";
import {useEffect,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import {setActiveAssessmentId,getAssessment} from "@/modules/assessments/storage/assessment-storage";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import Screen from "@/modules/assessments/components/viewer/AssessmentViewer/AssessmentViewer";
import ShortViewer from "@/modules/assessments/components/type-specific/short-answer/Viewer";
import OneViewer from "@/modules/assessments/components/type-specific/one-word/Viewer";
import FillViewer from "@/modules/assessments/components/type-specific/fill-in-the-blanks/Viewer";
import MemoryGameViewer from "@/modules/assessments/components/type-specific/memory-game/Viewer";
import DragDropViewer from "@/modules/assessments/components/type-specific/drag-and-drop/Viewer";
import TrueFalseViewer from "@/modules/assessments/components/type-specific/true-false/Viewer";
import LongViewer from "@/modules/assessments/components/type-specific/long-answer/Viewer";
export default function Page(){
 const {assessmentId}=useParams<{assessmentId:string}>();const router=useRouter();const [ready,setReady]=useState(false);
 const isPreview=typeof window!=="undefined" && new URLSearchParams(window.location.search).get("preview")==="true";
 useEffect(()=>{
  const session=getDemoSession();if(!session){router.replace("/login");return;}
  const record=getAssessment(assessmentId);
  if(!record||(record.tenantId||"north")!==session.tenantId){router.replace(session.role==="admin"?"/assessments":"/learner");return;}
  if(isPreview?session.role!=="admin":session.role!=="learner"||record.status!=="Published"){
   router.replace(session.role==="admin"?"/assessments":"/learner");return;
  }
  setActiveAssessmentId(assessmentId);setReady(true);
 },[assessmentId,isPreview,router]);
 const type=ready?getAssessment(assessmentId)?.typeCode:null;
 const Viewer=type==="memory-game"?MemoryGameViewer:type==="drag-and-drop"?DragDropViewer:type==="short-answer"?ShortViewer:type==="one-word"?OneViewer:type==="fill-in-the-blanks"?FillViewer:type==="true-false"?TrueFalseViewer:type==="long-answer"?LongViewer:Screen;
 return ready&&type?<div className={`assessment-variant assessment-variant--${type}`}><Viewer/></div>:null;
}
