#!/usr/bin/env python3
"""Safely integrate only Clickable Hotspot into the existing Next.js assessment workflow.
Run from repository web/: python3 install_clickable_hotspot.py .
All changes are exact, per-file and atomic, and unrelated assessments are untouched.
"""
from pathlib import Path
import argparse
import re
import sys
import shutil

p=argparse.ArgumentParser()
p.add_argument('project', nargs='?', default='.', help='Path to the web project root')
p.add_argument('--check', action='store_true', help='Preview changes without writing')
args=p.parse_args()
root=Path(args.project).resolve()
source=Path(__file__).resolve().parent
if not (root/'src/modules/assessments/config/component-registry.ts').exists():
    sys.exit('NOT INSTALLED: src/modules/assessments/config/component-registry.ts was not found. Run in your current web project folder.')
base='src/modules/assessments/components/type-specific/clickable-hotspot'
new=[f'{base}/{f}' for f in ['Content.tsx','Viewer.tsx','Review.tsx','Instructions.tsx','clickablehotspot.css','viewclick.css','review.css']]
required=[
 'src/modules/assessments/config/component-registry.ts',
 'src/modules/assessments/config/assessment-types.ts',
 'src/modules/assessments/components/common/AssessmentForm.tsx',
 'src/app/assessments/[assessmentId]/viewer/PageClient.tsx',
 'src/modules/assessments/storage/assessment-storage.ts',
]
for item in required:
    if not (root/item).is_file():sys.exit(f'NOT INSTALLED: Missing {item}; no files changed.')

def insert_once(s,marker,content,name):
    if content in s:return s
    if marker not in s:raise RuntimeError(f'{name}: expected insertion anchor not found. No files changed.')
    return s.replace(marker,content+marker,1)

try:
    modifications={}
    # Catalogue: existing type labels remain untouched.
    fn=required[1];s=(root/fn).read_text()
    row=' {code:"clickable-hotspot",label:"Clickable Hotspot",category:"Interactive Assessments",implemented:true},\n'
    if row not in s:
        marker='export const DEFAULT_ASSESSMENT_TYPES: AssessmentTypeDefinition[] = [\n'
        if marker not in s: raise RuntimeError('Catalogue list differs; no files changed.')
        s=s.replace(marker,marker+row,1)
    modifications[fn]=s

    # Registry: only new type union and new entry.
    fn=required[0];s=(root/fn).read_text()
    if '"clickable-hotspot"' not in s:
        s=s.replace('"connect-the-dots";', '"connect-the-dots" | "clickable-hotspot";',1)
        if '"clickable-hotspot"' not in s.split('export type QuestionMode')[1].split(';')[0]:
            raise RuntimeError('Registry QuestionMode union does not match the expected version; no files changed.')
        s=insert_once(s,'export const ASSESSMENT_ADAPTERS: Record<string, AssessmentAdapter> = {',
            '',fn)  # assert anchor exists
        marker='export const ASSESSMENT_ADAPTERS: Record<string, AssessmentAdapter> = {\n'
        if marker not in s:raise RuntimeError('Registry adapter table differs; no files changed.')
        entry='  "clickable-hotspot": {code:"clickable-hotspot",questionMode:"clickable-hotspot",draftKeys:{details:"mcqAssessmentDraft",content:"clickableHotspotContentDraft",evaluation:"mcqAssessmentEvaluationDraft"}},\n'
        s=s.replace(marker,marker+entry,1)
    modifications[fn]=s

    # Creator wizard. The MCQ details/evaluation pages stay exactly as they were.
    fn=required[2];s=(root/fn).read_text()
    imp='import ClickableHotspotContent from "../type-specific/clickable-hotspot/Content";\nimport ClickableHotspotReview from "../type-specific/clickable-hotspot/Review";\n'
    s=insert_once(s,'import ConnectDotsContent from',imp,fn) if imp not in s else s
    entry=' "clickable-hotspot": {details:DetailsStep, content:ClickableHotspotContent, evaluation:EvaluationStep, review:ClickableHotspotReview},\n'
    if entry not in s:
        marker='const TYPE_STEPS = {\n'
        if marker not in s:raise RuntimeError('AssessmentForm TYPE_STEPS differs; no files changed.')
        s=s.replace(marker,marker+entry,1)
    old='const Screen = step === "review" ? ReviewStep : configured ? configured[step] : STEPS[step];'
    replacement='const Screen = step === "review" && typeCode !== "clickable-hotspot" ? ReviewStep : configured ? configured[step] : STEPS[step];'
    if replacement not in s:
        if old not in s:raise RuntimeError('AssessmentForm review selection differs; no files changed.')
        s=s.replace(old,replacement,1)
    modifications[fn]=s

    # Draft duplication: add only this type's isolated draft and viewer progress key.
    fn=required[4];s=(root/fn).read_text()
    if '"clickableHotspotContentDraft"' not in s:
        marker='const ADDITIONAL_WORKFLOW_DRAFT_KEYS = [\n'
        if marker not in s:raise RuntimeError('Storage draft list differs; no files changed.')
        s=s.replace(marker,marker+'  "clickableHotspotContentDraft",\n',1)
    modifications[fn]=s

    # Learner: new viewer and instructions; do not change branches for existing types.
    fn=required[3];s=(root/fn).read_text()
    if '  assessmentStorage,\n' not in s:
        s=insert_once(s,'  setActiveAssessmentId,', '  assessmentStorage,\n',fn)
    imp='import ClickableHotspotViewer from "@/modules/assessments/components/type-specific/clickable-hotspot/Viewer";\nimport ClickableHotspotInstructions from "@/modules/assessments/components/type-specific/clickable-hotspot/Instructions";\n'
    s=insert_once(s,'import ConnectDotsViewer from',imp,fn) if imp not in s else s
    declaration='  const [hotspotInstructionsNeeded, setHotspotInstructionsNeeded] = useState(false);\n'
    if declaration not in s:
        s=insert_once(s,'  const [ready, setReady] = useState(false);',declaration,fn)
    logic='''    if (record.typeCode === "clickable-hotspot" && !isPreview) {
      const params = new URLSearchParams(window.location.search);
      const key = `neurolxp.clickableHotspotViewer.instructions.${assessmentId}`;
      let accepted = false;
      try { accepted = sessionStorage.getItem(key) === "accepted"; }
      catch { /* Always show the instructions if storage is disabled. */ }
      setHotspotInstructionsNeeded(params.get("instructions") === "1" || params.get("retry") === "wrong" || !accepted);
    } else {
      setHotspotInstructionsNeeded(false);
    }
'''
    if logic not in s:
        s=insert_once(s,'    setReady(true);',logic,fn)
    lock='''    // A learner's completed Hotspot attempt must not open again unless retry was explicitly requested.
    if (record.typeCode === "clickable-hotspot" && !isPreview) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("retry") !== "wrong") {
        try {
          const stored = JSON.parse(assessmentStorage.getItem("viewerAttemptDraft") || "{}");
          if (stored.finished) { router.replace("/learner"); return; }
        } catch { /* Invalid legacy attempt state: continue normally. */ }
      }
    }
'''
    if lock not in s:
        s=insert_once(s,'    setReady(true);',lock,fn)
    route='''    type === "clickable-hotspot"
      ? ClickableHotspotViewer
      : '''
    if route not in s:
        marker='    type === "image-based"\n'
        if marker not in s:raise RuntimeError('Viewer type routing differs; no files changed.')
        s=s.replace(marker,route+marker.lstrip(),1)
    instruction='''  if (type === "clickable-hotspot" && hotspotInstructionsNeeded) {
    return <div className="assessment-variant assessment-variant--clickable-hotspot">
      <ClickableHotspotInstructions assessmentId={assessmentId} onStart={() => {
        try { sessionStorage.setItem(`neurolxp.clickableHotspotViewer.instructions.${assessmentId}`, "accepted"); }
        catch { /* Continue in this tab. */ }
        const url = new URL(window.location.href);
        url.searchParams.delete("instructions");
        window.history.replaceState(window.history.state,"",`${url.pathname}${url.search}${url.hash}`);
        setHotspotInstructionsNeeded(false);
      }}/>
    </div>;
  }

'''
    if instruction not in s:
        marker='  return (\n    <div className={`assessment-variant assessment-variant--${type}`}>'
        if marker not in s:raise RuntimeError('Viewer return layout differs; no files changed.')
        s=s.replace(marker,instruction+marker,1)
    modifications[fn]=s

    # Validate all expected files before any writes. Preserve originals on failure.
    for item in new:
        if not (source/item).is_file():raise RuntimeError('Package is incomplete: '+item)
    changed=[item for item,data in modifications.items() if (root/item).read_text()!=data]
    created=[item for item in new if not (root/item).exists() or (root/item).read_bytes()!=(source/item).read_bytes()]
    print(f'Clickable Hotspot: {len(changed)} shared files need small integration edits; {len(created)} dedicated files to copy.')
    for item in changed+created:print('  '+item)
    if args.check:print('Dry run complete; nothing changed.');sys.exit(0)
    backups={item:(root/item).read_bytes() if (root/item).exists() else None for item in changed+created}
    try:
        for item in changed:
            target=root/item;temp=target.with_suffix(target.suffix+'.hotspot-tmp');temp.write_text(modifications[item]);temp.replace(target)
        for item in created:
            target=root/item;target.parent.mkdir(parents=True,exist_ok=True)
            temp=target.with_suffix(target.suffix+'.hotspot-tmp');shutil.copy2(source/item,temp);temp.replace(target)
    except Exception:
        for item,data in backups.items():
            target=root/item
            if data is None:target.unlink(missing_ok=True)
            else:target.write_bytes(data)
        raise
    print('Clickable Hotspot integrated. Other assessment types and files were not modified.')
except Exception as exc:
    sys.exit(f'NOT INSTALLED: {exc}')
