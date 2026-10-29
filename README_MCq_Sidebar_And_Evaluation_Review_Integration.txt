MCQ SIDEBAR PARITY + ALL REGISTERED CREATOR EVALUATION/REVIEW FLOW

Files included (only six modified application source files):
- Image-Based Content.tsx and image-based.css: MCQ-matched Question Settings and Assessment Summary sidebar; all other subtype editing content remains unchanged. The existing CSS is retained; scoped sidebar overrides are appended.
- common/AssessmentForm.tsx: preserves the explicit routing for MCQ, Short Answer, One-Word, True/False, Fill Blanks, Long Answer, Drag & Drop, Memory Game, Image-Based, and Match the Following. Adds support for type-specific step navigation events.
- common/steps/EvaluationStep/EvaluationStep.tsx: loads/saves the active assessment's evaluation draft, never labels non-MCQ types as MCQ; MCQ/Image-Based/Match the Following retain their already-connected evaluation draft key.
- common/steps/ReviewStep/ReviewStep.tsx: supports the active type's draft on the shared Review page (MCQ, Drag & Drop, Memory Game). MCQ validation is preserved; shared pages refuse to publish empty Drag/Memory drafts. Existing dedicated reviews for image/match/short/one/true/fill/long remain in place.
- storage/assessment-storage.ts: copies every registered assessment type's details, content, and evaluation draft when duplicating an assessment; the existing per-assessment localStorage isolation is unchanged.

FLOW:
MCQ: Content -> Evaluation -> Review
Short Answer: Content -> Short Evaluation -> Short Review
One-Word: Content -> One-Word Evaluation -> One-Word Review
True/False: Content -> True/False Evaluation -> True/False Review
Fill Blanks: Content -> Fill Blanks Evaluation -> Fill Blanks Review
Long Answer: Content -> Long Answer Evaluation -> Long Answer Review
Drag & Drop: Content -> shared Evaluation -> shared Review
Memory Game: Content -> shared Evaluation -> shared Review
Match the Following: Content -> shared Evaluation -> Match Review
Image-Based (all six subtypes): Content -> Preview Questions -> shared Evaluation -> Image Review

NOTE: This patch uses previously installed type-registration files. The older uploaded project snapshot is missing some Drag & Drop / Memory Game / Match the Following creator files, so full-build success cannot be established here. Keep those components already present on your Mac; this patch does not include/recreate them.

PRE-INSTALL FILE CHECK (from ~/Desktop/assessments/web):
for item in 'drag-and-drop/Details.tsx' 'drag-and-drop/Content.tsx' 'memory-game/Details.tsx' 'memory-game/Content.tsx' 'match-the-following/Content.tsx' 'match-the-following/Review.tsx'; do
 test -f "src/modules/assessments/components/type-specific/$item" || echo "MISSING: $item";
done

INSTALL:
cd ~/Desktop/assessments/web
unzip -o ~/Downloads/MCQ_Sidebar_All_Types_Evaluation_Review_Integration_Only.zip -d .
npm run build
npm run dev

Do not push until npm run build succeeds. Existing unrelated TS errors in the older snapshot are not fixed by this targeted patch.
