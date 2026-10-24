/** Map the saved Fill-in-the-Blanks answers to the existing MCQ result page's data contract.
 * Keep the original submitted Fill result in its own storage key (never overwrite MCQ results).
 */
type FillQuestion = {text?:string;options?:string[];blankCorrect?:number[];points?:number;hint?:string;bloom?:string};
type FillResult = {
 title?:string;questions?:FillQuestion[];answers?:Record<number,number[]>;
 total?:number;totalMarks?:number;score?:number;answered?:number;flagged?:number[];
 usedSeconds?:number;totalSeconds?:number;submittedAt?:string;
};
export function asMCQResult(raw:unknown){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const data=raw as FillResult;
 const questions=Array.isArray(data.questions)?data.questions:[];
 const responses=data.answers??{};
 const mapped=questions.map((q,index)=>{
  const expected=Array.isArray(q.blankCorrect)?q.blankCorrect:[];
  const selected=responses[index]??[];
  const filled=expected.length>0&&expected.every((_,blank)=>Number.isInteger(selected[blank])&&selected[blank]>=0);
  const correct=filled&&expected.every((answer,blank)=>selected[blank]===answer);
  const options=Array.isArray(q.options)?q.options:[];
  const answers=expected.map((_,blank)=>`Blank ${blank+1}: ${options[selected[blank]]??"Unanswered"}`).join(" • ");
  const key=expected.map((answer,blank)=>`Blank ${blank+1}: ${options[answer]??"—"}`).join(" • ");
  const points=Number(q.points)||1;
  return {
   text:String(q.text||""),options:[],correct:expected[0]??-1,selected:filled?(selected[0]??null):null,
   gradingStatus:correct?"correct" as const:filled?"incorrect" as const:"unanswered" as const,
   answerText:answers,expectedAnswer:key,questionType:"fill-in-the-blanks" as const,points,
   hint:q.hint||"",bloom:q.bloom||"",topic:q.bloom||"General",flagged:Array.isArray(data.flagged)&&data.flagged.includes(index)
  };
 });
 const totalQuestions=mapped.length;
 const correctAnswers=mapped.filter(q=>q.gradingStatus==="correct").length;
 const incorrectAnswers=mapped.filter(q=>q.gradingStatus==="incorrect").length;
 const unanswered=mapped.filter(q=>q.gradingStatus==="unanswered").length;
 const totalMarks=Number(data.totalMarks)||mapped.reduce((sum,q)=>sum+q.points,0);
 const earnedMarks=Number(data.score)||0;
 return {
  assessmentType:"fill-in-the-blanks" as const, title:data.title||"Fill in the Blanks",questions:mapped,
  totalQuestions,correctAnswers,incorrectAnswers,unanswered,totalMarks,earnedMarks,
  scorePercent:totalMarks>0?Math.round(earnedMarks/totalMarks*100):0,
  usedSeconds:Number(data.usedSeconds)||0,
  totalSeconds:Math.max(60,Number(data.totalSeconds)||Number(data.usedSeconds)||60),
  flaggedQuestionIndexes:Array.isArray(data.flagged)?data.flagged:[],
  retryAttemptsUsed:1,retryAttemptsAllowed:2,retryDurationMinutes:15
 };
}
