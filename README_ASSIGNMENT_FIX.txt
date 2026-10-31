ASSIGNMENT CREATOR — REGISTRATION AND ROUTING FIX

Why the selector previously said "This assessment type is not configured yet":
The type must be implemented in the assessment type catalogue AND registered in
ASSESSMENT_ADAPTERS. The earlier integration did not reliably register the adapter.

WHAT THIS FIX DOES
- Registers Assignment under Application & Practical Assessments, implemented:true.
- Adds questionMode "assignment" and the adapter INSIDE ASSESSMENT_ADAPTERS.
- Repairs a misplaced Assignment adapter line from the earlier installer if present.
- Routes Assignment Details / Content / Evaluation in the existing AssessmentForm.
- Uses the EXACT existing ReviewStep component, no new Review or CSS.
- Keeps the existing MCQ-style Create Questions entry screen, then opens Assignment Content.
- Makes the saved Assignment document visible as one item in the existing Review step.
- Adds Assignment draft keys to duplicate-assessment storage.
- Leaves all other assessment types and page styles unchanged.

REPLACE YOUR EARLIER ASSIGNMENT PACKAGE WITH THIS ONE
1. Place this ZIP into your Mac Downloads folder.
2. In Terminal:

   cd ~/Desktop/assessments/web
   unzip -o ~/Downloads/Assignment_Creator_Registration_Fixed.zip -d .
   node install_assignment.js . --check
   node install_assignment.js .
   npm run build
   npm run dev

3. Sign in as an Institute Admin, open Assessments > Create Assessment,
   select Practical Assessments > Assignment.
4. Complete Details, click Save & Continue, then click Create Questions.
   Upload a document, configure submissions, Save & Continue to Evaluation,
   then Review. The Review screen is your EXISTING shared page.

TO PUSH AFTER A SUCCESSFUL BUILD
   git status
   git add src/modules/assessments/config/assessment-types.ts \
     src/modules/assessments/config/component-registry.ts \
     src/modules/assessments/components/common/AssessmentForm.tsx \
     src/modules/assessments/components/common/AssessmentContentEntry.tsx \
     src/modules/assessments/storage/assessment-storage.ts \
     src/modules/assessments/components/type-specific/assignment/
   git commit -m "Fix Assignment creator registration and existing Review integration"
   git push origin main

NOTES
- This release integrates the creator workflow only, not a learner Assignment viewer.
- Existing assessment templates, shared Review and review.css are not replaced.
- The install command may be repeated. --check never writes to the project.
- The project build must be run locally: the full current application is not included.
