/** Frontend-only *runtime* capabilities, independent of localStorage metadata. */
import { mcqAssessmentAdapter } from "../components/type-specific/mcq";

export type QuestionMode = "single-choice" | "short-answer" | "one-word" | "fill-in-the-blanks" | "true-false" | "long-answer" | "drag-and-drop" | "memory-game";
export interface AssessmentAdapter {
  code: string;
  questionMode: QuestionMode;
  draftKeys: { readonly details: string; readonly content: string; readonly evaluation: string };
}

/** Add another adapter here when its Creator, Viewer, evaluation and results are implemented. */
export const ASSESSMENT_ADAPTERS: Record<string, AssessmentAdapter> = {
 "memory-game": {code:"memory-game",questionMode:"memory-game",draftKeys:{details:"memoryGameAssessmentDraft",content:"memoryGameContentDraft",evaluation:"memoryGameEvaluationDraft"}},
 "drag-and-drop": {code:"drag-and-drop",questionMode:"drag-and-drop",draftKeys:{details:"dragDropAssessmentDraft",content:"dragDropContentDraft",evaluation:"dragDropEvaluationDraft"}},
  [mcqAssessmentAdapter.code]: mcqAssessmentAdapter,
  "short-answer": {code:"short-answer",questionMode:"short-answer",draftKeys:{details:"shortAnswerAssessmentDraft",content:"shortAnswerContentDraft",evaluation:"shortAnswerEvaluationDraft"}},
  "one-word": {code:"one-word",questionMode:"one-word",draftKeys:{details:"oneWordAssessmentDraft",content:"oneWordContentDraft",evaluation:"oneWordEvaluationDraft"}},
  "fill-in-the-blanks": {code:"fill-in-the-blanks",questionMode:"fill-in-the-blanks",draftKeys:{details:"fillBlanksAssessmentDraft",content:"fillBlanksContentDraft",evaluation:"fillBlanksEvaluationDraft"}},
  "true-false": {code:"true-false",questionMode:"true-false",draftKeys:{details:"trueFalseAssessmentDraft",content:"trueFalseContentDraft",evaluation:"trueFalseEvaluationDraft"}},
  "long-answer": {code:"long-answer",questionMode:"long-answer",draftKeys:{details:"longAnswerAssessmentDraft",content:"longAnswerContentDraft",evaluation:"longAnswerEvaluationDraft"}},
};

export const hasAssessmentWorkflow = (code: string): boolean => Boolean(ASSESSMENT_ADAPTERS[code]);
export const getAssessmentAdapter = (code: string): AssessmentAdapter | undefined => ASSESSMENT_ADAPTERS[code];
