/** Frontend-only *runtime* capabilities, independent of localStorage metadata. */
import { mcqAssessmentAdapter } from "../components/type-specific/mcq";

export type QuestionMode = "single-choice" | "short-answer" | "one-word" | "matching";
export interface AssessmentAdapter {
  code: string;
  questionMode: QuestionMode;
  draftKeys: { readonly details: string; readonly content: string; readonly evaluation: string };
}

/** Add another adapter here when its Creator, Viewer, evaluation and results are implemented. */
export const ASSESSMENT_ADAPTERS: Record<string, AssessmentAdapter> = {
  "match-the-following": {code:"match-the-following",questionMode:"matching",draftKeys:{details:"mcqAssessmentDraft",content:"matchFollowingContentDraft",evaluation:"mcqAssessmentEvaluationDraft"}},
  [mcqAssessmentAdapter.code]: mcqAssessmentAdapter,
  "short-answer": {code:"short-answer",questionMode:"short-answer",draftKeys:{details:"shortAnswerAssessmentDraft",content:"shortAnswerContentDraft",evaluation:"shortAnswerEvaluationDraft"}},
  "one-word": {code:"one-word",questionMode:"one-word",draftKeys:{details:"oneWordAssessmentDraft",content:"oneWordContentDraft",evaluation:"oneWordEvaluationDraft"}},
};

export const hasAssessmentWorkflow = (code: string): boolean => Boolean(ASSESSMENT_ADAPTERS[code]);
export const getAssessmentAdapter = (code: string): AssessmentAdapter | undefined => ASSESSMENT_ADAPTERS[code];
