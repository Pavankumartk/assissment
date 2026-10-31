#!/usr/bin/env node
"use strict";
// Targeted Assignment creator registration for the existing assessment app.
// Reuses the original ReviewStep. Other assessment types are not edited.
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
const check = args.includes("--check");
const root = path.resolve(args.find(a => !a.startsWith("--")) || ".");
const source = __dirname;
const base = "src/modules/assessments";
const assign = `${base}/components/type-specific/assignment`;
const additions = ["AssignmentUI.tsx","assignment-data.ts","assignment.css","Details.tsx","Content.tsx","Evaluation.tsx"].map(n=>`${assign}/${n}`);
const edits = [
  [`${base}/config/assessment-types.ts`, catalogue],
  [`${base}/config/component-registry.ts`, registry],
  [`${base}/components/common/AssessmentForm.tsx`, form],
  [`${base}/components/common/AssessmentContentEntry.tsx`, contentEntry],
  [`${base}/storage/assessment-storage.ts`, storage],
];
const entry = '  "assignment": {code:"assignment",questionMode:"assignment",draftKeys:{details:"mcqAssessmentDraft",content:"assignmentContentDraft",evaluation:"mcqAssessmentEvaluationDraft"}},';
const map = '  "assignment": {details:AssignmentDetailsStep,content:AssignmentContentStep,evaluation:AssignmentEvaluationStep,review:ReviewStep},';
function requireMarker(input, regex, label) {
  const match=regex.exec(input);
  if(!match)throw new Error(`Cannot locate ${label}. Existing source differs from this integration; no files changed.`);
  return match;
}
function inObject(input, label) {
  // Only inspect the associated exported object, not an unrelated object or helper.
  const re=label==="ASSESSMENT_ADAPTERS" ? /export\s+const\s+ASSESSMENT_ADAPTERS\s*:[^=\n]+\s*=\s*\{/ : /const\s+TYPE_STEPS\s*=\s*\{/;
  const m=requireMarker(input,re,label);
  const open=input.indexOf("{",m.index+m[0].length-1);
  let depth=0,quote="",escape=false,close=-1;
  for(let i=open;i<input.length;i++){
    const c=input[i];
    if(quote){if(escape){escape=false;continue;}if(c==="\\"){escape=true;continue;}if(c===quote)quote="";continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==="{")depth++;
    if(c==="}" && --depth===0){close=i;break;}
  }
  if(close<0)throw new Error(`Unbalanced ${label}`);
  return {open,close,body:input.slice(open+1,close)};
}
function catalogue(s) {
  const literal='  {code:"assignment",label:"Assignment",category:"Application & Practical Assessments",implemented:true},';
  const old=/^[ \t]*\{\s*code\s*:\s*["']assignment["']\s*,[^\n}]*\}\s*,?\s*$/gm;
  const matches=[...s.matchAll(old)];
  if(matches.length>1)throw new Error("Duplicate Assignment catalogue entries detected");
  if(matches.length===1)return s.replace(old,literal);
  const m=requireMarker(s,/export\s+const\s+DEFAULT_ASSESSMENT_TYPES\s*:\s*AssessmentTypeDefinition\[\]\s*=\s*\[/,"assessment catalogue");
  return s.slice(0,m.index+m[0].length)+"\n"+literal+s.slice(m.index+m[0].length);
}
function registry(s) {
  // Repair an old integration that inserted the Assignment entry ABOVE the registry.
  s=s.replace(/^[ \t]*["']assignment["']\s*:\s*\{[^\n]*\}\s*,?\s*\r?\n(?=export\s+const\s+ASSESSMENT_ADAPTERS\b)/gm,"");
  const u=requireMarker(s,/export\s+type\s+QuestionMode\s*=([^;]+);/,"QuestionMode union");
  if(!/["']assignment["']/.test(u[1])){
    s=s.slice(0,u.index)+u[0].slice(0,-1)+' | "assignment";'+s.slice(u.index+u[0].length);
  }
  const obj=inObject(s,"ASSESSMENT_ADAPTERS");
  const old=/^[ \t]*["']assignment["']\s*:\s*\{[^\n]*\}\s*,?\s*$/gm;
  const hits=[...obj.body.matchAll(old)];
  if(hits.length>1)throw new Error("Duplicate Assignment registry entries detected");
  const body=hits.length?obj.body.replace(old,entry):"\n"+entry+obj.body;
  return s.slice(0,obj.open+1)+body+s.slice(obj.close);
}
function form(s){
  const imports=[
    'import AssignmentDetailsStep from "../type-specific/assignment/Details";',
    'import AssignmentContentStep from "../type-specific/assignment/Content";',
    'import AssignmentEvaluationStep from "../type-specific/assignment/Evaluation";',
  ];
  if(!/import\s+ReviewStep\s+from\s+/.test(s))throw new Error("Existing ReviewStep import was not found");
  if(!s.includes('import AssignmentDetailsStep')){
    const m=requireMarker(s,/import\s+ConnectDotsContent\s+from\s+[^;]+;/,"creator imports");
    s=s.slice(0,m.index)+imports.join("\n")+"\n"+s.slice(m.index);
  }
  const obj=inObject(s,"TYPE_STEPS");
  const old=/^[ \t]*["']assignment["']\s*:\s*\{[^\n]*\}\s*,?\s*$/gm;
  const hits=[...obj.body.matchAll(old)];
  if(hits.length>1)throw new Error("Duplicate Assignment creator mappings detected");
  const body=hits.length?obj.body.replace(old,map):"\n"+map+obj.body;
  return s.slice(0,obj.open+1)+body+s.slice(obj.close);
}
function insertMap(s,name,key,value){
  const re=new RegExp(`const\\s+${name}\\s*:\\s*Record<[^=\\n]+\\s*=\\s*\\{`);
  const m=requireMarker(s,re,name);
  const start=m.index+m[0].length;
  const close=s.indexOf("\n};",start);
  if(close<0)throw new Error(`Cannot locate end of ${name}`);
  const body=s.slice(start,close);
  const line=`  "${key}": ["${value}"],`;
  const old=new RegExp(`^[ \\t]*["']${key}["']\\s*:\\s*\\[[^\\n]*\\],?\\s*$`,'gm');
  const next=old.test(body)?body.replace(old,line):"\n"+line+body;
  return s.slice(0,start)+next+s.slice(close);
}
function contentEntry(s){
  s=insertMap(s,"CONTENT_KEYS","assignment","assignmentContentDraft");
  s=insertMap(s,"DETAIL_KEYS","assignment","mcqAssessmentDraft");
  return s;
}
function storage(s){
  const m=requireMarker(s,/const\s+ADDITIONAL_WORKFLOW_DRAFT_KEYS\s*=\s*\[/,"workflow draft keys");
  let place=m.index+m[0].length;
  const keys=["assignmentDetailsDraft","assignmentContentDraft","assignmentEvaluationDraft"];
  const newKeys=keys.filter(key=>!new RegExp(`['"]${key}['"]`).test(s));
  if(newKeys.length)s=s.slice(0,place)+"\n  "+newKeys.map(x=>`"${x}"`).join(", ")+","+s.slice(place);
  return s;
}
try {
  const patches=[];
  for(const [rel,fn] of edits){
    const full=path.join(root,rel);
    if(!fs.existsSync(full))throw new Error(`Missing current project file: ${rel}`);
    const current=fs.readFileSync(full,"utf8");
    const updated=fn(current);
    if(updated!==current)patches.push({rel,current,updated});
  }
  const files=[];
  for(const rel of additions){
    const from=path.join(source,rel),to=path.join(root,rel);
    if(!fs.existsSync(from))throw new Error(`Missing package file: ${rel}`);
    const content=fs.readFileSync(from);
    if(fs.existsSync(to)){
      const current=fs.readFileSync(to);
      if(!current.equals(content)){
        // Replacing only our own Assignment-specific components is safe.
        if(!to.includes('/type-specific/assignment/'))throw new Error(`Cannot overwrite ${rel}`);
      } else continue;
    }
    files.push({rel,content});
  }
  console.log(`Assignment: ${patches.length} shared file(s) to update, ${files.length} Assignment-specific file(s) to add/update.`);
  for(const p of patches)console.log(`  EDIT ${p.rel}`);
  for(const p of files)console.log(`  FILE ${p.rel}`);
  console.log("  KEEP existing ReviewStep / review.css unchanged");
  if(check){console.log("Check passed. No files changed.");process.exit(0);}
  const undo=[];
  try{
    for(const p of patches){
      const dst=path.join(root,p.rel);undo.push({dst,old:Buffer.from(p.current)});
      fs.writeFileSync(dst,p.updated,"utf8");
    }
    for(const p of files){
      const dst=path.join(root,p.rel);fs.mkdirSync(path.dirname(dst),{recursive:true});
      undo.push({dst,old:fs.existsSync(dst)?fs.readFileSync(dst):null});
      fs.writeFileSync(dst,p.content);
    }
  }catch(error){
    for(const item of undo.reverse()){
      if(item.old===null)fs.rmSync(item.dst,{force:true});else fs.writeFileSync(item.dst,item.old);
    }
    throw error;
  }
  console.log("Assignment registered. Select Practical Assessments > Assignment to start the existing creator flow.");
}catch(error){console.error(`ABORTED: ${error.message}`);process.exitCode=1;}
