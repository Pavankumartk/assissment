"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, X, Image as ImageIcon, Settings2, ClipboardList, MessageCircleMore, Check, Sparkles, Undo2, Redo2, Bold, Italic, Underline, Grid2X2, Upload } from "lucide-react";
import Sidebar from "../../common/sidebar/page";
import Header from "../../common/header/Header";
import { assessmentStorage, updateAssessment } from "@/modules/assessments/storage/assessment-storage";
import { imageDetails, imageCorrectIndices, imageQuestionStarted, imageQuestionValid, newImageQuestion, IMAGE_CONTENT_KEY, type ImageDraft, type ImageQuestion, type ImageMatchPair, newImageMatchPair } from "./image-based-data";
import "./image-based.css";

type Section = "Question and Image" | "Answer Options" | "Question" | "Picture and matching text" | "Grading Method" | "Feedback";
const SECTIONS: Section[] = ["Question and Image", "Answer Options", "Grading Method", "Feedback"];
const iconMap = { "Question and Image": Grid2X2, "Answer Options": ClipboardList, "Question": Grid2X2, "Picture and matching text": Settings2, "Grading Method": ClipboardList, "Feedback": MessageCircleMore };
const IMAGE_GALLERY = [
  "/assets/assessmenticons/image-based-network-1.png",
  "/assets/assessmenticons/image-based-firewall-2.png",
  "/assets/assessmenticons/image-based-network-3.png",
  "/assets/assessmenticons/image-based-network-4.png",
];
const cap = (value: string, maximum = 250) => value.slice(0, maximum);
const label = (n: number) => String.fromCharCode(65 + n);

function UploadImage({ value, onChange, title, compact=false, fallback="", matching=false }: { value: string; onChange: (data: string) => void; title: string; compact?: boolean; fallback?: string; matching?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [error,setError] = useState("");
  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please choose a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > 8_000_000) {
      setError("Choose an image smaller than 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setError("Unable to read this image.");
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const img = new window.Image();
      img.onerror = () => setError("Unable to process this image.");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSide = Math.max(img.naturalWidth, img.naturalHeight);
        let scale = Math.min(1, 1000 / Math.max(1, maxSide));
        let result = "";
        for (let attempt = 0; attempt < 4; attempt += 1) {
          canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
          const context = canvas.getContext("2d");
          if (!context) { setError("Image processing is unavailable."); return; }
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          result = canvas.toDataURL("image/jpeg", 0.70);
          if (result.length <= 180_000) break;
          scale *= 0.72;
        }
        if (result.length > 180_000) {setError("The image is too large to store in the assessment draft.");return;}
        onChange(result);
        setError("");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  return <div className={`ibqImagePicker ${compact ? "ibqCompactImage" : ""}`}>
    {matching ? <div className="ibqMatchUploadBox">
      <button type="button" className="ibqMatchThumbnail" aria-label={`Choose ${title}`} onClick={()=>input.current?.click()}>
        {value ? <img src={value} alt={title}/> : fallback ? <><ImageIcon size={28}/><img className="ibqMatchAsset" src={fallback} alt="" onError={event=>{event.currentTarget.style.display="none"}}/></> : <ImageIcon size={28}/>}
      </button>
      <button type="button" className="ibqMatchUploadIcon" aria-label={`Upload ${title}`} onClick={()=>input.current?.click()}><Upload size={22}/></button>
    </div> : value ? <div className="ibqImagePreview"><img src={value} alt={title}/><button type="button" aria-label={`Remove ${title}`} onClick={()=>onChange("")}><X size={18}/></button></div> : <button className="ibqUpload" type="button" title={`Upload ${title}`} onClick={()=>input.current?.click()}>{fallback&&compact?<><ImageIcon size={compact?18:22}/><img src={fallback} alt="" onError={event=>{event.currentTarget.style.display="none"}}/></>:<ImageIcon size={compact?18:22}/>}<span>{compact?"Choose image":<><Upload size={20}/> Upload Image</>}</span>{!compact&&<small>PNG, JPG or WebP · Max 8 MB</small>}</button>}
    <input type="file" ref={input} hidden accept="image/*" onChange={change} />
    {error && <span className="ibqError" role="alert">{error}</span>}
  </div>;
}

/** Small rich-text control. The stored value stays plain text for the existing viewer and result screens. */
function RichEditor({ value, onChange, label: ariaLabel, rows=3, placeholder="", tone="" }: {
  value: string; onChange:(value:string)=>void; label:string; rows?:number; placeholder?:string; tone?:string;
}) {
  const ref=useRef<HTMLDivElement>(null);
  const history=useRef<string[]>([value]);
  const position=useRef(0);
  const [family,setFamily]=useState("Arial");
  const [size,setSize]=useState("16");
  const [more,setMore]=useState(false);
  useEffect(()=>{
    if(ref.current && ref.current.innerText !== value){ref.current.innerText=value;history.current=[value];position.current=0;}
  },[value]);
  const setText=(next:string)=>{
    const trimmed=cap(next,250);
    if(trimmed!==history.current[position.current]){
      history.current=history.current.slice(0,position.current+1);
      history.current.push(trimmed);position.current=history.current.length-1;
    }
    onChange(trimmed);
    if(next.length>250 && ref.current) ref.current.innerText=trimmed;
  };
  const undo=(delta:number)=>{
    position.current=Math.min(Math.max(0,position.current+delta),history.current.length-1);
    const next=history.current[position.current];
    if(ref.current)ref.current.innerText=next;
    onChange(next);
  };
  const command=(name:string,arg?:string)=>{
    ref.current?.focus();
    document.execCommand(name,false,arg);
    setText(ref.current?.innerText || "");
  };
  return <div className={`ibqRich ${tone}`}>
    <div className="ibqRichToolbar" aria-label={`${ariaLabel} formatting tools`}>
      <button type="button" onClick={()=>undo(-1)} title="Undo" aria-label="Undo"><Undo2 size={16}/></button>
      <button type="button" onClick={()=>undo(1)} title="Redo" aria-label="Redo"><Redo2 size={16}/></button>
      <select aria-label="Font" value={family} onChange={e=>setFamily(e.target.value)}><option>Arial</option><option>Segoe UI</option><option>Inter</option></select>
      <select aria-label="Font size" value={size} onChange={e=>setSize(e.target.value)}><option>12</option><option>14</option><option>16</option><option>18</option><option>20</option></select>
      <button type="button" onClick={()=>command("bold")} title="Bold" aria-label="Bold"><Bold size={16}/></button>
      <button type="button" onClick={()=>command("italic")} title="Italic" aria-label="Italic"><Italic size={16}/></button>
      <button type="button" onClick={()=>command("underline")} title="Underline" aria-label="Underline"><Underline size={16}/></button>
      <button type="button" onClick={()=>command("foreColor","#2D4CC8")} title="Blue text" aria-label="Blue text"><span className="ibqLetterColor">A</span></button>
      <button type="button" onClick={()=>command("insertUnorderedList")} title="Bulleted list" aria-label="Bulleted list"><ClipboardList size={16}/></button>
      <button className="ibqMoreToolbar" type="button" onClick={()=>setMore(x=>!x)} title="More tools" aria-label="More tools">•••</button>
      {more&&<button type="button" onClick={()=>command("removeFormat")} title="Clear formatting">Clear</button>}
    </div>
    <div ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-label={ariaLabel} aria-multiline="true"
      data-placeholder={placeholder} className="ibqRichInput" style={{minHeight:rows*24+29,fontFamily:family,fontSize:`${size}px`}}
      onInput={e=>setText(e.currentTarget.innerText)} />
  </div>;
}

function Toggle({value,onChange,title}:{value:boolean;onChange:(v:boolean)=>void;title:string}){
  return <button type="button" title={title} aria-label={title} role="switch" aria-checked={value} onClick={()=>onChange(!value)}
    className={`ibqSwitch ${value?"is-on":""}`}><span>{value?"ON":"OFF"}</span><i/></button>;
}
function GalleryThumb({src,selected,onSelect,index}:{src:string;selected:boolean;onSelect:()=>void;index:number}){
  const [failed,setFailed]=useState(false);
  return <button type="button" className={`ibqGalleryThumb ${selected?"selected":""}`} disabled={failed} onClick={onSelect} title={`Use gallery image ${index+1}`}>
    {!failed?<img alt={`Network diagram ${index+1}`} src={src} onError={()=>setFailed(true)}/>:<><ImageIcon size={27}/><small>Image {index+1}</small></>}
  </button>;
}

export default function ImageBasedContent() {
  const router=useRouter();
  const [ready,setReady]=useState(false);
  const [questions,setQuestions]=useState<ImageQuestion[]>([newImageQuestion()]);
  const [active,setActive]=useState(0);
  const [count,setCount]=useState(20);
  const [totalMarks,setTotalMarks]=useState(40);
  const [open,setOpen]=useState<Section[]>([]);
  const [extraOpen,setExtraOpen]=useState({explanation:true,hint:true});
  const [tagsOpen,setTagsOpen]=useState(false);
  const [newTag,setNewTag]=useState("");
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);
  const [passingScore,setPassingScore]=useState("60");
  const scroll=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    try {
      const details=imageDetails();setCount(details.count);setTotalMarks(details.totalMarks);
      try {const evalSettings=JSON.parse(assessmentStorage.getItem("mcqAssessmentEvaluationDraft")||"{}");setPassingScore(String(evalSettings.passingScore||details.passingScore));}catch{setPassingScore(String(details.passingScore));}
      const draft=assessmentStorage.getItem(IMAGE_CONTENT_KEY);
      if(draft){const value=JSON.parse(draft) as ImageDraft; if(Array.isArray(value.questions) && value.questions.length){setQuestions(value.questions);setActive(Math.max(0,Math.min(value.active||0,details.count-1)));}}
    }catch{/* Keep editable defaults. */}
    setReady(true);
  },[]);
  useEffect(()=>{
    const close=()=>setTagsOpen(false);
    const container=document.querySelector(".ibqScroll");
    container?.addEventListener("scroll",close,{passive:true});
    window.addEventListener("scroll",close,{passive:true});
    return ()=>{container?.removeEventListener("scroll",close);window.removeEventListener("scroll",close);};
  },[]);
  useEffect(()=>{
    if(!ready) return;
    try {assessmentStorage.setItem(IMAGE_CONTENT_KEY,JSON.stringify({questions,active,savedAt:new Date().toISOString()}));} catch {setMessage("Draft could not be saved. Please use smaller images.");}
  },[questions,active,ready]);
  const question=questions[active] || newImageQuestion();
  const isMatching=question.subtype === "image-matching";
  const sections: Section[] = isMatching ? ["Question", "Picture and matching text", "Grading Method", "Feedback"] : SECTIONS;
  const pairs: ImageMatchPair[] = question.matchPairs || Array.from({length:4},newImageMatchPair);
  const update=(patch:Partial<ImageQuestion>)=>setQuestions(old=>{const copy=[...old];while(copy.length<=active) copy.push(newImageQuestion());copy[active]={...copy[active],...patch};return copy;});
  const go=(index:number)=>{if(index<0 || index>=count)return;setActive(index);setMessage("");scroll.current?.children[index]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});};
  const add=()=>{if(active>=count-1){setMessage(`Maximum ${count} questions configured in Details.`);return;}go(active+1);};
  const save=(continueToEvaluation=false)=>{
    if(continueToEvaluation){
      const firstIncomplete=Array.from({length:count},(_,i)=>i).find(i=>!questions[i]||!imageQuestionValid(questions[i]));
      if(firstIncomplete!==undefined){go(firstIncomplete);setMessage(`Complete Question ${firstIncomplete+1}: ${questions[firstIncomplete]?.subtype === "image-matching" ? "enter your question and at least two picture/text pairs, including an image for each." : "add a question image, at least two options, and mark the correct answer."}`);return;}
    }
    try {
      assessmentStorage.setItem(IMAGE_CONTENT_KEY,JSON.stringify({questions,active,savedAt:new Date().toISOString()}));
      const valid=questions.filter(imageQuestionValid);updateAssessment({questions:valid.length,marks:valid.reduce((sum,q)=>sum+(Number(q.points)||0),0)});
      setMessage(continueToEvaluation?"Saved. Opening Preview Questions...":"Successfully saved");
      if(continueToEvaluation){setSaving(true);router.push("/assessments/create/image-based-preview");}
    } catch {setMessage("Unable to save. Please reduce image sizes.");}
  };
  const toggle=(name:Section)=>setOpen(old=>old.includes(name)?old.filter(x=>x!==name):[...old,name]);
  const complete=questions.filter(imageQuestionValid).length;
  const correctIndices=imageCorrectIndices(question);
  const setCorrect=(index:number,value:boolean)=>{
    if(question.allowMultiple){
      const next=value?[...correctIndices,index]:correctIndices.filter(i=>i!==index);
      update({correctAnswers:[...new Set(next)],correct:next[0]??-1});
    }else update({correct:value?index:-1});
  };
  const removeOption=(i:number)=>{
    if(question.options.length<=2)return;
    const options=question.options.filter((_,j)=>i!==j);
    const selected=correctIndices.filter(n=>n!==i).map(n=>n>i?n-1:n);
    update({options,correct:selected[0]??-1,correctAnswers:selected});
  };
  const option=(i:number,patch:Partial<{text:string;image:string;explanation:string}>)=>update({options:question.options.map((v,j)=>j===i?{...v,...patch}:v)});
  const matchPair=(i:number,patch:Partial<ImageMatchPair>)=>update({matchPairs:pairs.map((v,j)=>i===j?{...v,...patch}:v)});
  const chooseSubtype=(value:"multiple-choice"|"image-matching")=>{
    update({subtype:value, ...(value === "image-matching" && !question.matchPairs ? {matchPairs:Array.from({length:4},newImageMatchPair),matchExtras:[""],shuffleTexts:true}: {})});
    setOpen(value === "image-matching" ? ["Question","Picture and matching text","Grading Method","Feedback"] : ["Question and Image","Answer Options","Grading Method","Feedback"]);
  };
  return <main className="ibqApp superAdminPage institutionAdminPage">
    <div className="dashboardLayout ibqLayout"><Sidebar/><section className="mainContent ibqMain"><div className="ibqHeader"><Header/></div>
    <div className="ibqScroll institutionScrollArea"><div className="ibqPage pageContent institutionPageContent">
      <div className="ibqTop"><nav aria-label="Breadcrumb" className="ibqBreadcrumb"><Link href="/assessments">Assessment</Link><span>»</span><button type="button" onClick={()=>router.push("/assessments/create/details")}>Create Assessment</button><span>»</span><strong>Create Questions</strong></nav><div className="ibqWelcome"><Sparkles size={24}/><div><strong>Let&apos;s Get Started! Antony?</strong><span>Let&apos;s Build A Great Question.</span></div></div></div>
      <><div className="ibqColumns"><div className="ibqPrimary"><section className="ibqCard">
        <div className="ibqCardHead"><div><h1>Question {active+1} of {count}</h1><p>{count} Question | {totalMarks} Marks</p></div><button className="ibqAccentButton" type="button" onClick={add}><Plus size={20}/>Add</button></div>
        <div className="ibqNumberLine"><button className="ibqCircle" aria-label="Previous question" onClick={()=>go(active-1)} disabled={active===0}><ChevronLeft size={20}/></button><div className="ibqNumberScroll" ref={scroll}>{Array.from({length:count},(_,i)=>{const q=questions[i];const done=q&&imageQuestionValid(q);return <button key={i} type="button" onClick={()=>go(i)} className={`ibqNumber ${active===i?"is-active":done?"is-done":""}`} aria-current={active===i?"step":undefined}><b>{i+1}</b>{(done||active===i)&&<span className="ibqDot"/>}<small>{q&&imageQuestionStarted(q)?(q.subtype === "image-matching"?"IM":"MCQ"):""}</small></button>})}</div><button className="ibqCircle" aria-label="Next question" onClick={()=>go(active+1)} disabled={active>=count-1}><ChevronRight size={20}/></button></div>
        <div className="ibqTrack"><span style={{width:`${Math.max(1,complete/count*100)}%`}}/></div>
        <section className="ibqForm"><div className="ibqField"><label>Question Type</label><div className="ibqStaticSelect">Image Based <ChevronDown size={20}/></div></div><div className="ibqField"><label>Sub type</label><select className="ibqSubtypeSelect" aria-label="Image-Based subtype" value={isMatching?"image-matching":"multiple-choice"} onChange={e=>chooseSubtype(e.target.value as "multiple-choice"|"image-matching")}><option value="multiple-choice">Image-Based Multiple Choice</option><option value="image-matching">Image Matching</option></select></div>
          {sections.map(name=>{const Icon=iconMap[name];const opened=open.includes(name);return <div className="ibqAccordion" data-section={name} key={name}><button type="button" className="ibqAccordionToggle" aria-expanded={opened} onClick={()=>toggle(name)}><span className="ibqSectionIcon"><Icon size={18}/></span><b>{name}</b>{name==="Feedback"&&<small>{(question.feedbackFull||question.feedback||"").length}/250</small>}<ChevronDown className={opened?"ibqRotated":""} size={20}/></button>{opened&&<div className="ibqAccordionBody">
          {name==="Question"&&<>
            <label>Write your Question <small>{question.text.length}/250</small></label>
            <RichEditor label="Write your matching question" rows={3} value={question.text} onChange={text=>update({text})} placeholder="Match each picture with its topic."/>
          </>}
          {name==="Picture and matching text"&&<>
            <p className="ibqMatchHelper">Each row is one correct match</p>
            <div className="ibqMatchColumns"><b>Match Text</b><b>Image</b></div>
            <div className="ibqMatchList">{pairs.map((pair,i)=> <div className="ibqMatchRow" key={i}>
              <input aria-label={`Matching text ${i+1}`} type="text" maxLength={250} value={pair.text} placeholder={["Neural Network","Security","Cloud","Data Analysis"][i]||`Matching text ${i+1}`} onChange={e=>matchPair(i,{text:cap(e.target.value)})}/>
              <div className="ibqMatchImageField"><UploadImage compact matching title={`Matching picture ${i+1}`} value={pair.image} fallback={["/assets/assessmenticons/image-matching-neural-network.svg","/assets/assessmenticons/image-matching-security.svg","/assets/assessmenticons/image-matching-cloud.svg","/assets/assessmenticons/image-matching-database.svg"][i]||""} onChange={image=>matchPair(i,{image})}/></div>
              <button className="ibqMatchRemove" type="button" aria-label={`Remove matching pair ${i+1}`} disabled={pairs.length<=2} onClick={()=>update({matchPairs:pairs.filter((_,n)=>n!==i)})}><X size={18}/></button>
            </div>)}</div>
            <div className="ibqMatchAdd"><button className="ibqMatchAddButton" type="button" disabled={pairs.length>=6} onClick={()=>update({matchPairs:[...pairs,newImageMatchPair()]})}><Plus size={20}/><span>Add Pairs</span></button><small>2 to 6 options</small></div>
            <label className="ibqMatchExtraLabel">Extra texts that match no Picture (Optional)</label>
            {(question.matchExtras||[]).map((extra,i)=><div className="ibqMatchExtraRow" key={i}><input type="text" aria-label={`Extra matching text ${i+1}`} maxLength={250} value={extra} placeholder="Printer" onChange={e=>update({matchExtras:(question.matchExtras||[]).map((v,j)=>i===j?cap(e.target.value):v)})}/><button className="ibqMatchRemove" type="button" aria-label={`Remove extra text ${i+1}`} onClick={()=>update({matchExtras:(question.matchExtras||[]).filter((_,j)=>j!==i)})}><X size={18}/></button></div>)}
            <div className="ibqMatchAdd"><button className="ibqMatchAddButton" type="button" disabled={(question.matchExtras||[]).length>=6} onClick={()=>update({matchExtras:[...(question.matchExtras||[]),""]})}><Plus size={20}/><span>Add Extra</span></button><small>0 to 6 options</small></div>
            <label className="ibqMatchShuffle">Shuffle the texts <Toggle title="Shuffle matching texts" value={question.shuffleTexts!==false} onChange={v=>update({shuffleTexts:v})}/></label>
          </>}
          {name==="Question and Image"&&<>
            <label>Write your Question <small>{question.text.length}/250</small></label>
            <RichEditor label="Write your Question" rows={3} value={question.text} onChange={text=>update({text})} placeholder="Write your question..." />
            <label>Choose an Image <span className="ibqRequired">*</span></label>
            <div className="ibqGallery">{IMAGE_GALLERY.map((src,i)=><GalleryThumb key={src} index={i} src={src} selected={question.image===src} onSelect={()=>update({image:src})}/>)}</div>
            <UploadImage title="Image" value={question.image&&!IMAGE_GALLERY.includes(question.image)?question.image:""} onChange={image=>update({image})}/>
            {question.image&&<div className="ibqSelectedImageNote"><Check size={15}/> Image selected <button type="button" onClick={()=>update({image:""})}>Remove</button></div>}
          </>}
          {name==="Answer Options"&&<>
            <p className="ibqHelper">Click on the toggle for correct answer.</p>
            <div className="ibqOptionList">{question.options.map((entry,i)=><div className="ibqOptionCard" key={i}>
              <div className="ibqOptionRow"><span className="ibqOptionIndex">{i+1}</span>
                <input type="text" aria-label={`Option ${i+1}`} maxLength={250} value={entry.text} placeholder={`Enter option ${i+1}`} onChange={e=>option(i,{text:cap(e.target.value)})}/>
                <UploadImage compact title={`option ${i+1}`} value={entry.image} fallback={question.image} onChange={image=>option(i,{image})}/>
                <div className="ibqSwitchHolder"><Toggle value={correctIndices.includes(i)} title={`Mark option ${i+1} correct`} onChange={yes=>setCorrect(i,yes)}/></div>
                <button className="ibqDelete" type="button" title={`Remove option ${i+1}`} aria-label={`Remove option ${i+1}`} disabled={question.options.length<=2} onClick={()=>removeOption(i)}><X size={17}/></button>
              </div>
              <textarea aria-label={`Explanation for option ${i+1}`} rows={2} maxLength={250} value={entry.explanation||""} placeholder="Explanation for this option" onChange={e=>option(i,{explanation:cap(e.target.value)})}/>
            </div>)}</div>
            <div className="ibqOptionAdd"><button className="ibqTextButton" type="button" disabled={question.options.length>=6} onClick={()=>update({options:[...question.options,{text:"",image:"",explanation:""}]})}><Plus size={20}/><span>Add Options</span></button><small>2 to 6 options</small></div>
            <div className="ibqOptionToggles"><label>Allow more than one correct answer <Toggle title="Allow multiple correct answers" value={!!question.allowMultiple} onChange={value=>update({allowMultiple:value,correctAnswers:value?correctIndices:[],correct:value?(correctIndices[0]??-1):correctIndices[0]??-1})}/></label><label>Shuffle the Options <Toggle title="Shuffle option order" value={question.shuffleOptions!==false} onChange={value=>update({shuffleOptions:value})}/></label></div>
          </>}
          {name==="Grading Method"&&<>
            <div className="ibqGradingGrid"><label>Grading Method<select value={question.gradingMethod||"Partial credit - equal marks"} onChange={e=>update({gradingMethod:e.target.value})}><option>Partial credit - equal marks</option><option>All or nothing</option></select></label>
            <label>Points (total for Question)<select value={question.points} onChange={e=>update({points:Number(e.target.value)})}>{Array.from({length:20},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label>
            <label>Negative Marking<select value={question.negativeMarking||0} onChange={e=>update({negativeMarking:Number(e.target.value)})}><option value={0}>NA</option><option value={0.25}>0.25</option><option value={0.5}>0.5</option><option value={1}>1</option></select></label></div>
            <label className="ibqGradeFloor">Calculate grade with a minimum score of 0 <Toggle title="Minimum score of zero" value={question.minimumZero!==false} onChange={v=>update({minimumZero:v})}/></label>
          </>}
          {name==="Feedback"&&<>
            <label className="ibqFeedbackLabel is-full">Full Marks <small>{(question.feedbackFull||question.feedback||"").length}/250</small></label>
            <RichEditor tone="ibqRichFull" label="Full Marks feedback" rows={3} value={question.feedbackFull??question.feedback??""} onChange={text=>update({feedbackFull:text,feedback:text})} placeholder="Feedback for correct answers"/>
            <label className="ibqFeedbackLabel is-partial">Partial Marks <small>{(question.feedbackPartial||"").length}/250</small></label>
            <RichEditor label="Partial Marks feedback" rows={3} value={question.feedbackPartial||""} onChange={text=>update({feedbackPartial:text})} placeholder="Feedback for partially correct answers"/>
            <label className="ibqFeedbackLabel is-zero">Zero Marks <small>{(question.feedbackZero||"").length}/250</small></label>
            <RichEditor label="Zero Marks feedback" rows={3} value={question.feedbackZero||""} onChange={text=>update({feedbackZero:text})} placeholder="Feedback for incorrect answers"/>
            <div className="ibqInnerAccordion"><button type="button" aria-expanded={extraOpen.explanation} onClick={()=>setExtraOpen(p=>({...p,explanation:!p.explanation}))}><span className="ibqSectionIcon"><ClipboardList size={17}/></span><b>Explanation</b><small>{question.explanation.length}/250</small><ChevronDown className={extraOpen.explanation?"ibqRotated":""} size={19}/></button>
              {extraOpen.explanation&&<RichEditor label="Explanation" rows={3} value={question.explanation} onChange={text=>update({explanation:text})} placeholder="Explain the correct answer"/>}</div>
            <div className="ibqInnerAccordion"><button type="button" aria-expanded={extraOpen.hint} onClick={()=>setExtraOpen(p=>({...p,hint:!p.hint}))}><span className="ibqSectionIcon"><MessageCircleMore size={17}/></span><b>Hint</b><small>{question.hint.length}/250</small><ChevronDown className={extraOpen.hint?"ibqRotated":""} size={19}/></button>
              {extraOpen.hint&&<><RichEditor label="Hint" rows={3} value={question.hint} onChange={text=>update({hint:text})} placeholder="Write a hint"/><label className="ibqHintCheck"><input type="checkbox" checked={question.showHintBefore!==false} onChange={e=>update({showHintBefore:e.target.checked})}/> Show hint before answering</label><label className="ibqHintCheck"><input type="checkbox" checked={!!question.allowHintRequest} onChange={e=>update({allowHintRequest:e.target.checked})}/> Allow learner to request hint</label></>}</div>
          </>}
          </div>}</div>})}
        </section>
        <div className="ibqWithinActions"><button className="ibqAccentButton" type="button" onClick={add}><Plus size={20}/>Add Questions</button><div><button className="ibqCircle" type="button" aria-label="Previous question" onClick={()=>go(active-1)} disabled={active===0}><ChevronLeft size={20}/></button><button className="ibqCircle" type="button" aria-label="Next question" onClick={()=>go(active+1)} disabled={active===count-1}><ChevronRight size={20}/></button></div></div>
        </section></div>
        <aside className="ibqAside"><section className="ibqAsideCard"><h2>Question Settings</h2><label htmlFor="ibqPoints">Points</label><input id="ibqPoints" min={1} max={1000} type="number" value={question.points} onChange={e=>update({points:Math.max(1,Number(e.target.value)||1)})}/><label htmlFor="ibqDifficulty">Difficulty</label><select id="ibqDifficulty" value={question.difficulty} onChange={e=>update({difficulty:e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select><label htmlFor="ibqCategory">Category</label><select id="ibqCategory" value={question.category} onChange={e=>update({category:e.target.value})}><option>AI</option><option>General</option><option>Science</option><option>Mathematics</option><option>Technology</option><option>Other</option></select><label htmlFor="ibqBloom">Bloom&apos;s Taxonomy</label><select id="ibqBloom" value={question.bloom} onChange={e=>update({bloom:e.target.value})}>{["Remember","Understand","Apply","Analyse","Evaluate","Create"].map(v=><option key={v}>{v}</option>)}</select><label>Tag</label><button type="button" className="ibqTagAdd" onClick={()=>setTagsOpen(x=>!x)}><Plus size={15}/> Add Tag</button>{tagsOpen&&<div className="ibqTagEntry"><input aria-label="New tag" placeholder="Enter tag" value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();if(newTag.trim())update({tags:[...question.tags.filter(x=>x!==newTag.trim()),newTag.trim()]});setNewTag("");setTagsOpen(false);}}}/><button type="button" onClick={()=>{if(newTag.trim())update({tags:[...question.tags.filter(x=>x!==newTag.trim()),newTag.trim()]});setNewTag("");setTagsOpen(false);}}>Add</button></div>}<div className="ibqTags">{question.tags.map(tag=><span key={tag}>{tag}<button type="button" aria-label={`Remove ${tag}`} onClick={()=>update({tags:question.tags.filter(x=>x!==tag)})}><X size={13}/></button></span>)}</div><div className="ibqMandatory"><label>Mandatory</label><Toggle title="Mandatory question" value={question.mandatory} onChange={value=>update({mandatory:value})}/></div><small>This Question is {question.mandatory?"Mandatory":"Optional"}</small></section>
        <section className="ibqAsideCard ibqSummary"><h2>Assessment Summary</h2><div className="ibqStats"><div><b>{complete}</b><span>Questions</span></div><div><b>{questions.filter(imageQuestionValid).reduce((n,q)=>n+q.points,0)}</b><span>Marks</span></div><div><b>{(() => {try {const raw=JSON.parse(assessmentStorage.getItem("mcqAssessmentDraft")||"{}");return Math.max(1,Math.round(Number(raw.duration)||60));} catch {return 60;}})()}</b><span>Minutes</span></div></div><p>Target is {count} questions · {totalMarks} marks. Add questions to get started.</p><label htmlFor="ibqPass">Passing Score</label><select id="ibqPass" value={`${passingScore}%`} onChange={e=>{const value=e.target.value.replace("%","");setPassingScore(value);try{const draft=JSON.parse(assessmentStorage.getItem("mcqAssessmentEvaluationDraft")||"{}");assessmentStorage.setItem("mcqAssessmentEvaluationDraft",JSON.stringify({...draft,passingScore:value}));}catch{setMessage("Unable to save the passing score.");}}}><option>50%</option><option>60%</option><option>70%</option><option>80%</option></select></section></aside>
      </div><div className="ibqFooter"><button type="button" onClick={()=>{try{assessmentStorage.setItem(IMAGE_CONTENT_KEY,JSON.stringify({questions,active,savedAt:new Date().toISOString()}));router.push("/assessments/create/image-based-preview");}catch{setMessage("Unable to save the preview. Please reduce image sizes.");}}}>Preview Questions</button><div>{message&&<span className="ibqStatus" role="status">{message}</span>}<button type="button" onClick={()=>save(false)}>Save</button><button className="ibqContinue" disabled={saving} type="button" onClick={()=>save(true)}>Continue</button></div></div></>
    </div></div></section></div>
  </main>;
}
