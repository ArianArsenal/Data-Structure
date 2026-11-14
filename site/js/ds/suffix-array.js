/* Suffix array + LCP: traced build / search mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const RH = 40;

  function parse(text) {
    const w = DSV.parseWords(text);
    if (w.length !== 1) throw new Error('Enter a single word (letters a-z), e.g. banana');
    return w;
  }

  function sorted(text) {
    return [...text].map((_, i) => i).sort((i, j) => (text.slice(i) < text.slice(j) ? -1 : 1));
  }

  function lcpOf(text, sa) {
    const lcp = Array(sa.length).fill(0);
    for (let k = 1; k < sa.length; k++) {
      let h = 0;
      while (text[sa[k - 1] + h] !== undefined && text[sa[k - 1] + h] === text[sa[k] + h]) h++;
      lcp[k] = h;
    }
    return lcp;
  }

  DSV.register({
    id: 'suffix-array',
    title: 'Suffix Array',
    about:
      'The start positions of all suffixes of a string, sorted alphabetically by suffix. Every substring is a prefix of some suffix, so binary search over the suffix array finds any pattern in O(m log n). The LCP array (longest common prefix of neighbouring suffixes) helps answer questions like "longest repeated substring".',
    init: {
      default: 'banana',
      parse,
      random: () => ['banana', 'mississippi', 'abracadabra', 'cocoa', 'papaya', 'bookkeeper'][Math.floor(Math.random() * 6)],
    },
    complexity: {
      rows: [
        ['Build (this simple version)', 'O(n² log n)', 'O(n² log n)'],
        ['Build (SA-IS / DC3)', 'O(n)', 'O(n)'],
        ['Search pattern of length m', 'O(m log n)', 'O(m log n)'],
      ],
      space: 'O(n)',
      notes: 'The largest LCP value marks the longest repeated substring, e.g. "ana" in banana.',
    },

    create([text]) {
      const sa = sorted(text);
      return { model: { text, sa, lcp: lcpOf(text, sa) }, msg: `Built the suffix array of "${text}". Run build() to watch it step by step, or search for a pattern.` };
    },
    snapshot: (m) => ({ text: m.text, sa: m.sa.slice(), lcp: m.lcp ? m.lcp.slice() : null }),

    layout(frame) {
      const st = frame.state;
      const n = st.text.length;
      const sw = n * 11 + 24;
      const nodes = [];
      st.sa.forEach((i, k) => {
        const y = k * RH;
        nodes.push(DSV.label('k' + k, -36, y, k));
        nodes.push({ id: 'n' + i, x: 0, y, shape: 'box', w: 40, h: 32, text: i, cls: frame.hl['r' + i] });
        nodes.push({ id: 'r' + i, x: 36 + sw / 2, y, shape: 'box', w: sw, h: 32, text: st.text.slice(i), align: 'start', cls: frame.hl['r' + i] });
        if (st.lcp) nodes.push({ id: 'l' + k, x: 60 + sw + 20, y, shape: 'box', w: 40, h: 32, text: k === 0 ? '-' : st.lcp[k], cls: frame.hl['l' + k] });
      });
      nodes.push(DSV.label('hk', -36, -34, 'k'), DSV.label('hs', 0, -34, 'sa[k]', 'strong'), DSV.label('hx', 36 + sw / 2, -34, 'suffix', 'strong'));
      if (st.lcp) nodes.push(DSV.label('hl', 80 + sw, -34, 'lcp', 'strong'));
      ['lo', 'mid', 'hi'].forEach((name, j) => {
        const v = frame.vars[name];
        if (v && v.t === 'val') nodes.push(DSV.label('p-' + name, -70 - j * 34, v.v * RH, name, 'strong'));
      });
      return { nodes, edges: [], pointers: [] };
    },

    scenarios: [
      ['banana', 'build', []],
      ['banana', 'search', ['ana']],
      ['banana', 'search', ['nab']],
      ['banana', 'search', ['zzz']],
    ],

    ops: [
      {
        id: 'build',
        label: 'build()',
        args: [],
        run(t, m) {
          const text = m.text;
          const n = text.length;
          m.sa = [...Array(n).keys()];
          m.lcp = null;
          t.step('init', `List every suffix start: 0..${n - 1}, still in text order.`, { n, sa: m.sa.slice() });
          m.sa = sorted(text);
          t.step('sort', 'Sort the start positions by the suffix each one begins (alphabetical order).', { n, sa: m.sa.slice() });
          m.lcp = Array(n).fill(0);
          t.step('lcp_init', 'Now compute LCP: how many leading characters each suffix shares with the one above it.', { n, sa: m.sa.slice() });
          for (let k = 1; ; k++) {
            t.step('lcp_loop', k < n ? `Row k = ${k}.` : 'All rows done.', { n, k });
            if (k >= n) break;
            const a = m.sa[k - 1];
            const b = m.sa[k];
            const hl = { ['r' + a]: 'visited', ['r' + b]: 'active', ['l' + k]: 'active' };
            t.step('lcp_pair', `Compare "${text.slice(a)}" with "${text.slice(b)}".`, { n, k, a, b }, { hl });
            let h = 0;
            while (a + h < n && b + h < n && text[a + h] === text[b + h]) h++;
            t.step('lcp_match', h ? `They share "${text.slice(b, b + h)}": h = ${h}.` : 'The first characters differ: h = 0.', { n, k, a, b, h }, { hl });
            m.lcp[k] = h;
            t.step('lcp_store', `lcp[${k}] = ${h}.`, { n, k, a, b, h }, { hl: Object.assign({}, hl, { ['l' + k]: 'new' }) });
          }
          const best = Math.max(0, ...m.lcp);
          const at = m.lcp.indexOf(best);
          t.step('lcp_loop', best ? `Built. The longest repeated substring is "${text.slice(m.sa[at], m.sa[at] + best)}" (max lcp = ${best}).` : 'Built. No substring repeats.', { n, sa: m.sa.slice(), lcp: m.lcp.slice() }, { ok: true });
        },
      },
      {
        id: 'search',
        label: 'search(pattern)',
        args: [{ name: 'pattern', default: 'ana', type: 'str' }],
        run(t, m, pattern) {
          const text = m.text;
          let lo = 0;
          let hi = m.sa.length;
          t.step('init', `Binary search for the first suffix ≥ "${pattern}".`, { pattern, lo, hi });
          for (;;) {
            t.step('loop', lo < hi ? `lo = ${lo} < hi = ${hi}.` : `lo == hi == ${lo}: the search range is empty.`, { pattern, lo, hi });
            if (lo >= hi) break;
            const mid = (lo + hi) >> 1;
            const s = text.slice(m.sa[mid]);
            t.step('mid', `mid = ${mid}: suffix "${s}".`, { pattern, lo, hi, mid }, { hl: { ['r' + m.sa[mid]]: 'active' } });
            const less = s < pattern;
            t.step('compare', `Is "${s}" < "${pattern}"? ${less ? 'Yes: the answer is below mid.' : 'No: the answer is at mid or above.'}`, { pattern, lo, hi, mid }, { hl: { ['r' + m.sa[mid]]: 'active' } });
            if (less) {
              lo = mid + 1;
              t.step('go_right', `lo = ${lo}.`, { pattern, lo, hi, mid });
            } else {
              hi = mid;
              t.step('go_left', `hi = ${hi}.`, { pattern, lo, hi, mid });
            }
          }
          const hit = lo < m.sa.length && text.startsWith(pattern, m.sa[lo]);
          t.step('check', lo < m.sa.length ? `Does "${text.slice(m.sa[lo])}" start with "${pattern}"? ${hit ? 'Yes.' : 'No.'}` : 'Ran past the last suffix.', { pattern, lo, hi }, { hl: lo < m.sa.length ? { ['r' + m.sa[lo]]: hit ? 'found' : 'removed' } : {} });
          if (hit) return t.step('found', `"${pattern}" occurs at position ${m.sa[lo]}.`, { pattern, lo }, { hl: { ['r' + m.sa[lo]]: 'found' }, ok: true });
          t.step('not_found', `"${pattern}" does not occur in "${text}".`, { pattern, lo }, { ok: false });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
