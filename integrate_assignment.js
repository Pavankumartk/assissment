#!/usr/bin/env node
"use strict";
/** Surgical Assignment creator integration for the existing Next.js project.
 * No global designs, other assessment types or existing Review page are modified.
 * Uses only Node built-in modules. All edits validated before writing.
 */
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
const check = args.includes("--check");
const verifyOnly = args.includes("--verify");
const requested = path.resolve(args.find(x => !x.startsWith("--")) || process.cwd());
const root = fs.existsSync(path.join(requested,"package.json")) ? requested : fs.existsSync(path.join(requested,"web","package.json")) ? path.join(requested,"web") : requested;
const BASE = "src/modules/assessments";
const cataloguePath = `${BASE}/config/assessment-types.ts`;
const registryPath = `${BASE}/config/component-registry.ts`;
const formPath = `${BASE}/components/common/AssessmentForm.tsx`;
const entryPath = `${BASE}/components/common/AssessmentContentEntry.tsx`;
const storagePath = `${BASE}/storage/assessment-storage.ts`;
const targetDir = `${BASE}/components/type-specific/assignment`;
const assignmentFiles = ["Details.tsx","Content.tsx","Evaluation.tsx","AssignmentUI.tsx","assignment-data.ts","assignment.css"];
const targetPaths = [cataloguePath,registryPath,formPath,entryPath,storagePath];
function fail(msg){throw new Error(msg);}
function expect(input, pattern, description){const m=pattern.exec(input);if(!m)fail(`Cannot find ${description}. Please provide your current ${description} source for a safe integration.`);return m;}
function braceBody(input,open,kind){let level=0,quoted="",escape=false,line=false,block=false;
 for(let i=open;i<input.length;i++){
  const c=input[i],n=input[i+1];
  if(line){if(c==="\n")line=false;continue;}
  if(block){if(c==='*'&&n==='/'){block=false;i++;}continue;}
  if(quoted){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quoted)quoted="";continue;}
  if(c==='/'&&n==='/'){line=true;i++;continue;}if(c==='/'&&n==='*'){block=true;i++;continue;}
  if(c==='"'||c==="'"||c==='`'){quoted=c;continue;}
  if(c===kind)level++;else if(c===(kind==='{'?'}':']')){level--;if(level===0)return {start:open,end:i,body:input.slice(open+1,i)};}
 }
 fail(`Unclosed ${kind} block`);
}
function objectAfter(input,re,description,kind='{'){
 const m=expect(input,re,description); const open=input.indexOf(kind,m.index+m[0].length-1); if(open<0)fail(`Missing opening ${kind} for ${description}`);return braceBody(input,open,kind);
}
function substituteBody(input,obj,newBody){return input.slice(0,obj.start+1)+newBody+input.slice(obj.end);}
function upsertLine(input,obj,key,line){
 const re=new RegExp(`^\\s*['"]${key}['"]\\s*:\\s*\\{[^\\n]*\\}\\s*,?\\s*$`,'gm');
 let body=obj.body;
 const seen=Array.from(body.matchAll(re));
 if(seen.length>1)fail(`Duplicate ${key} entries. Please resolve duplicates first.`);
 body=seen.length?body.replace(re,`\n${line}`):`\n${line}${body}`;
 return substituteBody(input,obj,body);
}
function ensureCatalogue(input){
 const obj=objectAfter(input,/export\s+const\s+DEFAULT_ASSESSMENT_TYPES\s*:\s*AssessmentTypeDefinition\[\]\s*=\s*\[/,"DEFAULT_ASSESSMENT_TYPES",'[');
 const row='  {code:"assignment",label:"Assignment",category:"Application & Practical Assessments",implemented:true},';
 // Use a conservative matching rule even if the catalogue has been edited manually.
 const lines=obj.body.split(/\r?\n/); const matches=lines.filter(line=>/\bcode\s*:\s*["']assignment["']/.test(line));
 if(matches.length>1)fail('Duplicate Assignment entries in type catalogue');
 const replaced=matches.length?lines.map(line=>/\bcode\s*:\s*["']assignment["']/.test(line)?row:line).join('\n'):`\n${row}${obj.body}`;
 return substituteBody(input,obj,replaced);
}
function ensureRegistry(input){
 // Remove only the invalid orphan line written by an older integration script.
 input=input.replace(/^[ \t]*["']assignment["']\s*:\s*\{[^\n]*\}\s*,?\s*\r?\n(?=export\s+const\s+ASSESSMENT_ADAPTERS\b)/gm,"");
 const union=expect(input,/export\s+type\s+QuestionMode\s*=\s*([^;]+);/,"QuestionMode type");
 if(!/["']assignment["']/.test(union[1]))input=input.slice(0,union.index)+union[0].slice(0,-1)+' | "assignment";'+input.slice(union.index+union[0].length);
 const obj=objectAfter(input,/export\s+const\s+ASSESSMENT_ADAPTERS\s*:\s*Record<string,\s*AssessmentAdapter>\s*=\s*\{/,"ASSESSMENT_ADAPTERS");
 return upsertLine(input,obj,'assignment','  "assignment": {code:"assignment",questionMode:"assignment",draftKeys:{details:"mcqAssessmentDraft",content:"assignmentContentDraft",evaluation:"mcqAssessmentEvaluationDraft"}},');
}
function ensureForm(input){
 expect(input,/import\s+ReviewStep\s+from\s+["']\.\/steps\/ReviewStep\/ReviewStep["'];/,"shared ReviewStep import");
 const imports=[['AssignmentDetailsStep','Details'],['AssignmentContentStep','Content'],['AssignmentEvaluationStep','Evaluation']];
 for(const [symbol,file] of imports){
  if(!new RegExp(`import\\s+${symbol}\\s+from`).test(input)){
   const anchor=expect(input,/import\s+ConnectDotsContent\s+from\s+["'][^"']+["'];/,"AssessmentForm type-specific imports");
   input=input.slice(0,anchor.index)+`import ${symbol} from "../type-specific/assignment/${file}";\n`+input.slice(anchor.index);
  }
 }
 const obj=objectAfter(input,/const\s+TYPE_STEPS\s*=\s*\{/,"TYPE_STEPS");
 return upsertLine(input,obj,'assignment','  "assignment": {details:AssignmentDetailsStep,content:AssignmentContentStep,evaluation:AssignmentEvaluationStep,review:ReviewStep},');
}
function insertKeyIntoMap(input,name,key,values){
 const re=new RegExp(`const\\s+${name}\\s*:\\s*Record<string,\\s*string\\[\\]>\\s*=\\s*\\{`);
 const obj=objectAfter(input,re,name);
 const row=`  "${key}": ["${values}"],`;
 const lines=obj.body.split(/\r?\n/); const hits=lines.filter(l=>new RegExp(`^[\\s]*["']${key}["']\\s*:`).test(l));
 if(hits.length>1)fail(`Duplicate ${key} in ${name}`);
 const body=hits.length?lines.map(l=>new RegExp(`^[\\s]*["']${key}["']\\s*:`).test(l)?row:l).join("\n"):`\n${row}${obj.body}`;
 return substituteBody(input,obj,body);
}
function ensureEntry(input){
 input=insertKeyIntoMap(input,'CONTENT_KEYS','assignment','assignmentContentDraft');
 input=insertKeyIntoMap(input,'DETAIL_KEYS','assignment','mcqAssessmentDraft');
 return input;
}
function ensureStorage(input){
 const obj=objectAfter(input,/const\s+ADDITIONAL_WORKFLOW_DRAFT_KEYS\s*=\s*\[/,"ADDITIONAL_WORKFLOW_DRAFT_KEYS",'[');
 const keys=['assignmentDetailsDraft','assignmentContentDraft','assignmentEvaluationDraft'];
 const missing=keys.filter(k=>!new RegExp(`["']${k}["']`).test(obj.body));
 return missing.length?substituteBody(input,obj,`\n  ${missing.map(k=>`"${k}"`).join(', ')},${obj.body}`):input;
}
function verify(contents){
 const [a,b,c,d,e]=contents;
 const conditions=[
  ["Assignment is implemented in catalogue",/code:\s*["']assignment["'],\s*label:\s*["']Assignment["'][^\n]*implemented:\s*true/.test(a)],
  ["Assignment workflow adapter",/^[ \t]*["']assignment["']\s*:\s*\{code:["']assignment["']/m.test(b)],
  ["Assignment mode in registry",/export\s+type\s+QuestionMode[^;]*["']assignment["']/.test(b)],
  ["Assignment creator Details, Content, Evaluation",/^[ \t]*["']assignment["']\s*:\s*\{details:AssignmentDetailsStep,content:AssignmentContentStep,evaluation:AssignmentEvaluationStep,review:ReviewStep\}/m.test(c)],
  ["Assignment content draft in Create Questions",/["']assignment["']\s*:\s*\[["']assignmentContentDraft["']\]/.test(d)],
  ["Assignment drafts isolated in storage",/["']assignmentContentDraft["']/.test(e)],
  ["Original ReviewStep retained",/import\s+ReviewStep\s+from\s+["']\.\/steps\/ReviewStep\/ReviewStep["']/.test(c)],
  ["Existing type selection already checks adapters",fs.existsSync(path.join(root,`${BASE}/components/common/steps/CreateStep/CreateStep.tsx`))&&/hasAssessmentWorkflow\(configured\.code\)/.test(fs.readFileSync(path.join(root,`${BASE}/components/common/steps/CreateStep/CreateStep.tsx`),'utf8'))]
 ];
 for(const [label,okay] of conditions)console.log(`${okay?'PASS':'FAIL'}: ${label}`);
 return conditions.every(x=>x[1]);
}
const transforms=[ensureCatalogue,ensureRegistry,ensureForm,ensureEntry,ensureStorage];
try{
 if(!fs.existsSync(path.join(root,'package.json')))fail(`Couldn't find package.json at ${root}. Run this in your web project folder.`);
 const original=targetPaths.map(p=>{const full=path.join(root,p);if(!fs.existsSync(full))fail(`Missing ${p}. Current project differs from the reference version.`);return fs.readFileSync(full,'utf8');});
 const updated=original.map((text,i)=>transforms[i](text));
 const copy=assignmentFiles.map(name=>{
  const rel=`${targetDir}/${name}`,source=path.join(__dirname,rel),destination=path.join(root,rel);
  if(!fs.existsSync(source))fail(`Package is missing ${rel}`);
  return {rel,source,destination,buf:fs.readFileSync(source)};
 });
 const changed=updated.map((text,i)=>({rel:targetPaths[i],text,old:original[i]})).filter(x=>x.text!==x.old);
 console.log(`Project: ${root}`);
 console.log(`${changed.length} shared files to modify, ${copy.length} Assignment-specific files checked.`);
 changed.forEach(x=>console.log('EDIT '+x.rel));
 if(!verify(updated))fail('Assignment mapping verification failed before writing');
 if(verifyOnly){const live=verify(original)&&copy.every(x=>fs.existsSync(x.destination)); if(!live)process.exitCode=1;else console.log('Verified installed integration.');}
 else if(check){console.log('SAFE CHECK: No files changed.');}
 else {
  // Copy or patch only after all source and mapping checks pass. Back up modified files.
  const changedFiles=copy.filter(x=>!fs.existsSync(x.destination)||!fs.readFileSync(x.destination).equals(x.buf));
  const backupDir=path.join(require('node:os').homedir(),'.assignment-integration-backups',`${path.basename(root)}-${new Date().toISOString().replace(/[:.]/g,'-')}`);
  const operations=[...changed.map(x=>({path:path.join(root,x.rel),content:Buffer.from(x.text)})),...changedFiles.map(x=>({path:x.destination,content:x.buf}))];
  if(operations.length){fs.mkdirSync(backupDir,{recursive:true});}
  for(const op of operations){
   fs.mkdirSync(path.dirname(op.path),{recursive:true});
   if(fs.existsSync(op.path)){
    const key=path.relative(root,op.path).replace(/[\\/]/g,'__');
    const back=path.join(backupDir,key);
    if(!fs.existsSync(back))fs.copyFileSync(op.path,back);
   }
   fs.writeFileSync(op.path,op.content);
  }
  const oldInstaller=path.join(root,'install_assignment.py');
  if(fs.existsSync(oldInstaller)){fs.unlinkSync(oldInstaller);console.log('Removed old Assignment-only installer.');}
  console.log('INTEGRATED. Existing Review and other assessment flows were not modified.');
  if(!verify(targetPaths.map(p=>fs.readFileSync(path.join(root,p),'utf8'))))fail('Post-install verification failed');
 }
}catch(error){console.error(`STOPPED: ${error.message}`);process.exitCode=1;}
