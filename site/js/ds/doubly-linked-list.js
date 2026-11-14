/* Doubly linked list: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 10;

  const label = (n) => (n ? `node ${n.value}` : '%null%');
  const hl = (...p) => {
    const o = {};
    for (let i = 0; i < p.length; i += 2) if (p[i]) o[p[i].id] = p[i + 1];
    return o;
  };
  const full = (m) => (m.size >= MAX ? `This demo is limited to ${MAX} nodes.` : null);

  DSV.register({
    id: 'doubly-linked-list',
    title: 'Doubly Linked List',
    layout: (frame) => DSV.listLayout(frame, { shape: 'dlist' }),
    about:
      'Each node links to both its next and its previous node, and the list keeps a tail pointer. That makes insert and delete at either end O(1), and a node can be unlinked without walking from the head to find its predecessor.',
    init: { default: '2, 4, 6, 8', max: MAX, random: [4, 1, 99] },
    complexity: {
      rows: [
        ['Insert at head / tail', 'O(1)', 'O(1)'],
        ['Delete given a node', 'O(1)', 'O(1)'],
        ['Delete by value (search first)', 'O(n)', 'O(n)'],
      ],
      space: 'O(n), one extra pointer per node',
      notes: 'Top arrows are next links; the faint lower arrows are prev links.',
    },

    create(values) {
      const m = { head: null, tail: null, size: 0 };
      for (const v of values) {
        const n = DSV.node({ value: v, next: null, prev: m.tail });
        if (m.tail) m.tail.next = n;
        else m.head = n;
        m.tail = n;
        m.size++;
      }
      return { model: m, msg: `Built a list with ${values.length} nodes.` };
    },

    snapshot(m, vars) {
      const nodes = {};
      const visit = (n) => {
        for (; n && !nodes[n.id]; n = n.next)
          nodes[n.id] = { id: n.id, value: n.value, next: n.next ? n.next.id : null, prev: n.prev ? n.prev.id : null };
      };
      visit(m.head);
      for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
      return { head: m.head ? m.head.id : null, tail: m.tail ? m.tail.id : null, nodes };
    },

    scenarios: [
      ['1 2', 'insert_head', [0]],
      ['', 'insert_head', [0]],
      ['1 2', 'insert_tail', [3]],
      ['', 'insert_tail', [3]],
      ['1 2 3', 'delete_value', [2]],
      ['1 2 3', 'delete_value', [1]],
      ['1 2 3', 'delete_value', [3]],
      ['1 2 3', 'delete_value', [9]],
    ],

    ops: [
      {
        id: 'insert_head',
        label: 'insert_head(value)',
        args: [{ name: 'value', default: 1 }],
        check: full,
        run(t, m, value) {
          const node = DSV.node({ value, next: null, prev: null });
          t.hint = { float: { [node.id]: -0.5 } };
          const v = () => ({ value, node });
          t.step('create', `Create node ${value}.`, v(), { hl: hl(node, 'new') });
          node.next = m.head;
          t.step('link_next', `node.next = head (${label(m.head)}).`, v(), { hl: hl(node, 'new') });
          t.step('check_empty', m.head ? 'The list is not empty.' : 'The list is empty.', v(), { hl: hl(node, 'new') });
          if (m.head) {
            m.head.prev = node;
            t.step('link_prev', `The old head's prev now points back to the new node.`, v(), { hl: hl(node, 'new', m.head, 'active') });
          } else {
            m.tail = node;
            t.step('set_tail', 'It is the only node, so it is also the tail.', v(), { hl: hl(node, 'new') });
          }
          m.head = node;
          t.hint = {};
          t.step('set_head', 'head = node.', v(), { hl: hl(node, 'new') });
          m.size++;
          t.step('done', `Size is now ${m.size}.`, v(), { hl: hl(node, 'found'), ok: true });
        },
      },
      {
        id: 'insert_tail',
        label: 'insert_tail(value)',
        args: [{ name: 'value', default: 10 }],
        check: full,
        run(t, m, value) {
          const node = DSV.node({ value, next: null, prev: null });
          t.hint = { float: { [node.id]: Math.max(0, m.size - 0.5) } };
          const v = () => ({ value, node });
          t.step('create', `Create node ${value}.`, v(), { hl: hl(node, 'new') });
          node.prev = m.tail;
          t.step('link_prev', `node.prev = tail (${label(m.tail)}).`, v(), { hl: hl(node, 'new') });
          t.step('check_empty', m.tail ? 'The list is not empty.' : 'The list is empty.', v(), { hl: hl(node, 'new') });
          if (m.tail) {
            m.tail.next = node;
            t.step('link_next', `The old tail's next now points to the new node. No traversal needed.`, v(), { hl: hl(node, 'new', m.tail, 'active') });
          } else {
            m.head = node;
            t.step('set_head', 'It is the only node, so it is also the head.', v(), { hl: hl(node, 'new') });
          }
          m.tail = node;
          t.hint = {};
          t.step('set_tail', 'tail = node.', v(), { hl: hl(node, 'new') });
          m.size++;
          t.step('done', `Size is now ${m.size}.`, v(), { hl: hl(node, 'found'), ok: true });
        },
      },
      {
        id: 'delete_value',
        label: 'delete_value(value)',
        args: [{ name: 'value', default: 4 }],
        run(t, m, value) {
          let curr = m.head;
          t.step('start', 'Start at the head.', { value, curr }, { hl: hl(curr, 'active') });
          for (;;) {
            const go = curr && curr.value !== value;
            t.step('loop', !curr ? 'curr is %null%: reached the end.' : go ? `${curr.value} ≠ ${value}: keep going.` : `Found ${value}.`, { value, curr }, { hl: hl(curr, go ? 'active' : 'found') });
            if (!go) break;
            t.mark(curr.id, 'visited');
            curr = curr.next;
            t.step('advance', `Move to ${label(curr)}.`, { value, curr }, { hl: hl(curr, 'active') });
          }
          t.step('check_found', curr ? `curr is node ${curr.value}.` : 'curr is %null%.', { value, curr });
          if (!curr) return t.step('not_found', `${value} is not in the list.`, { value, curr }, { ok: false });
          const v = () => ({ value, curr });
          t.step('check_prev', curr.prev ? `curr has a previous node (${curr.prev.value}).` : 'curr is the head (no prev).', v(), { hl: hl(curr, 'removed') });
          if (curr.prev) {
            curr.prev.next = curr.next;
            t.step('bypass_prev', `prev.next skips over curr to ${label(curr.next)}.`, v(), { hl: hl(curr, 'removed', curr.prev, 'active') });
          } else {
            m.head = curr.next;
            t.step('move_head', `head moves to ${label(curr.next)}.`, v(), { hl: hl(curr, 'removed') });
          }
          t.step('check_next', curr.next ? `curr has a next node (${curr.next.value}).` : 'curr is the tail (no next).', v(), { hl: hl(curr, 'removed') });
          if (curr.next) {
            curr.next.prev = curr.prev;
            t.step('bypass_next', `next.prev skips back over curr to ${label(curr.prev)}.`, v(), { hl: hl(curr, 'removed', curr.next, 'active') });
          } else {
            m.tail = curr.prev;
            t.step('move_tail', `tail moves to ${label(curr.prev)}.`, v(), { hl: hl(curr, 'removed') });
          }
          m.size--;
          t.step('release', 'curr is fully unlinked; release it (C++ deletes it) and decrement size.', { value });
          t.step('done', `Deleted ${value}; return %true%.`, { value }, { ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
