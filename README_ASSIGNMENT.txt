ASSIGNMENT ASSESSMENT — CREATOR FLOW (NODE.JS EDITION)

Only Next.js / React / TypeScript / CSS / built-in Node.js utilities are used.
No additional installer dependencies are required.

Creator flow:
  Assessment Type -> Details (Assignment) -> Create Questions (Assignment Content)
  -> Assignment Evaluation -> EXISTING common ReviewStep -> Publish

Files included:
  src/modules/assessments/components/type-specific/assignment/assignment-data.ts
  src/modules/assessments/components/type-specific/assignment/AssignmentUI.tsx
  src/modules/assessments/components/type-specific/assignment/Details.tsx
  src/modules/assessments/components/type-specific/assignment/Content.tsx
  src/modules/assessments/components/type-specific/assignment/Evaluation.tsx
  src/modules/assessments/components/type-specific/assignment/assignment.css
  install_assignment.js (Node.js only, no extra npm dependencies)

INSTALLATION ON MAC
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Assignment_Creator_Node_Only_Existing_Review.zip -d .
  node install_assignment.js . --check
  node install_assignment.js .
  npm run build
  npm run dev

The installer checks your current routing files and changes only:
  src/modules/assessments/config/assessment-types.ts
  src/modules/assessments/config/component-registry.ts
  src/modules/assessments/components/common/AssessmentForm.tsx
  src/modules/assessments/storage/assessment-storage.ts

It keeps the original ReviewStep and its styling unchanged. It refuses to overwrite
existing Assignment component files with different contents and stops if expected
routing markers are absent. If an old recognized integration installer is present,
it is removed after successful installation. Re-running this version is supported.

PUSH UPDATES TO GITHUB AFTER A SUCCESSFUL BUILD
  git add src/modules/assessments/config/assessment-types.ts \
    src/modules/assessments/config/component-registry.ts \
    src/modules/assessments/components/common/AssessmentForm.tsx \
    src/modules/assessments/storage/assessment-storage.ts \
    src/modules/assessments/components/type-specific/assignment/
  git commit -m "Integrate Assignment creator using existing Review"
  git push origin main

DESIGN & SCOPE
  - Design files use scoped assignment.css, Segoe UI, #DFE6E9 and neumorphic shadows.
  - Tablet/mobile responsive layout and horizontally scrollable tables.
  - Assignment Details, Content, Evaluation; no new Review page.
  - No changes to learner viewer are included.
  - Question documents are stored in browser storage as data URLs and are subject to storage size limits.
  - A full Next.js build against your local project is required before deployment.
