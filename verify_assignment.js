#!/usr/bin/env node
"use strict";
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2] || '.');
const read = p => fs.existsSync(path.join(root,p)) ? fs.readFileSync(path.join(root,p),'utf8') : '';
const base = 'src/modules/assessments/';
const a = read(base+'config/assessment-types.ts');
const r = read(base+'config/component-registry.ts');
const f = read(base+'components/common/AssessmentForm.tsx');
const e = read(base+'components/common/AssessmentContentEntry.tsx');
const creator = read(base+'components/common/steps/CreateStep/CreateStep.tsx');
const files = ['Details.tsx','Content.tsx','Evaluation.tsx','AssignmentUI.tsx','assignment-data.ts','assignment.css'];
const checked = [
 ['Assignment is enabled in type catalogue', /code\s*:\s*["']assignment["'][^\n]*implemented\s*:\s*true/.test(a)],
 ['Assignment is mapped in component registry', /["']assignment["']\s*:\s*\{[^\n]*code\s*:\s*["']assignment["']/.test(r)],
 ['Assignment is added to QuestionMode union', /QuestionMode[^;]*["']assignment["']/.test(r)],
 ['Assignment Details, Content and Evaluation are registered', /["']assignment["']\s*:\s*\{[^\n]*details\s*:\s*AssignmentDetailsStep[^\n]*content\s*:\s*AssignmentContentStep[^\n]*evaluation\s*:\s*AssignmentEvaluationStep/.test(f)],
 ['Assignment reuses the existing ReviewStep', /["']assignment["']\s*:\s*\{[^\n]*review\s*:\s*ReviewStep/.test(f)],
 ['Content entry can reopen Assignment questions', /["']assignment["']\s*:\s*\[["']assignmentContentDraft["']\]/.test(e)],
 ['Details data is available to Content entry', /["']assignment["']\s*:\s*\[["']mcqAssessmentDraft["']\]/.test(e)],
 ['Create screen uses the generic configured-type navigation', /findAssessmentTypeByLabel\(item\)/.test(creator) && /hasAssessmentWorkflow\(configured\.code\)/.test(creator) && /router\.push\(["']\/assessments\/create\/details["']\)/.test(creator)],
 ...files.map(name=>['Assignment '+name+' exists',fs.existsSync(path.join(root,base+'components/type-specific/assignment',name))]),
];
let bad = false;
for (const [name,pass] of checked) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) bad = true;
}
if(bad) {
  console.error('Assignment has not been fully integrated in this working copy. Run node install_assignment.js . first.');
  process.exitCode=1;
} else console.log('Assignment creator wiring present. Run npm run build; then push and deploy to update the live website.');
