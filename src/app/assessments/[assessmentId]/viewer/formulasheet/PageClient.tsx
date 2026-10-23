"use client";
import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import { getAssessment,setActiveAssessmentId } from "@/modules/assessments/storage/assessment-storage";
import ShortTool from "@/modules/assessments/components/type-specific/short-answer/Formulasheet";
import OneTool from "@/modules/assessments/components/type-specific/one-word/Formulasheet";
export default function ToolPage() {
 const params=useParams<{assessmentId:string}>();
 const [ready,setReady]=useState(false);
 useEffect(()=>{setActiveAssessmentId(params.assessmentId);setReady(true)},[params.assessmentId]);
 if(!ready)return null;
 const type=getAssessment(params.assessmentId)?.typeCode;
 const Tool=type==="one-word"?OneTool:ShortTool;
 if(type!=="one-word" && type!=="short-answer")return <p style={{padding:24}}>This tool is not available for this assessment. <a href={`/assessments/${params.assessmentId}/viewer`}>Back to assessment</a></p>;
 return <div className={`assessment-variant assessment-variant--${type}`}><Tool/></div>;
}
