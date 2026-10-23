"use client";
import {useEffect} from "react";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import {getAssessment} from "@/modules/assessments/storage/assessment-storage";
import {useRouter,useParams} from "next/navigation";
import {setActiveAssessmentId,viewerPath} from "@/modules/assessments/storage/assessment-storage";
export default function Preview(){const {assessmentId}=useParams<{assessmentId:string}>();const router=useRouter();useEffect(()=>{const session=getDemoSession(),record=getAssessment(assessmentId);if(!session){router.replace("/login");return;}if(session.role!=="admin" || !record || (record.tenantId||"north")!==session.tenantId){router.replace(session.role==="admin"?"/assessments":"/learner");return;}setActiveAssessmentId(assessmentId);router.replace(viewerPath(assessmentId)+"?preview=true");},[assessmentId,router]);return null;}
