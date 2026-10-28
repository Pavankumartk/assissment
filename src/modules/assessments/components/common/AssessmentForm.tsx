"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveAssessmentId, getAssessment } from "../../storage/assessment-storage";
import { hasAssessmentWorkflow } from "../../config/component-registry";
import {getDemoSession} from "../../auth/demo-auth";
import DetailsStep from "./steps/DetailsStep/DetailsStep";
import ContentStep from "./steps/ContentStep/ContentStep";
import EvaluationStep from "./steps/EvaluationStep/EvaluationStep";
import ReviewStep from "./steps/ReviewStep/ReviewStep";
import ShortDetails from "../type-specific/short-answer/Details";
import ShortContent from "../type-specific/short-answer/Content";
import ShortEvaluation from "../type-specific/short-answer/Evaluation";
import ShortReview from "../type-specific/short-answer/Review";
import OneDetails from "../type-specific/one-word/Details";
import OneContent from "../type-specific/one-word/Content";
import OneEvaluation from "../type-specific/one-word/Evaluation";
import OneReview from "../type-specific/one-word/Review";
import MatchContent from "../type-specific/match-the-following/Content";
import MatchReview from "../type-specific/match-the-following/Review";

/** A single shared Creator for every assessment type (no MCQ-only routes). */
export type AssessmentFormStep = "details" | "content" | "evaluation" | "review";
const STEPS = {
  details: DetailsStep,
  content: ContentStep,
  evaluation: EvaluationStep,
  review: ReviewStep,
};
const TYPE_STEPS = {
 "short-answer": { details:ShortDetails, content:ShortContent, evaluation:ShortEvaluation, review:ShortReview },
 "one-word": { details:OneDetails, content:OneContent, evaluation:OneEvaluation, review:OneReview },
 "match-the-following": { details:DetailsStep, content:MatchContent, evaluation:EvaluationStep, review:MatchReview },
};
export default function AssessmentForm({ step }: { step: AssessmentFormStep }) {
  const router = useRouter();
  const [typeCode, setTypeCode] = useState<string | null>(null);
  useEffect(() => {
    const id = getActiveAssessmentId();
    const record = id ? getAssessment(id) : undefined;
    const session=getDemoSession();
    if (!session || session.role!=="admin" || !record || (record.tenantId||"north")!==session.tenantId || !hasAssessmentWorkflow(record.typeCode)) {
      router.replace("/assessments/create");
      return;
    }
    setTypeCode(record.typeCode);
    const onWizardStep = (event: Event) => {
      const name=(event as CustomEvent<string>).detail;
      if (name === "type") router.push("/assessments/create");
      else if (["details","content","evaluation","review"].includes(name)) router.push(`/assessments/create/${name}`);
    };
    window.addEventListener("one-word-step",onWizardStep);
    return () => window.removeEventListener("one-word-step",onWizardStep);
  }, [router]);
  if (!typeCode) return null;
  const Screen = (typeCode === "short-answer" || typeCode === "one-word" || typeCode === "match-the-following") ? TYPE_STEPS[typeCode][step] : STEPS[step];
  return <div className={`assessment-variant assessment-variant--${typeCode}`}><Screen /></div>;
}
