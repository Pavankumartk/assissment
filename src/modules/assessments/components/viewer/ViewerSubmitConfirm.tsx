"use client";
import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
/** Same confirmation popup used by the original MCQ Viewer; dialog is portalled above scrolling panels. */
export default function ViewerSubmitConfirm({answered,remaining,flagged,onBack,onSubmit}:{answered:number;remaining:number;flagged:number;onBack:()=>void;onSubmit:()=>void}) {
 const [mounted,setMounted]=useState(false);
 useEffect(()=>setMounted(true),[]);
 if(!mounted)return null;
 return createPortal(<div className="viewerSubmitOverlay" role="presentation">
   <section className="viewerSubmitDialog" role="dialog" aria-modal="true" aria-labelledby="viewerSubmitTitle" aria-describedby="viewerSubmitDescription">
    <div className="viewerSubmitNotice">
     <span className="viewerSubmitIcon"><img src="/assets/viewericons/alert.svg" alt="" width={24} height={24}/></span>
     <div className="viewerSubmitNoticeText"><h2 id="viewerSubmitTitle">Confirm Submission</h2><p className="viewerSubmitQuestion">Are You Sure You Want to Submit the Assessment ?</p>
      <p id="viewerSubmitDescription" className="viewerSubmitDescription">You have {answered} answered, {remaining} unanswered and {flagged} marked for review. Once submitted, You cannot change your answers</p>
     </div>
    </div>
    <div className="viewerSubmitActions"><button type="button" className="viewerSubmitBack" onClick={onBack}><img src="/assets/viewericons/arrowleft.svg" alt="" width={20} height={20}/>Go Back</button>
     <button type="button" className="viewerSubmitConfirm" onClick={onSubmit}>Submit Answers<img src="/assets/viewericons/arrowrightg.svg" alt="" width={20} height={20}/></button></div>
   </section>
  </div>,document.querySelector(".viewerAppShell")||document.body);
}
