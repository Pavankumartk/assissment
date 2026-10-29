CONNECT THE DOTS — CREATOR AND LEARNER VIEWER INTEGRATION

SOURCE: The supplied Connectdot.zip and viewconnectdot.zip.
The provided connectdot.css and viewconnect.css are unchanged, byte-for-byte.

Changes are limited to 9 files:
- New creator Content.tsx and original connectdot.css
- New learner Viewer.tsx and original viewconnect.css
- Assessment type catalogue + runtime registry
- Creator step routing (reuses existing Details, Evaluation, Review)
- Learner viewer routing
- Assessment-scoped Connect the Dots draft + progress keys

SAVED DRAFT KEY: connectDotsContentDraft
TYPE CODE: connect-the-dots

The existing Submit Confirmation, Assessment Submitted, Results and tool routes are reused.
The source viewer has three modes: Text Based, Numeric Value, Picture.

Install from the `web` repository root:
  unzip -o ~/Downloads/Connect_The_Dots_Integration_Updated_Files_Only.zip -d .
  npm run build

NOTE: The supplied source viewer had standalone demo data and a browser confirm.
The integration reads real assessment-scoped creator data instead, and saves
submissions into the same viewerAssessmentResult key as other assessments.

No existing creator/viewer Figma styles, other assessment types, global CSS,
or shared popup components are modified.

The available older project snapshot has unresolved imports in unrelated
creator modules; a full build on your current Mac repository is not verified.
