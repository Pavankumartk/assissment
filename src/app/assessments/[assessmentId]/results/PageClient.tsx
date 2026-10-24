"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { setActiveAssessmentId } from "@/modules/assessments/storage/assessment-storage";
import Screen from "@/modules/assessments/components/viewer/ResultViewer/ResultViewer";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import {getAssessment} from "@/modules/assessments/storage/assessment-storage";
import {useRouter} from "next/navigation";
export default function Page() {
 const params = useParams<{assessmentId:string}>();
 const [ready,setReady] = useState(false);const router=useRouter();
 useEffect(() => {const session=getDemoSession(),record=getAssessment(params.assessmentId);if(!session){router.replace("/login");return;}if(!record||(record.tenantId||"north")!==session.tenantId || session.role!=="learner"){router.replace(session.role==="admin"?"/assessments":"/learner");return;}setActiveAssessmentId(params.assessmentId);setReady(true);},[params.assessmentId,router]);
 const type=ready?getAssessment(params.assessmentId)?.typeCode:null;
 return ready ? type==="fill-in-the-blanks"?<Screen source="fill-in-the-blanks"/>:type==="true-false"?<Screen source="true-false"/>:<Screen/> : null;
}
