"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import {getAssessments,viewerPath,type StoredAssessment} from "@/modules/assessments/storage/assessment-storage";
export default function LearnerAssessments(){
 const router=useRouter();
 const [assessments,setAssessments]=useState<StoredAssessment[]>([]);
 const [institute,setInstitute]=useState("");
 useEffect(()=>{
  const refresh=()=>{
   const user=getDemoSession();
   if(!user||user.role!=="learner")return;
   setInstitute(user.tenantId==="south"?"South Institute":"North Institute");
   setAssessments(getAssessments().filter(a=>a.status==="Published"&&(a.tenantId||"north")===user.tenantId)
     .sort((a,b)=>(Date.parse(b.updatedAt||b.createdAt)||0)-(Date.parse(a.updatedAt||a.createdAt)||0)));
  };
  refresh();window.addEventListener("storage",refresh);window.addEventListener("neurolxp-assessments-changed",refresh);
  return()=>{window.removeEventListener("storage",refresh);window.removeEventListener("neurolxp-assessments-changed",refresh);};
 },[]);
 return <div className="portalScreen">
  <div className="portalPageHeading"><h1>Available Assessments</h1><p>Published assessments from {institute||"your institute"}</p></div>
  {!assessments.length?<section className="portalWelcome" role="status"><h2>No assessments available yet</h2><p>Your Institute Admin has not published any assessments.</p></section>:
  <div className="portalAssessmentGrid">{assessments.map(a=><article key={a.id} className="portalAssessmentCard">
   <span className="portalTypePill">{a.typeLabel}</span>
   <h2>{a.title||"Untitled Assessment"}</h2>
   <p>{a.course||"General"} · {a.questions} {a.questions===1?"question":"questions"} · {a.marks} marks</p>
   <button type="button" onClick={()=>router.push(viewerPath(a.id))}>Start Assessment</button>
  </article>)}</div>}
 </div>;
}
