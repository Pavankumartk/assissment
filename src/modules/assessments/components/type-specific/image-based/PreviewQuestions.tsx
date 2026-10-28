"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2, ChevronDown, ChevronLeft, ChevronUp,
  ClipboardList, Eye, Image as PictureIcon, Pencil, ShieldCheck,
  SlidersHorizontal, Sparkles, Tag, Target, XCircle,
} from "lucide-react";
import Sidebar from "../../common/sidebar/page";
import Header from "../../common/header/Header";
import {
  assessmentStorage, getActiveAssessmentId, getAssessment, updateAssessment,
} from "@/modules/assessments/storage/assessment-storage";
import {
  IMAGE_CONTENT_KEY, imageCorrectIndices, imageDetails,
  imageQuestionStarted, imageQuestionValid, readImageDraft,
  type ImageQuestion,
} from "./image-based-data";
import "./image-based.css";
import "./image-based-preview.css";

type Filter = "all" | "complete" | "incomplete";
type Fold = "grading" | "feedback" | "settings";
const CONTENT_URL = "/assessments/create/content";

function asText(value?: string): string {
  return (value || "").trim();
}
function pointLabel(n: number): string {
  return `${n} ${n === 1 ? "Point" : "Points"}`;
}
function DisplaySwitch({ on }: { on: boolean }) {
  return <span className={`ibqpSwitch ${on ? "isOn" : ""}`} aria-label={on ? "On" : "Off"}>
    <span>{on ? "ON" : "OFF"}</span><i />
  </span>;
}
function SectionTitle({ name, icon, open, onClick, count }: {
  name: string; icon: ReactNode; open?: boolean;
  onClick?: () => void; count?: string;
}) {
  return <button type="button" className="ibqpSectionTitle" onClick={onClick} aria-expanded={onClick ? !!open : undefined}>
    <span className="ibqpTitleIcon">{icon}</span><strong>{name}</strong>
    {count && <small>{count}</small>}
    {onClick && (open ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
  </button>;
}
function FeedbackItem({ tone, title, content, icon }: {
  tone: "full" | "partial" | "zero" | "normal"; title: string;
  content?: string; icon: ReactNode;
}) {
  return <div className={`ibqpFeedbackItem ibqpFeedbackItem--${tone}`}>
    <div className="ibqpFeedbackHeading"><span className="ibqpFeedbackIcon">{icon}</span><b>{title}</b></div>
    <div className="ibqpFeedbackText">{asText(content) || "—"}</div>
  </div>;
}

export default function ImageBasedPreviewQuestions() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [questions, setQuestions] = useState<ImageQuestion[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [learnerMode, setLearnerMode] = useState(false);
  const [chosen, setChosen] = useState<Record<string, number[]>>({});
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<number,string>>>({});
  const [fold, setFold] = useState<Record<Fold, boolean>>({ grading: true, feedback: true, settings: true });
  const [error, setError] = useState("");
  const [details, setDetails] = useState({ count: 20, totalMarks: 40, title: "Image-Based Assessment", course: "", passingScore: 60 });

  useEffect(() => {
    const id = getActiveAssessmentId();
    const assessment = id ? getAssessment(id) : undefined;
    if (!assessment || assessment.typeCode !== "image-based") {
      router.replace("/assessments/create");
      return;
    }
    setDetails(imageDetails());
    setQuestions(readImageDraft().questions);
    setLoaded(true);
  }, [router]);

  const completeCount = questions.filter(imageQuestionValid).length;
  const savedMarks = questions.filter(imageQuestionValid).reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const allComplete = completeCount === details.count && questions.slice(0, details.count).every(imageQuestionValid);
  const marksMatch = savedMarks === details.totalMarks;
  const ready = allComplete && marksMatch;
  const entries = useMemo(() => questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => imageQuestionStarted(question))
    .filter(({ question }) => activeFilter === "all" || (activeFilter === "complete" ? imageQuestionValid(question) : !imageQuestionValid(question))),
  [questions, activeFilter]);

  const editQuestion = (index: number) => {
    try {
      const draft = readImageDraft();
      assessmentStorage.setItem(IMAGE_CONTENT_KEY, JSON.stringify({ ...draft, active: index, savedAt: new Date().toISOString() }));
    } catch { /* The current draft is still available to the editor. */ }
    router.push(CONTENT_URL);
  };
  const continueToEvaluation = () => {
    if (!allComplete) {
      setError(`Complete all ${details.count} Image-Based questions before continuing. Currently ${completeCount} are complete.`);
      return;
    }
    if (!marksMatch) {
      setError(`The completed questions total ${savedMarks} marks, but Details requires ${details.totalMarks}. Please correct the question points.`);
      return;
    }
    try {
      const draft = readImageDraft();
      assessmentStorage.setItem(IMAGE_CONTENT_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
      updateAssessment({ questions: completeCount, marks: savedMarks });
      router.push("/assessments/create/evaluation");
    } catch {
      setError("Could not save the Image-Based assessment. Return to Create Questions and save the draft.");
    }
  };
  const chooseOption = (q: ImageQuestion, index: number) => {
    const now = chosen[q.id] || [];
    const next = q.allowMultiple ? (now.includes(index) ? now.filter(n => n !== index) : [...now, index]) : [index];
    setChosen(previous => ({ ...previous, [q.id]: next }));
  };

  if (!loaded) return null;
  return <main className="ibqApp ibqpApp superAdminPage institutionAdminPage">
    <div className="dashboardLayout ibqLayout">
      <Sidebar />
      <section className="mainContent ibqMain">
        <div className="ibqHeader"><Header /></div>
        <div className="ibqScroll institutionScrollArea">
          <div className="ibqpPage pageContent institutionPageContent">
            <nav className="ibqpBreadcrumb" aria-label="Breadcrumb">
              <Link href="/assessments">Assessment</Link><span>»</span>
              <Link href="/assessments/create/details">Create Assessment</Link><span>»</span>
              <Link href={CONTENT_URL}>Create Questions</Link><span>»</span>
              <strong>Preview Questions</strong>
            </nav>

            <div className="ibqpIntro">
              <h1>Preview Questions</h1>
              <p>Review Your Questions Before Savings.</p>
            </div>
            <div className="ibqpTopRow">
              <div className="ibqpSummary">
                <div className="ibqpStat"><b>{details.count}</b><span>Questions</span></div>
                <div className="ibqpStat"><b>{details.totalMarks}</b><span>Marks</span></div>
                <div className="ibqpStat ibqpReady">
                  {ready ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  <span><b>{ready ? "Ready" : "Needs review"}</b><small>{ready ? "All good to continue" : `${completeCount}/${details.count} questions complete`}</small></span>
                </div>
              </div>
              <div className="ibqpActionsTop">
                <label className="ibqpFilter"><span className="sr-only">Filter questions</span>
                  <select value={activeFilter} onChange={event => setActiveFilter(event.target.value as Filter)}>
                    <option value="all">All Questions</option><option value="complete">Complete Questions</option><option value="incomplete">Incomplete Questions</option>
                  </select><ChevronDown size={18} />
                </label>
                <button type="button" className="ibqpLearnerButton" onClick={() => { setLearnerMode(v => !v); setChosen({}); setMatchingAnswers({}); }}>
                  <Eye size={20} /> {learnerMode ? "Admin Preview" : "Learner Preview"}
                </button>
              </div>
            </div>

            <div className="ibqpReviewPanel">
              {learnerMode && <div className="ibqpLearnerNotice"><Eye size={18} /> Learner Preview — select an answer to test the learner-facing question. Your selections are not saved.</div>}
              {entries.length === 0 ? <div className="ibqpEmpty">
                <PictureIcon size={32} /><h2>No questions to display</h2>
                <p>{questions.some(imageQuestionStarted) ? "No questions match your filter." : "Create an Image-Based question to see it here."}</p>
                <button type="button" onClick={() => router.push(CONTENT_URL)}>Back to Question</button>
              </div> : entries.map(({ question: q, index }) => {
                const valid = imageQuestionValid(q);
                const selected = chosen[q.id] || [];
                const correct = imageCorrectIndices(q);
                return <article className="ibqpQuestion" key={q.id || index}>
                  {!learnerMode && <div className="ibqpQuestionMeta">
                    <span>Image based : {pointLabel(q.points)}</span>
                    <span>Status : <b className={valid ? "ibqpSuccess" : "ibqpDanger"}>{valid ? "Complete" : "Incomplete"}</b></span>
                    <button type="button" onClick={() => editQuestion(index)}><Pencil size={16} /> Edit</button>
                  </div>}
                  <section className="ibqpQuestionText">
                    <h2>Questions {index + 1}</h2>
                    <p>{asText(q.text) || "Question text is missing"}</p>
                  </section>
                  {q.subtype === "image-matching" ? <section className="ibqpPanelSection ibqpMatchingSection">
                    <SectionTitle name="Picture and matching text" icon={<SlidersHorizontal size={18}/>} />
                    <div className="ibqpMatchingBody">
                      <div className="ibqpMatchingHead"><b>Image</b><b>Matching Word</b></div>
                      {(q.matchPairs||[]).map((pair,i)=> {
                        const allChoices=[...(q.matchPairs||[]).map(p=>p.text),...(q.matchExtras||[])];
                        const choices=q.shuffleTexts!==false ? [...allChoices].reverse() : allChoices;
                        return <div className="ibqpMatchingRow" key={i}>
                          <span className="ibqpMatchingImage"><b>{String.fromCharCode(65+i)}.</b><span>{pair.image?<img src={pair.image} alt={`Matching image ${i+1}`}/>:<PictureIcon size={22}/>}</span></span>
                          <label><span className="ibqpApp sr-only">Matching word for image {String.fromCharCode(65+i)}</span><select aria-label={`Matching word for image ${String.fromCharCode(65+i)}`} value={matchingAnswers[q.id]?.[i]||""} onChange={e=>setMatchingAnswers(prev=>({...prev,[q.id]:{...(prev[q.id]||{}),[i]:e.target.value}}))}><option value="">Choose...</option>{choices.map((text,j)=><option key={`${text}-${j}`} value={text}>{text}</option>)}</select></label>
                        </div>;
                      })}
                      <div className="ibqpMatchingShuffle">Shuffle the texts <DisplaySwitch on={q.shuffleTexts!==false}/></div>
                    </div>
                  </section> : <section className="ibqpQuestionImage">
                    <SectionTitle name="Question and Image" icon={<PictureIcon size={18} />} />
                    <div className="ibqpImageStage">{q.image ? <img src={q.image} alt={`Image for question ${index + 1}`} /> : <div className="ibqpMissingImage"><PictureIcon size={35} /><span>No image selected</span></div>}</div>
                    <div className="ibqpOptionGrid">{q.options.map((option, optionIndex) => {
                      const isChosen = selected.includes(optionIndex);
                      return <button key={optionIndex} type="button" className={`ibqpAnswer ${isChosen ? "isChosen" : ""}`} onClick={() => learnerMode && chooseOption(q, optionIndex)} disabled={!learnerMode}>
                        <span className={`ibqpRadio ${isChosen ? "isSelected" : ""}`} />
                        <span>{String.fromCharCode(65 + optionIndex)}. {asText(option.text) || "Untitled option"}</span>
                        {option.image && <img src={option.image} alt="" />}
                      </button>;
                    })}</div>
                    {!learnerMode && <div className="ibqpOptionsSettings">
                      <div><b>Allow more than one correct answer</b><label>More than one answer permission <DisplaySwitch on={!!q.allowMultiple} /></label></div>
                      <div><b>Shuffle</b><label>Shuffle Options <DisplaySwitch on={q.shuffleOptions !== false} /></label></div>
                    </div>}
                  </section>}
                  {!learnerMode && <>
                    <section className="ibqpPanelSection">
                      <SectionTitle name="Grading Method" icon={<ClipboardList size={19} />} open={fold.grading} onClick={() => setFold(p => ({ ...p, grading: !p.grading }))} />
                      {fold.grading && <div className="ibqpGradingBody">
                        <div className="ibqpGradingFields">
                          <div><label>Grading Method</label><span>{q.gradingMethod || q.grading || "Partial credit - equal marks"}<ChevronDown size={16} /></span></div>
                          <div><label>Points (total for Question)</label><span>{q.points}<ChevronDown size={16} /></span></div>
                          <div><label>Negative Marking</label><span>{q.negativeMarking || "NA"}<ChevronDown size={16} /></span></div>
                        </div>
                        <div className="ibqpGradeFloor">Calculate grade with a minimum score of 0 <DisplaySwitch on={q.minimumZero !== false} /></div>
                      </div>}
                    </section>
                    <section className="ibqpPanelSection">
                      <SectionTitle name={q.subtype === "image-matching" ? "Feedback and Learning" : "Feedback"} icon={<ShieldCheck size={18} />} count={`${(q.feedbackFull || q.feedback || "").length}/250`} open={fold.feedback} onClick={() => setFold(p => ({ ...p, feedback: !p.feedback }))} />
                      {fold.feedback && <div className="ibqpFeedbackList">
                        <FeedbackItem tone="full" title="Full Marks" content={q.feedbackFull || q.feedback} icon={<CheckCircle2 size={19} />} />
                        <FeedbackItem tone="partial" title="Partial Marks" content={q.feedbackPartial} icon={<Target size={19} />} />
                        <FeedbackItem tone="zero" title="Zero Marks" content={q.feedbackZero} icon={<XCircle size={19} />} />
                        <FeedbackItem tone="normal" title="Explanation" content={q.explanation} icon={<ClipboardList size={18} />} />
                        <FeedbackItem tone="normal" title="Hint" content={q.hint} icon={<Sparkles size={18} />} />
                      </div>}
                    </section>
                    <section className="ibqpPanelSection">
                      <SectionTitle name="Question Settings" icon={<SlidersHorizontal size={19} />} open={fold.settings} onClick={() => setFold(p => ({ ...p, settings: !p.settings }))} />
                      {fold.settings && <div className="ibqpQuestionSettings">
                        <div><label>Difficulty</label><span><Target size={18} />{q.difficulty || "—"}</span></div>
                        <div><label>Blooms Taxonomy</label><span><Sparkles size={18} />{q.bloom || "—"}</span></div>
                        <div><label>Category</label><span><PictureIcon size={18} />{q.category || "—"}</span></div>
                        <div><label>Tags</label><span><Tag size={18} />{q.tags?.join(", ") || "—"}</span></div>
                        <div><label>Mandatory</label><span className="ibqpMandatory"><CheckCircle2 size={18} />{q.mandatory ? "YES" : "NO"}</span></div>
                      </div>}
                    </section>
                  </>}
                </article>;
              })}
              {error && <p className="ibqpError" role="alert">{error}</p>}
              <div className="ibqpFooter">
                <button type="button" onClick={() => router.push(CONTENT_URL)}><ChevronLeft size={18} /> Back to Question</button>
                <button type="button" className="ibqpContinue" onClick={continueToEvaluation}>Save And Continue</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>;
}
