"use client";
import {useEffect,useState} from "react";
import {getAssessments,type StoredAssessment} from "../storage/assessment-storage";
export function useAssessments(){
 const [assessments,setAssessments]=useState<StoredAssessment[]>([]);
 useEffect(()=>{
  const refresh=()=>setAssessments(getAssessments());
  refresh();window.addEventListener("storage",refresh);window.addEventListener("neurolxp-assessments-changed",refresh);
  return ()=>{window.removeEventListener("storage",refresh);window.removeEventListener("neurolxp-assessments-changed",refresh);};
 },[]);
 return assessments;
}
