Problem Solving Viewer — shared Results, Retry, and submission overlap correction

Only two existing Problem Solving files are replaced:
  src/modules/assessments/components/type-specific/problem-solving/Viewer.tsx
  src/modules/assessments/components/type-specific/problem-solving/viewproblem.css

Important corrections:
- Submission success popup appears over the existing test UI, NOT a second Results screen.
- Closing the popup navigates to the existing assessment Results route, as in other assessment viewers.
- Results are recorded in the shared result format so the existing Results route can read the submission.
- When the learner reopens a submitted assessment, navigate to its Results route.
- Retry links from the shared Results page (viewer?retry=wrong or another retry value) open fresh Instructions for the next attempt; previous attempts stay saved and the attempt limit is enforced.
- Written responses without a complete objective answer key are pending grading, not automatically graded incorrect.
- Existing Problem Solving questions, hints, timer, navigator, instructions, and tool navigation are preserved.
- Creator pages and other assessment types are not modified.

Install:
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Problem_Solving_Viewer_Results_Overlap_Retry_Same_Flow_Fix.zip -d .
  npm run build
  npm run dev

Validation performed: TSX parse, CSS parse, comparative TypeScript diagnostics (no new issues), ZIP integrity.
The complete Next.js app build and browser check must be run on the local project.
No Python was used.
