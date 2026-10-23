"use client";

import {useEffect} from "react";
import {useRouter,useParams} from "next/navigation";
import {setActiveAssessmentId,resultPath} from "@/modules/assessments/storage/assessment-storage";
export default function Attempts(){const {assessmentId}=useParams<{assessmentId:string}>();const router=useRouter();useEffect(()=>{setActiveAssessmentId(assessmentId);router.replace(resultPath(assessmentId));},[assessmentId,router]);return null;}
