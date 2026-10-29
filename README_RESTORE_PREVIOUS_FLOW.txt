RESTORE PREVIOUS LEARNER ASSESSMENT FLOW — UNDO LAST COMPLETED LOCK PATCH

Reverts ONLY the changes introduced by Learner_Completed_Column_Submission_Lock_Only.zip.

Files restored (3):
- src/modules/assessments/components/common/LearnerAssessments.tsx
- src/modules/assessments/storage/assessment-storage.ts
- src/app/assessments/[assessmentId]/viewer/PageClient.tsx

Restores the original Available Assessments list and Start Assessment button.
Removes the newly added Completed section, disabled Completed button, and viewer route completion guard.
Keeps earlier viewer updates, including Image Matching's fresh-attempt/instructions fix.
No CSS or creator/evaluation/review/viewer design files changed.

From project root:
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Restore_Previous_Learner_Assessment_Flow_Only.zip -d .
  npm run build

IMPORTANT: This is a rollback to the PREVIOUS behavior, not a new completion-lock implementation.
The last patch may have written localStorage completion receipts; the restored code ignores those receipts.
Other existing viewer saved-submitted logic is untouched.
