/** MCQ-specific registration; the five Creator pages remain shared. */
export const mcqAssessmentAdapter = {
  code: "mcq",
  questionMode: "single-choice",
  draftKeys: {
    details: "mcqAssessmentDraft",
    content: "mcqContentDraft",
    evaluation: "mcqAssessmentEvaluationDraft",
  },
} as const;
