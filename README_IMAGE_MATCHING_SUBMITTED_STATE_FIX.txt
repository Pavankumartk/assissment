Image Matching viewer — Submitted state repair

Fixes:
- Viewer state is now isolated by assessment ID and by the current explicit Start Assessment action.
- Previously submitted attempts no longer make a fresh matching test open with a disabled Submitted button.
- Opening a completed Image Matching test again shows the original instructions screen before starting a new session.
- Existing submission popups, View Result, retry, and saved result records remain unchanged.
- No CSS or design changes. No other assessment viewers changed.

Install from ~/Desktop/assessments/web:
  unzip -o ~/Downloads/Image_Matching_Submitted_Locked_State_Fix_Only.zip -d .
  npm run build
  npm run dev

If an existing run was already stuck before installing this patch, the new assessment-scoped state key prevents it being inherited.
