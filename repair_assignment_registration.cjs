#!/usr/bin/env node
'use strict';
// Assignment-only repair for the existing Next.js assessment creator.
// No third-party packages, Git patch matching, or Python required.
// Keeps all non-Assignment entries and the existing ReviewStep unchanged.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const args = process.argv.slice(2);
const preview = args.includes('--check');
const verifyOnly = args.includes('--verify');
const projectArg = args.find(a => !a.startsWith('--')) || '.';
const root = path.resolve(projectArg);
const prefix = 'src/modules/assessments';
const fileNames = [
  `${prefix}/config/assessment-types.ts`,
  `${prefix}/config/component-registry.ts`,
  `${prefix}/components/common/AssessmentForm.tsx`,
  `${prefix}/components/common/AssessmentContentEntry.tsx`,
  `${prefix}/storage/assessment-storage.ts`,
];
const creatorFiles = ['Details.tsx','Content.tsx','Evaluation.tsx','AssignmentUI.tsx','assignment-data.ts','assignment.css'].map(n => `${prefix}/components/type-specific/assignment/${n}`);
function stop(message) { throw Error(message); }
function assertion(ok, label) { if(!ok) stop(label); }
function countMatches(source, re) { return [...source.matchAll(re)].length; }
function block(source, re, opening, closing, label) {
  const match = re.exec(source);
  if (!match) stop(`${label} not found (local source differs). No files were changed.\nPlease share ${label}'s source so it can be integrated without guessing.`);
  const start = source.indexOf(opening, match.index + match[0].length - 1);
  if(start < 0) stop(`Opening ${opening} missing for ${label}`);
  let depth=0, quote='', escaped=false, lineComment=false, blockComment=false;
  for(let i=start;i<source.length;i++) {
    const c=source[i], next=source[i+1];
    if (lineComment) { if(c==='\n') lineComment=false; continue; }
    if (blockComment) { if(c==='*' && next==='/'){blockComment=false;i++;} continue; }
    if (quote) { if(escaped){escaped=false;continue;} if(c==='\\'){escaped=true;continue;} if(c===quote) quote=''; continue; }
    if (c==='/' && next==='/') { lineComment=true;i++;continue; }
    if (c==='/' && next==='*') { blockComment=true;i++;continue; }
    if (c==='"' || c==="'" || c==='`') {quote=c;continue;}
    if(c===opening) depth++;
    else if(c===closing) { depth--; if(depth===0) return {start,end:i,body:source.slice(start+1,i)}; }
  }
  stop(`Unclosed ${opening} in ${label}`);
}
function replacement(source, b, body) { return source.slice(0,b.start+1)+body+source.slice(b.end); }
function addOrReplaceLine(source, b, key, line, label) {
  const lines=b.body.split(/\r?\n/);
  const rx=new RegExp(`^\\s*["']?${key}["']?\\s*:`);
  const hits=lines.filter(l => rx.test(l));
  if(hits.length>1) stop(`Multiple ${key} entries in ${label}; no changes made`);
  if(hits.length && !/[},\]]\s*,?\s*$/.test(hits[0])) stop(`Existing ${key} entry in ${label} is multiline or incomplete; refusing to overwrite it.`);
  const updated=hits.length ? lines.map(l=>rx.test(l)?line:l).join('\n') : '\n'+line+b.body;
  return replacement(source,b,updated);
}
function ensureCatalogue(s) {
  const re=/(?:export\s+)?const\s+DEFAULT_ASSESSMENT_TYPES\s*(?::[^=]+)?=\s*\[/m;
  const b=block(s,re,'[',']','DEFAULT_ASSESSMENT_TYPES');
  const line='  {code:"assignment",label:"Assignment",category:"Application & Practical Assessments",implemented:true},';
  const lines=b.body.split(/\r?\n/);
  const rx=/\bcode\s*:\s*["']assignment["']/;
  const hits=lines.filter(l=>rx.test(l));
  if(hits.length>1) stop('Multiple Assignment catalogue definitions');
  if(hits.length && !/\}\s*,?\s*$/.test(hits[0])) stop('Assignment catalogue entry spans multiple lines; refusing an unsafe edit.');
  return replacement(s,b,hits.length ? lines.map(l=>rx.test(l)?line:l).join('\n') : '\n'+line+b.body);
}
function ensureRegistry(s) {
  const mode=/\b(?:export\s+)?type\s+QuestionMode\s*=\s*([^;]+);/m.exec(s);
  if(!mode) stop('QuestionMode union not found in component-registry.ts');
  if(!/["']assignment["']/.test(mode[1])) {
    const end=mode.index+mode[0].length-1;
    s=s.slice(0,end)+' | "assignment"'+s.slice(end);
  }
  const re=/(?:export\s+)?const\s+ASSESSMENT_ADAPTERS\s*(?::[^=]+)?=\s*\{/m;
  const b=block(s,re,'{','}','ASSESSMENT_ADAPTERS');
  const line='  "assignment": {code:"assignment",questionMode:"assignment",draftKeys:{details:"mcqAssessmentDraft",content:"assignmentContentDraft",evaluation:"mcqAssessmentEvaluationDraft"}},';
  return addOrReplaceLine(s,b,'assignment',line,'ASSESSMENT_ADAPTERS');
}
function ensureForm(s) {
  const names={};
  // Reuse an existing Assignment import (including the previous integration's names).
  for(const [target,sourceName] of [['details','Details'],['content','Content'],['evaluation','Evaluation']]) {
    const existing=new RegExp('import\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+["\u0027]\\.\\.\\/type-specific\\/assignment\\/'+sourceName+'["\u0027]').exec(s);
    if(existing) {names[target]=existing[1];continue;}
    const ident=sourceName==='Details'?'AssignmentDetailsStep':sourceName==='Content'?'AssignmentContentStep':'AssignmentEvaluationStep';
    const firstImport=/(?:^|\n)(import\s+[^;]+;)/m.exec(s);
    if(!firstImport) stop('No import statement found in AssessmentForm.tsx');
    const at=firstImport.index+(firstImport[0].startsWith('\n')?1:0);
    s=s.slice(0,at)+'import '+ident+' from "../type-specific/assignment/'+sourceName+'";\n'+s.slice(at);
    names[target]=ident;
  }
  if(!/\bReviewStep\b/.test(s)) stop('Shared ReviewStep not found. No new review component will be added.');
  const b=block(s,/\bconst\s+TYPE_STEPS\s*(?::[^=]+)?=\s*\{/m,'{','}','TYPE_STEPS');
  const line='  "assignment": {details:'+names.details+',content:'+names.content+',evaluation:'+names.evaluation+',review:ReviewStep},';
  return addOrReplaceLine(s,b,'assignment',line,'TYPE_STEPS');
}
function ensureEntry(s) {
  for(const [constant,key] of [['CONTENT_KEYS','assignmentContentDraft'],['DETAIL_KEYS','mcqAssessmentDraft']]) {
    const re=new RegExp(`\\bconst\\s+${constant}\\s*(?::[^=]+)?=\\s*\\{`,'m');
    const b=block(s,re,'{','}',constant);
    s=addOrReplaceLine(s,b,'assignment',`  "assignment": ["${key}"],`,constant);
  }
  return s;
}
function ensureStorage(s) {
  const b=block(s,/\bconst\s+ADDITIONAL_WORKFLOW_DRAFT_KEYS\s*(?::[^=]+)?=\s*\[/m,'[',']','ADDITIONAL_WORKFLOW_DRAFT_KEYS');
  const missing=['assignmentDetailsDraft','assignmentContentDraft','assignmentEvaluationDraft'].filter(k => !(new RegExp(`["']${k}["']`)).test(b.body));
  return missing.length ? replacement(s,b,'\n  '+missing.map(k=>`"${k}"`).join(', ')+','+b.body) : s;
}
const transforms=[ensureCatalogue,ensureRegistry,ensureForm,ensureEntry,ensureStorage];
function verify(texts) {
  const [a,b,c,d,e]=texts;
  const tests=[
    ['Type catalogue: Assignment implemented', /\bcode\s*:\s*["']assignment["'][^\n]*\bimplemented\s*:\s*true/.test(a)],
    ['Runtime adapter: Assignment registered', /["']assignment["']\s*:\s*\{\s*code\s*:\s*["']assignment["']/.test(b)],
    ['QuestionMode includes Assignment', /\btype\s+QuestionMode\s*=[^;]*["']assignment["']/.test(b)],
    ['Assignment Details/Content/Evaluation mapped', /["\']assignment["\']\s*:\s*\{\s*details\s*:\s*Assignment\w+\s*,\s*content\s*:\s*Assignment\w+\s*,\s*evaluation\s*:\s*Assignment\w+\s*,\s*review\s*:\s*ReviewStep/.test(c)],
    ['Existing ReviewStep kept', /\bReviewStep\b/.test(c)],
    ['Content preview keys registered', /["']assignment["']\s*:\s*\[\s*["']assignmentContentDraft["']/.test(d)],
    ['Draft storage registered', /["']assignmentContentDraft["']/.test(e)],
    ['All six Assignment page files exist', creatorFiles.every(f=>fs.existsSync(path.join(root,f)))],
  ];
  for(const [name,pass] of tests) console.log((pass?'PASS':'FAIL')+'  '+name);
  return tests.every(t=>t[1]);
}
try {
  assertion(fs.existsSync(path.join(root,'package.json')),'package.json not found; run from the web project folder');
  const read=f => {const p=path.join(root,f); assertion(fs.existsSync(p),`Missing ${f}`);return fs.readFileSync(p,'utf8');};
  const originals=fileNames.map(read);
  if(verifyOnly) { if(!verify(originals)) process.exitCode=1;else console.log('Assignment registry verification passed.'); }
  else {
    assertion(creatorFiles.every(f=>fs.existsSync(path.join(root,f))), 'Assignment pages are missing. Extract the previous Assignment ZIP into the web project first.');
    const modified=originals.map((source,i)=>transforms[i](source));
    assertion(verify(modified),'Verification failed. Nothing was changed.');
    const changes=modified.map((content,i)=>({content,original:originals[i],name:fileNames[i]})).filter(x=>x.content!==x.original);
    console.log(`\n${changes.length} shared files need an Assignment-only edit.`);
    changes.forEach(c=>console.log('EDIT '+c.name));
    if(preview) { console.log('DRY RUN — no project files changed.'); }
    else if(!changes.length) { console.log('Already integrated; no files changed.'); }
    else {
      const backups=fs.mkdtempSync(path.join(os.homedir(),'.assignment-registration-backup-'));
      // Safe: prepare all backups outside the repository before changing any file.
      for(const change of changes) {
        const dest=path.join(backups,change.name);
        fs.mkdirSync(path.dirname(dest),{recursive:true});
        fs.writeFileSync(dest,change.original);
      }
      const written=[];
      try {
        for(const change of changes) {
          const dest=path.join(root,change.name);
          fs.writeFileSync(dest,change.content);
          written.push(change);
        }
        assertion(verify(fileNames.map(read)),'Post-edit verification failed');
      } catch(e) {
        for(const change of written) fs.writeFileSync(path.join(root,change.name),change.original);
        throw e;
      }
      console.log(`INTEGRATED — original files backed up under ${backups}`);
    }
  }
} catch(error) { console.error('STOPPED:',error.message);process.exitCode=1; }
