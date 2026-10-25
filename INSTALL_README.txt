Figma Assessment page refinement.

Files changed:
- learner-assessment.css : Replaces previous browser styling with values from attached Figma CSS (443/779px columns, 122px cards, 36px inset fields, 16px text, exact shadows). Dashboard styles are retained.
- LearnerAssessmentBrowser.tsx : Breadcrumb double-chevron only; data and navigation unchanged.
- src/app/assessments/page.tsx : Removes demo footer on learner Assessment page only. Admin unchanged.
- sidebar/page.tsx : Starts collapsed on learner /assessments page to match reference, remains toggleable; other pages unchanged and logout remains removed.

Install: unzip -o Assessment_Learner_Figma_Source_CSS_Updated.zip -d .
Run: rm -rf .next && npm run build
