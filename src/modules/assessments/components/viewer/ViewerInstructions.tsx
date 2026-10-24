"use client";
import "@/modules/assessments/components/viewer/AssessmentViewer/viewer.css";

/** The same MCQ instruction cards, agreement and Start button for every viewer type. */
export type ViewerInstructionDetails = {
  totalQuestions: string;
  totalMarks: string;
  totalTime: string;
  passingScore: string;
  negativeMarking: string;
  instructions: string[];
};

const ICONS = "/assets/viewericons/";
const STAT_ITEMS = [
  { key: "totalQuestions", label: "Total Questions", icon: "list.svg", tone: "blue" },
  { key: "totalMarks", label: "Total Marks", icon: "star-award.svg", tone: "orange" },
  { key: "totalTime", label: "Total Time", icon: "alarm-clock.svg", tone: "purple" },
  { key: "passingScore", label: "Passing Score", icon: "checkmark-circle.svg", tone: "green" },
  { key: "negativeMarking", label: "Negative Marking", icon: "remove-circle.svg", tone: "red" },
] as const;

export default function ViewerInstructions({
  details, accepted, onAcceptedChange, onStart, canStart = true, unavailableMessage,
}: {
  details: ViewerInstructionDetails;
  accepted: boolean;
  onAcceptedChange: (checked: boolean) => void;
  onStart: () => void;
  canStart?: boolean;
  unavailableMessage?: string;
}) {
  return <div className="viewerColumns">
    <aside className="viewerSummary" aria-label="Assessment summary">
      {STAT_ITEMS.map(item => <div key={item.key} className={`viewerStat viewerStat--${item.tone}`}>
        <span className="viewerStatIcon"><img src={`${ICONS}${item.icon}`} width={24} height={24} alt="" aria-hidden="true" /></span>
        <div className="viewerStatText"><strong>{item.label}</strong><span>{details[item.key]}</span></div>
      </div>)}
    </aside>
    <div className="viewerRightColumn">
      <section className="viewerInstructions"><h2>Instructions</h2>
        <ol>{details.instructions.map((instruction, index) => <li key={`${index}-${instruction}`}>{index + 1}. {instruction}</li>)}</ol>
      </section>
      <section className="viewerConfirmation" aria-label="Confirm instructions">
        <label className="viewerAgreement">
          <input type="checkbox" checked={accepted} onChange={event => onAcceptedChange(event.target.checked)} />
          <span className="viewerCheckboxIcon">{accepted && <img src={"/assets/assessmenticons/checkmark-square-02.svg"} width={20} height={20} alt="" aria-hidden="true" />}</span>
          <span>I have read and understood the instructions</span>
        </label>
        <button type="button" className="viewerStart" disabled={!accepted || !canStart} onClick={onStart}>Start Assessment</button>
        {!canStart && unavailableMessage && <p className="viewerStartNote" role="alert">{unavailableMessage}</p>}
      </section>
    </div>
  </div>;
}
