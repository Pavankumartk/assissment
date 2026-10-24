FILL IN THE BLANKS — RESTORED ORIGINAL MCQ VIEWER FLOW

Only the seven files listed in this patch are modified/created.

- Instructions now use the existing MCQ viewer layout and CSS, with Fill in the Blanks assessment data.
- Submit uses the MCQ confirmation popup (Go Back / Submit Answers), not window.confirm.
- Submitted popup matches MCQ (including Evaluation-driven result visibility).
- View Result uses the original MCQ Results UI with real saved blank answers, not a new result screen.
- MCQ, One Word, Short Answer viewers, Creator steps, Header, and Sidebar are unchanged.
- The original saved Fill in the Blanks result and existing Fill questions are retained.
- Retry for incorrect Fill questions preserves the original result.

Installation from your Mac project root ~/Desktop/assessments/web:
  unzip -o ~/Downloads/Assessment_Fill_Blanks_Restore_Original_MCQ_Viewer_Flow.zip -d .
  rm -rf .next
  npm run build

TypeScript checking passed locally. Complete Next.js build could not be run in the packaged workspace because @next/env was missing from its incomplete local node_modules; validate with npm run build on your Mac.
