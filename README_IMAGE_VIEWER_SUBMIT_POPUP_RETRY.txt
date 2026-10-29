IMAGE-BASED VIEWER — EXISTING MCQ POPUP + RESULT + RETRY INTEGRATION

Includes ONLY four updated viewer TypeScript pages and three scoped shared files.
NO changes to the four Figma CSS files, creator, Evaluation, Review, navigation, or other assessment types.

WHAT IS INTEGRATED
- The existing MCQ ViewerSubmitConfirm popup: Confirm Submission, Go Back, Submit Answers.
- The existing MCQ TextSubmitSuccess popup: Assessment Submitted, Back to Dashboard, View Result.
- Evaluation settings: result-release visibility and passing score (shared image-based Evaluation key).
- The original common Results screen via assessmentStorage key viewerAssessmentResult.
- Retry Incorrect Questions using the existing Results button and ?retry=wrong route.
  Each subtype reloads ONLY its incorrect questions and gets a separate attempt state.
  Retrying never overwrites the original result.
- Auto submission on timer expiry uses the same result-saving and submitted popup logic.
- Confirm and submitted popups work on Image-Based MCQ, Image Matching, Image Sequencing, and Image Sorting.

IMPORTANT
The popup components below already exist in your project and are REUSED (not replaced):
src/modules/assessments/components/viewer/ViewerSubmitConfirm.tsx
src/modules/assessments/components/viewer/TextSubmitSuccess.tsx
src/modules/assessments/components/viewer/text-submit-success.css
The viewer ZIP only adds the original MCQ submit-confirm styling in its own scoped stylesheet.

INSTALL ON YOUR MAC
cd ~/Desktop/assessments/web
unzip -o ~/Downloads/Image_Based_Four_Viewers_Submit_Submitted_Retry_Integration_Only.zip -d .
npm run build
npm run dev

TEST
1. Log in as Learner; start an Image-Based MCQ assessment.
2. Answer one or more questions; press Submit on the last question.
3. Check the exact original Confirm Submission popup; choose Go Back and then Submit Answers.
4. Check the original Assessment Submitted popup; choose View Result.
5. On the existing Results screen, choose Retry Incorrect Questions (if incorrect answers exist).
6. Check that the retry opens the same subtype viewer, only incorrect questions, fresh progress.
7. Repeat for Image Matching, Image Sequencing and Image Sorting.

NOT CHANGED
- Your four viewer layout/CSS files and their existing sizes, shadows, icons, mobile breakpoints.
- Image Labelling or remaining unsupplied subtypes.
- Creator, Details, Evaluation, Review, other assessment viewer pages.

VALIDATION
No TypeScript diagnostics originated from the changed Image-Based files in the available project snapshot. That older snapshot has existing errors outside this patch; a full build must still run on your latest Mac project.
