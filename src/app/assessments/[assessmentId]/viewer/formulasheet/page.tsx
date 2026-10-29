"use client";
import { Suspense,useEffect,useState } from "react";
import { useParams } from "next/navigation";
import { getAssessment,setActiveAssessmentId } from "@/modules/assessments/storage/assessment-storage";
import ShortTool from "@/modules/assessments/components/type-specific/short-answer/Formulasheet";
import CommonTool from "@/app/formulasheet/page";
import OneTool from "@/modules/assessments/components/type-specific/one-word/Formulasheet";
function ToolContent() {
 const params=useParams<{assessmentId:string}>();
 const [ready,setReady]=useState(false);
 useEffect(()=>{setActiveAssessmentId(params.assessmentId);setReady(true)},[params.assessmentId]);
 if(!ready)return null;
 const type=getAssessment(params.assessmentId)?.typeCode;
 const Tool=type==="one-word"?OneTool:type==="short-answer"?ShortTool:CommonTool;

 return <div className={`assessment-variant assessment-variant--${type}`}><Tool/></div>;
}

export default function ToolPage() {
 return <Suspense fallback={null}><ToolContent/></Suspense>;
}
