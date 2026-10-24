"use client";
import WizardStepLink from "@/modules/assessments/components/common/WizardStepLink";
import {validateCompleteDetails, detailsFieldSections, type DetailsFieldErrors} from "@/modules/assessments/validation/details-full-validation";
import { assessmentStorage,updateAssessment } from "@/modules/assessments/storage/assessment-storage";
import { getAssessmentTypeGroups } from "@/modules/assessments/config/assessment-types";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Sidebar from "../../sidebar/page";
import Header from "../../header/Header";
import "./details.css";
import "@/modules/assessments/validation/details-validation.css";

const sections = [
  { title: "Basic Information", fields: [
    { label: "Assessment Title", name: "assessmentTitle", type: "text", placeholder: "Enter assessment title" },
    { label: "Description", name: "description", type: "textarea", placeholder: "Enter assessment description" },
    { label: "Instructions", name: "instructions", type: "textarea", placeholder: "Enter instructions for learners" },
  ] },
  { title: "Scoring & Grading", fields: [
    { label: "Total Marks", name: "totalMarks", type: "number", placeholder: "Enter total marks" },
    { label: "Passing Marks", name: "passingMarks", type: "number", placeholder: "Enter passing marks" },
    { label: "Grading Method", name: "gradingMethod", type: "select", placeholder: "Select grading method", options: ["Auto Graded", "Manual Grading", "Combined"] },
  ] },
  { title: "Timing & Availability", fields: [
    { label: "Duration (minutes)", name: "duration", type: "number", placeholder: "Enter duration" },
    { label: "Available From", name: "availableFrom", type: "datetime-local", placeholder: "" },
    { label: "Available Until", name: "availableUntil", type: "datetime-local", placeholder: "" },
  ] },
  { title: "Attempts & Access", fields: [
    { label: "Allowed Attempts", name: "attempts", type: "number", placeholder: "Enter allowed attempts" },
    { label: "Access", name: "access", type: "select", placeholder: "Select access", options: ["Enrolled Learners", "Assigned Learners", "All Learners"] },
  ] },
  { title: "Audience", fields: [
    { label: "Assign To", name: "audience", type: "select", placeholder: "Select audience", options: ["All Learners", "Selected Course", "Selected Batch", "Selected Group"] },
  ] },
] as const;

type FormData = Record<string, string>;


// Neumorphic date picker: day, month and year selectors are part of the same control.
function MCQCalendar({ label, value, disabled, onChange }: {
  label: string; value: string; disabled: boolean; onChange: (date: string) => void;
}) {
  const initial = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear] = useState(initial.getFullYear());
  const root = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 420, maxHeight: 420 });
  const positionPopup = useCallback(() => {
    if (!root.current) return;
    const r = root.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(420, viewportWidth - 24);
    const height = Math.min(400, viewportHeight - 24);
    const left = Math.max(12, Math.min(r.left, viewportWidth - width - 12));
    const below = viewportHeight - r.bottom - 12;
    const above = r.top - 12;
    const openBelow = below >= height || below >= above;
    const maxHeight = Math.max(130, Math.min(height, openBelow ? below - 8 : above - 8));
    const top = openBelow ? r.bottom + 8 : Math.max(8, r.top - maxHeight - 8);
    setPosition({ top, left, width, maxHeight });
  }, []);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearStart = Math.floor(year / 12) * 12;
  useEffect(() => {
    if (!visible) return;
    positionPopup();
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !popupRef.current?.contains(target)) setVisible(false);
    };
    const reposition = () => positionPopup();
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setVisible(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [visible, positionPopup]);
  const shift = (delta: number) => {
    if (mode === "years") setYear(y => y + delta * 12);
    else { const next = new Date(year, month + delta, 1); setMonth(next.getMonth()); setYear(next.getFullYear()); }
  };
  const offset = new Date(year, month, 1).getDay();
  const days = Array.from({ length: 35 + (offset + new Date(year, month + 1, 0).getDate() > 35 ? 7 : 0) }, (_, i) => new Date(year, month, i - offset + 1));
  return <div className="mcqCalendarRoot" ref={root}>
    <button type="button" className="mcqCalendarInput" disabled={disabled} aria-label={label} aria-expanded={visible}
      onClick={() => { setVisible(v => !v); setMode("days"); }}>
      <span>{value || label}</span><svg className="mcqCalendarGlyph" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.5 3.5v4M16.5 3.5v4M4 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8.5 13.5h2M13.5 13.5h2M8.5 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
    {visible && typeof document !== "undefined" && createPortal(
      <div ref={popupRef} className="mcqCalendarPopup" role="dialog" aria-label={`${label} calendar`}
        style={{ position: "fixed", top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight, zIndex: 99999 }}>
      <div className="mcqCalendarTop">
        <button type="button" className="mcqCalendarNav" aria-label="Previous" onClick={() => shift(-1)}><Image src="/assets/assessmenticons/arrowleft.svg" alt="" width={18} height={18} unoptimized /></button>
        <button type="button" className="mcqCalendarChoose" onClick={() => setMode(mode === "months" ? "days" : "months")}>{months[month]} <Image src="/assets/assessmenticons/arrow-down-01.svg" width={18} height={18} alt="" unoptimized /></button>
        <button type="button" className="mcqCalendarChoose mcqCalendarYearButton" onClick={() => setMode(mode === "years" ? "days" : "years")}>{year} <Image src="/assets/assessmenticons/arrow-down-01.svg" width={18} height={18} alt="" unoptimized /></button>
        <button type="button" className="mcqCalendarNav" aria-label="Next" onClick={() => shift(1)}><Image src="/assets/assessmenticons/arrowright.svg" alt="" width={18} height={18} unoptimized /></button>
      </div>
      {mode === "days" && <><div className="mcqCalendarWeek">{["Su","Mo","Tu","We","Th","Fr","Sa"].map(day => <span key={day}>{day}</span>)}</div>
        <div className="mcqCalendarDays">{days.map((day, i) => {
          const iso = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`;
          return <button key={i} type="button" className={`${day.getMonth() !== month ? "mcqCalendarMuted " : ""}${value === iso ? "mcqCalendarSelected" : ""}`} onClick={() => { onChange(iso); setVisible(false); }}>{day.getDate()}</button>;
        })}</div></>}
      {mode === "months" && <div className="mcqCalendarMonths">{months.map((name,i) => <button key={name} className={i === month ? "mcqCalendarSelected" : ""} type="button" onClick={() => { setMonth(i); setMode("days"); }}>{name}</button>)}</div>}
      {mode === "years" && <><div className="mcqCalendarYearNav"><button type="button" aria-label="Previous years" onClick={() => setYear(y => y - 12)}><Image src="/assets/assessmenticons/arrowleft.svg" alt="" width={18} height={18} unoptimized /></button><strong>{yearStart} - {yearStart + 11}</strong><button type="button" aria-label="Next years" onClick={() => setYear(y => y + 12)}><Image src="/assets/assessmenticons/arrowright.svg" alt="" width={18} height={18} unoptimized /></button></div><div className="mcqCalendarYears">{Array.from({length:12},(_,i) => yearStart+i).map(y => <button type="button" className={y===year ? "mcqCalendarSelected" : ""} key={y} onClick={() => { setYear(y); setMode("days"); }}>{y}</button>)}</div></>}
    </div>, document.body)}
  </div>;
}


// Reference dropdowns: exact label groups with the existing neumorphic radio style.
const assessmentNames = [
  "Introduction to Artificial Intelligence", "AI Fundamentals", "Artificial Intelligence Basics",
  "AI Concepts & Principles", "Introduction to Machine Learning", "Machine Learning Fundamentals",
  "Neural Networks Basics", "Deep Learning Fundamentals", "Generative AI Essentials",
  "Prompt Engineering Basics", "AI Ethics & Responsible AI", "AI Applications & Use Cases",
  "AI Knowledge Check", "AI Fundamentals Quiz", "Artificial Intelligence Final Assessment",
];
const courseDropdownGroups = [
  { heading: "By Category", items: ["Academic", "Corporate Training", "Professional Development", "Compliance", "Technical", "Soft Skills", "Language Learning", "Certification", "Vocational / Skills Training", "Continuing Education"] },
  { heading: "Courses", items: ["Java Development", "Python Programming", "Data Structures & Algorithms", "Artificial Intelligence", "Machine Learning", "Cybersecurity", "Cloud Computing", "Project Management", "Leadership & Management", "Employee Onboarding", "Workplace Safety", "Communication Skills"] },
  { heading: "By Program", items: ["Undergraduate", "Postgraduate", "Diploma", "Certificate", "Professional Certification", "Employee Training"] },
  { heading: "By Organization", items: ["All Organizations", "Organization A", "Organization B", "Organization C"] },
];
const moduleDropdownGroups = [
  { heading: "MODULE 1 — Introduction to AI", items: ["Unit 1.1 — What is Artificial Intelligence?", "Unit 1.2 — History of AI", "Unit 1.3 — AI Types & Applications", "Unit 1.4 — AI Ethics & Responsible AI"] },
  { heading: "MODULE 2 — Machine Learning Basics", items: ["Unit 2.1 — ML Fundamentals", "Unit 2.2 — Supervised Learning", "Unit 2.3 — Unsupervised Learning", "Unit 2.4 — Model Evaluation"] },
  { heading: "MODULE 3 — AI Fundamentals", items: ["Unit 3.1 — AI Concepts", "Unit 3.2 — AI Problem Solving", "Unit 3.3 — Search & Decision Making", "Unit 3.4 — Knowledge Representation", "Unit 3.5 — AI Reasoning"] },
  { heading: "MODULE 4 — Neural Networks", items: ["Unit 4.1 — Neural Network Basics", "Unit 4.2 — Neurons & Activation Functions", "Unit 4.3 — Training Neural Networks", "Unit 4.4 — Deep Learning"] },
  { heading: "MODULE 5 — Generative AI", items: ["Unit 5.1 — Generative AI Basics", "Unit 5.2 — Large Language Models", "Unit 5.3 — Prompt Engineering", "Unit 5.4 — AI Content Generation", "Unit 5.5 — Generative AI Safety"] },
  { heading: "MODULE 6 — AI Applications", items: ["Unit 6.1 — AI in Business", "Unit 6.2 — AI in Healthcare", "Unit 6.3 — AI in Education", "Unit 6.4 — Real-World AI Case Studies"] },
];

type MCQDropdownKind = "assessmentName" | "assessmentType" | "course" | "module" | "simple";
function MCQReferenceDropdown({ label, kind, value, onChange, wide = false, options = [], disabled = false, compact = false, hideLabel = false, error }: {
  label: string; kind: MCQDropdownKind; value: string;
  onChange: (value: string) => void; wide?: boolean; options?: string[]; disabled?: boolean; compact?: boolean; hideLabel?: boolean; error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(kind === "course" ? ["Courses"] : kind === "assessmentType" ? ["Academic assessment"] : kind === "module" ? ["MODULE 3 — AI Fundamentals"] : []);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    const esc = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", esc); };
  }, [open]);
  const groups = kind === "assessmentType" ? getAssessmentTypeGroups(true) : kind === "course" ? courseDropdownGroups : moduleDropdownGroups;
  const single = kind === "assessmentName" || kind === "simple";
  const singleItems = kind === "simple" ? options : assessmentNames;
  const display = value ? (kind === "assessmentType" && value === "Multiple Choice Question (MCQ)" ? "MCQ" : value) : `Select ${label.toLowerCase()}`;
  const selected = (item: string) => value === item || (kind === "assessmentType" && value === "MCQ" && item === "Multiple Choice Question (MCQ)");
  const choose = (item: string) => { onChange(item); setOpen(false); setQuery(""); };
  const matches = (item: string) => item.toLowerCase().includes(query.toLowerCase());
  return (
    <div className={`${hideLabel ? "" : "mcqField"} ${wide ? "mcqFieldWide" : ""} mcqReferenceField ${compact ? "mcqReferenceCompact" : ""}`} ref={ref}>
      {!hideLabel && <span>{label}</span>}
      <button type="button" disabled={disabled} className={`mcqReferenceTrigger ${error ? "mcqDetailsInvalid" : ""}`} aria-label={label} aria-invalid={Boolean(error)} aria-expanded={open} onClick={() => setOpen(v => !v)}>
        <span>{display}</span><Image src="/assets/assessmenticons/arrow-down-01.svg" width={20} height={20} alt="" unoptimized />
      </button>
      {open && <div className="mcqReferenceMenu" role="group" aria-label={`${label} options`}>
        {kind === "course" && <div className="mcqReferenceMenuTitle">All Courses</div>}
        {(kind === "course" || kind === "assessmentName" || kind === "assessmentType" || kind === "module") &&
          <label className="mcqReferenceSearch"><Image src="/assets/assessmenticons/search-02.svg" width={17} height={17} alt="" unoptimized />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder={kind === "course" ? "Search courses..." : kind === "assessmentType" ? "Search assessment types..." : kind === "module" ? "Search modules and units..." : "Search assessment name..."} aria-label={`Search ${label}`} />
          </label>}
        {kind === "course" && <button type="button" className="mcqReferenceOption" onClick={() => choose("All Courses")}>
          <span className={`mcqReferenceRadio ${(value === "All Courses") ? "is-selected" : ""}`} aria-hidden="true" /><span>All Courses</span>
        </button>}
        {single ? singleItems.filter(matches).map(item => (
          <button type="button" key={item} className="mcqReferenceOption" role="radio" aria-checked={selected(item)} onClick={() => choose(item)}>
            <span className={`mcqReferenceRadio ${selected(item) ? "is-selected" : ""}`} aria-hidden="true" /><span>{item}</span>
          </button>
        )) : groups.map(group => {
          const filtered = group.items.filter(matches);
          if (query && !filtered.length && !matches(group.heading)) return null;
          const expanded = !!query || expandedGroups.includes(group.heading);
          return <div className="mcqReferenceGroup" key={group.heading}>
            {<button type="button" className="mcqReferenceHeading mcqReferenceHeadingButton" aria-expanded={expanded}
                onClick={() => setExpandedGroups(old => old.includes(group.heading) ? old.filter(g => g !== group.heading) : [...old, group.heading])}>
              {group.heading}<Image src="/assets/assessmenticons/arrow-down-01.svg" width={18} height={18} alt="" className={expanded ? "mcqReferenceArrowOpen" : ""} unoptimized />
            </button>}
            {expanded && (filtered.length ? filtered : (matches(group.heading) ? group.items : [])).map(item => (
              <button type="button" key={item} className="mcqReferenceOption" role="radio" aria-checked={selected(item)} onClick={() => choose(item)}>
                <span className={`mcqReferenceRadio ${selected(item) ? "is-selected" : ""}`} aria-hidden="true" /><span>{item}</span>
              </button>
            ))}
          </div>;
        })}
      </div>}
      {error && <p className="mcqDetailsError" role="alert">{error}</p>}
    </div>
  );
}

// Keep the original single time field. Show separate HH/MM lists only inside its popup.
function MCQTimePicker({ label, value, onChange, disabled }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState({ top: 0, left: 0, width: 218, maxHeight: 240 });
  const [hours = "00", minutes = "00"] = value.split(":");
  const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
  const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

  const placePopup = useCallback(() => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const width = Math.min(rect.width, window.innerWidth - 24);
    const maxHeight = Math.min(232, Math.max(100, window.innerHeight - 24));
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const showBelow = below >= maxHeight || below >= above;
    const available = Math.max(72, Math.min(maxHeight, (showBelow ? below : above) - 8));
    const top = showBelow ? rect.bottom + 7 : Math.max(8, rect.top - available - 7);
    setPopup({ top, left, width, maxHeight: available });
  }, []);

  useEffect(() => {
    if (!open || disabled) return;
    placePopup();
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", placePopup);
    window.addEventListener("scroll", placePopup, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", placePopup);
      window.removeEventListener("scroll", placePopup, true);
    };
  }, [open, disabled, placePopup]);

  return (
    <div className="mcqSeparateTime" ref={rootRef}>
      <button type="button" className="mcqSingleTimeTrigger" aria-label={label}
        aria-expanded={open} disabled={disabled} onClick={() => setOpen(previous => !previous)}>
        <span>{value || label}</span>
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 6.5v6l4 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && !disabled && typeof document !== "undefined" && createPortal(
        <div ref={popupRef} className="mcqTimePopup" role="group" aria-label={`${label} hours and minutes`}
          style={{ position: "fixed", top: popup.top, left: popup.left, width: popup.width, height: popup.maxHeight, maxHeight: popup.maxHeight, zIndex: 99999 }}>
          <div className="mcqTimeColumn">
            <strong>HH</strong>
            <div className="mcqTimeOptions" role="listbox" aria-label={`${label} hours`}>
              {hourOptions.map(hour => <button type="button" role="option" aria-selected={hours === hour}
                className={hours === hour ? "mcqTimeSelected" : ""} key={hour}
                onClick={() => onChange(`${hour}:${minutes}`)}>{hour}</button>)}
            </div>
          </div>
          <div className="mcqTimeColumn">
            <strong>MM</strong>
            <div className="mcqTimeOptions" role="listbox" aria-label={`${label} minutes`}>
              {minuteOptions.map(minute => <button type="button" role="option" aria-selected={minutes === minute}
                className={minutes === minute ? "mcqTimeSelected" : ""} key={minute}
                onClick={() => { onChange(`${hours}:${minute}`); setOpen(false); }}>{minute}</button>)}
            </div>
          </div>
        </div>, document.body)}
    </div>
  );
}


// Inline learner accommodation manager; stays within the existing MCQ accordion.
type AccommodationRecord = { learner: string; id: string; extraTime: string; accommodation: string };
const LEARNER_DIRECTORY = [
  { name: "Ananya Sharma", id: "S001", section: "Section A", extraTime: "+50%", department: "Computer Science", program: "B.Tech" },
  { name: "Rahul Kumar", id: "S002", section: "Section A", extraTime: "+25%", department: "Computer Science", program: "B.Tech" },
  { name: "Priya Nair", id: "S003", section: "Section A", extraTime: "+60%", department: "Computer Science", program: "B.Tech" },

];
function AccommodationDropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="mcqAddLearnerField mcqAccommodationDropdown" ref={root}>
    <label>{label}</label><button type="button" className="mcqAddLearnerSelect" aria-expanded={open} onClick={() => setOpen(v => !v)}><span>{value}</span><Image src="/assets/assessmenticons/arrow-down-01.svg" width={18} height={18} alt="" unoptimized /></button>
    {open && <div className="mcqAddLearnerChoices" role="radiogroup" aria-label={label}>{options.map(option => <button key={option} type="button" role="radio" aria-checked={value === option} onClick={() => { onChange(option); setOpen(false); }}><span className={`mcqAddLearnerRadio ${option === value ? "selected" : ""}`} aria-hidden="true" />{option}</button>)}</div>}
  </div>;
}
function AccommodationManager({ rows, setRows, assessmentTitle, duration, totalMarks, batch }: {
  rows: AccommodationRecord[];
  setRows: React.Dispatch<React.SetStateAction<AccommodationRecord[]>>;
  assessmentTitle: string; duration: string; totalMarks: string; batch: string;
}) {
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"extra" | "excluded">("extra");
  const [excludedSelected, setExcludedSelected] = useState<string[]>(() => rows.map(row => row.learner));
  const [excludeReason, setExcludeReason] = useState("Scheduled Conflict");
  const [excludeUntil, setExcludeUntil] = useState("Whole assessment");
  const [excludeNotes, setExcludeNotes] = useState("");
  const [notifyExcluded, setNotifyExcluded] = useState(true);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("All section");
  const [show, setShow] = useState("All learners");
  const [department, setDepartment] = useState("All departments");
  const [program, setProgram] = useState("All Program");
  const [selected, setSelected] = useState<string[]>(() => rows.map(row => row.learner));
  const [page, setPage] = useState(0);
  const [extraType, setExtraType] = useState("% of time limit");
  const [extraValue, setExtraValue] = useState("50");
  const [accommodation, setAccommodation] = useState("Extended Time");
  const [breakValue, setBreakValue] = useState("50");
  const [reason, setReason] = useState("Learning Disability");
  const [validFor, setValidFor] = useState("this assessment only");
  const [notes, setNotes] = useState("");
  const [notify, setNotify] = useState(true);
  const [customize, setCustomize] = useState(true);
  const [supportingFile, setSupportingFile] = useState("");
  const activeSelected = tab === "excluded" ? excludedSelected : selected;
  const setActiveSelected = tab === "excluded" ? setExcludedSelected : setSelected;
  const toggleLearner = (name: string) => setActiveSelected(previous => previous.includes(name) ? previous.filter(v => v !== name) : [...previous, name]);
  const clearAll = () => { if (tab === "excluded") setExcludedSelected([]); else { setSelected([]); setRows([]); } };
  const saveLearners = () => {
    setRows(previous => LEARNER_DIRECTORY.filter(l => selected.includes(l.name)).map((l, index) => ({
      learner: l.name,
      id: previous.find(record => record.learner === l.name)?.id || l.id || `S${String(index + 1).padStart(3, "0")}`,
      extraTime: extraType === "% of time limit" ? `+${extraValue || 0}%` : `+${extraValue || 0} min`,
      accommodation
    })));
    setAdding(false);
  };
  const matches = LEARNER_DIRECTORY.filter(l => [l.name, l.id, l.section, activeSelected.includes(l.name) ? (tab === "excluded" ? "Provided" : "Added") : "—", activeSelected.includes(l.name) ? "already added" : "not yet added"].some(value => value.toLowerCase().includes(search.trim().toLowerCase())) && (section === "All section" || section === l.section) && (department === "All departments" || department === l.department || (department === "IT" && l.department === "Information Technology")) && (program === "All Program" || (program === "B.tech CS" && l.program === "B.Tech" && l.department === "Computer Science") || (program === "B.tech IT" && l.program === "B.Tech" && l.department === "Information Technology")) && (show === "All learners" || (show === "already added" ? activeSelected.includes(l.name) : !activeSelected.includes(l.name))));
  const pageCount = Math.max(1, Math.ceil(matches.length / 14));
  const visible = matches.slice(Math.min(page, pageCount - 1) * 14, (Math.min(page, pageCount - 1) + 1) * 14);
  if (!adding) return <div className="mcqAccommodation">
    <div className="mcqAccommodationTop"><label><Image src="/assets/assessmenticons/search-02.svg" alt="" width={18} height={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Learner....." /></label><button type="button" onClick={() => {setSelected(rows.map(r => r.learner));setAdding(true);}}>Add Learners <Image src="/assets/assessmenticons/plus.svg" alt="" width={16} height={16}/></button></div>
    <div className="mcqAccommodationTable" role="table" aria-label="Extra Time Accommodations"><div className="mcqAccommodationHead" role="row"><span role="columnheader">Learner</span><span role="columnheader">ID</span><span role="columnheader">Extra Time</span><span role="columnheader">Accommodation</span><span role="columnheader">Action</span></div>
    {rows.filter(r => [r.learner, r.id, r.extraTime, r.accommodation].some(value => value.toLowerCase().includes(search.toLowerCase()))).map(r => <div className="mcqAccommodationRow" role="row" key={r.learner}><span role="cell" className="mcqLearnerName">{r.learner}</span><span role="cell">{r.id}</span><span role="cell">{r.extraTime}</span><span role="cell">{r.accommodation}</span><span role="cell"><button type="button" className="mcqAccommodationRemove" onClick={() => {setRows(prev => prev.filter(v => v.learner !== r.learner));setSelected(prev => prev.filter(v => v !== r.learner));}}>Remove</button></span></div>)}
    {!rows.some(r => [r.learner, r.id, r.extraTime, r.accommodation].some(value => value.toLowerCase().includes(search.toLowerCase()))) && <p className="mcqAccommodationEmpty">No learners found.</p>}</div>
  </div>;
  return typeof document !== "undefined" ? createPortal(<div className="mcqAddLearnersFullscreen" role="dialog" aria-modal="true" aria-label="Add Learners"><div className="mcqAddLearnersInline">
    <div className="mcqAddLearnersHeader"><button type="button" className="mcqAddLearnersBack" onClick={() => setAdding(false)}><Image src="/assets/assessmenticons/leftlong.svg" width={20} height={20} alt="" unoptimized/>Back</button><h3>Add Learners</h3></div>
    <div className="mcqAddLearnersTabs"><button type="button" className={tab === "extra" ? "selected" : ""} onClick={() => {setTab("extra");setPage(0);setShow("All learners");}}>Extra time /accommodation</button><button type="button" className={tab === "excluded" ? "selected" : ""} onClick={() => {setTab("excluded");setPage(0);setShow("All learners");}}>Excluded Learners</button></div>
    <p className="mcqAddLearnersSubtitle">{assessmentTitle || "Introduction to AI"} · MCQ · {duration || "30"} min · {totalMarks || "40"} marks · {batch || "2026 — Batch A"}</p>
    <div className="mcqAddLearnersColumns"><section className="mcqAddLearnersPanel"><h4>1. Find Learners</h4>
      <div className="mcqAddLearnersFilters"><div className="mcqAddLearnerField"><label htmlFor="mcqLearnerFind">Search</label><div className="mcqAddLearnerSearch"><Image src="/assets/assessmenticons/search-02.svg" width={19} height={19} alt="" unoptimized/><input id="mcqLearnerFind" placeholder="Name or ID " value={search} onChange={e => {setSearch(e.target.value);setPage(0);}} /></div></div>
      <AccommodationDropdown label="Section / class" options={["All section","Section A","Section B","Generate with AI"]} value={section} onChange={v => {setSection(v);setPage(0);}}/><AccommodationDropdown label="Show" options={["All learners","not yet added","already added"]} value={show} onChange={v => {setShow(v);setPage(0);}}/><AccommodationDropdown label="Department" options={["All departments","Computer Science","IT"]} value={department} onChange={v => {setDepartment(v);setPage(0);}}/><AccommodationDropdown label="Program" options={["All Program","B.tech CS","B.tech IT"]} value={program} onChange={v => {setProgram(v);setPage(0);}}/></div>
      <div className="mcqAddLearnersTableScroll"><table className="mcqAddLearnersTable"><thead><tr><th><input type="checkbox" aria-label="Select visible learners" checked={visible.length>0&&visible.every(l=>activeSelected.includes(l.name))} onChange={e=>setActiveSelected(prev => e.target.checked ? [...new Set([...prev,...visible.map(l=>l.name)])] : prev.filter(name=>!visible.some(l=>l.name===name)))} /></th><th>Learner</th><th>ID</th><th>Section</th><th>Status</th></tr></thead><tbody>{visible.map(l => <tr key={l.name}><td><input type="checkbox" checked={activeSelected.includes(l.name)} aria-label={`Select ${l.name}`} onChange={()=>toggleLearner(l.name)} /></td><td className="mcqAddLearnerLink">{l.name}</td><td>{l.id}</td><td>{l.section}</td><td className={activeSelected.includes(l.name)?(tab === "excluded" ? "mcqLearnerProvided" : "mcqLearnerAdded"):""}>{activeSelected.includes(l.name)?(tab === "excluded" ? "Provided" : "Added"):"—"}</td></tr>)}{!visible.length&&<tr><td colSpan={5}>No learners found.</td></tr>}</tbody></table></div>
      <div className="mcqAddLearnersPagination"><span>Showing {matches.length ? Math.min(page,pageCount-1)*14+1 : 0} to {Math.min((Math.min(page,pageCount-1)+1)*14,matches.length)} of {matches.length}</span><div><button type="button" disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} aria-label="Previous page"><Image src="/assets/assessmenticons/arrowleft.svg" width={18} height={18} alt="" unoptimized/></button><strong>{Math.min(page,pageCount-1)+1}</strong><button type="button" disabled={page>=pageCount-1} onClick={()=>setPage(p=>Math.min(pageCount-1,p+1))} aria-label="Next page"><Image src="/assets/assessmenticons/arrowright.svg" width={18} height={18} alt="" unoptimized/></button></div></div>
    </section><section className="mcqAddLearnersPanel"><h4>2. {tab === "excluded" ? "Excluded Learners" : "Set Accommodation"}</h4>
      <div className="mcqAddLearnersSelectedHeading"><strong>Selected Learners ({activeSelected.length})</strong><button type="button" onClick={clearAll}>Clear all</button></div><p className="mcqAddLearnersHelp">{activeSelected.length ? tab === "excluded" ? "added. Tick learners on the left to add more" : "Tick learners on the left to update your selection" : "none yet. Tick learners on the left"}</p>
      <div className="mcqAddLearnerChips">{activeSelected.map(name=><button key={name} type="button" onClick={()=>toggleLearner(name)}>{name}<span aria-hidden="true"><Image src="/assets/assessmenticons/bluecircle.svg" width={14} height={14} alt="" unoptimized/></span></button>)}</div>
      {tab === "excluded" ? <>
      <div className="mcqExcludedSettings">
        <AccommodationDropdown label="Reason" options={["Scheduled Conflict","Learning Disability","Medical","Language Support","Other"]} value={excludeReason} onChange={setExcludeReason}/>
        <AccommodationDropdown label="Exclude Until" options={["Whole assessment","Pick the date","On leave","Other"]} value={excludeUntil} onChange={setExcludeUntil}/>
        {excludeUntil === "Pick the date" && <div className="mcqAddLearnerField"><label htmlFor="mcqExcludeDate">Exclusion date</label><input id="mcqExcludeDate" type="date"/></div>}
        <div className="mcqAddLearnerField"><label htmlFor="mcqExcludeNotes">Notes (Optional)</label><textarea id="mcqExcludeNotes" rows={3} value={excludeNotes} placeholder="Add note here....." onChange={e=>setExcludeNotes(e.target.value)} /></div>
        <p className="mcqAddLearnersInfo">Excluded learners cannot see or start this assessment. An extra-time accommodation is kept but won't apply while they are excluded.</p>
        <div className="mcqAddLearnerToggle"><span>Notify excluded learner</span><button type="button" role="switch" aria-checked={notifyExcluded} onClick={()=>setNotifyExcluded(v=>!v)} className={`mcqSwitch ${notifyExcluded?"mcqSwitchOn":""}`}><span className="mcqSwitchState">{notifyExcluded?"ON":"OFF"}</span><span className="mcqSwitchKnob"/></button></div>
      </div><div className="mcqAddLearnersActions"><button type="button" onClick={()=>setAdding(false)}>Cancel</button><button type="button" className="mcqAddLearnersApply" onClick={()=>setAdding(false)}>Save Excluded Learners</button></div>
      </> : <>
      <div className="mcqAddLearnersSettings"><AccommodationDropdown label="Extra time type" options={["% of time limit","Fixed Time"]} value={extraType} onChange={setExtraType}/><div className="mcqAddLearnerField"><label htmlFor="mcqExtraTimeValue">Extra time {extraType==="Fixed Time"?"(minutes)":"(%)"}</label><input id="mcqExtraTimeValue" type="number" min="0" value={extraValue} onChange={e=>setExtraValue(e.target.value)}/></div>
      <p className="mcqAddLearnersInfo">{extraType === "% of time limit" ? `${duration||"30"} min · ${Math.round(Number(duration||30)*(1+Number(extraValue||0)/100))} min per learner (+ ${Math.round(Number(duration||30)*Number(extraValue||0)/100)} min). applies to every attempt` : `Extra ${extraValue||0} minutes per learner. Applies to every attempt.`}</p>
      <AccommodationDropdown label="Accommodation" options={["Extended Time","Extra Break","Screen reader","Large text","Separate room"]} value={accommodation} onChange={setAccommodation}/><div className="mcqAddLearnerField"><label htmlFor="mcqBreakValue">Extra Break (+5 min)</label><div className="mcqBreakStepper"><input id="mcqBreakValue" type="number" min="0" value={breakValue} onChange={e=>setBreakValue(e.target.value)}/><div className="mcqBreakStepperButtons"><button type="button" aria-label="Increase extra break" onClick={()=>setBreakValue(v=>String((Number(v)||0)+1))}><Image src="/assets/assessmenticons/arrow-down-01.svg" width={14} height={14} alt="" className="mcqBreakArrowUp" unoptimized/></button><button type="button" aria-label="Decrease extra break" onClick={()=>setBreakValue(v=>String(Math.max(0,(Number(v)||0)-1)))}><Image src="/assets/assessmenticons/arrow-down-01.svg" width={14} height={14} alt="" unoptimized/></button></div></div></div>
      <AccommodationDropdown label="Reason" options={["Learning Disability","Medical","Language Support","Other"]} value={reason} onChange={setReason}/><AccommodationDropdown label="Valid for" options={["this assessment only","All Mcq in this course","Language Support","Other"]} value={validFor} onChange={setValidFor}/>
      <div className="mcqAddLearnerField mcqAddLearnerFull"><label htmlFor="mcqExtraNotes">Notes (admins only)</label><textarea id="mcqExtraNotes" rows={3} value={notes} placeholder="Add note here....." onChange={e=>setNotes(e.target.value)} /></div>
      <div className="mcqAddLearnerField mcqAddLearnerFull"><label>Supporting Documents</label><label className="mcqAddLearnerAttach"><input type="file" onChange={e=>setSupportingFile(e.target.files?.[0]?.name||"")}/><span><Image src="/assets/assessmenticons/attachment.svg" width={17} height={17} alt="" unoptimized/>Attach</span><small>{supportingFile || "No file chosen"}</small></label></div>
      <div className="mcqAddLearnerFull mcqAddLearnerToggle"><span>Notify Learners by Emails</span><button type="button" role="switch" aria-checked={notify} onClick={()=>setNotify(v=>!v)} className={`mcqSwitch ${notify?"mcqSwitchOn":""}`}><span className="mcqSwitchState">{notify?"ON":"OFF"}</span><span className="mcqSwitchKnob"/></button></div>
      <div className="mcqAddLearnerFull mcqAddLearnerToggle"><span>Customize each learners</span><button type="button" role="switch" aria-checked={customize} onClick={()=>setCustomize(v=>!v)} className={`mcqSwitch ${customize?"mcqSwitchOn":""}`}><span className="mcqSwitchState">{customize?"ON":"OFF"}</span><span className="mcqSwitchKnob"/></button></div>
      </div><div className="mcqAddLearnersActions"><button type="button" onClick={()=>setAdding(false)}>Cancel</button><button type="button" className="mcqAddLearnersApply" onClick={saveLearners}>Apply to Selected Learners</button></div>
      </>}
    </section></div>
  </div></div>, document.body) : null;
}

export default function MCQDetailsPage({ draftKey = "mcqAssessmentDraft", countKey = "mcqQuestionCount", typeLabel = "MCQ" }: { draftKey?: string; countKey?: string; typeLabel?: string } = {}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number[]>([]);
  // Review Edit: open the exact Details accordion, then scroll it into view.
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("reviewSection");
    if (raw === null || !/^[0-4]$/.test(raw)) return;
    const index = Number(raw);
    setExpanded([index]);
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(`mcq-review-target-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const [form, setForm] = useState<FormData>({});
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<DetailsFieldErrors>({});
  const [invalidSection, setInvalidSection] = useState<number | null>(null);
  const [hydrated,setHydrated] = useState(false);
  useEffect(()=>{
    try {
      const saved=JSON.parse(assessmentStorage.getItem(draftKey)||"null");
      if(saved && typeof saved==="object") {
        const {tags:savedTags,markingScheme:savedMarking,negativeMarking:savedNegative,gradeToPass:savedGrade,partialCredit:savedPartial,toggles:savedToggles,...fields}=saved;
        setForm(fields);
        if(Array.isArray(savedTags)) setTags(savedTags);
        if(typeof savedMarking==="string") setMarkingScheme(savedMarking);
        if(typeof savedNegative==="boolean") setNegativeMarking(savedNegative);
        if(typeof savedGrade==="boolean") setGradeToPass(savedGrade);
        if(typeof savedPartial==="boolean") setPartialCredit(savedPartial);
        if(savedToggles && typeof savedToggles==="object") setToggles(previous=>({...previous,...savedToggles}));
      }
    } catch { /* Keep unchanged defaults. */ }
    setHydrated(true);
  },[]);

  const [accommodationRows, setAccommodationRows] = useState<{learner:string;id:string;extraTime:string;accommodation:string}[]>([]);
  const [markingScheme, setMarkingScheme] = useState("");
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [gradeToPass, setGradeToPass] = useState(true);
  const [partialCredit, setPartialCredit] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [tagText, setTagText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  // Restore saved rich text only when its accordion becomes visible.
  useEffect(() => {
    if (expanded.includes(0) && editorRef.current && !editorRef.current.innerHTML && form.descriptionInstructions) {
      editorRef.current.innerHTML = form.descriptionInstructions;
    }
  }, [expanded, form.descriptionInstructions]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    timeLimit: true, perQuestionTimer: false, availableFrom: true, availableUntil: true,
    lateSubmission: true, accessCode: true, browserLockdown: true,
    webcamProctoring: true, prerequisite: true, notifyLearners: true,
  });
  const flip = (key: string) => setToggles(previous => ({ ...previous, [key]: !previous[key] }));
  useEffect(()=>{
    if(!hydrated) return;
    const data={...form,tags,markingScheme,negativeMarking,gradeToPass,partialCredit,toggles};
    try { assessmentStorage.setItem(draftKey,JSON.stringify(data)); }catch{}
    updateAssessment({ title:(form.assessmentName||form.assessmentTitle||"Untitled Assessment").trim(), course:form.course??"", questions:Number(form.questionCount)||0, marks:Number(form.totalMarks)||0 });
  },[hydrated,form,tags,markingScheme,negativeMarking,gradeToPass,partialCredit,toggles]);



  const update = (name: string, value: string) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    if (name === "questionCount" && /^\d+$/.test(value) && Number(value) >= 1) { try { assessmentStorage.setItem(countKey, String(Number(value))); } catch {} }
    setMessage("");
    setFieldErrors(previous => { if (!previous[name]) return previous; const next = {...previous}; delete next[name]; return next; });
    setInvalidSection(null);
  };

  const fieldError = (name: string) => fieldErrors[name] ? <p className="mcqDetailsError" role="alert">{fieldErrors[name]}</p> : null;
  const clearFieldErrors = (...names: string[]) => setFieldErrors(previous => {
    if (!names.some(name => previous[name])) return previous;
    const next = { ...previous };
    names.forEach(name => delete next[name]);
    return next;
  });

  const toggleSection = (index: number) => {
    setExpanded((previous) => previous.includes(index) ? [] : [index]);
  };

  const basicField = (label: string, name: string, values: string[], wide = false) => (
    <MCQReferenceDropdown key={name} label={label} kind="simple"
      value={form[name] ?? ""} options={values}
      onChange={value => update(name, value)} wide={wide} error={fieldErrors[name]} />
  );

  // A single inset control with stacked up/down buttons; unlike a dropdown,
  // numeric values can be typed or stepped without changing the field layout.
  const numberField = (label: string, name: string, initial: number, min = 0) => {
    const current = form[name] ?? "";
    const stepValue = (direction: number) => {
      const numeric = current === "" ? 0 : Number(current);
      update(name, String(Math.max(min, (Number.isFinite(numeric) ? numeric : 0) + direction)));
    };
    return (
      <div className="mcqField mcqNumericField" key={name}>
        <label htmlFor={`mcq-${name}`}>{label}</label>
        <div className="mcqNumberControl">
          <input
            id={`mcq-${name}`}
            type="number"
            min={min}
            step="1"
            value={current}
            onChange={(event) => update(name, event.target.value)}
            aria-label={label}
            aria-invalid={Boolean(fieldErrors[name])}
          />
          <div className="mcqNumberSteppers">
            <button type="button" aria-label={`Increase ${label}`} onClick={() => stepValue(1)}>
              <Image src="/assets/assessmenticons/arrow-down-01.svg" alt="" width={14} height={14} className="mcqStepperUp" unoptimized />
            </button>
            <button type="button" aria-label={`Decrease ${label}`} onClick={() => stepValue(-1)}>
              <Image src="/assets/assessmenticons/arrow-down-01.svg" alt="" width={14} height={14} unoptimized />
            </button>
          </div>
        </div>
        {fieldError(name)}
      </div>
    );
  };

  const toggle = (title: string, enabled: boolean, change: (next: boolean) => void) => (
    <button type="button" className={`mcqSwitch ${enabled ? "mcqSwitchOn" : ""}`} role="switch" aria-checked={enabled} aria-label={title} onClick={() => change(!enabled)}>
      <span className="mcqSwitchState">{enabled ? "ON" : "OFF"}</span><span className="mcqSwitchKnob" />
    </button>
  );

  const selectField = (label: string, name: string, choices: string[], extraClass = "") => (
    <div key={name} className={`mcqField mcqSelectField ${extraClass}`}>
      <MCQReferenceDropdown label={label} kind="simple"
        value={form[name] ?? ""} options={choices}
        onChange={value => update(name, value)} error={fieldErrors[name]} />
    </div>
  );

  const switchField = (label: string, key: string, defaultValue: string, choices: string[], extraClass = "") => (
    <div key={key} className={`mcqField ${extraClass}`}>
      <span>{label}</span>
      <div className="mcqSwitchField">
        <MCQReferenceDropdown label={label} kind="simple" compact hideLabel
          disabled={!toggles[key]} value={form[key] ?? ""} options={choices}
          onChange={value => update(key, value)} />
        {toggle(label, toggles[key], () => { flip(key); clearFieldErrors(key); })}
      </div>
      {toggles[key] && fieldError(key)}
    </div>
  );

  const runEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    update("descriptionInstructions", editorRef.current?.innerHTML ?? "");
  };

  // Add matching SVG files manually inside public/assets/assessmenticons/.
  // Missing images stay hidden instead of displaying a broken-image icon.
  const toolbarIcon = (filename: string, label: string) => (
    <img
      src={`/assets/assessmenticons/${filename}.svg`}
      alt=""
      width={20}
      height={20}
      aria-hidden="true"
      onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
    />
  );

  const editorTool = (label: string, filename: string, command: string) => (
    <button key={label} type="button" title={label} aria-label={label}
      onMouseDown={event => event.preventDefault()} onClick={() => runEditorCommand(command)}>
      {toolbarIcon(filename, label)}
    </button>
  );

  const basicContent = () => (
    <div className="mcqDetailsFields mcqBasicFields">
      <MCQReferenceDropdown label="Assessment Name" kind="assessmentName" value={form.assessmentName ?? ""} onChange={v => update("assessmentName", v)} error={fieldErrors.assessmentName} wide />
      <MCQReferenceDropdown label="Assessment Type" kind="assessmentType" value={form.assessmentType ?? ""} onChange={v => update("assessmentType", v)} />
      <MCQReferenceDropdown label="Course" kind="course" value={form.course ?? ""} onChange={v => update("course", v)} error={fieldErrors.course} />
      {basicField("Language", "language", ["English", "Hindi", "Kannada", "Tamil", "Telugu"])}
      <MCQReferenceDropdown label="Module/ Unit" kind="module" value={form.module ?? ""} onChange={v => update("module", v)} error={fieldErrors.module} />
      <div className="mcqField">
        <span>Category / tags</span>
        <div className="mcqTagInput">
          <div className="mcqTags">{tags.map((tag) => <button type="button" className="mcqTag" key={tag} title={`Remove ${tag}`} onClick={() => setTags((prev) => prev.filter((name) => name !== tag))}>{tag}</button>)}</div>
          {addingTag ? (
            <input aria-label="New category tag" autoFocus value={tagText} onChange={(event) => setTagText(event.target.value)} onKeyDown={(event) => {
              if (event.key === "Enter") { event.preventDefault(); if (tagText.trim()) setTags((prev) => [...prev, tagText.trim()]); setTagText(""); setAddingTag(false); }
              if (event.key === "Escape") setAddingTag(false);
            }} onBlur={() => { if (tagText.trim()) setTags((prev) => [...prev, tagText.trim()]); setTagText(""); setAddingTag(false); }} />
          ) : <button type="button" className="mcqAddTag" onClick={() => setAddingTag(true)}>Add <Image src="/assets/assessmenticons/plus.svg" alt="" width={16} height={16} unoptimized /></button>}
        </div>
      </div>
      <div className="mcqField mcqFieldWide">
        <span>Description / Instructions</span>
        <div className="mcqEditor">
          <div className="mcqEditorToolbar" role="toolbar" aria-label="Description formatting toolbar">
            {editorTool("Undo", "undo", "undo")}
            {editorTool("Redo", "redo", "redo")}
            <select aria-label="Font" defaultValue="Arial" onChange={event => runEditorCommand("fontName", event.target.value)}>
              <option>Arial</option><option>Segoe UI</option><option>Georgia</option><option>Times New Roman</option>
            </select>
            <select aria-label="Font size" defaultValue="3" onChange={event => runEditorCommand("fontSize", event.target.value)}>
              <option value="2">12</option><option value="3">16</option><option value="4">18</option><option value="5">24</option>
            </select>
            {editorTool("Bold", "bold", "bold")}
            {editorTool("Italic", "italic", "italic")}
            {editorTool("Underline", "underline", "underline")}
            <label className="mcqEditorColor" title="Text color">
              <span className="mcqColorLetter">A</span><input aria-label="Text color" type="color" defaultValue="#374151" onChange={event => runEditorCommand("foreColor", event.target.value)} />
              <Image src="/assets/assessmenticons/arrow-down-01.svg" alt="" width={14} height={14} />
            </label>
            {editorTool("Pen", "pencil-line", "italic")}
            {editorTool("Highlight", "highlighter", "hiliteColor")}
            {editorTool("Pen line", "pen-line", "removeFormat")}
            {editorTool("Bullet list", "text-centerline-center-top", "insertUnorderedList")}
            <label className="mcqEditorFile" title="Attach a file">{toolbarIcon("attachment", "Attach a file")}<input type="file" onChange={event => {
              const file = event.target.files?.[0]; if (file) setMessage(`Selected attachment: ${file.name}`);
            }} /></label>
            <label className="mcqEditorFile" title="Insert image">{toolbarIcon("image", "Insert image")}<input type="file" accept="image/*" onChange={event => {
              const file = event.target.files?.[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = () => { if (typeof reader.result === "string") runEditorCommand("insertImage", reader.result); };
              reader.readAsDataURL(file);
            }} /></label>
          </div>
          <div className="mcqEditorBody" ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-invalid={Boolean(fieldErrors.descriptionInstructions)} aria-label="Description and instructions" data-placeholder="Assess learner understanding of core Java concepts...." onInput={(event) => update("descriptionInstructions", event.currentTarget.innerHTML)} />
        </div>
        {fieldError("descriptionInstructions")}
      </div>
    </div>
  );

  const scoringContent = () => (
    <div className="mcqDetailsFields mcqScoringFields">
      {numberField("Total Marks", "totalMarks", 20)}
      {numberField("Number of Question", "questionCount", 20)}
      {numberField("Marks per Question", "marksPerQuestion", 1)}
      <div className="mcqField mcqFieldWide">
        <span>Marking Scheme</span>
        <div className="mcqMarkingOptions">
          {["Fixed marks per question", "Weighted questions", "Custom marking"].map((option) => (
            <button key={option} type="button" className={`mcqMarkingOption ${markingScheme === option ? "mcqMarkingSelected" : ""}`} onClick={() => { setMarkingScheme(option); update("markingScheme", option); clearFieldErrors("markingScheme"); }}>
              <span className={`mcqChoiceCircle ${markingScheme === option ? "mcqChoiceChecked" : ""}`} aria-hidden="true" />
              <span>{option}</span>
            </button>
          ))}
        </div>
        {fieldError("markingScheme")}
      </div>
      <div className="mcqField"><span>Negative Marking</span><div className="mcqSwitchField">
        <MCQReferenceDropdown label="Negative Marking" kind="simple" compact hideLabel disabled={!negativeMarking} value={form.negativeMarkingValue ?? ""} options={["-0.25", "-0.5", "-1"]} onChange={value => update("negativeMarkingValue", value)} />
        {toggle("Negative Marking", negativeMarking, (enabled) => {setNegativeMarking(enabled); clearFieldErrors("negativeMarkingValue");})}
      </div>{negativeMarking && fieldError("negativeMarkingValue")}</div>
      {basicField("Passing Score", "passingScore", ["60%", "50%", "70%", "80%"])}
      <div className="mcqField"><span>Grade to Pass</span><div className="mcqSwitchField">
        <MCQReferenceDropdown label="Grade to Pass" kind="simple" compact hideLabel disabled={!gradeToPass} value={form.gradeToPass ?? ""} options={["A", "B", "C", "D"]} onChange={value => update("gradeToPass", value)} />
        {toggle("Grade to Pass", gradeToPass, (enabled) => {setGradeToPass(enabled); clearFieldErrors("gradeToPass");})}
      </div>{gradeToPass && fieldError("gradeToPass")}</div>
      {basicField("Grade category", "gradeCategory", ["A - 90-100%", "B - 75-89%", "C - 60-74%", "D - Below 60%"])}
      {basicField("Rounding Rule", "roundingRule", ["No rounding", "Round to nearest integer", "Round to 2 decimals", "Module 3 Assessment"])}
    </div>
  );

  const timingContent = () => (
    <div className="mcqDetailsFields mcqTimingFields mcqThreeColumnFields">
      {switchField("Time Limit", "timeLimit", "Duration 30 Minutes", ["Duration 30 Minutes", "Duration 45 Minutes", "Duration 60 Minutes", "No Limit"])}
      {switchField("Per-question Timer", "perQuestionTimer", "Set Time Per Question", ["Set Time Per Question", "30 Seconds", "1 Minute", "2 Minutes"])}
      {selectField("Time Zone", "timeZone", ["Asia/Kolkata", "UTC", "Asia/Dubai", "Europe/London"])}
      <div className="mcqField mcqDateField"><span>Available from</span><div className="mcqDateRow">
        <MCQCalendar label="Start Date" value={form.availableFromDate ?? ""} onChange={v => update("availableFromDate", v)} disabled={!toggles.availableFrom} />
        <MCQTimePicker label="Start Time" value={form.availableFromTime ?? ""} onChange={value => update("availableFromTime", value)} disabled={!toggles.availableFrom} />
        {toggle("Available from",toggles.availableFrom,() => {flip("availableFrom");clearFieldErrors("availableFromDate", "availableFromTime");})}
      </div>{toggles.availableFrom && <>{fieldError("availableFromDate")}{fieldError("availableFromTime")}</>}</div>
      <div className="mcqField mcqDateField"><span>Available from</span><div className="mcqDateRow">
        <MCQCalendar label="End Date" value={form.availableUntilDate ?? ""} onChange={v => update("availableUntilDate", v)} disabled={!toggles.availableUntil} />
        <MCQTimePicker label="End Time" value={form.availableUntilTime ?? ""} onChange={value => update("availableUntilTime", value)} disabled={!toggles.availableUntil} />
        {toggle("Available Until",toggles.availableUntil,() => {flip("availableUntil");clearFieldErrors("availableUntilDate", "availableUntilTime");})}
      </div>{toggles.availableUntil && <>{fieldError("availableUntilDate")}{fieldError("availableUntilTime")}</>}</div>
      {switchField("Late Submission", "lateSubmission", "Select", ["Select", "Grace Period - 10 Min", "Grace Period - 20 Min", "Grace Period - 30 Min", "No Grace Period"], "mcqLateSubmissionField")}
    </div>
  );

  const attemptsContent = () => (
    <div className="mcqDetailsFields mcqScoringFields">
      {numberField("Number of Attempts", "attempts", 2, 1)}
      {selectField("Attempt Cooldown", "attemptCooldown", ["12 Hrs", "6 Hrs", "24 Hrs", "No Cooldown"])}
      {selectField("Grading Method", "gradingMethod", ["Highest Score", "Last Attempt", "Average Score", "First Attempt"])}
      {switchField("Access Code", "accessCode", "A7X9-KP42", ["A7X9-KP42", "Generate New Code"])}
      {switchField("Browser Lockdown", "browserLockdown", "Secure Exam Browser", ["Secure Exam Browser", "Browser Fullscreen", "Disabled"])}
      {switchField("Webcam Proctoring", "webcamProctoring", "Camera Check", ["Camera Check", "Live Proctoring", "Recording Only"])}
      {switchField("Prerequisite", "prerequisite", "Previous Assessment", ["Previous Assessment", "No Prerequisite"])}
      <div className="mcqField mcqFieldWide"><span>Extra Time / Accommodations</span><AccommodationManager rows={accommodationRows} setRows={setAccommodationRows} assessmentTitle={form.assessmentName ?? form.assessmentTitle ?? "Introduction to AI"} duration={form.duration ?? "30"} totalMarks={form.totalMarks ?? "40"} batch={form.batch ?? "2026 — Batch A"}/></div>
    </div>
  );

  const audienceContent = () => (
    <div className="mcqDetailsFields mcqAudienceFields">
      {selectField("Who can take this assessment?", "whoCanTake", ["All enrolled learners", "Assigned Learners", "Selected Learners"])}
      {selectField("Batch / Cohort", "batch", ["2026 — Batch A", "2026 — Batch B", "All Batches"])}
      {selectField("Academic Year", "academicYear", ["2026 2027", "2025–2026", "2027–2028"])}
      {selectField("Department", "department", ["Computer Science", "Information Technology", "All Departments"])}
      {selectField("Program", "program", ["B.Tech Computer Science", "BCA", "MCA"])}
      {selectField("Section / Class", "section", ["Section A", "Section B", "All Sections"])}
      {selectField("Excluded Learners", "excludedLearners", ["Add learners", "None"])}
      <div className="mcqField mcqNotifyOnly">
        <span>Notify learners when published</span>
        <div className="mcqSwitchField">
          {toggle("Notify learners when published", toggles.notifyLearners, () => flip("notifyLearners"))}
        </div>
      </div>
    </div>
  );

  const saveAndContinue = () => {
    const selectedForm={...form, assessmentType: form.assessmentType || typeLabel};
    const errors = validateCompleteDetails(form, { markingScheme, negativeMarking, gradeToPass, toggles });
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      const invalidSections = [...new Set(Object.keys(errors).map(name => detailsFieldSections[name] ?? 0))];
      const first = invalidSections[0];
      setInvalidSection(first);
      setMessage("Please complete the required fields highlighted in red before continuing.");
      setExpanded(previous => [...new Set([...previous, ...invalidSections])]);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() =>
        document.getElementById(`mcq-review-target-${first}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
      ));
      return;
    }
    setInvalidSection(null);
    const count = Number(form.questionCount);
    try {
      assessmentStorage.setItem(countKey, String(count));
      assessmentStorage.setItem(draftKey, JSON.stringify({ ...selectedForm, tags, markingScheme, negativeMarking, gradeToPass, partialCredit, toggles }));
      updateAssessment({title:(form.assessmentName||form.assessmentTitle||"").trim(),course:form.course||"",questions:count,marks:Number(form.totalMarks)});
      setMessage("Successfully saved");
      window.setTimeout(() => router.push("/assessments/create/content"), 1100);
    } catch { setMessage("Unable to save the assessment. Please allow browser storage and try again."); }
  };

  return (
    <main className="superAdminPage institutionAdminPage mcqAppShell">
      <div className="dashboardLayout mcqDashboardLayout">
        <Sidebar />
        <section className="mainContent mcqMainContent">
          <div className="mcqHeaderSlot"><Header /></div>
          <div className="institutionScrollArea mcqScrollArea">
            <div className="pageContent institutionPageContent mcqPageContent">
              <div className="mcqBreadcrumb" aria-label="Breadcrumb">
                <Link href="/assessments" className="mcqBreadcrumbParent">Assessment</Link>
                <Image src="/assets/assessmenticons/arrowrightdouble.svg" alt="" width={20} height={20} className="mcqBreadcrumbArrow" unoptimized />
                <Link href="/assessments" className="mcqBreadcrumbCurrent">Create Assessment</Link>
              </div>

              <ol className="mcqWizard" aria-label="Assessment creation steps">
                {(["Type", "Details", "Content", "Evaluation", "Review"] as const).map((label, index) => (
                  <li key={label} className={`mcqWizardStep ${index === 0 ? "mcqWizardCompleted" : index === 1 ? "mcqWizardActive" : ""}`}><WizardStepLink index={index} current={1}/>
                    <span className="mcqWizardNumber"><span>{index + 1}</span></span>
                    <span>{label}</span>
                  </li>
                ))}
              </ol>

              <div className="mcqTitleGroup">
                <h1>Assessment Details (MCQ)</h1>
                <p>Provide The Essential Details And Settings For Your Assessment.</p>
              </div>

              <div className="mcqAccordionList">
                {sections.map((section, index) => {
                  const isOpen = expanded.includes(index);
                  return (
                    <section id={`mcq-review-target-${index}`} className={`mcqAccordion ${isOpen ? "mcqAccordionOpen" : ""}`} key={section.title}>
                      <button type="button" className="mcqAccordionTrigger" onClick={() => toggleSection(index)} aria-expanded={isOpen} aria-controls={`mcq-section-${index}`}>
                        <span>{index + 1}. {section.title}</span>
                        <Image src="/assets/assessmenticons/arrow-down-01.svg" alt="" width={28} height={28} className="mcqAccordionArrow" unoptimized />
                      </button>
                      {isOpen && (
                        <div className="mcqAccordionContent mcqAccordionContentDesigned" id={`mcq-section-${index}`}>
                          {invalidSection === index && message && <p role="alert" style={{ color: "#BC1E2D", fontWeight: 600, margin: "0 0 14px" }}>{message}</p>}
                          {index === 0 ? basicContent() : index === 1 ? scoringContent() : index === 2 ? timingContent() : index === 3 ? attemptsContent() : index === 4 ? audienceContent() : section.fields.map((field) => (
                            <label className="mcqField" key={field.name}>
                              <span>{field.label}</span>
                              {field.type === "textarea" ? (
                                <textarea value={form[field.name] ?? ""} placeholder={field.placeholder} onChange={(event) => update(field.name, event.target.value)} rows={3} />
                              ) : field.type === "select" ? (
                                <select value={form[field.name] ?? ""} onChange={(event) => update(field.name, event.target.value)}>
                                  <option value="">{field.placeholder}</option>
                                  {"options" in field && field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                              ) : (
                                <input type={field.type} value={form[field.name] ?? ""} placeholder={field.placeholder} onChange={(event) => update(field.name, event.target.value)} />
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              <div className="mcqFooter">
                <button type="button" className="mcqFooterButton" onClick={() => router.push("/assessments")}>Back</button>
                {message && <p className={`mcqFooterInlineMessage ${message === "Successfully saved" ? "mcqFooterSavedPill" : "mcqValidationError"}`} role={message === "Successfully saved" ? "status" : "alert"}>{message}</p>}
                <div className="mcqFooterRight">
                  <button type="button" className="mcqFooterButton mcqContinue mcqSaveContinue" onClick={saveAndContinue}>Save &amp; Continue</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
