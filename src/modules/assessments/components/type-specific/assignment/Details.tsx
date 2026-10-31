"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getActiveAssessmentId,updateAssessment} from "@/modules/assessments/storage/assessment-storage";
import {ActionFooter,AssignmentShell,DateTimeRow,Field,FileDrop,Notice,Panel,RichTextField,Toggle} from "./AssignmentUI";
import {asStoredFile,defaultDetails,DETAILS_KEY,readAssignment,saveAssignment,validateDetails,type AssignmentDetails} from "./assignment-data";

export default function AssignmentDetailsStep(){
 const router=useRouter();const [data,setData]=useState<AssignmentDetails>(defaultDetails);
 const [ready,setReady]=useState(false);const [errors,setErrors]=useState<string[]>([]);const [message,setMessage]=useState("");
 useEffect(()=>{setData(readAssignment(DETAILS_KEY,defaultDetails));setReady(true);},[]);
 useEffect(()=>{if(ready){try{saveAssignment(DETAILS_KEY,data);}catch{setMessage("Unable to persist this draft. Check browser storage.");}}},[ready,data]);
 const set=<K extends keyof AssignmentDetails>(key:K,value:AssignmentDetails[K])=>{setData(d=>({...d,[key]:value}));setErrors([]);setMessage("");};
 const persist=()=>{try{
  saveAssignment(DETAILS_KEY,data);
  saveAssignment("mcqAssessmentDraft",{
   assessmentTitle:data.name,assessmentName:data.name,title:data.name,assessmentType:"Assignment",typeCode:"assignment",
   course:data.course,courseName:data.course,language:data.language,module:data.module,description:data.description,
   instructions:data.instructions,questionCount:1,totalMarks:100,marks:100,
   availableFrom:data.availableEnabled?`${data.availableDate}T${data.availableTime}`:null,
   dueDate:data.dueEnabled?`${data.dueDate}T${data.dueTime}`:null,
   tags:data.tags,
  });
  if(getActiveAssessmentId())updateAssessment({title:data.name,course:data.course,questions:1,marks:100});
  setMessage("Assignment details saved.");return true;
 }catch{setErrors(["Could not save the draft. Reduce attached file sizes or check browser storage."]);return false;}};
 const proceed=()=>{const found=validateDetails(data);setErrors(found);if(found.length){window.scrollTo({top:0,behavior:"smooth"});return;}if(persist())router.push("/assessments/create/content");};
 const addFiles=async(files:File[])=>{try{const out=await Promise.all(files.map(f=>asStoredFile(f,2)));if(out.length+data.files.length>5)throw new Error("Maximum 5 additional files are allowed.");set("files",[...data.files,...out]);}catch(e){setErrors([e instanceof Error?e.message:"File upload failed."]);}};
 return <AssignmentShell step="details"><Notice errors={errors} message={message}/>
 <Panel title="Basic Information" icon="assignments.svg"><div className="asgn-fields-grid asgn-grid-two">
  <Field label="Assessment Name"><input value={data.name} onChange={e=>set("name",e.target.value)} placeholder="Data Structures – Stack Implementation" required/></Field>
  <Field label="Assessment Type"><input value="Assignment" disabled readOnly/></Field>
  <Field label="Course"><input value={data.course} onChange={e=>set("course",e.target.value)} placeholder="Select or enter course" required/></Field>
  <Field label="Language"><select value={data.language} onChange={e=>set("language",e.target.value)}><option>English</option><option>Hindi</option><option>Kannada</option><option>Tamil</option><option>Telugu</option></select></Field>
  <Field label="Module / Unit"><input value={data.module} placeholder="Module 3 – AI Fundamentals" onChange={e=>set("module",e.target.value)}/></Field>
  <Field label="Category / Tags"><input value={data.tags.join(", ")} placeholder="Data structure, stack" onChange={e=>set("tags",e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}/></Field>
 </div><RichTextField label="Description" value={data.description} html={data.descriptionHtml} onChange={v=>set("description",v)} onHtmlChange={v=>set("descriptionHtml",v)} placeholder="Describe the assignment and required deliverables..."/>
 <Toggle label="Display description on course page" value={data.showDescription} onChange={v=>set("showDescription",v)}/>
 <RichTextField label="Activity Instructions" value={data.instructions} html={data.instructionsHtml} onChange={v=>set("instructions",v)} onHtmlChange={v=>set("instructionsHtml",v)} placeholder="Follow the PDF template provided."/>
 <FileDrop label="Additional Files" files={data.files} multiple onPick={addFiles}/>
 {data.files.length>0&&<button className="asgn-text-button" type="button" onClick={()=>set("files",[])}>Remove additional files</button>}</Panel>
 <Panel title="Timing & Availability" icon="calendar-01.svg"><div className="asgn-fields-grid asgn-grid-two asgn-datetime-grid">
 <DateTimeRow label="Available from" enabled={data.availableEnabled} onEnabled={v=>set("availableEnabled",v)} date={data.availableDate} onDate={v=>set("availableDate",v)} time={data.availableTime} onTime={v=>set("availableTime",v)}/>
 <DateTimeRow label="Due date" enabled={data.dueEnabled} onEnabled={v=>set("dueEnabled",v)} date={data.dueDate} onDate={v=>set("dueDate",v)} time={data.dueTime} onTime={v=>set("dueTime",v)}/>
 <DateTimeRow label="Cut-off date" enabled={data.cutoffEnabled} onEnabled={v=>set("cutoffEnabled",v)} date={data.cutoffDate} onDate={v=>set("cutoffDate",v)} time={data.cutoffTime} onTime={v=>set("cutoffTime",v)}/>
 <DateTimeRow label="Remind me to grade by" enabled={data.gradeReminderEnabled} onEnabled={v=>set("gradeReminderEnabled",v)} date={data.gradeDate} onDate={v=>set("gradeDate",v)} time={data.gradeTime} onTime={v=>set("gradeTime",v)}/>
 </div></Panel>
 <Panel title="Attempts & Access" icon="settings-02.svg"><div className="asgn-fields-grid asgn-grid-three">
  <Field label="Number of Attempts"><input type="number" min={1} value={data.attempts} onChange={e=>set("attempts",Number(e.target.value))}/></Field>
  <Field label="Attempt Cooldown"><select value={data.cooldown} onChange={e=>set("cooldown",e.target.value)}>{["None","1 Hr","6 Hrs","12 Hrs","24 Hrs"].map(x=><option key={x}>{x}</option>)}</select></Field>
  <Field label="Additional Attempts"><select value={data.additionalAttempts} onChange={e=>set("additionalAttempts",e.target.value)}><option>Manually</option><option>Automatically</option><option>Not allowed</option></select></Field>
  <Field label="Assignment ID"><input placeholder="A7X9-KP42" value={data.assignmentId} onChange={e=>set("assignmentId",e.target.value)}/></Field>
  <Field label="Restrict Access"><select value={data.restrictAccess} onChange={e=>set("restrictAccess",e.target.value)}><option>None</option><option>Enrolled learners</option><option>Selected cohort</option></select></Field>
  <Field label="Extra Time / Accommodations"><input value={data.extraTime} onChange={e=>set("extraTime",e.target.value)} placeholder="e.g. +25% extra time"/></Field>
 </div></Panel>
 <Panel title="Common Module Settings" icon="settings-02.svg"><Toggle label="Show on course page" value={data.showOnCourse} onChange={v=>set("showOnCourse",v)}/><Field label="Activity Completion"><select value={data.completionMode} onChange={e=>set("completionMode",e.target.value)}><option>Complete when conditions met</option><option>Mark complete manually</option></select></Field>
 <Toggle label="Notify learners when published" value={data.notifyOnPublish} onChange={v=>set("notifyOnPublish",v)}/>
 <Toggle label="Student must submit to complete" value={data.mustSubmitToComplete} onChange={v=>set("mustSubmitToComplete",v)}/><Toggle label="Student must receive a grade to complete" value={data.mustGradeToComplete} onChange={v=>set("mustGradeToComplete",v)}/></Panel>
 <Panel title="Audience" icon="user-multiple-02.svg"><div className="asgn-fields-grid asgn-grid-two">
  <Field label="Who can take this assessment?"><select value={data.audience} onChange={e=>set("audience",e.target.value)}><option>All enrolled learners</option><option>Selected learners</option><option>Selected cohort</option></select></Field>
  <Field label="Batch / Cohort"><input value={data.batch} onChange={e=>set("batch",e.target.value)} placeholder="2026 — Batch A"/></Field>
  <Field label="Academic Year"><input value={data.academicYear} onChange={e=>set("academicYear",e.target.value)} placeholder="2026–2027"/></Field>
  <Field label="Department"><input value={data.department} onChange={e=>set("department",e.target.value)} placeholder="Computer Science"/></Field>
  <Field label="Program"><input value={data.program} onChange={e=>set("program",e.target.value)} placeholder="B.Tech Computer Science"/></Field>
  <Field label="Section / Class"><input value={data.section} onChange={e=>set("section",e.target.value)} placeholder="Section A"/></Field>
  <Field label="Excluded Learners" help="Enter learner IDs separated by commas."><input value={data.excludedLearners.join(", ")} onChange={e=>set("excludedLearners",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))} placeholder="Add learners"/></Field>
 </div></Panel>
 <ActionFooter onBack={()=>router.push("/assessments/create")} onSave={persist} onContinue={proceed}/></AssignmentShell>;
}
