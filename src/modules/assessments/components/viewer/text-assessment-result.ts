/** Shared submission adapter for text-response assessment types (frontend/localStorage only). */
export type TextMode = "short-answer" | "one-word";
export type TextQuestion = {type:string;text:string;options:string[];correct:number;bloom:string;hint:string;allowHint:boolean;points:number;expectedAnswer?:string;explanation?:string};
export type TextMark = "correct" | "incorrect" | "pending" | "unanswered";
export const normalizeResponse = (value:string) => value.toLocaleLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
export function textMark(mode:TextMode, response:string, expected:string, wasChecked=false, wasCorrect=false):TextMark {
  if (!response.trim()) return "unanswered";
  if (!expected.trim()) return "pending";
  if (mode === "short-answer") {
    // Free-form answers can be valid paraphrases. Don't mark an unreviewed paraphrase wrong.
    if (wasChecked) return wasCorrect ? "correct" : "incorrect";
    return normalizeResponse(response) === normalizeResponse(expected) ? "correct" : "pending";
  }
  return normalizeResponse(response) === normalizeResponse(expected) ? "correct" : "incorrect";
}
export function makeTextResult(args:{mode:TextMode;title:string;questions:TextQuestion[];shortAnswers:Record<number,string>;checked:Record<number,boolean>;answerCorrect:Record<number,boolean>;flagged:number[];totalSeconds:number;secondsLeft:number;previousAttempts?:number;retryCount?:number}) {
 const entries = args.questions.map((q,i)=>{
   const answerText = args.shortAnswers[i]?.trim() || null;
   const expectedAnswer = q.expectedAnswer?.trim() || "";
   const gradingStatus = textMark(args.mode,answerText || "",expectedAnswer,Boolean(args.checked[i]),Boolean(args.answerCorrect[i]));
   return {text:q.text,options:[],correct:-1,selected:null,answerText,expectedAnswer,gradingStatus,questionType:args.mode,points:q.points||1,hint:q.hint,explanation:q.explanation,bloom:q.bloom,topic:q.bloom||"General",flagged:args.flagged.includes(i)};
 });
 const correctAnswers=entries.filter(q=>q.gradingStatus==="correct").length;
 const incorrectAnswers=entries.filter(q=>q.gradingStatus==="incorrect").length;
 const unanswered=entries.filter(q=>q.gradingStatus==="unanswered").length;
 const pendingCount=entries.filter(q=>q.gradingStatus==="pending").length;
 const totalMarks=entries.reduce((sum,q)=>sum+q.points,0);
 const earnedMarks=entries.reduce((sum,q)=>sum+(q.gradingStatus==="correct"?q.points:0),0);
 return {attemptId:crypto.randomUUID(),assessmentType:args.mode,title:args.title,questions:entries,totalQuestions:entries.length,
  correctAnswers,incorrectAnswers,unanswered,pendingCount,totalMarks,earnedMarks,
  scorePercent:pendingCount?null:Math.round(earnedMarks/Math.max(1,totalMarks)*100),
  totalSeconds:args.totalSeconds,usedSeconds:Math.max(0,args.totalSeconds-args.secondsLeft),
  flaggedQuestionIndexes:args.flagged,retryAttemptsUsed:args.retryCount||1,retryAttemptsAllowed:2,retryDurationMinutes:15,
  submittedAt:new Date().toISOString()};
}
