"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getDemoSession,type DemoRole} from "@/modules/assessments/auth/demo-auth";
import PortalShell from "@/modules/assessments/components/common/PortalShell";
import CreatorAssessments from "@/modules/assessments/components/common/AssessmentDashboard/AssessmentDashboard";
import PortalDashboard from "@/modules/assessments/components/common/PortalDashboard";

export default function Page(){
 const router=useRouter();
 const [role,setRole]=useState<DemoRole|null>(null);
 useEffect(()=>{
  const session=getDemoSession();
  if(!session){router.replace("/login");return;}
  setRole(session.role);
 },[router]);
 if(role==="admin")return <CreatorAssessments/>;
 if(role==="learner")return <PortalShell><PortalDashboard assessmentLanding/></PortalShell>;
 return null;
}
