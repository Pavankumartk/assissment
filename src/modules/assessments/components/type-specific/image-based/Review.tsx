"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, Image as ImageIcon, Pencil, Send } from "lucide-react";
import Sidebar from "../../common/sidebar/page";
import Header from "../../common/header/Header";
import { assessmentStorage, getActiveAssessmentId, getAssessment, updateAssessment } from "@/modules/assessments/storage/assessment-storage";
import { imageDetails, imageQuestionValid, readImageDraft, type ImageQuestion } from "./image-based-data";
import "./image-based.css";

export default function ImageBasedReview() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [questions, setQuestions] = useState<ImageQuestion[]>([]);
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [details, setDetails] = useState(imageDetails());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDetails(imageDetails());
    setQuestions(readImageDraft().questions);
    try {setSettings(JSON.parse(assessmentStorage.getItem("mcqAssessmentEvaluationDraft") || "{}"));} catch { /* no evaluation settings yet */ }
    setReady(true);
  }, []);

  const validQuestions = questions.filter(imageQuestionValid);
  const total = validQuestions.reduce((sum, question) => sum + (Number(question.points) || 0), 0);
  const publish = () => {
    if (busy) return;
    const id = getActiveAssessmentId();
    const record = id ? getAssessment(id) : undefined;
    if (!record || record.typeCode !== "image-based") {setError("Please select an Image-Based assessment first.");return;}
    if (validQuestions.length !== details.count || questions.slice(0,details.count).some(q => !imageQuestionValid(q))) {
      setError(`Complete all ${details.count} image-based questions before publishing.`);
      return;
    }
    if (total !== details.totalMarks) {
      setError(`Question points total ${total}; the Details page specifies ${details.totalMarks} marks. Adjust the points or total marks before publishing.`);
      return;
    }
    setBusy(true);
    updateAssessment({title:details.title,course:details.course,questions:validQuestions.length,marks:total,status:"Published"});
    router.push("/assessments");
  };

  if (!ready) return null;
  return <main className="ibqApp superAdminPage institutionAdminPage">
    <div className="dashboardLayout ibqLayout"><Sidebar/><section className="mainContent ibqMain"><div className="ibqHeader"><Header/></div>
      <div className="ibqScroll institutionScrollArea"><div className="ibqPage pageContent institutionPageContent">
        <nav className="ibqBreadcrumb"><Link href="/assessments">Assessment</Link><span>»</span><span>Create Assessment</span><span>»</span><strong>Review</strong></nav>
        <div className="ibqReviewHead"><h1>Review &amp; Publish</h1><p>Check your Image-Based Assessment before publishing it to learners.</p></div>
        <div className="ibqReviewGrid">
          <section className="ibqReviewPanel"><div className="ibqReviewPanelHead"><h2>Assessment Details</h2><Link href="/assessments/create/details"><Pencil size={17}/> Edit</Link></div>
            <dl><div><dt>Name</dt><dd>{details.title}</dd></div><div><dt>Type</dt><dd>Image-Based Assessment</dd></div><div><dt>Course</dt><dd>{details.course || "—"}</dd></div><div><dt>Questions</dt><dd>{validQuestions.length} / {details.count}</dd></div><div><dt>Marks</dt><dd>{total} / {details.totalMarks}</dd></div><div><dt>Passing Score</dt><dd>{settings.passingScore || details.passingScore}%</dd></div></dl>
          </section>
          <section className="ibqReviewPanel"><div className="ibqReviewPanelHead"><h2>Question Summary</h2><Link href="/assessments/create/content"><Pencil size={17}/> Edit</Link></div>
            <p className="ibqReviewSummary"><CheckCircle2 size={18}/> {validQuestions.length} completed image-based questions</p>
            <div className="ibqReviewQuestions">{Array.from({length:details.count},(_,index)=>{
              const q=questions[index];const complete=q && imageQuestionValid(q);
              return <div key={index}><span className={complete?"isComplete":""}><ImageIcon size={16}/>{index+1}. {q?.text?.trim() || "Question not completed"}</span><b>{q?.points || 0} mark(s)</b></div>;
            })}</div>
          </section>
        </div>
        {error&&<p className="ibqError" role="alert">{error}</p>}
        <div className="ibqReviewActions"><button type="button" onClick={()=>router.push("/assessments/create/evaluation")}><ChevronLeft size={18}/> Back</button><button type="button" className="ibqReviewPublish" disabled={busy} onClick={publish}><Send size={18}/> Publish Assessment</button></div>
      </div></div>
    </section></div>
  </main>;
}
