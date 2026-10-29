Fix nine TypeScript build errors after installing the shared MCQ sidebar / Evaluation / Review integration.

Updated files only:
- src/modules/assessments/components/common/steps/EvaluationStep/EvaluationStep.tsx
- src/modules/assessments/components/common/steps/ReviewStep/ReviewStep.tsx
- src/modules/assessments/storage/assessment-storage.ts

Changes:
- Shared Evaluation accepts the existing optional detailsKey, evaluationKey, typeLabel props and reads/saves the correct type-specific evaluation draft.
- Shared Review accepts existing detailsKey, contentKey, evaluationKey and legacy type flags. It reads the wrapper's type-specific drafts and preserves the existing UI.
- publishAssessment supports long-answer and its matching detail/content keys.

Install from project web directory:
cd ~/Desktop/assessments/web
unzip -o ~/Downloads/Fix_9_Assessment_Evaluation_Review_Build_Errors_Only.zip -d .
npm run build

If successful:
git add src/modules/assessments/components/common/steps/EvaluationStep/EvaluationStep.tsx src/modules/assessments/components/common/steps/ReviewStep/ReviewStep.tsx src/modules/assessments/storage/assessment-storage.ts
git commit -m "Fix shared evaluation and review props for assessment types"
git push origin main
