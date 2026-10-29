ASSESSMENT CREATOR, RESULTS, SUBMIT, RETRY INTEGRATION — UPDATED FILES ONLY

Scope: routing/data-wiring, not a design replacement.
- Other assessment creators now begin at the existing MCQ-styled empty Content entry when no saved questions exist. Clicking Create Questions shows the original type-specific editor. Saved questions reopen the editor.
- Existing creator pages, Evaluation, Review, MCQ CSS, and viewer CSS are unchanged.
- Results use the existing ResultViewer and adapt legacy saved results for Fill Blanks, Match Following and older Image-Based submissions. No fake results when no attempt exists.
- Match Following and Image Labelling now use the existing shared Confirm Submission / Assessment Submitted components.
- Memory Game, Match Following, Fill Blanks and Image Labelling retry questions are passed to their original viewer; retry progress and results use separate keys.
- The existing shared MCQ/True-False/Drag & Drop viewer preserves original result when retrying.
- All 4 supplied Image-Based viewer pages and CSS are unchanged.

IMPORTANT prerequisites on your Mac:
- The creator components and previous packages (especially ImageViewerSubmitPopups.tsx and image-viewer-submission.ts) must already exist.
- This does not create a new Drag & Drop viewer. The current shared viewer is retained.
- There is no backend; attempts are scoped to this browser's assessment storage.
- The existing result-release rules still apply: scheduled/manual/never are not immediately viewable.

Run from the project root:
cd ~/Desktop/assessments/web
unzip -o ~/Downloads/Assessment_Existing_Content_Result_Submit_Retry_Integration_Only.zip -d .
npm run build
npm run dev

Verify in browser:
1. Choose a non-MCQ assessment -> Details -> Content; confirm empty MCQ-style landing with Create Questions.
2. Create/save a question; revisit Content and confirm it opens the existing editor (not a new design).
3. Publish, log in as learner, take test -> Submit -> Confirm Submission -> Assessment Submitted.
4. View Result -> existing Results page -> Retry Incorrect Questions -> Start Retry. Confirm only wrong questions and original score is not overwritten.
5. Repeat for Image-Based MCQ/Matching/Sequencing/Sorting/Labelling, Fill Blanks, Match Following, Memory Game and other registered types.

Compilation of modified files: no TypeScript diagnostics in the available project snapshot. The full build remains unverified on your local project; the older snapshot has unresolved files and unrelated TypeScript errors. Do not publish before a successful local build.
