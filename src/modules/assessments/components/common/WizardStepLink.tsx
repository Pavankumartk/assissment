"use client";
import {useRouter} from "next/navigation";
import "./wizard-navigation.css";
const PATHS=["/assessments/create","/assessments/create/details","/assessments/create/content","/assessments/create/evaluation","/assessments/create/review"];
/** Place inside an existing styled <li>: overlay preserves the Figma shapes and spacing. */
export default function WizardStepLink({index,current}:{index:number;current:number}){
 const router=useRouter();
 // Only previous, already-completed steps can be clicked; never skip ahead.
 return index < current ? <button type="button" className="assessment-wizard-step-hit" onClick={()=>router.push(PATHS[index])} aria-label={`Go back to completed step ${["Type","Details","Content","Evaluation","Review"][index]}`} title="Completed step — open"/> : null;
}
