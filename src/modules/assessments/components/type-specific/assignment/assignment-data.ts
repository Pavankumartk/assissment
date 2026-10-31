import { assessmentStorage } from "@/modules/assessments/storage/assessment-storage";

export type StoredFile = { name: string; type: string; size: number; dataUrl: string };
export type AssignmentDetails = {
  name:string; course:string; language:string; module:string; tags:string[]; description:string; descriptionHtml:string;
  showDescription:boolean; instructions:string; instructionsHtml:string; files:StoredFile[];
  availableEnabled:boolean; availableDate:string; availableTime:string;
  dueEnabled:boolean; dueDate:string; dueTime:string;
  cutoffEnabled:boolean; cutoffDate:string; cutoffTime:string;
  gradeReminderEnabled:boolean; gradeDate:string; gradeTime:string;
  attempts:number; cooldown:string; additionalAttempts:string; assignmentId:string;
  restrictAccess:string; extraTime:string;
  showOnCourse:boolean; notifyOnPublish:boolean; completionMode:string;
  mustSubmitToComplete:boolean; mustGradeToComplete:boolean;
  audience:string; batch:string; academicYear:string; department:string; program:string; section:string;
  excludedLearners:string[];
};
export type AssignmentContent = {
  questionDocument:StoredFile|null; onlineText:boolean; fileSubmissions:boolean;
  wordLimit:number; maxFiles:number; maxFileSize:number; acceptedTypes:string;
  feedbackComments:boolean; annotatePdf:boolean; feedbackFiles:boolean; offlineWorksheet:boolean; inlineComment:boolean;
  requireSubmit:boolean; requireStatement:boolean; groupSubmission:boolean; groupMembersSubmit:boolean;
  notifyGraders:boolean; notifyLate:boolean; notifyStudents:boolean;
};
export type Criterion={id:string;title:string;description:string;marks:number};
export type AssignmentEvaluation={
  gradeType:string; maxGrade:number; category:string; passGrade:number; method:string;
  anonymous:boolean; hideGrader:boolean; markingWorkflow:boolean; markingAllocation:boolean;
  rubricTemplate:string; rubricName:string; rubricVersion:string; criteria:Criterion[];
  entryMode:string; finalGradeUsers:string; resultsVisibility:string; lateSubmission:string; latePenalty:number;
  directMarks:boolean; partialMarks:boolean; criterionComments:boolean; questionComments:boolean;
  annotatedFeedback:boolean; resubmission:boolean; lockRubric:boolean; auditTrail:boolean; preventChanges:boolean;
  previewRubric:boolean; hideScores:boolean; gradingNotes:string;
};

export const DETAILS_KEY="assignmentDetailsDraft";
export const CONTENT_KEY="assignmentContentDraft";
export const EVALUATION_KEY="assignmentEvaluationDraft";

export const defaultDetails:AssignmentDetails={
  name:"",course:"",language:"English",module:"",tags:[],description:"",descriptionHtml:"",showDescription:true,
  instructions:"",instructionsHtml:"",files:[], availableEnabled:false,availableDate:"",availableTime:"09:00",
  dueEnabled:false,dueDate:"",dueTime:"23:59",cutoffEnabled:false,cutoffDate:"",cutoffTime:"23:59",
  gradeReminderEnabled:false,gradeDate:"",gradeTime:"09:00",attempts:2,cooldown:"12 Hrs",
  additionalAttempts:"Manually",assignmentId:"",restrictAccess:"None",extraTime:"",
  showOnCourse:true,notifyOnPublish:true,completionMode:"Complete when conditions met",
  mustSubmitToComplete:true,mustGradeToComplete:true,audience:"All enrolled learners",batch:"",academicYear:"",
  department:"",program:"",section:"",excludedLearners:[],
};
export const defaultContent:AssignmentContent={
  questionDocument:null,onlineText:true,fileSubmissions:true,wordLimit:500,maxFiles:3,maxFileSize:10,
  acceptedTypes:"PDF, DOC, DOCX, JPG, PNG",feedbackComments:true,annotatePdf:true,feedbackFiles:true,
  offlineWorksheet:false,inlineComment:false,requireSubmit:true,requireStatement:true,
  groupSubmission:false,groupMembersSubmit:false,notifyGraders:true,notifyLate:true,notifyStudents:true,
};
export const defaultCriteria:Criterion[]=[
  {id:"understanding",title:"Understanding of Assignment",description:"Understands the questions and instructions.",marks:10},
  {id:"accuracy",title:"Content Accuracy & Relevance",description:"Gives correct and relevant answers.",marks:25},
  {id:"complete",title:"Completeness of Submission",description:"Answers all questions and tasks.",marks:15},
  {id:"analysis",title:"Critical Thinking & Analysis",description:"Thinks logically and explains why.",marks:15},
  {id:"practice",title:"Practical Application & Examples",description:"Uses concepts with examples or solutions.",marks:10},
  {id:"original",title:"Originality & Academic Integrity",description:"Works independently and credits sources.",marks:10},
  {id:"structure",title:"Structure & Organization",description:"Organizes answers clearly.",marks:5},
  {id:"references",title:"References & Supporting Evidence",description:"Provides sources and proof where needed.",marks:5},
  {id:"clarity",title:"Clarity & Presentation",description:"Uses clear language and correct terms.",marks:5},
];
export const defaultEvaluation:AssignmentEvaluation={
  gradeType:"Point",maxGrade:100,category:"Assignment",passGrade:50,method:"Rubric",
  anonymous:false,hideGrader:false,markingWorkflow:false,markingAllocation:false,
  rubricTemplate:"Default (marks)",rubricName:"Assignment evaluation rubric",rubricVersion:"v1.0",
  criteria:defaultCriteria,entryMode:"Direct marks per criterion",finalGradeUsers:"Latest attempt",resultsVisibility:"On publication",
  lateSubmission:"Apply configured penalty",latePenalty:0,directMarks:true,partialMarks:true,
  criterionComments:true,questionComments:true,annotatedFeedback:true,resubmission:false,
  lockRubric:true,auditTrail:true,preventChanges:true,previewRubric:true,hideScores:false,gradingNotes:"",
};
export function readAssignment<T extends object>(key:string,base:T):T{
  try{const raw=assessmentStorage.getItem(key);if(!raw)return {...base};
    const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return {...base};
    return {...base,...parsed};
  }catch{return {...base};}
}
export function saveAssignment(key:string,value:unknown){assessmentStorage.setItem(key,JSON.stringify(value));}
export async function asStoredFile(file:File,maxMB=2):Promise<StoredFile>{
  if(file.size>maxMB*1024*1024)throw new Error(`File must be ${maxMB} MB or smaller.`);
  return new Promise((resolve,reject)=>{const reader=new FileReader();
    reader.onload=()=>resolve({name:file.name,type:file.type,size:file.size,dataUrl:String(reader.result||"")});
    reader.onerror=()=>reject(new Error("Could not read this file."));reader.readAsDataURL(file);
  });
}
export function validateDetails(d:AssignmentDetails):string[]{
 const errors:string[]=[];
 if(!d.name.trim())errors.push("Assessment Name is required.");
 if(!d.course.trim())errors.push("Course is required.");
 if(!d.description.trim())errors.push("Description is required.");
 if(!d.instructions.trim())errors.push("Activity Instructions are required.");
 if(d.attempts<1||!Number.isInteger(d.attempts))errors.push("Number of attempts must be at least 1.");
 for(const [enabled,date,label] of [[d.availableEnabled,d.availableDate,"Available from"],[d.dueEnabled,d.dueDate,"Due date"],[d.cutoffEnabled,d.cutoffDate,"Cut-off date"],[d.gradeReminderEnabled,d.gradeDate,"Grade reminder"]] as const){
   if(enabled&&!date)errors.push(`${label} requires a date.`);
 }
 const start=d.availableEnabled&&d.availableDate?`${d.availableDate}T${d.availableTime}`:"";
 const due=d.dueEnabled&&d.dueDate?`${d.dueDate}T${d.dueTime}`:"";
 const cutoff=d.cutoffEnabled&&d.cutoffDate?`${d.cutoffDate}T${d.cutoffTime}`:"";
 if(start&&due&&new Date(due)<=new Date(start))errors.push("Due date must be after Available from.");
 if(due&&cutoff&&new Date(cutoff)<new Date(due))errors.push("Cut-off date must not be earlier than the due date.");
 return errors;
}
export function validateContent(c:AssignmentContent):string[]{
 const errors:string[]=[];
 if(!c.questionDocument)errors.push("Upload a Question document to continue.");
 if(!c.onlineText&&!c.fileSubmissions)errors.push("Enable at least one submission type.");
 if(c.onlineText&&(!Number.isInteger(c.wordLimit)||c.wordLimit<1))errors.push("Word limit must be at least 1.");
 if(c.fileSubmissions&&(!Number.isInteger(c.maxFiles)||c.maxFiles<1))errors.push("Maximum uploaded files must be at least 1.");
 if(c.fileSubmissions&&(!Number.isFinite(c.maxFileSize)||c.maxFileSize<=0))errors.push("Maximum submission size must be greater than zero.");
 if(c.fileSubmissions&&!c.acceptedTypes.trim())errors.push("Accepted file types cannot be empty.");
 return errors;
}
export function validateEvaluation(e:AssignmentEvaluation):string[]{
 const errors:string[]=[];
 if(!Number.isFinite(e.maxGrade)||e.maxGrade<=0)errors.push("Maximum grade must be greater than zero.");
 if(e.passGrade<0||e.passGrade>e.maxGrade)errors.push("Grade to pass must be within Maximum Grade.");
 if(e.method==="Rubric"){
  if(!e.rubricName.trim())errors.push("Rubric name is required.");
  if(!e.criteria.length)errors.push("Add at least one rubric criterion.");
  if(e.criteria.some(c=>!c.title.trim()||!c.description.trim()))errors.push("Each criterion requires a name and description.");
  if(e.criteria.some(c=>!Number.isFinite(c.marks)||c.marks<=0))errors.push("Each rubric criterion must have positive marks.");
  const total=e.criteria.reduce((n,c)=>n+c.marks,0);
  if(Math.abs(total-e.maxGrade)>0.0001)errors.push(`Rubric total (${total}) must equal Maximum Grade (${e.maxGrade}).`);
 }
 return errors;
}
