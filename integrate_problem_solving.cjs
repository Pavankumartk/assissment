/* Node.js only. Additive, source-validated Problem Solving registration. */
const fs=require('fs'),path=require('path'),os=require('os');
const args=process.argv.slice(2),cwd=path.resolve(args.find(a=>!a.startsWith('--'))||'.');
const mode=args.includes('--verify')?'verify':args.includes('--check')?'check':'apply';
const base='src/modules/assessments';
const targets={
  types:`${base}/config/assessment-types.ts`,
  registry:`${base}/config/component-registry.ts`,
  creator:`${base}/components/common/AssessmentForm.tsx`,
  viewer:'src/app/assessments/[assessmentId]/viewer/PageClient.tsx',
  storage:`${base}/storage/assessment-storage.ts`,
  contentEntry:`${base}/components/common/AssessmentContentEntry.tsx`,
};
const own=`${base}/components/type-specific/problem-solving`;
const here=path.join(__dirname,own),read=f=>fs.readFileSync(f,'utf8');
const files=['Content.tsx','Viewer.tsx','problemsolving.css','viewproblem.css'];
const fail=(msg)=>{console.error('STOPPED: '+msg+'\nNo shared files changed.');process.exit(1)};
for(const name of ['types','registry','creator','viewer'])if(!fs.existsSync(path.join(cwd,targets[name])))fail('Missing shared file '+targets[name]);
for(const name of files)if(!fs.existsSync(path.join(here,name)))fail('Package is missing '+name);
const originals={},patched={};
for(const [key,rel] of Object.entries(targets)){const p=path.join(cwd,rel);if(fs.existsSync(p))originals[key]=read(p),patched[key]=read(p)}
function insertOnce(value,token,addition,desc){if(value.includes(addition.trim()))return value;
 const pos=value.indexOf(token);if(pos<0)throw Error(`Cannot locate ${desc}; existing source differs. Do not force.`);
 return value.slice(0,pos)+addition+value.slice(pos);
}
function insertObjectEntry(src,decl,entries){const m=src.match(new RegExp(`(?:const|export\\s+const)\\s+${decl}\\b[^=]*=\\s*\\{`));
 if(!m)throw Error(`Could not find ${decl} object`);
 const pos=m.index+m[0].length;
 const add=entries.filter(x=>!new RegExp(`['"]${x.code}['"]\\s*:`).test(src.slice(pos,src.indexOf('};',pos)+2))).map(x=>x.text).join('');
 return src.slice(0,pos)+add+src.slice(pos);
}
function findArrayPosition(src,decl){const m=src.match(new RegExp(`(?:export\\s+)?const\\s+${decl}\\s*:[^=]*=\\s*\\[`));
 if(!m)throw Error(`Cannot locate ${decl} array`);return m.index+m[0].length}
try{
 // Existing dropdown label is "Problem-Solving Challenge". Preserve its existing code if it is present.
 const typeDef='{code:"problem-solving-challenge",label:"Problem-Solving Challenge",category:"Practical Assessments",implemented:true}';
 const existingLabel=patched.types.match(/\{[^{}]*\bcode\s*:\s*["']([^"']+)["'][^{}]*\blabel\s*:\s*["'](?:Problem-Solving Challenge|Problem Solving|Problem-Solving)["'][^{}]*\}/i);
 if(existingLabel){
   const enabled=existingLabel[0].replace(/implemented\s*:\s*false/,'implemented:true');
   patched.types=patched.types.replace(existingLabel[0],enabled);
 }else{
   const idx=findArrayPosition(patched.types,'DEFAULT_ASSESSMENT_TYPES');
   patched.types=patched.types.slice(0,idx)+'\n  '+typeDef+',\n'+patched.types.slice(idx);
 }
 // Runtime type registration; both aliases accept saved assessments created under either slug.
 patched.registry=patched.registry.replace(/(export\s+type\s+QuestionMode\s*=\s*)([^;]+)(;)/,(full,a,b,c)=>b.includes('"problem-solving"')?full:a+b+' | "problem-solving"'+c);
 if(!patched.registry.includes('"problem-solving"'))throw Error('QuestionMode union not found');
 patched.registry=insertObjectEntry(patched.registry,'ASSESSMENT_ADAPTERS',[
  {code:'problem-solving-challenge',text:'\n  "problem-solving-challenge": {code:"problem-solving-challenge",questionMode:"problem-solving",draftKeys:{details:"mcqAssessmentDraft",content:"problemSolvingContentDraft",evaluation:"mcqAssessmentEvaluationDraft"}},'},
  {code:'problem-solving',text:'\n  "problem-solving": {code:"problem-solving",questionMode:"problem-solving",draftKeys:{details:"mcqAssessmentDraft",content:"problemSolvingContentDraft",evaluation:"mcqAssessmentEvaluationDraft"}},'}]);
 const importLine='import ProblemSolvingContent from "../type-specific/problem-solving/Content";';
 if(!patched.creator.includes(importLine))patched.creator=importLine+'\n'+patched.creator;
 patched.creator=insertObjectEntry(patched.creator,'TYPE_STEPS',[
  {code:'problem-solving-challenge',text:'\n  "problem-solving-challenge": {details:STEPS.details,content:ProblemSolvingContent,evaluation:STEPS.evaluation,review:STEPS.review},'},
  {code:'problem-solving',text:'\n  "problem-solving": {details:STEPS.details,content:ProblemSolvingContent,evaluation:STEPS.evaluation,review:STEPS.review},'}]);
 // Optional content/detail key maps, only when the old shared creator already has them.
 if(/\bconst\s+CONTENT_KEYS\b/.test(patched.creator))patched.creator=insertObjectEntry(patched.creator,'CONTENT_KEYS',[
  {code:'problem-solving-challenge',text:'\n  "problem-solving-challenge": ["problemSolvingContentDraft","mcqContentDraft"],'},
  {code:'problem-solving',text:'\n  "problem-solving": ["problemSolvingContentDraft","mcqContentDraft"],'}]);
 if(/\bconst\s+DETAIL_KEYS\b/.test(patched.creator))patched.creator=insertObjectEntry(patched.creator,'DETAIL_KEYS',[
  {code:'problem-solving-challenge',text:'\n  "problem-solving-challenge": ["mcqAssessmentDraft"],'},
  {code:'problem-solving',text:'\n  "problem-solving": ["mcqAssessmentDraft"],'}]);
 const viewerImport='import ProblemSolvingViewer from "@/modules/assessments/components/type-specific/problem-solving/Viewer";';
 if(!patched.viewer.includes(viewerImport)){
   const at=patched.viewer.search(/\bexport\s+default\s+function\b/);
   if(at===-1)throw Error('Cannot locate shared viewer component');
   patched.viewer=patched.viewer.slice(0,at)+viewerImport+'\n'+patched.viewer.slice(at);
 }
 if(!/\bconst\s+Viewer\s*=/.test(patched.viewer))throw Error('Cannot locate viewer selector');
 if(!/type\s*===\s*["']problem-solving-challenge["']/.test(patched.viewer)){
   patched.viewer=patched.viewer.replace(/\bconst\s+Viewer\s*=\s*/,'$& (type === "problem-solving-challenge" || type === "problem-solving") ? ProblemSolvingViewer : ');
 }
 if(patched.storage){
  const key='"problemSolvingContentDraft"';
  if(!patched.storage.includes(key)){
   const hook='const ADDITIONAL_WORKFLOW_DRAFT_KEYS = [';
   if(patched.storage.includes(hook))patched.storage=patched.storage.replace(hook,hook+'\n  "problemSolvingContentDraft", "problemSolvingViewerState", "problemSolvingViewerResult",');
   else if(patched.storage.includes('export const DRAFT_KEYS = ['))patched.storage=patched.storage.replace('export const DRAFT_KEYS = [','export const DRAFT_KEYS = ["problemSolvingContentDraft", "problemSolvingViewerState", "problemSolvingViewerResult",');

  }
 }
 // All changed files must retain the types/registry and never modify others' registrations.
 if(!patched.creator.includes('"problem-solving-challenge"')||!patched.viewer.includes('ProblemSolvingViewer'))throw Error('Registration verification failed');
}catch(e){fail(e.message)}
const changes=Object.keys(patched).filter(k=>patched[k]!==originals[k]);
if(mode==='verify'){
 if(changes.length)fail('Integration has not been applied: '+changes.map(k=>targets[k]).join(', '));
 for(const f of files)if(!fs.existsSync(path.join(cwd,own,f)))fail('Missing Problem Solving '+f);
 console.log('PASS: catalogue, workflow adapters, creator, viewer, storage and supplied files present.');process.exit(0);
}
console.log('Validated changes to existing shared files:',changes.map(k=>targets[k]));
console.log('Only new type-specific files:',files.map(f=>`${own}/${f}`));
if(mode==='check'){console.log('CHECK PASSED: no files modified.');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'problem-solving-integration-'));
try{
 // Atomic rollback for any write failure; only named shared files are eligible.
 for(const k of changes)fs.writeFileSync(path.join(dir,k),originals[k]);
 for(const k of changes){const target=path.join(cwd,targets[k]);const temp=target+'.ps-tmp';fs.writeFileSync(temp,patched[k]);fs.renameSync(temp,target)}
 const targetDir=path.join(cwd,own);fs.mkdirSync(targetDir,{recursive:true});
 for(const f of files){const dest=path.join(targetDir,f),src=path.join(here,f);if(!fs.existsSync(dest)||read(src)!==read(dest))fs.copyFileSync(src,dest)}
}catch(e){for(const k of changes){try{fs.copyFileSync(path.join(dir,k),path.join(cwd,targets[k]))}catch{}}
 fail('Installation rolled back after: '+e.message)}
console.log('Installed Problem Solving only. Run node integrate_problem_solving.cjs . --verify then npm run build.');
