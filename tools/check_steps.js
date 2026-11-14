#!/usr/bin/env node
/* Runs every structure's scenarios through its JS tracer and checks that each
 * step id it emits is tagged in all three languages (errors), and that every
 * tagged step is reached by some scenario (warnings). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site/js');

const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
load(path.join(SITE, 'generated/code.js'));
for (const f of ['dsv.js', 'layouts.js', 'helpers.js', 'graph.js']) load(path.join(SITE, 'core', f));
const dsFiles = fs.readdirSync(path.join(SITE, 'ds')).filter((f) => f.endsWith('.js'));
for (const f of dsFiles) load(path.join(SITE, 'ds', f));

const DSV = ctx.DSV;
let errors = 0;
let warnings = 0;

for (const id of Object.keys(DSV.registry).sort()) {
  const ds = DSV.registry[id];
  const code = ctx.DS_CODE[id];
  const layout = typeof ds.layout === 'function' ? ds.layout : DSV.layouts[ds.layout];
  if (!code) {
    console.error(`ERROR ${id}: no generated code`);
    errors++;
    continue;
  }
  const seen = {}; // op -> Set(step)
  // Scenario: [init text, op id, args, optional [[op, args], ...] run silently first]
  for (const [init, opId, args, setup] of ds.scenarios || []) {
    const { model } = ds.create((ds.init.parse || DSV.parseInts)(init));
    let frames;
    try {
      for (const [sop, sargs] of setup || []) DSV.runOp(ds, model, sop, sargs);
      frames = DSV.runOp(ds, model, opId, args);
      frames.forEach(layout); // the layout must accept every frame
    } catch (e) {
      console.error(`ERROR ${id}.${opId}(${args}) on [${init}]: ${e.stack}`);
      errors++;
      continue;
    }
    for (const f of frames) (seen[f.op] = seen[f.op] || new Set()).add(f.step);
  }
  // Listed ops plus any helper regions the tracer stepped into (e.g. LRU 'helpers').
  const opIds = new Set(ds.ops.map((o) => o.id).concat(Object.keys(seen)));
  for (const opId of opIds) {
    const op = { id: opId };
    for (const lang of Object.keys(code)) {
      const region = code[lang].ops[op.id];
      if (!region) {
        console.error(`ERROR ${id}: ${code[lang].file} has no @op ${op.id}`);
        errors++;
        continue;
      }
      const emitted = seen[op.id] || new Set();
      for (const s of emitted) {
        if (!region.steps[s]) {
          console.error(`ERROR ${id}.${op.id}: step "${s}" not tagged in ${code[lang].file}`);
          errors++;
        }
      }
      for (const s of Object.keys(region.steps)) {
        if (!emitted.has(s)) {
          console.warn(`warn  ${id}.${op.id}: step "${s}" in ${code[lang].file} not reached by any scenario`);
          warnings++;
        }
      }
    }
  }
}

console.log(`check_steps: ${Object.keys(DSV.registry).length} structures, ${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
