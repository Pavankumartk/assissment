"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import PortalShell from "@/modules/assessments/components/common/PortalShell";
import LearnerAssessmentBrowser from "@/modules/assessments/components/learner/LearnerAssessmentBrowser";

export default function AssessmentListPage(){
 const router=useRouter();
 const [isLearner,setIsLearner]=useState(false);
 useEffect(()=>{
  const session=getDemoSession();
  if(!session){router.replace("/login");return;}
  if(session.role!=="learner"){router.replace("/assessments");return;}
  setIsLearner(true);
 },[router]);
 return isLearner?<PortalShell><LearnerAssessmentBrowser/></PortalShell>:null;
}
