#!/usr/bin/env node
"use strict";
// Assignment registration only. No new source folders, routes, or review pages.
// Keeps the app's shared Details and Review; reuses already-installed Assignment Content/Evaluation.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const root = path.resolve(process.argv.find((a,i)=>i>1 && !a.startsWith("--")) || ".");
const mode = process.argv.includes("--verify") ? "verify" : process.argv.includes("--apply") ? "apply" : "check";
const base = "src/modules/assessments";
const files = [
  `${base}/config/assessment-types.ts`,
  `${base}/config/component-registry.ts`,
  `${base}/components/common/AssessmentForm.tsx`,
];
const content = `${base}/components/type-specific/assignment/Content.tsx`;
const evaluation = `${base}/components/type-specific/assignment/Evaluation.tsx`;
function fail(msg) { throw new Error(msg); }
function requireThat(test,msg) { if (!test) fail(msg); }
function block(s,regexp,opening,closing,name) {
  const re = new RegExp(regexp,"m"); const m=re.exec(s);
  requireThat(m,`Cannot locate ${name}. No changes applied; your source structure differs.`);
  const pos=s.indexOf(opening,m.index+m[0].length-1);
  requireThat(pos>=0,`Cannot parse ${name}`);
  let depth=0,quote=null,escape=false,comment=null;
  for(let i=pos;i<s.length;i++) {
    const c=s[i],n=s[i+1];
    if(comment==='line'){if(c==='\n')comment=null;continue;}
    if(comment==='block'){if(c==='*'&&n==='/'){i++;comment=null;}continue;}
    if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote)quote=null;continue;}
    if(c==='/'&&n==='/'){comment='line';i++;continue;}
    if(c==='/'&&n==='*'){comment='block';i++;continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c===opening)depth++;
    if(c===closing){depth--;if(depth===0)return {start:pos,end:i,body:s.slice(pos+1,i)};}
  }
  fail(`Cannot locate the end of ${name}`);
}
function changeBlock(s,b,newBody){return s.slice(0,b.start+1)+newBody+s.slice(b.end);}
function upsertOneLine(s,b,key,value,name) {
  const rows=b.body.split('\n');
  const rx=new RegExp(`^\\s*(?:["']${key}["']|${key})\\s*:`);
  const inds=rows.map((row,i)=>rx.test(row)?i:-1).filter(i=>i>=0);
  requireThat(inds.length<=1,`Multiple ${key} registrations in ${name}; stopping safely`);
  if(inds.length) {
    const old=rows[inds[0]];
    requireThat(/\}\s*,?\s*$/.test(old),`${key} in ${name} is multiline. Refusing to overwrite other entries.`);
    rows[inds[0]]=value;
  } else rows.splice(0,0,'',value);
  return changeBlock(s,b,rows.join('\n'));
}
function updateCatalogue(s) {
  const b=block(s,'\\b(?:export\\s+)?(?:const|let)\\s+DEFAULT_ASSESSMENT_TYPES\\s*(?::[^=]+)?=\\s*\\[','[',']','DEFAULT_ASSESSMENT_TYPES');
  const definition='  {code:"assignment",label:"Assignment",category:"Practical Assessments",implemented:true},';
  const rows=b.body.split('\n');
  const matches=rows.map((r,i)=>/\bcode\s*:\s*["']assignment["']/.test(r)?i:-1).filter(i=>i>=0);
  requireThat(matches.length<=1,'Multiple Assignment definitions; no changes made');
  if(matches.length){
    requireThat(/\}\s*,?\s*$/.test(rows[matches[0]]),'Assignment definition is multiline; no changes made');
    rows[matches[0]]=definition;
  } else rows.unshift('',definition);
  return changeBlock(s,b,rows.join('\n'));
}
function updateRegistry(s) {
  const m=/\b(?:export\s+)?type\s+QuestionMode\s*=\s*([^;]+);/m.exec(s);
  requireThat(m,'QuestionMode type not found. No changes made.');
  if(!/["']assignment["']/.test(m[1])){
    const idx=m.index+m[0].length-1;
    s=s.slice(0,idx)+' | "assignment"'+s.slice(idx);
  }
  const b=block(s,'\\b(?:export\\s+)?const\\s+ASSESSMENT_ADAPTERS\\s*(?::[^=]+)?=\\s*\\{','{','}','ASSESSMENT_ADAPTERS');
  return upsertOneLine(s,b,'assignment',
    '  "assignment": {code:"assignment",questionMode:"assignment",draftKeys:{details:"mcqAssessmentDraft",content:"assignmentContentDraft",evaluation:"mcqAssessmentEvaluationDraft"}},',
    'ASSESSMENT_ADAPTERS');
}
function updateForm(s) {
  requireThat(/\bReviewStep\b/.test(s),'Shared ReviewStep not found; no changes made.');
  // Use the exact same Details component already used by MCQ/other types.
  const defaultDetails=/\bconst\s+STEPS\s*(?::[^=]+)?=\s*\{/.test(s)
    ? (()=>{const b=block(s,'\\bconst\\s+STEPS\\s*(?::[^=]+)?=\\s*\\{','{','}','STEPS');
        const v=/\bdetails\s*:\s*([\w.]+)/.exec(b.body); requireThat(v,'No shared details in STEPS');return `STEPS.details`;})()
    : (/\bDetailsStep\b/.test(s)?'DetailsStep':null);
  requireThat(defaultDetails,'Cannot find shared DetailsStep. No changes made.');
  // The earlier package added a different Assignment Details component. Do not use it.
  s=s.replace(/^import\s+\w+\s+from\s+["']\.\.\/type-specific\/assignment\/Details["'];?\s*\n/gm,'');
  let names={};
  for(const [part,unit] of [['content','Content'],['evaluation','Evaluation']]){
    const rx=new RegExp(`^import\\s+([\\w$]+)\\s+from\\s+[\"\']\\.\\.\\/type-specific\\/assignment\\/${unit}[\"\'];?`,"m");
    const existing=rx.exec(s);
    if(existing){names[part]=existing[1];continue;}
    const name=unit==='Content'?'AssignmentContentStep':'AssignmentEvaluationStep';
    const first=/^import\s/m.exec(s);
    requireThat(first,'Cannot locate imports in AssessmentForm.tsx');
    s=s.slice(0,first.index)+`import ${name} from "../type-specific/assignment/${unit}";\n`+s.slice(first.index);
    names[part]=name;
  }
  const b=block(s,'\\bconst\\s+TYPE_STEPS\\s*(?::[^=]+)?=\\s*\\{','{','}','TYPE_STEPS');
  // Only Assignment row changes; all other rows remain byte-for-byte identical.
  const row=`  "assignment": {details:${defaultDetails},content:${names.content},evaluation:${names.evaluation},review:ReviewStep},`;
  return upsertOneLine(s,b,'assignment',row,'TYPE_STEPS');
}
const transforms=[updateCatalogue,updateRegistry,updateForm];
function verify(texts){
 const [types,reg,form]=texts;
 const checks=[
  ['Assignment enabled in type catalogue',/code\s*:\s*["']assignment["'][^\n]*implemented\s*:\s*true/.test(types)],
  ['Runtime adapter registered',/["']assignment["']\s*:\s*\{\s*code\s*:\s*["']assignment["']/.test(reg)],
  ['Assignment question mode registered',/type\s+QuestionMode\s*=[^;]*["']assignment["']/.test(reg)],
  ['Shared Details used (no custom Assignment Details)',/["']assignment["']\s*:\s*\{\s*details\s*:\s*(?:STEPS\.details|DetailsStep)\s*,/.test(form)],
  ['Assignment Content and Evaluation mapped',/["']assignment["']\s*:\s*\{[^\n]*content\s*:\s*\w*Assignment\w*Content\w*\s*,\s*evaluation\s*:\s*\w*Assignment\w*Evaluation\w*/.test(form)],
  ['Original Review page reused',/["']assignment["']\s*:\s*\{[^\n]*review\s*:\s*ReviewStep/.test(form)],
  ['Supplied Content page present',fs.existsSync(path.join(root,content))],
  ['Supplied Evaluation page present',fs.existsSync(path.join(root,evaluation))],
 ];
 checks.forEach(([name,passed])=>console.log(`${passed?'PASS':'FAIL'}  ${name}`));
 return checks.every(c=>c[1]);
}
try {
 requireThat(fs.existsSync(path.join(root,'package.json')),'Run from the existing web project root containing package.json.');
 const original=files.map(f=>{const p=path.join(root,f);requireThat(fs.existsSync(p),`Missing existing file ${f}`);return fs.readFileSync(p,'utf8');});
 if(mode==='verify'){if(!verify(original))process.exitCode=1;}
 else {
  requireThat(fs.existsSync(path.join(root,content)),'Assignment Content.tsx is not installed. Extract the previously supplied Assignment pages first.');
  requireThat(fs.existsSync(path.join(root,evaluation)),'Assignment Evaluation.tsx is not installed. Extract the previously supplied Assignment pages first.');
  const updated=original.map((s,i)=>transforms[i](s));
  requireThat(verify(updated),'Pre-write validation failed. No changes applied.');
  const changed=files.map((f,i)=>({file:f,old:original[i],now:updated[i]})).filter(x=>x.old!==x.now);
  console.log(`\n${changed.length} existing file(s) require an Assignment-only change.`);
  changed.forEach(x=>console.log(`  ${x.file}`));
  if(mode==='check') console.log('CHECK ONLY: No source files changed.');
  else if(!changed.length)console.log('Already integrated; no changes needed.');
  else {
    const backup=fs.mkdtempSync(path.join(os.tmpdir(),'assignment-existing-flow-'));
    for(const c of changed){const p=path.join(backup,c.file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,c.old);}
    const written=[];
    try{
      for(const c of changed){fs.writeFileSync(path.join(root,c.file),c.now);written.push(c);}
      requireThat(verify(files.map(f=>fs.readFileSync(path.join(root,f),'utf8'))),'Post-write verification failed');
    }catch(e){written.forEach(c=>fs.writeFileSync(path.join(root,c.file),c.old));throw e;}
    console.log(`APPLIED. Backups are outside your project: ${backup}`);
  }
 }
}catch(e){console.error('STOPPED:',e.message);process.exitCode=1;}
