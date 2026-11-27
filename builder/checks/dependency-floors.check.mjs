// Dependency floors: every copy of a listed package that package-lock.json
// resolves (nested copies included) must be at or above its floor. A package
// that is not installed passes. Minimums only, never an exact version.
//
// The dependency refresh edits ONLY this table: raise a floor it moves up, add
// a line for a package it newly bumps or an advisory it fixes. Never lower or
// remove a line. One line per package: [package, floor, reason, week].
const FLOORS = [
  ["@koehler8/cms", "1.5.4", "in-range baseline: the devDependency the scanner tracks", "2026-11-23"],
];

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// "1.2.3" or "1.2.3-beta.4" -> { nums, pre }. Build metadata is ignored.
function parse(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/.exec(String(v).trim());
  if (!m) return null;
  return { nums: [Number(m[1]), Number(m[2]), Number(m[3])], pre: m[4] ? m[4].split(".") : [] };
}

// Semver precedence: -1, 0 or 1. A prerelease sorts below its release.
function compare(a, b) {
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) throw new Error(`cannot compare "${a}" and "${b}"`);
  for (let i = 0; i < 3; i++) if (x.nums[i] !== y.nums[i]) return x.nums[i] < y.nums[i] ? -1 : 1;
  if (!x.pre.length || !y.pre.length) return x.pre.length === y.pre.length ? 0 : x.pre.length ? -1 : 1;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const p = x.pre[i];
    const q = y.pre[i];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    if (p === q) continue;
    const pn = /^\d+$/.test(p);
    const qn = /^\d+$/.test(q);
    if (pn && qn) return Number(p) < Number(q) ? -1 : 1;
    if (pn !== qn) return pn ? -1 : 1;
    return p < q ? -1 : 1;
  }
  return 0;
}

const failures = [];

// The comparator must be able to tell below from at-or-above, or the check
// could never fail.
for (const [lo, hi] of [["1.5.3", "1.5.4"], ["1.9.0", "1.10.0"], ["1.5.4-beta.1", "1.5.4"], ["1.0.0-beta.2", "1.0.0-beta.10"]]) {
  if (compare(lo, hi) !== -1 || compare(hi, lo) !== 1 || compare(hi, hi) !== 0) {
    failures.push(`comparator is wrong for ${lo} vs ${hi}`);
  }
}

if (!FLOORS.length) failures.push("the floor table is empty");
for (const [pkg, floor] of FLOORS) {
  if (!parse(floor)) failures.push(`floor for ${pkg} is not a plain version: "${floor}"`);
}

const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const entries = Object.entries(lock.packages || {});
if (!entries.length) failures.push("package-lock.json lists no packages");

for (const [pkg, floor, reason] of FLOORS) {
  for (const [path, info] of entries) {
    const at = path.lastIndexOf("node_modules/");
    if (at === -1 || path.slice(at + "node_modules/".length) !== pkg) continue;
    if (!info || typeof info.version !== "string") continue; // linked or bundled entry
    if (compare(info.version, floor) < 0) {
      failures.push(`${path} resolves ${info.version}, below the floor ${floor} (${reason})`);
    }
  }
}

if (failures.length) {
  console.error("dependency-floors check failed:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`dependency-floors check passed (${FLOORS.length} floor${FLOORS.length === 1 ? "" : "s"})`);
