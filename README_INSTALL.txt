FIX: DetailsStep compatibility for Drag & Drop, Fill in the Blank, Memory Game, True / False.

Only existing src/modules/assessments/components/common/steps/DetailsStep/DetailsStep.tsx is updated.

Mac installation (run after downloading the ZIP):
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Assessment_Details_Props_Build_Fix.zip -d .
  npm run build

Fix restores optional draftKey, countKey and typeLabel props used by existing question-type Details wrappers.
It also persists each wrapper's Details and question count under that assessment type's existing keys rather than hard-coded MCQ keys.
No CSS, navigation, viewer or other assessment files change.

Verification: static TypeScript check in provided project snapshot shows no errors relating to the DetailsStep wrapper props. The snapshot contains unrelated type/module errors; the user Mac project is the final production build check.
