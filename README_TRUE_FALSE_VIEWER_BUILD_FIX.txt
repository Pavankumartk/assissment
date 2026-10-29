True / False viewer type error fix.

The shared AssessmentViewer now accepts mode="true-false" and reads trueFalseAssessmentDraft, trueFalseContentDraft, and trueFalseEvaluationDraft (including blankCorrect fallback). MCQ continues to use its existing keys. No markup or CSS modifications.

cd ~/Desktop/assessments/web
unzip -o ~/Downloads/TrueFalse_Viewer_Mode_Build_Fix_Only.zip -d .
npm run build
