/* Trie: traced insert / search / starts_with mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX_NODES = 60;
  const WORDS = ['car', 'cart', 'care', 'cat', 'dog', 'dot', 'do', 'tea', 'ten', 'to', 'tree', 'trie', 'try', 'in', 'inn', 'ink'];

  const mk = (ch) => DSV.node({ ch, children: {}, isEnd: false });
  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const size = (n) => 1 + Object.values(n.children).reduce((s, c) => s + size(c), 0);

  // search and starts_with share the walk; they differ only in the final step.
  function walk(t, m, text, argName, finish) {
    let node = m.root;
    let path = '';
    const v = (x) => Object.assign({ [argName]: text, node }, x);
    t.step('start', 'Start at the root (the empty prefix).', v(), { hl: hl(node, 'active') });
    for (const ch of text) {
      t.step('loop', `Next character: '${ch}'.`, v({ ch }), { hl: hl(node, 'active') });
      const has = !!node.children[ch];
      t.step('check_child', has ? `"${path}" has a '${ch}' child.` : `"${path}" has no '${ch}' child.`, v({ ch }), { hl: hl(node, has ? 'active' : 'removed') });
      if (!has) return t.step('missing', `No word starts with "${path + ch}". Return %false%.`, v({ ch }), { hl: hl(node, 'removed'), ok: false });
      t.mark(node.id, 'visited');
      node = node.children[ch];
      path += ch;
      t.step('descend', `Follow '${ch}': prefix "${path}".`, v({ ch }), { hl: hl(node, 'active') });
    }
    t.step('loop', `All of "${text}" matched.`, v(), { hl: hl(node, 'found') });
    finish(node, v);
  }

  DSV.register({
    id: 'trie',
    title: 'Trie (Prefix Tree)',
    about:
      'A tree where each edge is a character, so every path from the root spells a prefix. Words that share a prefix share nodes. Looking up a word or prefix costs O(L) for length L, no matter how many words are stored. Used for autocomplete and spell checking.',
    init: {
      default: 'car, cart, cat, dog, do, tea',
      max: 12,
      parse: DSV.parseWords,
      random: () => WORDS.slice().sort(() => Math.random() - 0.5).slice(0, 6).join(', '),
    },
    complexity: {
      rows: [
        ['Insert (length L)', 'O(L)', 'O(L)'],
        ['Search word', 'O(L)', 'O(L)'],
        ['Starts with prefix', 'O(L)', 'O(L)'],
      ],
      space: 'O(total characters), up to alphabet size × nodes for array children',
      notes: 'Nodes with a thick green ring mark the end of a word. Try search("ca"): every letter is there, but "ca" was never inserted as a word.',
    },

    create(words) {
      const m = { root: mk('') };
      for (const w of words) {
        let n = m.root;
        for (const ch of w) n = n.children[ch] = n.children[ch] || mk(ch);
        n.isEnd = true;
      }
      return { model: m, msg: `Inserted ${words.length} words using ${size(m.root)} nodes.` };
    },

    snapshot(m, vars) {
      const nodes = {};
      const visit = (n) => {
        if (nodes[n.id]) return;
        const keys = Object.keys(n.children).sort();
        nodes[n.id] = { id: n.id, ch: n.ch, end: n.isEnd, children: keys.map((k) => n.children[k].id) };
        keys.forEach((k) => visit(n.children[k]));
      };
      visit(m.root);
      return { root: m.root.id, nodes };
    },

    layout(frame) {
      const st = frame.state;
      const pos = DSV.tidy([st.root], (id) => st.nodes[id].children, { dx: 50, dy: 70 });
      const nodes = [];
      const edges = [];
      for (const id in st.nodes) {
        const n = st.nodes[id];
        nodes.push({ id, x: pos[id].x, y: pos[id].y, shape: 'circle', text: n.ch || '•', cls: [n.end ? 'end' : '', frame.hl[id] || ''].join(' ') });
        n.children.forEach((c) => edges.push({ from: id, to: c, kind: 'tree' }));
      }
      return { nodes, edges, pointers: DSV.varPointers(frame, [{ name: 'root', target: st.root, cls: 'root' }]) };
    },

    scenarios: [
      ['car cat', 'insert', ['cart']],
      ['car cart', 'search', ['car']],
      ['car cart', 'search', ['ca']],
      ['car cart', 'search', ['cow']],
      ['car cart', 'starts_with', ['ca']],
      ['car cart', 'starts_with', ['x']],
    ],

    ops: [
      {
        id: 'insert',
        label: 'insert(word)',
        args: [{ name: 'word', default: 'care', type: 'str' }],
        check: (m) => (size(m.root) >= MAX_NODES ? `This demo is limited to ${MAX_NODES} nodes.` : null),
        run(t, m, word) {
          let node = m.root;
          const v = (x) => Object.assign({ word, node }, x);
          t.step('start', 'Start at the root.', v(), { hl: hl(node, 'active') });
          for (const ch of word) {
            t.step('loop', `Next character: '${ch}'.`, v({ ch }), { hl: hl(node, 'active') });
            const has = !!node.children[ch];
            t.step('check_child', has ? `'${ch}' already exists here: reuse the shared prefix.` : `No '${ch}' child yet.`, v({ ch }), { hl: hl(node, 'active') });
            if (!has) {
              node.children[ch] = mk(ch);
              t.step('create', `Create a node for '${ch}'.`, v({ ch }), { hl: hl(node.children[ch], 'new') });
            }
            t.mark(node.id, 'visited');
            node = node.children[ch];
            t.step('descend', `Move down to '${ch}'.`, v({ ch }), { hl: hl(node, 'active') });
          }
          t.step('loop', 'Every character is placed.', v(), { hl: hl(node, 'active') });
          node.isEnd = true;
          t.step('mark_end', `Mark this node as the end of "${word}".`, v(), { hl: hl(node, 'found'), ok: true });
        },
      },
      {
        id: 'search',
        label: 'search(word)',
        args: [{ name: 'word', default: 'cat', type: 'str' }],
        run(t, m, word) {
          walk(t, m, word, 'word', (node, v) =>
            t.step('check_end', node.isEnd ? `The node is marked as a word end: "${word}" is in the trie.` : `"${word}" is only a prefix: no word ends here. Return %false%.`, v(), {
              hl: hl(node, node.isEnd ? 'found' : 'removed'),
              ok: node.isEnd,
            })
          );
        },
      },
      {
        id: 'starts_with',
        label: 'starts_with(prefix)',
        args: [{ name: 'prefix', default: 'ca', type: 'str' }],
        run(t, m, prefix) {
          walk(t, m, prefix, 'prefix', (node, v) => t.step('done', `Some word starts with "${prefix}". Return %true%.`, v(), { hl: hl(node, 'found'), ok: true }));
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
