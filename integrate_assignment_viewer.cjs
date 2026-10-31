/* Narrow, dependency-free Node.js integration into the existing shared viewer route.
   Never replaces the existing shared viewer page or another assessment type. */
const fs=require('fs'),path=require('path'),os=require('os');
const args=process.argv.slice(2);const cwd=path.resolve(args.find(a=>!a.startsWith('--'))||'.');
const check=args.includes('--check'),verify=args.includes('--verify');
const route=path.join(cwd,'src/app/assessments/[assessmentId]/viewer/PageClient.tsx');
const target=path.join(cwd,'src/modules/assessments/components/type-specific/assignment');
const here=path.join(__dirname,'src/modules/assessments/components/type-specific/assignment');
const file=path.join(target,'Viewer.tsx');
const importStatement='import AssignmentViewer from "@/modules/assessments/components/type-specific/assignment/Viewer";';
const read=p=>fs.readFileSync(p,'utf8');
function fail(m){console.error('STOPPED: '+m);process.exit(1)}
if(!fs.existsSync(route))fail('Existing viewer route missing: '+route);
if(!fs.existsSync(target)||!fs.existsSync(path.join(target,'Content.tsx')))fail('Assignment Content folder is missing; this package does not create a new flow. Install the creator first.');
let original=read(route);let text=original;
const block=/\bconst\s+Viewer\s*=\s*/;
if(!block.test(text))fail('The shared viewer selection code has changed; no modifications made. Supply the current PageClient.tsx for a safe targeted update.');
if(!text.includes('AssignmentViewer')){
  const importEnd=text.search(/\bexport\s+default\s+function\b/);
  if(importEnd<0)fail('Could not identify component declaration; no files changed.');
  text=text.slice(0,importEnd)+importStatement+'\n\n'+text.slice(importEnd);
}
const selector=/(?<decl>\bconst\s+Viewer\s*=\s*)(?<rest>[\s\S]*?)(?<end>;\s*(?:if\s*\(|return\s*\(|const\s|\n\s*if\s*\())/m;
const match=text.match(selector);
if(!match)fail('Could not safely identify the existing viewer registry; no files changed.');
if(!/type\s*===\s*['"]assignment['"]/.test(match.groups.rest)){
  text=text.replace(block, '$&type === "assignment" ? AssignmentViewer : ');
}
const registered=/\bimport\s+AssignmentViewer\s+from/.test(text) && /\bconst\s+Viewer\s*=\s*type\s*===\s*["']assignment["']\s*\?\s*AssignmentViewer\s*:/.test(text);
if(!registered)fail('Assignment viewer registration is not valid; no modifications made.');
for(const source of ['Viewer.tsx','viewassignment.css'])if(!fs.existsSync(path.join(here,source)))fail('Package file missing: '+source);
const summary={routeChange:text!==original,viewerFile:fs.existsSync(file),assessmentFolder:true};
if(verify){
  if(text!==original)fail('Assignment viewer registration was not applied. Run installation without --verify.');
  if(!fs.existsSync(file))fail('Assignment Viewer.tsx missing.');
  if(!fs.existsSync(path.join(target,'viewassignment.css')))fail('Assignment viewassignment.css missing.');
  console.log('PASS: Assignment uses the existing shared viewer route; source and CSS present.');process.exit(0);
}
if(check){console.log('CHECK OK:',JSON.stringify(summary),'\nNo files modified.');process.exit(0)}
if(text!==original){
  const back=path.join(os.tmpdir(),'assignment-PageClient-backup-'+Date.now()+'.tsx');fs.copyFileSync(route,back);
  const tmp=route+'.assignment-tmp';fs.writeFileSync(tmp,text);fs.renameSync(tmp,route);console.log('Updated viewer registration. Original backed up:',back);
}else console.log('Viewer registration already present; unchanged.');
for(const name of ['Viewer.tsx','viewassignment.css']){const source=path.join(here,name),dest=path.join(target,name);if(!fs.existsSync(dest)||read(source)!==read(dest)){fs.copyFileSync(source,dest);console.log('Updated Assignment only:',dest)}else console.log('Unchanged:',dest)}
console.log('Complete. Run: npm run build');
