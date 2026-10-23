"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import "./assessment.css";
import Sidebar from "../components/sidebar/page";
import Header from "../components/header/Header";

// Match these filenames to the files already in public/assets/assessmenticons.

// No icon library is used in this page.

const ICON_ROOT = "/assets/assessmenticons/";

const icons = {

  plus: `${ICON_ROOT}plus.svg`,

  search: `${ICON_ROOT}search-02.svg`,

  down: `${ICON_ROOT}arrow-down-01.svg`,

  sort: `${ICON_ROOT}sorting-01.svg`,

  actions: `${ICON_ROOT}more-vertical.svg`,

  previous: `${ICON_ROOT}arrowleft.svg`,

  next: `${ICON_ROOT}arrowright.svg`,

};

type AssessmentStatus = "Published" | "Draft" | "Closing soon" | "Scheduled";

type Assessment = {

  id: number;

  title: string;

  type: string;

  course: string;

  questions: number;

  marks: number;

  status: AssessmentStatus;

  window: string | null;

  attempts: string;

  grading: string;

  submissions: string;

};

const base: Omit<Assessment, "id">[] = [

  { title: "Introduction to AI- AI", type: "Quiz", course: "Introduction to AI", questions: 20, marks: 20, status: "Published", window: "Sep 14, 9:00", attempts: "01 Attempts", grading: "Auto- graded", submissions: "0/32 Submitted" },

  { title: "Data Structures - Java", type: "MCQ", course: "Data Structures", questions: 20, marks: 20, status: "Draft", window: null, attempts: "-", grading: "Not Graded", submissions: "-" },

  { title: "Employee Onboarding- DSA", type: "T/F", course: "Employee Onboarding", questions: 20, marks: 20, status: "Closing soon", window: "Sep 14, 9:00", attempts: "Unlimited", grading: "Manual entry", submissions: "0/32 Submitted" },

  { title: "Employee Onboarding- DSA", type: "T/F", course: "Employee Onboarding", questions: 20, marks: 20, status: "Scheduled", window: "Sep 14, 9:00", attempts: "02 Attempts", grading: "01 Attempts", submissions: "-" },

  { title: "Data Structures - Java", type: "MCQ", course: "Data Structures", questions: 20, marks: 20, status: "Published", window: "Sep 14, 9:00", attempts: "Unlimited", grading: "Rubric- Manual", submissions: "14/32 Submitted" },

  { title: "Data Structures - Java", type: "MCQ", course: "Data Structures", questions: 20, marks: 20, status: "Published", window: "Sep 14, 9:00", attempts: "Unlimited", grading: "Rubric- Manual", submissions: "14/32 Submitted" },

];

const assessments: Assessment[] = Array.from({ length: 19 }, (_, i) => ({ ...base[i % base.length], id: i + 1 }));

const kpis = [

  { label: "Total Assessment", value: "124", color: "total" },

  { label: "Draft", value: "05", color: "draft" },

  { label: "Published", value: "11", color: "published" },

  { label: "To be Graded", value: "47", color: "grading" },

  { label: "Closing Soon", value: "03", color: "closing" },

];

type FilterName = "course" | "type" | "status" | "sort";

type OptionGroup = { heading: string; items: string[] };

const courseGroups: OptionGroup[] = [

  { heading: "By Category", items: ["Academic", "Corporate Training", "Professional Development", "Compliance", "Technical", "Soft Skills", "Language Learning", "Certification", "Vocational / Skills Training", "Continuing Education"] },

  { heading: "Courses", items: ["Java Development", "Python Programming", "Data Structures & Algorithms", "Artificial Intelligence", "Machine Learning", "Cybersecurity", "Cloud Computing", "Project Management", "Leadership & Management", "Employee Onboarding", "Workplace Safety", "Communication Skills"] },

  { heading: "By Program", items: ["Undergraduate", "Postgraduate", "Diploma", "Certificate", "Professional Certification", "Employee Training"] },

  { heading: "By Organization", items: ["All Organizations", "Organization A", "Organization B", "Organization C"] },

];

const typeGroups: OptionGroup[] = [

  { heading: "Academic assessment", items: ["Multiple Choice Question (MCQ)", "Multiple Response", "True / False", "Fill in the Blank", "One-Word Answer", "Short Answer", "Long Answer / Essay", "Numeric Response", "Formula Response", "Matrix Question", "Assertion & Reason", "Ranking Question", "Quick Quiz", "Timed Quiz", "Scenario Quiz"] },

  { heading: "Interactive Assessments", items: ["Drag & Drop", "Match the Following", "Sequence & Order", "Connect the Dots", "Clickable Hotspot", "Interactive Diagram", "Interactive Concept Map", "Puzzle Challenge", "Memory Game", "Interactive Story"] },

  { heading: "Multimedia Assessments", items: ["Image-Based Assessment", "Audio-Based Assessment", "Video-Based Assessment", "Visual Identification", "Video Response", "Audio Response", "Screen Recording Task", "Media Annotation"] },

  { heading: "Application & Practical Assessments", items: ["Case Study", "Problem-Solving Challenge", "Assignment", "Project Assessment", "Research Task", "Practical Task", "Lab Assessment", "Simulation Assessment", "Design Review", "Presentation Assessment", "Role-Play Assessment", "Oral Viva", "Product Demonstration"] },

  { heading: "Portfolio Assessments", items: ["Portfolio Assessment", "Project Showcase", "Code Portfolio", "Design Portfolio", "Research Portfolio"] },

  { heading: "Collaborative Assessments", items: ["Peer Assessment", "Self Assessment", "Group Project Assessment", "Team Challenge", "Discussion Assessment", "Debate Assessment", "Peer Review", "Collaborative Task"] },

  { heading: "Gamified Challenges", items: ["Quiz Battle", "Team Battle (quantum champ)", "Tournament", "Daily Challenge", "Weekly Challenge", "Skill Sprint", "Boss Battle", "Mission Challenge", "Escape Room", "Mystery Challenge"] },

  { heading: "AI-Powered Assessments", items: ["AI Interview", "AI Viva", "Adaptive Assessment", "AI Mentor Challenge", "AI Competency Assessment", "AI Skill Gap Assessment"] },

  { heading: "Certification & Professional Assessments", items: ["Online Exam", "Mock Exam", "Skill Evaluation", "Competency Assessment", "Certification Assessment", "Certification Renewal Assessment", "Professional Readiness Assessment", "Compliance Assessment", "Safety Assessment", "Product Knowledge Assessment", "Sales Competency Assessment"] },

  { heading: "Career & Behavioral Assessments", items: ["Communication Assessment", "Soft Skills Assessment", "Leadership Assessment", "Situational Judgment Test", "Interview Readiness Assessment", "Industry Simulation", "Client Project Assessment", "Startup Challenge", "Product Design Challenge", "Consulting Challenge"] },

];

const simpleOptions: Record<"status" | "sort", string[]> = {

  status: ["All Status", "Draft", "Scheduled", "Published", "Active", "Closed", "Archived", "Cancelled"],

  sort: ["Default", "Assessment A-Z", "Assessment Z-A", "Newest First", "Oldest First"],

};

function FilterDropdown({ name, label, value, onChange, icon, open, onToggle, onClose }: {

  name: FilterName;

  label: string;

  value: string;

  onChange: (value: string) => void;

  icon: string;

  open: boolean;

  onToggle: () => void;

  onClose: () => void;

}) {

  const [typed, setTyped] = useState("");

  const [expanded, setExpanded] = useState<string[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);

  const searchable = name === "course" || name === "type";

  const groups = name === "course" ? courseGroups : typeGroups;

  useEffect(() => {

    if (!open) { setTyped(""); setExpanded([]); return; }

    const handleOutside = (event: PointerEvent) => {

      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onClose();

    };

    const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };

    document.addEventListener("pointerdown", handleOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {

      document.removeEventListener("pointerdown", handleOutside);

      document.removeEventListener("keydown", handleEscape);

    };

  }, [open, onClose]);

  const select = (option: string) => { onChange(option); onClose(); };

  const isAll = name === "course" ? "All Courses" : "All Types";

  const shownGroups = searchable ? groups.map(group => ({

    ...group,

    items: group.heading.toLowerCase().includes(typed.toLowerCase()) ? group.items : group.items.filter(item => item.toLowerCase().includes(typed.toLowerCase())),

  })).filter(group => !typed || group.heading.toLowerCase().includes(typed.toLowerCase()) || group.items.length > 0) : [];

  return (

    <div className={`asm-filter asm-filter--${name}`} ref={rootRef}>

      <button className="asm-filter-trigger" type="button" aria-expanded={open} aria-label={label} onClick={onToggle}>

        <span>{value || label}</span>

        <img src={icon} alt="" width={20} height={20} />

      </button>

      {open && <div className="asm-filter-menu">

        {searchable ? <>

          <label className="asm-dropdown-search">

            <img src="/assets/assessmenticons/search-02.svg" alt="" width={18} height={18} />

            <input autoFocus value={typed} onChange={e => setTyped(e.target.value)} placeholder={name === "course" ? "Search courses..." : "Search assessment types..."} aria-label={`Search ${label}`} />

          </label>

          <div className="asm-filter-options">

            <button type="button" className="asm-filter-option" onClick={() => select(isAll)}>

              <span className={`asm-choice-circle ${!value || value === isAll ? "is-checked" : ""}`} aria-hidden="true" />{isAll}

            </button>

            {shownGroups.map(group => {

              const expandedNow = typed.length > 0 || expanded.includes(group.heading);

              return <div className="asm-filter-group" key={group.heading}>

                <button type="button" className="asm-filter-group-heading" aria-expanded={expandedNow} onClick={() => setExpanded(prev => prev.includes(group.heading) ? prev.filter(x => x !== group.heading) : [...prev, group.heading])}>

                  <span>{group.heading}</span><span className={`asm-group-chevron ${expandedNow ? "is-open" : ""}`} aria-hidden="true" />

                </button>

                {expandedNow && <div className="asm-filter-group-items">

                  {(typed && group.heading.toLowerCase().includes(typed.toLowerCase()) ? group.items : group.items).map(item => <button key={item} type="button" className="asm-filter-option" onClick={() => select(item)}>

                    <span className={`asm-choice-circle ${value === item ? "is-checked" : ""}`} aria-hidden="true" />{item}

                  </button>)}

                </div>}

              </div>;

            })}

            {!shownGroups.length && <div className="asm-no-options">No matching options</div>}

          </div>

        </> : <div className="asm-filter-options asm-filter-options--simple">

          {simpleOptions[name as "status" | "sort"].map(option => <button key={option} type="button" className="asm-filter-option" onClick={() => select(option)}>

            <span className={`asm-choice-circle ${value === option || (!value && option === simpleOptions[name as "status" | "sort"][0]) ? "is-checked" : ""}`} aria-hidden="true" />{option}

          </button>)}

        </div>}

      </div>}

    </div>

  );

}

function AssessmentContent() {

  const [query, setQuery] = useState("");

  const [course, setCourse] = useState("");

  const [type, setType] = useState("");

  const [status, setStatus] = useState("");

  const [sort, setSort] = useState("");

  const [page, setPage] = useState(1);

  const [viewAll, setViewAll] = useState(false);

  const [openAction, setOpenAction] = useState<number | null>(null);

  const [notice, setNotice] = useState("");
  const [screen, setScreen] = useState<"list" | "create">("list");

  const [openFilter, setOpenFilter] = useState<FilterName | null>(null);

  const pageSize = 6;

  const results = useMemo(() => {

    const filtered = assessments.filter((item) =>

      item.title.toLowerCase().includes(query.toLowerCase()) &&

      (!course || course === "All Courses" || item.course === course) &&

      (!type || type === "All Types" || item.type === type || (type === "Multiple Choice Question (MCQ)" && item.type === "MCQ") || (type === "True / False" && item.type === "T/F") || (type === "Quick Quiz" && item.type === "Quiz")) &&

      (!status || status === "All Status" || item.status === status || (status === "Active" && item.status === "Published") || (status === "Closed" && item.status === "Closing soon"))

    );

    if (sort === "Assessment A-Z") filtered.sort((a, b) => a.title.localeCompare(b.title));

    if (sort === "Assessment Z-A") filtered.sort((a, b) => b.title.localeCompare(a.title));

    if (sort === "Newest First") filtered.sort((a, b) => b.id - a.id);

    if (sort === "Oldest First") filtered.sort((a, b) => a.id - b.id);

    return filtered;

  }, [query, course, type, status, sort]);

  const maxPage = Math.max(1, Math.ceil(results.length / pageSize));

  const currentPage = Math.min(page, maxPage);

  const shown = viewAll ? results : results.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const changeFilter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };

  if (screen === "create") {
    return <CreateAssessment onCancel={() => setScreen("list")} />;
  }

  return (

    <main className="assessment-page">

      <div className="asm-heading-row">

        <div className="asm-heading">

          <h1>Assessments</h1>

          <p>Create, Schedule &amp; Manage Assessments</p>

        </div>

        <button type="button" className="asm-create" onClick={() => { setScreen("create"); setOpenFilter(null); }}>

          <img src="/assets/assessmenticons/plus.svg" width={20} height={20} alt="" />

          <span>Create</span>

        </button>

      </div>

      <section className="asm-kpis" aria-label="Assessment overview">

        {kpis.map((card) => (

          <div className="asm-kpi" key={card.label}>

            <div className="asm-kpi-label">{card.label}</div>

            <strong className={`asm-kpi-value asm-kpi-value--${card.color}`}>{card.value}</strong>

          </div>

        ))}

      </section>

      <section className="asm-filters" aria-label="Assessment search and filters">

        <label className="asm-search">

          <input

            type="search"

            value={query}

            onChange={(event) => { setQuery(event.target.value); setPage(1); }}

            placeholder="Search assessment name..."

            aria-label="Search assessment name"

          />

          <img src={icons.search} width={20} height={20} alt="" />

        </label>

        <FilterDropdown name="course" label="Courses" value={course} onChange={changeFilter(setCourse)} icon={icons.down} open={openFilter === "course"} onToggle={() => setOpenFilter(openFilter === "course" ? null : "course")} onClose={() => setOpenFilter(null)} />

        <FilterDropdown name="type" label="Type" value={type} onChange={changeFilter(setType)} icon={icons.down} open={openFilter === "type"} onToggle={() => setOpenFilter(openFilter === "type" ? null : "type")} onClose={() => setOpenFilter(null)} />

        <FilterDropdown name="status" label="Status" value={status} onChange={changeFilter(setStatus)} icon={icons.down} open={openFilter === "status"} onToggle={() => setOpenFilter(openFilter === "status" ? null : "status")} onClose={() => setOpenFilter(null)} />

        <FilterDropdown name="sort" label="Sort By" value={sort} onChange={changeFilter(setSort)} icon={icons.sort} open={openFilter === "sort"} onToggle={() => setOpenFilter(openFilter === "sort" ? null : "sort")} onClose={() => setOpenFilter(null)} />

      </section>

      <section className="asm-recent" aria-label="Recent assessments">

        <div className="asm-recent-header">

          <h2>Recent Assessment</h2>

          <button className="asm-view-all" type="button" onClick={() => { setViewAll(!viewAll); setOpenAction(null); }}>

            {viewAll ? "View less" : "View all"}

          </button>

        </div>

        <div className="asm-table-scroll">

          <table className="asm-table">

            <colgroup>

              <col className="asm-col-assessment" />

              <col className="asm-col-status" />

              <col className="asm-col-window" />

              <col className="asm-col-attempts" />

              <col className="asm-col-grading" />

              <col className="asm-col-submissions" />

              <col className="asm-col-actions" />

            </colgroup>

            <thead><tr>

              <th>Assessment</th>

              <th>Status</th><th>Window</th><th>Attempts</th><th>Grading</th><th>Submissions</th><th>Actions</th>

            </tr></thead>

            <tbody>

              {shown.map((item) => (

                <tr key={item.id}>

                  <td><div className="asm-assessment-name">{item.title}</div><div className="asm-assessment-meta">{item.type} | {item.questions} Questions | {item.marks} Marks</div></td>

                  <td><span className={`asm-status asm-status--${item.status.toLowerCase().replaceAll(" ", "-")}`}><i />{item.status}</span></td>

                  <td>{item.window ? <div className="asm-window"><div>Opens: {item.window}</div><div>Closes: Sep 16, 23:00</div></div> : "Not Scheduled"}</td>

                  <td>{item.attempts}</td><td>{item.grading}</td><td>{item.submissions}</td>

                  <td className="asm-action-cell">

                    <button className="asm-action-button" type="button" aria-label={`Actions for ${item.title}`} aria-expanded={openAction === item.id} onClick={() => setOpenAction(openAction === item.id ? null : item.id)}>

                      <img src={icons.actions} width={20} height={20} alt="" />

                    </button>

                    {openAction === item.id && <div className="asm-action-menu">

                      {(["View details", "Edit assessment", "Duplicate"] as const).map(action => <button key={action} type="button" onClick={() => { setNotice(`${action} for ${item.title} will be connected next.`); setOpenAction(null); }}>{action}</button>)}

                    </div>}

                  </td>

                </tr>

              ))}

              {!shown.length && <tr><td className="asm-empty" colSpan={7}>No assessments found</td></tr>}

            </tbody>

          </table>

        </div>

      </section>

      <footer className="asm-footer">

        <span>Showing {results.length ? String(viewAll ? 1 : (currentPage - 1) * pageSize + 1).padStart(2, "0") : "00"} to {String(viewAll ? results.length : Math.min(currentPage * pageSize, results.length)).padStart(2, "0")} of {results.length}</span>

        {!viewAll && <nav className="asm-pagination" aria-label="Assessment pagination">

          <button type="button" disabled={currentPage === 1} aria-label="Previous page" onClick={() => setPage(Math.max(1, currentPage - 1))}><img src={icons.previous} width={19} height={19} alt="" /></button>

          <span className="asm-current-page">{currentPage}</span>

          <button type="button" disabled={currentPage >= maxPage} aria-label="Next page" onClick={() => setPage(Math.min(maxPage, currentPage + 1))}><img src={icons.next} width={19} height={19} alt="" /></button>

        </nav>}

      </footer>

      {notice && <div className="asm-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")}>×</button></div>}

    </main>

  );

}


// Create Assessment is intentionally page-only. The application header and sidebar
// remain the responsibility of the parent layout.
const createTypes = [
  { title: "Academic assessment", subtitle: "MCQ, Quiz, Short Answer....", count: 15, tone: "academic" },
  { title: "Interactive Assessments", subtitle: "Drag & Drop, Match the Following..", count: 10, tone: "interactive" },
  { title: "Multimedia Assessments", subtitle: "Image based, Video based ......", count: 8, tone: "multimedia" },
  { title: "Practical Assessments", subtitle: "Case Study, Problem-Solving.....", count: 13, tone: "practical" },
  { title: "Portfolio Assessments", subtitle: "Code Portfolio, Design Portfolio.....", count: 5, tone: "portfolio" },
  { title: "Collaborative Assessments", subtitle: "Peer Assessment, Self Assessment....", count: 8, tone: "collaborative" },
  { title: "Gamified Challenges", subtitle: "Quiz Battle, Team Battle....", count: 10, tone: "gamified" },
  { title: "AI-Powered Assessments", subtitle: "AI Interview, AI Viva....", count: 6, tone: "ai" },
  { title: "Certification Assessments", subtitle: "Online Exam, Mock Exam.....", count: 11, tone: "certification" },
  { title: "Career Assessments", subtitle: "Communication Assessment....", count: 10, tone: "career" },
];

function CreateAssessment({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [openType, setOpenType] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 16, left: 16 });
  const [selectedSubtype, setSelectedSubtype] = useState<Record<string, string>>({});
  const activeCardRef = useRef<HTMLButtonElement | null>(null);
  const [welcomeName, setWelcomeName] = useState("there");
  const [nextNotice, setNextNotice] = useState(false);

  useEffect(() => {
    // Detect a displayed name in an imported header. Never render another header.
    const findName = () => {
      const candidates = [
        '.topHeader .topUserName',
        '[data-header-name]', '[data-user-name]', '.header-user-name',
        '.profile-name', '.user-name', '.userName', '.headerProfileName',
        '.user-info h3', 'header .profile-info strong', 'header .user-info strong'
      ];
      for (const selector of candidates) {
        const node = document.querySelector(selector);
        const name = node?.textContent?.trim();
        if (name) { setWelcomeName(name.split(/\s+/)[0]); return; }
      }
    };
    findName();
    const observer = new MutationObserver(findName);
    const header = document.querySelector('header');
    if (header) observer.observe(header, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!openType) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenType(null); };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [openType]);

  // Anchor the popup to the clicked card, including while the page scrolls.
  const updatePopupPosition = (button: HTMLButtonElement) => {
    const card = button.getBoundingClientRect();
    const margin = 12;
    const gap = 8;
    const mobile = window.innerWidth <= 700;
    const width = mobile ? Math.min(290, window.innerWidth - margin * 2) : 280;
    let left = card.right + gap;
    if (left + width > window.innerWidth - margin) left = card.left - width - gap;
    if (mobile || left < margin) {
      left = Math.max(margin, Math.min(card.left, window.innerWidth - width - margin));
    }
    // Never shift the popup upward to a different row. Limit its height instead.
    const top = Math.max(margin, card.top);
    setPopupPosition({ top, left });
  };

  const showTypePopup = (title: string, button: HTMLButtonElement) => {
    if (openType === title) { setOpenType(null); activeCardRef.current = null; return; }
    activeCardRef.current = button;
    updatePopupPosition(button);
    setOpenType(title);
    setNextNotice(false);
  };

  useEffect(() => {
    if (!openType) return;
    const followCard = () => {
      if (activeCardRef.current?.isConnected) updatePopupPosition(activeCardRef.current);
      else setOpenType(null);
    };
    window.addEventListener("scroll", followCard, true);
    window.addEventListener("resize", followCard);
    return () => {
      window.removeEventListener("scroll", followCard, true);
      window.removeEventListener("resize", followCard);
    };
  }, [openType]);

  useEffect(() => {
    if (!openType) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".asm-subtype-panel") && !target.closest(".asm-type-card")) setOpenType(null);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [openType]);

  const openTypeIndex = createTypes.findIndex(item => item.title === openType);
  const popupItems = openTypeIndex >= 0 ? typeGroups[openTypeIndex].items : [];

  const shown = createTypes.filter(item =>
    (item.title + " " + item.subtitle).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="assessment-page asm-create-page">
      <div className="asm-create-top">
        <div className="asm-create-progress-area">
          <div className="asm-breadcrumb">
            <button type="button" className="asm-breadcrumb-parent" onClick={onCancel}>Assessment</button>
            <span className="asm-breadcrumb-divider" aria-hidden="true">»</span>
            <span className="asm-breadcrumb-current">Create Assessment</span>
          </div>
          <ol className="asm-wizard" aria-label="Assessment creation steps">
            {(["Type", "Details", "Content", "Evaluation", "Review"] as const).map((label, index) => (
              <li key={label} className={`asm-wizard-step ${index === 0 ? "asm-wizard-step--active" : ""}`}>
                <span className="asm-wizard-number">{index + 1}</span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="asm-welcome" role="status">
          <div className="asm-welcome-title"><img className="asm-welcome-wave" src="/assets/assessmenticons/wavinghand.svg" alt="" width={30} height={30} /><strong>Welcome Back, {welcomeName}!</strong></div>
          <span>Create Assessments, Measure Real Learning</span>
        </div>
      </div>

      <section className="asm-type-section" aria-label="Select assessment type">
        <div className="asm-type-section-header">
          <div className="asm-type-copy">
            <h1>Assessment Type</h1>
            <p>Choose How You Want To Assess Learners</p>
          </div>
          <label className="asm-create-search">
            <img src="/assets/assessmenticons/search-02.svg" alt="" width={20} height={20} />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Assessment Type" aria-label="Search Assessment Type" />
          </label>
        </div>
        <div className="asm-type-grid">
          {shown.map(item => (
            <button key={item.title} type="button"
              className={`asm-type-card asm-type-card--${item.tone} ${openType === item.title ? "asm-type-card--selected" : ""}`}
              aria-expanded={openType === item.title}
              onClick={(event) => showTypePopup(item.title, event.currentTarget)}>
              <span className="asm-type-title">{item.title}</span>
              <span className="asm-type-subtitle">{item.subtitle}</span>
              <span className="asm-type-bottom"><strong>{String(item.count).padStart(2, "0")} Types</strong>
                <img className="asm-type-arrow" src="/assets/assessmenticons/arrowupright.svg" width={24} height={24} alt="" />
              </span>
            </button>
          ))}
          {shown.length === 0 && <div className="asm-types-empty">No assessment types match your search.</div>}
        </div>
        {openType && (
          <div className="asm-subtype-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenType(null); }}>
            <div className={`asm-subtype-panel asm-type-card--${createTypes.find(item => item.title === openType)?.tone ?? "academic"}`} style={{ top: popupPosition.top, left: popupPosition.left, maxHeight: `min(365px, calc(100dvh - ${Math.max(12, popupPosition.top)}px - 12px))` }} role="dialog" aria-modal="true" aria-label={openType}>
              <div className="asm-subtype-header">
                <h2>{openType}</h2>
                <button type="button" className="asm-subtype-close" onClick={() => setOpenType(null)} aria-label="Close assessment types">×</button>
              </div>
              <div className="asm-subtype-options" role="radiogroup" aria-label={`${openType} types`}>
                {popupItems.map((item) => (
                  <button type="button" key={item} className={`asm-subtype-option ${selectedSubtype[openType] === item ? "is-selected" : ""}`}
                    role="radio" aria-checked={selectedSubtype[openType] === item}
                    onClick={() => {
                      setSelectedSubtype(prev => ({ ...prev, [openType]: item }));
                      setSelected(openType);
                      setOpenType(null);
                      setNextNotice(false);
                      if (openType === "Academic assessment" && item === "Short Answer") {
                        router.push("/short-answers/details");
                      }
                    }}>
                    <span className={`asm-choice-circle ${selectedSubtype[openType] === item ? "is-checked" : ""}`} aria-hidden="true" />
                    <span>{item === "Multiple Choice Question (MCQ)" ? "MCQ" : item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
      <div className="asm-create-footer">
        {nextNotice && <span role="status" className="asm-next-note">{selected ? `${selected} — ${selectedSubtype[selected] ?? ""} selected. The Details step will be connected next.` : "Choose an assessment type first."}</span>}
        <button type="button" className="asm-create-footer-button" onClick={onCancel}>Cancel</button>
        <button type="button" className="asm-create-footer-button asm-create-footer-button--continue" onClick={() => {
          setOpenType(null);
          if (selected === "Academic assessment" && selectedSubtype[selected] === "Short Answer") {
            router.push("/short-answers/details");
            return;
          }
          setNextNotice(true);
        }}>Continue</button>
      </div>
    </main>
  );
}


// The shell follows the same Header / Sidebar imports and nesting
// used by the supplied reference page. Assessment features remain unchanged.
export default function AssessmentPage() {
  return (
    <main className="superAdminPage institutionAdminPage">
      <div className="dashboardLayout" style={{ height: "100dvh", overflow: "hidden", display: "flex" }}>
        <Sidebar />
        <section className="mainContent" style={{ minWidth: 0, minHeight: 0, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}>
            <Header />
          </div>
          <div className="institutionScrollArea" style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
            <div className="pageContent institutionPageContent">
              <AssessmentContent />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
