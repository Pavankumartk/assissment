/** MCQ creation validation; shared by Save & Continue and Publish. */
export type ValidationResult = { ok:true } | {ok:false;message:string;section?:number;question?:number};
export function validateMcqDetails(form:Record<string,unknown>):ValidationResult{
 const title=String(form.assessmentName||form.assessmentTitle||"").trim();
 if(!title)return {ok:false,message:"Assessment Name is required. Please choose or enter a name.",section:0};
 if(!String(form.course||"").trim())return {ok:false,message:"Please select a course.",section:0};
 const total=Number(form.totalMarks??20), count=Number(form.questionCount??20), marks=Number(form.marksPerQuestion??1);
 if(!Number.isFinite(total)||total<=0)return {ok:false,message:"Total Marks must be greater than zero.",section:1};
 if(!Number.isSafeInteger(count)||count<1||count>500)return {ok:false,message:"Number of Questions must be a whole number from 1 to 500.",section:1};
 if(!Number.isFinite(marks)||marks<=0)return {ok:false,message:"Marks per Question must be greater than zero.",section:1};
 if(form.passingMarks!==undefined&&String(form.passingMarks).trim()!==""){
  const passing=Number(form.passingMarks);if(!Number.isFinite(passing)||passing<0||passing>total)return {ok:false,message:"Passing Marks must be between 0 and Total Marks.",section:1};
 }
 if(form.attempts!==undefined&&(!Number.isSafeInteger(Number(form.attempts))||Number(form.attempts)<1))return {ok:false,message:"Allowed Attempts must be a positive whole number.",section:3};
 const start=String(form.availableFromDate||""),end=String(form.availableUntilDate||"");
 if(start&&end){const startMs=Date.parse(`${start}T${String(form.availableFromTime||"00:00")}`);const endMs=Date.parse(`${end}T${String(form.availableUntilTime||"23:59")}`);
  if(Number.isFinite(startMs)&&Number.isFinite(endMs)&&endMs<=startMs)return {ok:false,message:"Available Until must be later than Available From.",section:2};}
 return {ok:true};
}
export type McqQuestionInput={text?:string;options?:string[];correct?:number;points?:string|number;category?:string;bloom?:string};
export function validateMcqQuestions(questions:McqQuestionInput[], count:number, totalMarks?:number):ValidationResult{
 if(!Number.isSafeInteger(count)||count<1)return {ok:false,message:"Configure a valid question count in Details first."};
 if(questions.length<count)return {ok:false,message:`Please complete all ${count} questions before continuing.`,question:Math.max(0,questions.length)};
 let sum=0;
 for(let index=0;index<count;index++){
  const q=questions[index],prefix=`Question ${index+1}: `;
  if(!q?.text?.trim())return {ok:false,message:prefix+"enter the question text.",question:index};
  const valid=(q.options||[]).map(v=>String(v||"").trim());
  if(valid.filter(Boolean).length<2)return {ok:false,message:prefix+"enter at least two answer options.",question:index};
  if(!Number.isInteger(q.correct)||q.correct!>=valid.length||q.correct!<0||!valid[q.correct!])return {ok:false,message:prefix+"select a correct answer.",question:index};
  const points=Number(q.points);if(!Number.isFinite(points)||points<=0)return {ok:false,message:prefix+"marks must be greater than zero.",question:index};
  if(!q.category?.trim())return {ok:false,message:prefix+"select a category.",question:index};
  if(!q.bloom?.trim())return {ok:false,message:prefix+"select a Bloom’s level.",question:index};
  sum+=points;
 }
 if(totalMarks!==undefined && Number.isFinite(totalMarks)&&Math.abs(sum-totalMarks)>.001)return {ok:false,message:`Question marks total ${sum}, but Total Marks is ${totalMarks}. Update the marks to match.`};
 return {ok:true};
}
