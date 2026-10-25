import type {StoredAssessment} from "@/modules/assessments/storage/assessment-storage";

export type LearnerStatus = "Live" | "Upcoming" | "Completed";
export type LearnerAttempt = {
  attemptId?: string;
  submittedAt?: string;
  scorePercent?: number;
  earnedMarks?: number;
  totalMarks?: number;
  pendingCount?: number;
};
export type LearnerAssessment = {
  record: StoredAssessment;
  status: LearnerStatus;
  course: string;
  module: string;
  totalQuestions: number;
  totalMarks: number;
  duration: number | null;
  passingScore: string;
  negativeMarking: string;
  maxAttempts: number | null;
  attempts: LearnerAttempt[];
  startAt: Date | null;
  endAt: Date | null;
  schedule: string;
  mode: string;
  canStart: boolean;
};

type Draft = Record<string, unknown>;
const PREFIX = "neurolxp.assessments.draft.v1.";

function storedJson(id: string, key: string): unknown {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(`${PREFIX}${id}.${key}`) || "null"); }
  catch { return null; }
}
function draftFor(record: StoredAssessment): Draft {
  const key = record.typeCode === "short-answer" ? "shortAnswerAssessmentDraft"
    : record.typeCode === "one-word" ? "oneWordAssessmentDraft" : "mcqAssessmentDraft";
  const saved = storedJson(record.id, key);
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved as Draft : {};
}
function stringValue(value: unknown): string { return typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : ""; }
function positiveNumber(value: unknown): number | null {
  const number = Number(value);
  return value === undefined || value === null || value === "" || !Number.isFinite(number) || number <= 0 ? null : number;
}
function dateTime(dateValue: unknown, timeValue: unknown): Date | null {
  const day = stringValue(dateValue);
  if (!day) return null;
  const time = stringValue(timeValue) || "00:00";
  const parsed = new Date(day.includes("T") ? day : `${day}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function shortDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {day:"numeric",month:"short"}).format(date);
}
function clock(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {hour:"2-digit",minute:"2-digit",hour12:false}).format(date);
}
export function formatDue(date: Date | null): string { return date ? shortDate(date) : "No closing date"; }
export function learnerAssessmentData(record: StoredAssessment, now = new Date()): LearnerAssessment {
  const draft = draftFor(record);
  const toggles = draft.toggles && typeof draft.toggles === "object" ? draft.toggles as Record<string, unknown> : {};
  const useStart = toggles.availableFrom !== false;
  const useEnd = toggles.availableUntil !== false;
  const startAt = useStart ? dateTime(draft.availableFromDate ?? draft.availableFrom, draft.availableFromTime) : null;
  const endAt = useEnd ? dateTime(draft.availableUntilDate ?? draft.availableUntil, draft.availableUntilTime) : null;
  const attemptsRaw = storedJson(record.id, "viewerAttempts");
  const attempts = Array.isArray(attemptsRaw) ? attemptsRaw.filter(a => a && typeof a === "object") as LearnerAttempt[] : [];
  const taken = Math.max(attempts.length, Number(record.attemptCount) || 0);
  const maxAttempts = positiveNumber(draft.attempts);
  const duration = positiveNumber(draft.duration)
    ?? positiveNumber(stringValue(draft.timeLimit).match(/\d+/)?.[0]);
  const score = stringValue(draft.passingScore || draft.passingMarks);
  const negativeMarking = draft.negativeMarking === false ? "No" : stringValue(draft.negativeMarkingValue) || "Not specified";
  const scheduled = record.status === "Scheduled";
  const completed = Boolean((endAt && now > endAt) || (maxAttempts !== null && taken >= maxAttempts));
  const upcoming = Boolean(scheduled || (startAt && now < startAt));
  const status: LearnerStatus = completed ? "Completed" : upcoming ? "Upcoming" : "Live";
  let schedule = "No availability window set";
  if (startAt && endAt) schedule = `${shortDate(startAt)}, ${clock(startAt)} — ${shortDate(endAt)}, ${clock(endAt)}`;
  else if (startAt) schedule = `Opens ${shortDate(startAt)}, ${clock(startAt)}`;
  else if (endAt) schedule = `Closes ${shortDate(endAt)}, ${clock(endAt)}`;
  return {
    record, status, course: stringValue(draft.course) || record.course || "Course not specified",
    module: stringValue(draft.module) || stringValue(draft.moduleUnit),
    totalQuestions: Number(record.questions) || positiveNumber(draft.questionCount) || 0,
    totalMarks: Number(record.marks) || positiveNumber(draft.totalMarks) || 0,
    duration, passingScore: score ? score.includes("%") ? score : `${score}%` : "Not specified",
    negativeMarking, maxAttempts, attempts, startAt, endAt, schedule,
    mode: "Online" + (duration ? ", timed" : ""), canStart: status === "Live" && record.status === "Published",
  };
}
export function learnerAssessmentsForTenant(records: StoredAssessment[], tenantId: string): LearnerAssessment[] {
  return records
    .filter(record => (record.tenantId || "north") === tenantId && (record.status === "Published" || record.status === "Scheduled"))
    .map(record => learnerAssessmentData(record))
    .sort((a,b) => {
      const order = {Live:0,Upcoming:1,Completed:2};
      return order[a.status] - order[b.status] || (a.endAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.endAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
    });
}
