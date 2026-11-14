/* Page shell: builds the UI for one data structure and wires everything up.
 * Usage in a page: DSV.mount('singly-linked-list'). */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  const SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('dsv.' + k);
        return v === null ? d : v;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('dsv.' + k, v);
      } catch (e) {
        /* storage unavailable: settings just don't persist */
      }
    },
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const ICON = {
    first: '<path d="M6 5h2v14H6zM20 5v14L9 12z"/>',
    prev: '<path d="M18 5v14L7 12z"/>',
    play: '<path d="M7 5v14l12-7z"/>',
    pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
    next: '<path d="M6 5v14l11-7z"/>',
    last: '<path d="M16 5h2v14h-2zM4 5v14l11-7z"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

  DSV.applyTheme = function () {
    document.documentElement.dataset.theme = store.get('theme', 'dark');
  };
  DSV.toggleTheme = function () {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    store.set('theme', next);
    DSV.applyTheme();
  };

  function randomInts(n, lo, hi) {
    const set = new Set();
    while (set.size < n) set.add(lo + Math.floor(Math.random() * (hi - lo + 1)));
    return [...set];
  }

  DSV.mount = function (id) {
    DSV.applyTheme();
    const ds = DSV.registry[id];
    const code = (root.DS_CODE || {})[id];
    document.title = `${ds.title} · DS Visualizer`;
    const app = document.getElementById('app');
    if (!code) {
      app.innerHTML = `<p class="fatal">No generated code for "${esc(id)}". Run <code>node tools/build_code.js</code>.</p>`;
      return;
    }

    app.innerHTML = `
      <header class="topbar">
        <a class="back" href="../index.html" title="All data structures">←</a>
        <h1>${esc(ds.title)}</h1>
        <div class="spacer"></div>
        <div class="seg langs" role="tablist" aria-label="Language">
          ${Object.keys(DSV.LANGS)
            .map((l) => `<button role="tab" data-lang="${l}">${DSV.LANGS[l].label}</button>`)
            .join('')}
        </div>
        <button class="iconbtn theme" title="Toggle light / dark">◐</button>
      </header>
      <main class="workspace">
        <section class="col left">
          <div class="card code-card">
            <div class="card-head">
              <span class="file mono"></span>
              <div class="spacer"></div>
              <label class="check"><input type="checkbox" class="full"> Full file</label>
            </div>
            <div class="code mono"></div>
          </div>
          <div class="card side-card">
            <div class="card-head tabs">
              <button data-tab="watch" class="on">Variables</button>
              <button data-tab="info">Complexity</button>
            </div>
            <div class="pane watch mono" data-pane="watch"></div>
            <div class="pane info" data-pane="info" hidden></div>
          </div>
        </section>
        <section class="col right">
          <div class="card inputs">
            <div class="row">
              <label for="init">Initial values</label>
              <input id="init" class="init mono" spellcheck="false" autocomplete="off">
              <button class="btn build">Build</button>
              <button class="btn random" title="Random values">Random</button>
            </div>
            <div class="row">
              <label for="op">Operation</label>
              <select id="op" class="op"></select>
              <span class="args"></span>
              <button class="btn primary run">Run</button>
            </div>
          </div>
          <div class="card viz-card">
            <svg class="viz" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Visualization"></svg>
            <div class="caption" aria-live="polite"></div>
          </div>
          <div class="card controls">
            <div class="transport">
              <button class="iconbtn" data-act="first" title="First step (Home)">${icon('first')}</button>
              <button class="iconbtn" data-act="prev" title="Step back (←)">${icon('prev')}</button>
              <button class="iconbtn play" data-act="toggle" title="Play / pause (Space)">${icon('play')}</button>
              <button class="iconbtn" data-act="next" title="Step forward (→)">${icon('next')}</button>
              <button class="iconbtn" data-act="last" title="Last step (End)">${icon('last')}</button>
            </div>
            <input type="range" class="scrub" min="0" max="0" value="0" aria-label="Step">
            <span class="counter mono">0 / 0</span>
            <label class="speed">Speed <input type="range" class="speedr" min="0" max="${SPEEDS.length - 1}" step="1"> <span class="speedv mono"></span></label>
          </div>
        </section>
      </main>`;

    const $ = (s) => app.querySelector(s);
    const els = {
      file: $('.file'),
      full: $('.full'),
      code: $('.code'),
      watch: $('.watch'),
      info: $('.info'),
      init: $('.init'),
      op: $('.op'),
      args: $('.args'),
      svg: $('.viz'),
      caption: $('.caption'),
      scrub: $('.scrub'),
      counter: $('.counter'),
      speed: $('.speedr'),
      speedv: $('.speedv'),
      play: $('.play'),
    };

    const codePanel = new DSV.CodePanel(els.code, code);
    const watch = new DSV.Watch(els.watch);
    const view = new DSV.SceneView(els.svg);
    const layout = typeof ds.layout === 'function' ? ds.layout : DSV.layouts[ds.layout];
    let lang = store.get('lang', 'python');
    if (!DSV.LANGS[lang]) lang = 'python';
    let model = null;
    let current = null;

    const player = new DSV.Player(
      (frame, prev, i, tween) => {
        current = frame;
        view.show(layout(frame), tween);
        codePanel.showFrame(frame, prev);
        watch.showFrame(frame, prev);
        showCaption(frame);
      },
      () => {
        const n = player.frames.length;
        els.scrub.max = Math.max(0, n - 1);
        els.scrub.value = player.i;
        els.counter.textContent = `${n ? player.i + 1 : 0} / ${n}`;
        els.play.innerHTML = icon(player.playing ? 'pause' : 'play');
        els.play.classList.toggle('on', player.playing);
      }
    );

    function showCaption(frame) {
      els.caption.className = 'caption' + (frame.ok === true ? ' good' : frame.ok === false ? ' bad' : '');
      els.caption.textContent = DSV.langText(frame.msg, lang);
    }

    function error(msg) {
      player.pause();
      els.caption.className = 'caption bad';
      els.caption.textContent = msg;
    }

    function setLang(l) {
      lang = l;
      store.set('lang', l);
      app.querySelectorAll('.langs button').forEach((b) => b.classList.toggle('on', b.dataset.lang === l));
      els.file.textContent = code[l].file;
      codePanel.setLang(l);
      watch.setLang(l);
      if (current) showCaption(current);
    }

    function selectedOp() {
      return DSV.findOp(ds, els.op.value);
    }

    function renderArgs() {
      const op = selectedOp();
      els.args.innerHTML = (op.args || [])
        .map(
          (a) =>
            `<label class="arg"><span>${esc(a.name)}</span><input class="mono${a.type === 'str' ? ' wide' : ''}" data-arg="${esc(a.name)}" value="${esc(
              a.default
            )}" size="4" spellcheck="false" autocomplete="off"></label>`
        )
        .join('');
      els.args.querySelectorAll('input').forEach((inp) =>
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') run();
        })
      );
      codePanel.setOp(op.id);
    }

    function build() {
      let values;
      try {
        values = (ds.init.parse || DSV.parseInts)(els.init.value);
      } catch (e) {
        return error(e.message);
      }
      if (ds.init.max && values.length > ds.init.max) return error(`Use at most ${ds.init.max} values.`);
      const res = ds.create(values);
      model = res.model;
      player.load([DSV.buildFrame(ds, model, res.msg)]);
    }

    function run() {
      const op = selectedOp();
      const args = [];
      for (const a of op.args || []) {
        const raw = els.args.querySelector(`[data-arg="${a.name}"]`).value;
        try {
          args.push(DSV.parseArg(a, raw));
        } catch (e) {
          return error(`${a.name}: ${e.message}`);
        }
      }
      const problem = op.check && op.check(model, ...args);
      if (problem) return error(problem);
      player.load(DSV.runOp(ds, model, op.id, args), true);
    }

    // Static content
    els.op.innerHTML = ds.ops.map((o) => `<option value="${o.id}">${esc(o.label)}</option>`).join('');
    const cx = ds.complexity;
    els.info.innerHTML =
      `<p>${ds.about}</p>` +
      `<table class="cx"><thead><tr><th>Operation</th><th>Average</th><th>Worst</th></tr></thead><tbody>` +
      cx.rows.map((r) => `<tr><td>${esc(r[0])}</td><td class="mono">${esc(r[1])}</td><td class="mono">${esc(r[2])}</td></tr>`).join('') +
      `</tbody></table><p class="muted">Space: <span class="mono">${esc(cx.space)}</span></p>` +
      (cx.notes ? `<p class="muted">${cx.notes}</p>` : '');

    // Events
    app.querySelectorAll('.langs button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
    $('.theme').addEventListener('click', DSV.toggleTheme);
    els.full.addEventListener('change', () => codePanel.setFull(els.full.checked));
    app.querySelectorAll('.tabs button').forEach((b) =>
      b.addEventListener('click', () => {
        app.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x === b));
        app.querySelectorAll('.pane').forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.tab));
      })
    );
    $('.build').addEventListener('click', build);
    els.init.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') build();
    });
    $('.random').addEventListener('click', () => {
      const r = ds.init.random || [5, 1, 99];
      els.init.value = typeof r === 'function' ? r() : randomInts(...r).join(', ');
      build();
    });
    els.op.addEventListener('change', renderArgs);
    $('.run').addEventListener('click', run);
    app.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => player[b.dataset.act]()));
    els.scrub.addEventListener('input', () => {
      const i = +els.scrub.value; // read before pause() refreshes the slider
      player.pause();
      player.go(i, 120);
    });
    const speedIdx = SPEEDS.indexOf(+store.get('speed', 1));
    els.speed.value = speedIdx === -1 ? 3 : speedIdx;
    const applySpeed = () => {
      const s = SPEEDS[+els.speed.value];
      player.setSpeed(s);
      els.speedv.textContent = s + '×';
      store.set('speed', s);
    };
    els.speed.addEventListener('input', applySpeed);
    document.addEventListener('keydown', (e) => {
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName) && e.target.type !== 'range') return;
      const act = { ArrowRight: 'next', ArrowLeft: 'prev', ' ': 'toggle', Home: 'first', End: 'last' }[e.key];
      if (!act) return;
      e.preventDefault();
      player[act]();
    });

    // Initial state
    applySpeed();
    renderArgs();
    setLang(lang);
    els.init.value = ds.init.default;
    build();
  };
})(typeof window !== 'undefined' ? window : globalThis);
