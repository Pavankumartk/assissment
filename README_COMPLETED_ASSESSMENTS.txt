Assessment completed-column and reopening protection (no CSS/visual changes)

Updated files (3):
- src/modules/assessments/storage/assessment-storage.ts
- src/modules/assessments/components/common/LearnerAssessments.tsx
- src/app/assessments/[assessmentId]/viewer/PageClient.tsx

Learner listing now separates Available and Completed published assessments.
Completed cards have a disabled Completed button (no Start).
On submit, existing viewers' result writes record a completion receipt. Older results
with a submittedAt value are also recognized. No creator preview or retry result is
mistaken for a new submission.
Viewer route blocks direct URL access to Completed assessments. Only an explicit
?retry=wrong attempt with a saved retry-question list is permitted (for the existing
Results page's Retry Incorrect Questions workflow).

IMPORTANT: The project currently uses browser localStorage and demo login. These
restrictions are enforced within the current browser, not across devices or
against someone editing developer-tools storage. A backend is needed for a
secure cross-device attempt lock.

Install from project root:
  unzip -o ~/Downloads/Learner_Completed_Column_Submission_Lock_Only.zip -d .
  npm run build
