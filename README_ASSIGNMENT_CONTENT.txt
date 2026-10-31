ASSIGNMENT CONTENT — UPDATED EXISTING FILES ONLY

Replace only these two existing files in your Next.js web project:

src/modules/assessments/components/type-specific/assignment/Content.tsx
src/modules/assessments/components/type-specific/assignment/assignment.css

Nothing changes in the shared Details, Evaluation, Review, Registry, or other assessment type pages.
Existing AssignmentShell, AssignmentUI.tsx, and assignment-data.ts from the earlier package are reused.

DESIGN / BEHAVIOR
- 6 cards: Question document; Submission types; Feedback type; Submission settings; Group Submission Settings; Notifications.
- Figma reference 72x36 gradient ON/OFF toggles and 58px inset setting rows.
- Clicking row arrow expands/collapses submission settings; switch operates independently.
- Word limit, max files, max size, accepted types are validated and saved.
- File upload (PDF, DOC, DOCX, JPG, PNG, TXT, 2 MB max) with browse and drag-and-drop.
- Autosave to assignmentContentDraft and retain existing common Review summary.
- Back > shared Details. Save & Continue > /assessments/create/evaluation.
- Existing 5-step creator nav retained, with horizontal scrolling on narrow mobile.
- Icons requested from /public/assets/assessmenticons/ (e.g. upload-01.svg, arrow-down-01.svg, attachment.svg).

USE
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Assignment_Content_Figma_Toggles_Updated.zip -d .
  npm run build
  npm run dev

IMPORTANT
The Assignment type registration must already be mapped to AssignmentContentStep in the existing AssessmentForm.tsx.
The install package intentionally does NOT patch shared routing because your local files differ from previously supplied snapshots.
Check locally:
  grep -n 'assignment' src/modules/assessments/components/common/AssessmentForm.tsx
If this is missing, share that *current* file so an exact minimal integration can be made safely.

NO Python. NO new source folders or page routes. NO changes to other assessment types.
