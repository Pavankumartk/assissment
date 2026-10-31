ASSIGNMENT CREATOR — REGISTRATION AND PAGE INTEGRATION

This package corrects the actual condition seen in your current GitHub main code:
  Practical Assessments — Assignment selected. This assessment type is not configured yet.

The Type popup exists, but the registered catalogue and the runtime adapter do not
include Assignment. The CreateStep selection handler requires BOTH. Updating only
Assignment's TSX or CSS does not enable it.

THIS PACKAGE
- Adds Assignment to DEFAULT_ASSESSMENT_TYPES with implemented:true
- Adds Assignment question mode and adapter to component-registry.ts
- Registers Assignment Details, Content, Evaluation in AssessmentForm.tsx
- Reuses the EXISTING ReviewStep (does NOT create/replace Review)
- Registers Assignment content/detail draft keys for Create Questions
- Adds Assignment draft keys to assessment storage duplication
- Copies six existing Assignment-specific TSX/TS/CSS files into the right folder
- No changes to CreateStep markup or CSS, and no changes to other assessment-type entries
- The learner Assignment viewer is NOT implemented in this package
- Uses Node.js only; no Python script in this ZIP

RUN IN MAC TERMINAL (from your existing Next.js project folder)

  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Assignment_Creator_Direct_Integration_Fix.zip -d .
  node integrate_assignment.js . --check
  node integrate_assignment.js .
  node integrate_assignment.js . --verify
  npm run build
  npm run dev

The verify command MUST print PASS for all eight checks. Open local app and
select Practical Assessments > Assignment. It should take you to Details.
After entering details, you will see the existing Content empty state, then
click Create Questions to open the Assignment content editor. Save & Continue
opens Evaluation, then the existing Review page.

ONLY IF YOUR BUILD SUCCEEDS, PUSH THE CHANGES:

  git status
  git add src/modules/assessments/config/assessment-types.ts \
    src/modules/assessments/config/component-registry.ts \
    src/modules/assessments/components/common/AssessmentForm.tsx \
    src/modules/assessments/components/common/AssessmentContentEntry.tsx \
    src/modules/assessments/storage/assessment-storage.ts \
    src/modules/assessments/components/type-specific/assignment/
  git commit -m "Integrate Assignment creator into assessment selection flow"
  git push origin main

IMPORTANT
The existing live site won't change until you apply, build, push and deploy.
The script does not access or modify your GitHub repository directly.
If a check fails, the installer stops without changing the source files.
Existing files that are modified are backed up outside the project, under
~/.assignment-integration-backups/.

If Type still shows not configured after verified install, verify you are
running the newly built application and not viewing an older deployed build.
