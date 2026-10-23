"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getDemoSession,type DemoRole} from "@/modules/assessments/auth/demo-auth";
import {getAssessments,setActiveAssessmentId,viewerPath} from "@/modules/assessments/storage/assessment-storage";
import PortalShell from "@/modules/assessments/components/common/PortalShell";
import CreatorAssessments from "@/modules/assessments/components/common/AssessmentDashboard/AssessmentDashboard";

export default function Page(){
 const router=useRouter();
 const [role,setRole]=useState<DemoRole|null>(null);
 const [noPublished,setNoPublished]=useState(false);
 useEffect(()=>{
  const session=getDemoSession();
  if(!session){router.replace("/login");return;}
  setRole(session.role);
  if(session.role!=="learner")return;
  const latest=getAssessments()
   .filter(a=>a.status==="Published"&&(a.tenantId||"north")===session.tenantId)
   .sort((a,b)=>(Date.parse(b.updatedAt||b.createdAt)||0)-(Date.parse(a.updatedAt||a.createdAt)||0))[0];
  if(!latest){setNoPublished(true);return;}
  setActiveAssessmentId(latest.id);
  router.replace(viewerPath(latest.id));
 },[router]);
 if(role==="admin")return <CreatorAssessments/>;
 if(role==="learner"&&noPublished)return <PortalShell footer><div className="portalScreen"><div className="portalPageHeading"><h1>No assessment available</h1><p>Your institute has not published an assessment yet.</p></div></div></PortalShell>;
 return null;
}
