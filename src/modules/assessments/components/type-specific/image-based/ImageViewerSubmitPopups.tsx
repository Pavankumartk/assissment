"use client";
import ViewerSubmitConfirm from "@/modules/assessments/components/viewer/ViewerSubmitConfirm";
import TextSubmitSuccess from "@/modules/assessments/components/viewer/TextSubmitSuccess";
import { imageViewerPassingScore, imageViewerRelease } from "./image-viewer-submission";
import "./image-viewer-submit-popups.css";

type Props = {
  title: string;
  answered: number;
  total: number;
  flagged: number;
  totalMarks: number;
  earnedMarks: number;
  confirmOpen: boolean;
  submittedOpen: boolean;
  isRetry: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onClose: () => void;
};
/** Use precisely the popup components that the other assessment viewers already use. */
export default function ImageViewerSubmitPopups(props: Props) {
  return <>
    {props.confirmOpen && <ViewerSubmitConfirm
      answered={props.answered}
      remaining={Math.max(0, props.total - props.answered)}
      flagged={props.flagged}
      onBack={props.onBack}
      onSubmit={props.onSubmit}
    />}
    {props.submittedOpen && <TextSubmitSuccess
      title={props.title}
      scorePercent={props.totalMarks > 0 ? Math.round(props.earnedMarks / props.totalMarks * 100) : 0}
      pendingCount={0}
      passingScore={imageViewerPassingScore()}
      release={imageViewerRelease()}
      isRetry={props.isRetry}
      onClose={props.onClose}
    />}
  </>;
}
