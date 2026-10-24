"use client";
import {resultPath} from "@/modules/assessments/storage/assessment-storage";
import {demoDashboardPath} from "@/modules/assessments/auth/demo-auth";
import {useRouter} from "next/navigation";
import type {ReleasePolicy} from "@/modules/assessments/components/viewer/result-release";

const ICONS="/assets/viewericons/";
/** MCQ submission confirmation and success markup/classes are deliberately reused unchanged. */
export default function ViewerDialogs({confirmOpen,successOpen,onGoBack,onConfirm,onClose,answered,remaining,flagged,title,earnedMarks,totalMarks,passingScore,release}:{
 confirmOpen:boolean;successOpen:boolean;onGoBack:()=>void;onConfirm:()=>void;onClose:()=>void;
 answered:number;remaining:number;flagged:number;title:string;earnedMarks:number;totalMarks:number;passingScore:number;release:ReleasePolicy;
}){
 const router=useRouter();
 return <>
  {confirmOpen&&<div className="viewerSubmitOverlay" role="presentation"><section className="viewerSubmitDialog" role="dialog" aria-modal="true" aria-labelledby="viewerSubmitTitle" aria-describedby="viewerSubmitDescription">
    <div className="viewerSubmitNotice"><span className="viewerSubmitIcon"><img src="/assets/viewericons/alert.svg" alt="" width={24} height={24}/></span><div className="viewerSubmitNoticeText">
      <h2 id="viewerSubmitTitle">Confirm Submission</h2><p className="viewerSubmitQuestion">Are You Sure You Want to Submit the Assessment ?</p><p id="viewerSubmitDescription" className="viewerSubmitDescription">You have {answered} answered, {remaining} unanswered and {flagged} marked for review.<br/>Once submitted, You cannot change your answers</p>
    </div></div>
    <div className="viewerSubmitActions"><button type="button" className="viewerSubmitBack" onClick={onGoBack}><img src="/assets/viewericons/arrowleft.svg" alt="" width={20} height={20}/>Go Back</button><button type="button" className="viewerSubmitConfirm" onClick={onConfirm}>Submit Answers<img src="/assets/viewericons/arrowrightg.svg" alt="" width={20} height={20}/></button></div>
  </section></div>}
  {successOpen&&<div className="viewerSuccessOverlay" role="presentation"><section className={`viewerSuccessDialog viewerSuccessDialog--${release.mode}`} role="dialog" aria-modal="true" aria-labelledby="viewerSuccessTitle">
    <button type="button" className="viewerSuccessClose" aria-label="Close" onClick={onClose}><img src={`${ICONS}multiplication-sign-square.svg`} alt="" width={16} height={16}/></button>
    <div className="viewerSuccessArt"><img src={`${ICONS}blast.png`} alt="" aria-hidden="true"/><img className="viewerSuccessCheck" src={`${ICONS}checkmark-circle.svg`} alt=""/></div>
    <h2 id="viewerSuccessTitle">Assessment Submitted</h2><h3>{title}</h3>
    {release.mode==="immediate"?<><p>Your assessment has been submitted. Your result is available now.</p><div className="viewerSuccessStats">
      <div><img className="viewerSuccessStatIcon" src={`${ICONS}award.svg`} alt=""/><span>Score<strong>{totalMarks>0?Math.round(earnedMarks/totalMarks*100):0}%</strong></span></div>
      <div><img className="viewerSuccessStatIcon" src={`${ICONS}checkmark-badge.svg`} alt=""/><span>Result<strong>{earnedMarks>=totalMarks*passingScore/100?"Passed":"Failed"}</strong></span></div>
    </div></>:<><p>{release.message}</p><div className={`viewerSuccessReleaseCard viewerSuccessReleaseCard--${release.mode}`}><img src={`${ICONS}${release.mode==="scheduled"?"calendar.svg":release.mode==="manual"?"user.svg":"eye-off.svg"}`} width={40} height={40} alt="" onError={event=>{event.currentTarget.style.visibility="hidden";}}/><span className="viewerSuccessReleaseInfo"><strong>{release.mode==="scheduled"?"Result Available":"Status"}</strong><small>{release.mode==="scheduled"?release.releaseDateLabel:release.mode==="manual"?"Awaiting result Release":"Submitted"}</small></span></div></>}
    <div className="viewerSuccessActions"><button type="button" onClick={()=>router.push(demoDashboardPath())}>Back to Dashboard</button>{release.mode!=="never"&&<button type="button" disabled={release.mode!=="immediate"} onClick={()=>router.push(resultPath())}>View Result</button>}</div>
  </section></div>}
 </>;
}
