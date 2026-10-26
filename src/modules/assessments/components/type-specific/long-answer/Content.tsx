"use client";
import Link from "next/link";
import {useCallback,useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {getDemoSession} from "@/modules/assessments/auth/demo-auth";
import {assessmentStorage,updateAssessment,getActiveAssessmentId} from "@/modules/assessments/storage/assessment-storage";
import Sidebar from "@/modules/assessments/components/common/sidebar/page";
import Header from "@/modules/assessments/components/common/header/Header";
import LongAnswerPreview from "./Preview";
import Select from "./LongAnswerSelect";
import {blooms,categories,loadLongDraft,newCriterion,newId,newLevel,newLongQuestion,validLongQuestion,type LongQuestion,type RubricCriterion} from "./long-answer-data";
import "./long-answer.css";

const ICONS="/assets/assessmenticons/";
const Asset=({name,size=19}:{name:string;size?:number})=><img src={`${ICONS}${name}`} width={size} height={size} alt="" aria-hidden="true"/>;
const num=(value:unknown,fallback:number)=>{const number=Number(value);return Number.isFinite(number)&&number>0?number:fallback;};
function Toggle({value,onChange,label}:{value:boolean;onChange:(v:boolean)=>void;label:string}){return <button className={`la-toggle ${value?"is-on":""}`} type="button" role="switch" aria-checked={value} aria-label={label} onClick={()=>onChange(!value)}><span>{value?"ON":"OFF"}</span><i/></button>;}
function Collapse({title,open,onClick,children,sub}:{title:string;open:boolean;onClick:()=>void;children:React.ReactNode;sub?:string}){return <section className="la-collapse"><button type="button" className="la-collapse-head" aria-expanded={open} onClick={onClick}><span className="la-collapse-label"><span className="la-icon-round"><Asset name="editbig.svg"/></span><strong>{title}</strong></span><span className="la-collapse-end">{sub&&<small>{sub}</small>}<span className={`la-collapse-chevron ${open?"is-expanded":""}`}><Asset name="arrow-down-01.svg" size={20}/></span></span></button>{open&&<div className="la-collapse-body">{children}</div>}</section>;}
function RichField({value,onChange,placeholder="",rows=3,maxLength,id}:{value:string;onChange:(v:string)=>void;placeholder?:string;rows?:number;maxLength?:number;id:string}){
 const ref=useRef<HTMLTextAreaElement>(null);
 const [font,setFont]=useState("Segoe UI");
 const [size,setSize]=useState("16");
 const wrap=(before:string,after=before)=>{const el=ref.current;if(!el)return;const a=el.selectionStart,b=el.selectionEnd;const selected=value.slice(a,b);onChange(value.slice(0,a)+before+selected+after+value.slice(b));requestAnimationFrame(()=>{el.focus();el.setSelectionRange(a+before.length,a+before.length+selected.length);});};
 return <div className="la-rich"><div className="la-rich-toolbar"><button type="button" title="Undo" onClick={()=>{const el=ref.current;el?.focus();document.execCommand("undo");}}>↶</button><button type="button" title="Redo" onClick={()=>{const el=ref.current;el?.focus();document.execCommand("redo");}}>↷</button><Select className="la-toolbar-dropdown la-toolbar-font" ariaLabel="Font family" value={font} onChange={setFont} options={["Segoe UI","Inter"]}/><Select className="la-toolbar-dropdown la-toolbar-size" ariaLabel="Font size" value={size} onChange={setSize} options={["12","14","16","18","20"]}/><button type="button" title="Bold" onClick={()=>wrap("**")}>B</button><button type="button" title="Italic" onClick={()=>wrap("*")}>𝐼</button><button type="button" title="Underline" onClick={()=>wrap("__")}>U̲</button><button type="button" title="Bullet list" onClick={()=>wrap("\n• ","")}>≡</button><button type="button" title="Highlight" onClick={()=>wrap("==")}>A</button><button type="button" title="Link" onClick={()=>wrap("[", "](url)")}>↗</button><button type="button" title="Quote" onClick={()=>wrap("\n> ","")}>❞</button><button type="button" title="More formatting" onClick={()=>wrap("`")}>···</button></div><textarea id={id} ref={ref} style={{fontFamily:`"${font}", "Inter", sans-serif`,fontSize:`${size}px`}} rows={rows} maxLength={maxLength} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>;
}
function EditRich({label,value,onChange,placeholder,rows=3,max=250,id}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;rows?:number;max?:number;id:string}){return <div className="la-field"><label htmlFor={id}>{label} <small>{value.length}/{max}</small></label><RichField id={id} value={value} onChange={onChange} maxLength={max} rows={rows} placeholder={placeholder}/></div>;}
const settingsButtons=[{key:"rubricTotalPoints",label:"Use rubric total as question points"},{key:"rubricLearnerView",label:"Allow learners to preview the rubric"},{key:"rubricCriterionDescription",label:"Show criterion descriptions to learners"},{key:"rubricPointsVisible",label:"Show points per level to learners"},{key:"rubricGraderComments",label:"Allow grader to add comment per criterion"},{key:"rubricCriterionScore",label:"Calculate grade with a minimum score of 0"},{key:"rubricHideUntilGraded",label:"Hide level scores while grading"}] as const;
export default function LongAnswerContent(){
 const router=useRouter();
 const [questions,setQuestions]=useState<LongQuestion[]>([]);
 const [active,setActive]=useState(0);
 const [expected,setExpected]=useState(1);
 const [minutes,setMinutes]=useState("60");
 const [passing,setPassing]=useState("60");
 const [isPreview,setIsPreview]=useState(false);
 const [expanded,setExpanded]=useState<string[]>(["answer","placeholder","model","rubric","criterion-0","feedback","explanation","hint"]);
 const [tag,setTag]=useState("");
 const [welcomeName,setWelcomeName]=useState("Creator");
 const [error,setError]=useState("");
 const [loaded,setLoaded]=useState(false);
 const scrollRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const user=getDemoSession();
  if(user?.displayName?.trim())setWelcomeName(user.displayName.trim().split(/\s+/)[0]);
  try {
   const details=JSON.parse(assessmentStorage.getItem("longAnswerAssessmentDraft")||"{}") as Record<string,unknown>;
   const count=Math.max(1,Math.min(100,num(details.questionCount??assessmentStorage.getItem("longAnswerQuestionCount"),1)));
   const marks=num(details.totalMarks,count);const each=num(details.marksPerQuestion,marks/count);
   const draft=loadLongDraft(assessmentStorage.getItem("longAnswerContentDraft"));
   setExpected(count);setMinutes(String(details.duration||details.timeLimit||"60"));setPassing(String(details.passingScore||details.passingMarks||"60"));
   setQuestions(Array.from({length:count},(_,i)=>draft.questions[i]??newLongQuestion(String(each))));
   setActive(Math.max(0,Math.min(draft.active??0,count-1)));
  }catch{setQuestions([newLongQuestion()]);}
  setLoaded(true);
  // The form is a nested scroller; a previous Results/Preview position must not carry over.
  requestAnimationFrame(()=>{if(scrollRef.current)scrollRef.current.scrollTop=0;});
 },[]);
 // Always show the Content/Preview page from its heading when entering this route.
 // This affects only the Long Answer scroll pane, not other assessment pages.
 useEffect(()=>{
  if(!loaded)return;
  const pane=scrollRef.current;
  if(pane)pane.scrollTop=0;
 },[loaded,isPreview]);
 const item=questions[active]??newLongQuestion();
 const setQ=useCallback((changes:Partial<LongQuestion>)=>setQuestions(prev=>prev.map((q,i)=>i===active?{...q,...changes}:q)),[active]);
 const isOpen=(name:string)=>expanded.includes(name);
 const toggle=(name:string)=>setExpanded(old=>old.includes(name)?old.filter(v=>v!==name):[...old,name]);
 const updateCriterion=(index:number,changes:Partial<RubricCriterion>)=>setQ({criteria:item.criteria.map((c,i)=>i===index?{...c,...changes}:c)});
 const save=(enforce=true)=>{
  const count=questions.length;
  if(enforce){
   const problematic=questions.findIndex(q=>validLongQuestion(q).length>0);
   if(problematic>=0){setActive(problematic);setIsPreview(false);setError(`Question ${problematic+1}: ${validLongQuestion(questions[problematic])[0]}`);return false;}
  }
  try{
   assessmentStorage.setItem("longAnswerContentDraft",JSON.stringify({questions,active}));
   const total=questions.reduce((n,q)=>n+(Number(q.points)||0),0);
   updateAssessment({questions:count,marks:total});
   setError("");return true;
  }catch{setError("Unable to save questions to browser storage.");return false;}
 };
 // Draft persistence follows the same per-assessment localStorage used by the existing five Creator steps.
 useEffect(()=>{if(!loaded||!questions.length)return;try{assessmentStorage.setItem("longAnswerContentDraft",JSON.stringify({questions,active}));}catch{/* Storage errors appear when saving */}},[questions,active,loaded]);
 const preview=()=>{if(save(false)){setIsPreview(true);scrollRef.current?.scrollTo({top:0});}};
 const proceed=()=>{if(save()){router.push("/assessments/create/evaluation");}};
 const answerText=(field:keyof LongQuestion,value:string)=>setQ({[field]:value} as Partial<LongQuestion>);
 const questionNavigation=(next:number)=>{setActive(Math.max(0,Math.min(questions.length-1,next)));setError("");};
 if(!loaded)return null;
 return <main className="la-app"><div className="la-layout"><Sidebar/><section className="la-main"><Header/><div className="la-scroll" ref={scrollRef}><div className="la-page">
  {isPreview?<LongAnswerPreview questions={questions} onBack={()=>{setIsPreview(false);scrollRef.current?.scrollTo({top:0});}} onEdit={index=>{setActive(index);setIsPreview(false);scrollRef.current?.scrollTo({top:0});}} onSaveAndContinue={proceed}/>:
  <><nav className="la-breadcrumb"><Link href="/assessments">Assessment</Link><Asset name="arrowrightdouble.svg" size={20}/><Link href="/assessments/create/details">Create Assessment</Link><Asset name="arrowrightdouble.svg" size={20}/><strong>Create Questions</strong></nav>
  <div className="la-welcome"><strong>✧ Let's Get Started! {welcomeName}?</strong><span>Let's Build A Great Question.</span></div>
  <div className="la-body"><div className="la-builder">
   {questions.length > 1&&<nav className="la-question-switcher" aria-label="Select a long answer question"><span>Question {active+1} of {expected}</span><div>{questions.map((q,index)=><button type="button" key={q.id} className={index===active?"is-selected":""} aria-current={index===active?"step":undefined} onClick={()=>questionNavigation(index)}>Question {index+1}</button>)}</div></nav>}
   <section className="la-question-area"><div className="la-field"><label>Question Type</label><div className="la-inset la-type">Long Answer <Asset name="arrow-down-01.svg"/></div></div>
    <EditRich id="la-question" label="Write Your Question" value={item.text} onChange={v=>answerText("text",v)} placeholder="" max={250}/>
    <Collapse title="Answer Box, Model Answer, Rubrics, Feedback and Hint" open={isOpen("answer")} onClick={()=>toggle("answer")}>
     <Collapse title="Answer Box Placeholder" open={isOpen("placeholder")} onClick={()=>toggle("placeholder") } sub={`${item.responseFormat} · ${item.inputBoxLines} lines`}>
       <RichField id="la-answer-placeholder" value={item.answerPlaceholder} onChange={v=>setQ({answerPlaceholder:v})} rows={2}/>
       <div className="la-fieldgrid"><div className="la-field"><label>Response Format</label><Select value={item.responseFormat} options={["Plain Text","Rich Text"]} onChange={v=>setQ({responseFormat:v as LongQuestion["responseFormat"]})}/></div><div className="la-field"><label>Input box size (lines)</label><Select value={item.inputBoxLines} options={["3","5","8","10","15","20"]} onChange={v=>setQ({inputBoxLines:v})}/></div><div className="la-field"><label>Minimum Words</label><input className="la-input" type="number" min="0" value={item.minWords} onChange={e=>answerText("minWords",e.target.value)}/></div><div className="la-field"><label>Maximum Words</label><input className="la-input" type="number" min="1" value={item.maxWords} onChange={e=>answerText("maxWords",e.target.value)}/></div><div className="la-field"><label>Maximum Characters</label><input className="la-input" type="number" min="1" value={item.maxCharacters} onChange={e=>answerText("maxCharacters",e.target.value)}/></div></div>
       <div className="la-switchrow">Response Required<Toggle label="Response required" value={item.responseRequired} onChange={v=>setQ({responseRequired:v})}/></div>
     </Collapse>
     <Collapse title="Model Answer and Grader Information" open={isOpen("model")} onClick={()=>toggle("model")} sub="Not shown to learners"><EditRich id="la-model" label="Model Answer" value={item.modelAnswer} onChange={v=>answerText("modelAnswer",v)} max={5000} rows={3}/><EditRich id="la-grader" label="Information for Graders" value={item.graderInfo} onChange={v=>answerText("graderInfo",v)} max={5000} rows={3}/></Collapse>
     <Collapse title="Grading Method and Rubrics" open={isOpen("rubric")} onClick={()=>toggle("rubric")} sub="Multi-level rubric"><div className="la-criteria">{item.criteria.map((criterion,i)=><section key={criterion.id} className="la-criterion"><div className="la-field"><label>Criterion {i+1}</label><input className="la-input" value={criterion.title} onChange={e=>updateCriterion(i,{title:e.target.value})} placeholder="Criterion title (e.g. Concept Accuracy)"/></div><EditRich id={`la-criteria-${i}`} label="Description" value={criterion.description} onChange={v=>updateCriterion(i,{description:v})} max={1000} rows={2}/>
       <div className="la-levelgrid">{criterion.levels.map((level,j)=><div className="la-level" key={level.id}><div className="la-level-heading">Level {j+1}<button type="button" aria-label={`Remove level ${j+1}`} onClick={()=>updateCriterion(i,{levels:criterion.levels.filter(levelItem=>levelItem.id!==level.id)})}>×</button></div><label>Title<input className="la-input" value={level.title} onChange={e=>updateCriterion(i,{levels:criterion.levels.map(l=>l.id===level.id?{...l,title:e.target.value}:l)})}/></label><label>Points<input type="number" min="0" step="0.5" className="la-input" value={level.points} onChange={e=>updateCriterion(i,{levels:criterion.levels.map(l=>l.id===level.id?{...l,points:e.target.value}:l)})}/></label><label>Description<textarea className="la-input" rows={3} value={level.description} onChange={e=>updateCriterion(i,{levels:criterion.levels.map(l=>l.id===level.id?{...l,description:e.target.value}:l)})}/></label></div>)}</div>
       <div className="la-criterion-buttons"><button type="button" onClick={()=>updateCriterion(i,{levels:[...criterion.levels,newLevel(criterion.levels.length)]})}>＋ Add Level</button><button type="button" disabled={item.criteria.length===1} onClick={()=>setQ({criteria:item.criteria.filter(c=>c.id!==criterion.id)})}>Remove Criterion</button></div></section>)}<button className="la-add-criterion" type="button" onClick={()=>setQ({criteria:[...item.criteria,newCriterion()]})}>＋ Add Criterion</button></div>
       <div className="la-rubric-total">Total Points From Criteria <strong>{item.criteria.reduce((sum,c)=>sum+Math.max(0,...c.levels.map(l=>Number(l.points)||0)),0)}</strong></div><div className="la-rubric-options"><h3>Rubric Options</h3>{settingsButtons.map(opt=><div className="la-switchrow" key={opt.key}>{opt.label}<Toggle label={opt.label} value={item[opt.key]} onChange={v=>setQ({[opt.key]:v})}/></div>)}</div>
     </Collapse>
     <Collapse title="Feedback" open={isOpen("feedback")} onClick={()=>toggle("feedback") } sub="Full, Partial and Zero Marks"><EditRich id="la-feedback-full" label="Full Marks" value={item.feedbackFull} onChange={v=>answerText("feedbackFull",v)} max={2000}/><EditRich id="la-feedback-partial" label="Partial Marks" value={item.feedbackPartial} onChange={v=>answerText("feedbackPartial",v)} max={2000}/><EditRich id="la-feedback-zero" label="Zero Marks" value={item.feedbackZero} onChange={v=>answerText("feedbackZero",v)} max={2000}/></Collapse>
     <Collapse title="Explanation" open={isOpen("explanation")} onClick={()=>toggle("explanation")} sub={`${item.explanation.length}/2500`}><RichField id="la-explanation" value={item.explanation} onChange={v=>answerText("explanation",v)} maxLength={2500}/></Collapse>
     <Collapse title="Hint" open={isOpen("hint")} onClick={()=>toggle("hint")} sub={`${item.hint.length}/2500`}><RichField id="la-hint" value={item.hint} onChange={v=>answerText("hint",v)} maxLength={2500}/><label className="la-checkbox"><input type="checkbox" checked={item.hintBefore} onChange={e=>setQ({hintBefore:e.target.checked})}/>Show hint before answering</label><label className="la-checkbox"><input type="checkbox" checked={item.hintOnRequest} onChange={e=>setQ({hintOnRequest:e.target.checked})}/>Allow learner to request hint</label></Collapse>
    </Collapse>
   </section>
   <div className="la-builder-bottom"><button type="button" onClick={()=>{const newOne=newLongQuestion();setQuestions(old=>[...old,newOne]);setExpected(n=>n+1);setActive(questions.length);}}>＋ Add Questions</button></div>
  </div>
  <aside className="la-aside"><h2>Question Settings</h2><div className="la-field"><label htmlFor="la-points">Points</label><input id="la-points" className="la-input" type="number" min="0.5" step="0.5" value={item.points} onChange={e=>answerText("points",e.target.value)}/></div><div className="la-field"><label>Difficulty</label><Select value={item.difficulty} options={["Easy","Medium","Hard"]} onChange={v=>setQ({difficulty:v})}/></div><div className="la-field"><label>Category</label><Select value={item.category} options={categories} onChange={v=>setQ({category:v})}/></div><div className="la-field"><label>Bloom’s Taxonomy</label><Select value={item.bloom} options={blooms} onChange={v=>setQ({bloom:v})}/></div><div className="la-field"><label>Tag</label><div className="la-tags"><input className="la-input" value={tag} onChange={e=>setTag(e.target.value)} placeholder="Add Tag" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(tag.trim()&&!item.tags.includes(tag.trim()))setQ({tags:[...item.tags,tag.trim()]});setTag("");}}}/><button type="button" onClick={()=>{if(tag.trim()&&!item.tags.includes(tag.trim()))setQ({tags:[...item.tags,tag.trim()]});setTag("");}}>＋</button></div>{item.tags.map(value=><button key={value} type="button" className="la-tag" onClick={()=>setQ({tags:item.tags.filter(t=>t!==value)})}>{value} ×</button>)}</div><div className="la-switchrow">Mandatory<Toggle label="Mandatory" value={item.mandatory} onChange={v=>setQ({mandatory:v})}/></div><small>This Question is Mandatory</small></aside>
  </div>
  {error&&<p role="alert" className="la-error">{error}</p>}
  <div className="la-page-footer"><button type="button" onClick={()=>router.push("/assessments/create/details")}>Back</button><button type="button" onClick={preview}>Preview Questions</button><span/><button type="button" onClick={()=>save(false)}>Save</button><button type="button" className="la-green" onClick={proceed}>Continue</button></div></>}
 </div></div></section></div></main>;
}
