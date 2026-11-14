/* Variable watch panel: the locals of the current step, spelled per language. */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function show(v, lang) {
    const L = DSV.LANGS[lang];
    switch (v.t) {
      case 'null':
        return `<span class="tk-kw">${L.null}</span>`;
      case 'bool':
        return `<span class="tk-kw">${L[v.v]}</span>`;
      case 'node':
        return `<span class="tk-ty">Node</span>(<span class="tk-nu">${esc(v.label)}</span>)`;
      case 'str':
        return `<span class="tk-st">"${esc(v.v)}"</span>`;
      case 'list': {
        const [o, c] = lang === 'cpp' ? ['{', '}'] : ['[', ']'];
        return o + v.items.map((x) => show(x, lang)).join(', ') + c;
      }
      default:
        return `<span class="tk-nu">${esc(v.v)}</span>`;
    }
  }

  class Watch {
    constructor(el) {
      this.el = el;
      this.lang = 'python';
    }

    setLang(lang) {
      this.lang = lang;
      if (this.frame !== undefined) this.showFrame(this.frame, this.prevFrame);
    }

    showFrame(frame, prevFrame) {
      this.frame = frame;
      this.prevFrame = prevFrame;
      const vars = (frame && frame.vars) || {};
      const before = (prevFrame && prevFrame.op === frame.op && prevFrame.vars) || {};
      const names = Object.keys(vars);
      if (!names.length) {
        this.el.innerHTML = '<div class="empty">No local variables at this step.</div>';
        return;
      }
      this.el.innerHTML =
        '<table>' +
        names
          .map((n) => {
            const html = show(vars[n], this.lang);
            const changed = before[n] === undefined || JSON.stringify(before[n]) !== JSON.stringify(vars[n]);
            return `<tr class="${changed ? 'changed' : ''}"><th>${esc(n)}</th><td>${html}</td></tr>`;
          })
          .join('') +
        '</table>';
    }
  }
  DSV.Watch = Watch;
})(typeof window !== 'undefined' ? window : globalThis);
