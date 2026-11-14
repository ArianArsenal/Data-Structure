/* Union-find: traced find / union mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const uid = (i) => 'u' + i;

  // "8: 0-1, 2-3" -> { n: 8, pairs: [[0,1],[2,3]] }
  function parse(text) {
    const m = /^\s*(\d+)\s*(?::(.*))?$/.exec(String(text));
    if (!m) throw new Error('Use the form "n" or "n: a-b, c-d", e.g. 8: 0-1, 2-3');
    const n = +m[1];
    if (n < 2 || n > 12) throw new Error('n must be between 2 and 12');
    const pairs = [];
    for (const tok of (m[2] || '').split(/[\s,]+/).filter(Boolean)) {
      const p = /^(\d+)-(\d+)$/.exec(tok);
      if (!p || +p[1] >= n || +p[2] >= n) throw new Error(`"${tok}" is not a pair a-b with a, b < ${n}`);
      pairs.push([+p[1], +p[2]]);
    }
    return { n, pairs };
  }

  function find(t, m, x, base) {
    const o = { op: 'find' };
    const x0 = x;
    let root = x;
    const v = (extra) => Object.assign({}, base, { x, root }, extra);
    t.step('start', `find(${x0}): climb parent links to the root.`, v(), Object.assign({ hl: { [uid(x)]: 'active' } }, o));
    for (;;) {
      const top = m.parent[root] === root;
      t.step('climb_check', top ? `${root} is its own parent: it is the root.` : `parent[${root}] = ${m.parent[root]}: keep climbing.`, v(), Object.assign({ hl: { [uid(root)]: top ? 'found' : 'active' } }, o));
      if (top) break;
      root = m.parent[root];
      t.step('climb', `root = ${root}.`, v(), Object.assign({ hl: { [uid(root)]: 'active' } }, o));
    }
    for (;;) {
      const done = m.parent[x] === root;
      t.step('compress_check', done ? `${x} already points at the root.` : `Path compression: point ${x} directly at ${root}.`, v(), Object.assign({ hl: { [uid(x)]: 'active', [uid(root)]: 'found' } }, o));
      if (done) break;
      const nxt = m.parent[x];
      t.step('save', `Remember the old parent, ${nxt}.`, v({ nxt }), Object.assign({ hl: { [uid(x)]: 'active', [uid(root)]: 'found' } }, o));
      m.parent[x] = root;
      t.step('compress', `parent[${x}] = ${root}.`, v({ nxt }), Object.assign({ hl: { [uid(x)]: 'new', [uid(root)]: 'found' } }, o));
      x = nxt;
      t.step('advance', `Continue with ${x}.`, v({ nxt }), Object.assign({ hl: { [uid(x)]: 'active', [uid(root)]: 'found' } }, o));
    }
    t.step('done', `find(${x0}) = ${root}.`, v(), Object.assign({ hl: { [uid(root)]: 'found' } }, o));
    return root;
  }

  function quietFind(m, x) {
    while (m.parent[x] !== x) x = m.parent[x] = m.parent[m.parent[x]];
    return x;
  }

  DSV.register({
    id: 'union-find',
    title: 'Union-Find (Disjoint Sets)',
    about:
      'Tracks which elements belong to the same group. Each set is a tree whose root is its representative. find follows parent links to the root; union links one root under the other. Union by rank keeps trees shallow, and path compression flattens them during finds, which makes both operations nearly O(1).',
    init: {
      default: '8: 0-1, 2-3, 1-3, 4-5',
      parse,
      random: () => {
        const n = 8;
        const p = [];
        for (let k = 0; k < 4; k++) p.push(`${Math.floor(Math.random() * n)}-${Math.floor(Math.random() * n)}`);
        return `${n}: ${p.join(', ')}`;
      },
    },
    complexity: {
      rows: [
        ['Find', 'O(α(n))', 'O(log n) single op'],
        ['Union', 'O(α(n))', 'O(log n) single op'],
      ],
      space: 'O(n)',
      notes: 'α(n) is the inverse Ackermann function, which is at most 4 for any realistic n. Initial values use the form "n: a-b, c-d". The r number beside each root is its rank. Used in Kruskal’s minimum spanning tree algorithm.',
    },

    create({ n, pairs }) {
      const m = { parent: [...Array(n).keys()], rank: Array(n).fill(0) };
      for (const [a, b] of pairs) {
        let ra = quietFind(m, a);
        let rb = quietFind(m, b);
        if (ra === rb) continue;
        if (m.rank[ra] < m.rank[rb]) [ra, rb] = [rb, ra];
        m.parent[rb] = ra;
        if (m.rank[ra] === m.rank[rb]) m.rank[ra]++;
      }
      const sets = m.parent.filter((p, i) => p === i).length;
      return { model: m, msg: `${n} elements in ${sets} sets.` };
    },
    snapshot: (m) => ({ parent: m.parent.slice(), rank: m.rank.slice() }),

    layout(frame) {
      const st = frame.state;
      const n = st.parent.length;
      const roots = [...Array(n).keys()].filter((i) => st.parent[i] === i);
      const kids = (i) => [...Array(n).keys()].filter((j) => j !== i && st.parent[j] === i);
      const pos = DSV.tidy(roots, kids, { dx: 56, dy: 76, gap: 20 });
      const nodes = [];
      const edges = [];
      for (let i = 0; i < n; i++) {
        const isRoot = st.parent[i] === i;
        nodes.push({ id: uid(i), x: pos[i].x, y: pos[i].y, shape: 'circle', text: i, sub: isRoot ? 'r' + st.rank[i] : undefined, cls: frame.hl[uid(i)] });
        if (!isRoot) edges.push({ from: uid(i), to: uid(st.parent[i]) });
      }
      return { nodes, edges, pointers: [] };
    },

    scenarios: [
      ['8: 0-1, 2-3, 1-3, 4-5', 'find', [2]],
      ['8: 0-1, 2-3, 1-3, 4-5', 'find', [0]],
      ['4', 'find', [3], [['union', [0, 1]], ['union', [2, 3]], ['union', [1, 3]]]],
      ['8: 0-1, 2-3', 'union', [1, 2]],
      ['8: 0-1', 'union', [2, 0]],
      ['8: 0-1, 2-3, 1-3', 'union', [4, 0]],
      ['8: 0-1', 'union', [0, 1]],
    ],

    ops: [
      {
        id: 'find',
        label: 'find(x)',
        args: [{ name: 'x', default: 2 }],
        check: (m, x) => (x < 0 || x >= m.parent.length ? `x must be 0..${m.parent.length - 1}.` : null),
        run(t, m, x) {
          find(t, m, x, {});
        },
      },
      {
        id: 'union',
        label: 'union(a, b)',
        args: [
          { name: 'a', default: 3 },
          { name: 'b', default: 5 },
        ],
        check: (m, a, b) => (a < 0 || b < 0 || a >= m.parent.length || b >= m.parent.length ? `a and b must be 0..${m.parent.length - 1}.` : null),
        run(t, m, a, b) {
          t.step('find_roots', `First find the roots of ${a} and ${b}.`, { a, b });
          let ra = find(t, m, a, { a, b });
          let rb = find(t, m, b, { a, b, ra });
          const v = () => ({ a, b, ra, rb });
          t.step('find_roots', `ra = ${ra}, rb = ${rb}.`, v(), { hl: { [uid(ra)]: 'found', [uid(rb)]: 'found' } });
          t.step('check_same', ra === rb ? 'Same root: already in the same set.' : 'Different roots: merge the two sets.', v());
          if (ra === rb) return t.step('same', 'Nothing to do; return %false%.', v(), { ok: false });
          const sw = m.rank[ra] < m.rank[rb];
          t.step('compare_rank', `rank[${ra}] = ${m.rank[ra]}, rank[${rb}] = ${m.rank[rb]}. ${sw ? 'Swap so ra has the higher rank.' : 'ra already has the higher (or equal) rank.'}`, v());
          if (sw) {
            [ra, rb] = [rb, ra];
            t.step('swap', `Now ra = ${ra}, rb = ${rb}.`, v());
          }
          m.parent[rb] = ra;
          t.step('attach', `Hang the shorter tree under the taller one: parent[${rb}] = ${ra}.`, v(), { hl: { [uid(rb)]: 'new', [uid(ra)]: 'found' } });
          const tie = m.rank[ra] === m.rank[rb];
          t.step('check_tie', tie ? 'Equal ranks: the merged tree got one level taller.' : 'Ranks differed: the height is unchanged.', v());
          if (tie) {
            m.rank[ra]++;
            t.step('bump', `rank[${ra}] = ${m.rank[ra]}.`, v(), { hl: { [uid(ra)]: 'found' } });
          }
          t.step('done', `Merged: ${a} and ${b} are now in the same set.`, v(), { ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
