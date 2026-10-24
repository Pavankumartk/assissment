Generate With AI integration for MCQ, One Word and Short Answers

Installation: unzip over the root of your existing web project. The ZIP adds the
route /assessments/create/ai and its component, updates ONLY the three Content
components and adds the missing assessment icon assets. The shared Header and
Sidebar source files are not replaced.

Entry points: initial Content page Generate With AI; MCQ builder Add menu;
One Word and Short Answer builder AI action.

Cancel returns to /assessments/create/content. AI draft settings are saved
separately per assessment type in localStorage. This page does not call a real
AI backend; the existing Generate Questions button reports that a service
connection is required. It does not create question records.

Run: rm -rf .next && npm run build, then npm run dev.
