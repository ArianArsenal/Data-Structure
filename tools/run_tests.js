#!/usr/bin/env node
/* Runs the Python, C++ and Java test suites. Usage: node tools/run_tests.js [python|cpp|java ...] */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const exe = process.platform === 'win32' ? '.exe' : '';

function run(cmd, args, opts) {
  const r = spawnSync(cmd, args, Object.assign({ cwd: ROOT, stdio: 'inherit', shell: false }, opts));
  if (r.error) console.error(`  could not run ${cmd}: ${r.error.message}`);
  return r.status === 0;
}

const list = (dir, re) =>
  fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => re.test(f))
    .sort();

const suites = {
  python() {
    const py = process.platform === 'win32' ? 'python' : 'python3';
    return run(py, ['-m', 'unittest', 'discover', '-s', 'src/python/tests', '-p', 'test_*.py']);
  },
  cpp() {
    fs.mkdirSync(path.join(BUILD, 'cpp'), { recursive: true });
    let ok = true;
    for (const f of list('src/cpp/tests', /^test_.*\.cpp$/)) {
      const out = path.join(BUILD, 'cpp', f.replace(/\.cpp$/, exe));
      if (!run('g++', ['-std=c++17', '-Wall', '-Wextra', '-O1', '-static', '-o', out, path.join('src/cpp/tests', f)])) {
        ok = false;
        continue;
      }
      ok = run(out, []) && ok;
    }
    return ok;
  },
  java() {
    const out = path.join(BUILD, 'java');
    fs.mkdirSync(out, { recursive: true });
    const srcs = list('src/java', /\.java$/)
      .map((f) => path.join('src/java', f))
      .concat(list('src/java/tests', /\.java$/).map((f) => path.join('src/java/tests', f)));
    if (!run('javac', ['-d', out].concat(srcs))) return false;
    let ok = true;
    for (const f of list('src/java/tests', /^Test.*\.java$/)) ok = run('java', ['-cp', out, f.replace(/\.java$/, '')]) && ok;
    return ok;
  },
};

const pick = process.argv.slice(2);
const names = pick.length ? pick : Object.keys(suites);
const results = names.map((n) => {
  console.log(`\n=== ${n} ===`);
  return [n, suites[n]()];
});
console.log('\n' + results.map(([n, ok]) => `${n}: ${ok ? 'PASS' : 'FAIL'}`).join('   '));
process.exit(results.every(([, ok]) => ok) ? 0 : 1);
