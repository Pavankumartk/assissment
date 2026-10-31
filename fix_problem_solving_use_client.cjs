#!/usr/bin/env node
"use strict";

// Minimal targeted repair: keep the existing AssessmentForm.tsx unchanged
// except for moving its existing "use client" directive to line one.
const fs = require("node:fs");
const path = require("node:path");

const rootArg = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || ".";
const check = process.argv.includes("--check");
const verify = process.argv.includes("--verify");
if (check && verify) {
  console.error("Use either --check or --verify, not both.");
  process.exit(1);
}
const relativePath = "src/modules/assessments/components/common/AssessmentForm.tsx";
const file = path.resolve(rootArg, relativePath);
if (!fs.existsSync(file)) {
  console.error(`STOPPED: File not found: ${file}`);
  process.exit(1);
}
const original = fs.readFileSync(file, "utf8");
const eol = original.includes("\r\n") ? "\r\n" : "\n";
const lines = original.split(/\r?\n/);
const directive = (line) => /^\s*["']use client["'];?\s*$/.test(line.replace(/^\uFEFF/, ""));
const problemImport = (line) => /^\s*import\s+ProblemSolvingContent\s+from\s+["']\.\.\/type-specific\/problem-solving\/Content["'];?\s*$/.test(line);

if (directive(lines[0])) {
  if (verify) {
    if (!lines.some((line, i) => i > 0 && problemImport(line))) {
      console.error("STOPPED: Problem Solving import was not found after the directive.");
      process.exit(1);
    }
    console.log("PASS: 'use client' is on line 1 and the Problem Solving import follows it.");
  } else {
    console.log("ALREADY FIXED: No changes needed.");
  }
  process.exit(0);
}

if (problemImport(lines[0]) && directive(lines[1])) {
  if (verify) {
    console.error("NOT FIXED: Run node fix_problem_solving_use_client.cjs .");
    process.exit(1);
  }
  if (check) {
    console.log("CHECK PASSED: Two-line ordering error found; safe one-file correction is available. No files modified.");
    process.exit(0);
  }
  const firstLine = lines[0];
  lines[0] = lines[1];
  lines[1] = firstLine;
  const updated = lines.join(eol);
  if (updated === original) {
    console.error("STOPPED: Could not apply the intended change.");
    process.exit(1);
  }
  fs.writeFileSync(file, updated, "utf8");
  console.log(`FIXED: ${relativePath}`);
  console.log("Moved only the existing 'use client' directive above the Problem Solving import.");
  process.exit(0);
}

console.error("STOPPED: The first two lines don't match the reported error. No files modified.");
console.error("Please show the first 10 lines of AssessmentForm.tsx before applying another fix.");
process.exit(1);
