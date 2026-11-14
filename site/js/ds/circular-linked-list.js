/* Circular linked list: traced operations mirroring src/{python,cpp,java}. */
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

  // Shared by insert_head and insert_tail (which calls it).
  function insertHead(t, m, value, quiet) {
    const node = DSV.node({ value, next: null });
    // Frames belong to insert_head's code even when insert_tail calls it.
    const step = (id, msg, opts) => !quiet && t.step(id, msg, { value, node }, Object.assign({ op: 'insert_head' }, opts));
    t.hint = { float: { [node.id]: -0.5 } };
    step('create', `Create node ${value}.`, { hl: hl(node, 'new') });
    step('check_empty', m.tail ? 'The list is not empty.' : 'The list is empty.', { hl: hl(node, 'new') });
    if (!m.tail) {
      node.next = node;
      step('self_loop', 'A lone node points to itself: it is both head and tail.', { hl: hl(node, 'new') });
      m.tail = node;
      t.hint = {};
      step('set_tail', 'tail = node.', { hl: hl(node, 'new') });
    } else {
      node.next = m.tail.next;
      step('link', `node.next = tail.next, the current head (${m.tail.next.value}).`, { hl: hl(node, 'new') });
      m.tail.next = node;
      t.hint = {};
      step('close', 'tail.next = node: the circle now runs through the new node, which is the new head.', { hl: hl(node, 'new', m.tail, 'active') });
    }
    m.size++;
    step('done', `Size is now ${m.size}.`, { hl: hl(node, 'found'), ok: true });
    return node;
  }

  DSV.register({
    id: 'circular-linked-list',
    title: 'Circular Linked List',
    layout: (frame) => DSV.listLayout(frame, { noHead: true }),
    about:
      'The last node links back to the first, so there is no null at the end. Storing only a tail pointer is enough: tail.next is the head. That gives O(1) insertion at both ends, and makes round-robin scheduling natural.',
    init: { default: '1, 2, 3, 4', max: MAX, random: [4, 1, 99] },
    complexity: {
      rows: [
        ['Insert at head / tail', 'O(1)', 'O(1)'],
        ['Delete by value', 'O(n)', 'O(n)'],
        ['Traverse', 'O(n)', 'O(n)'],
      ],
      space: 'O(n)',
      notes: 'Loops must stop when they come back to where they started, not when they reach null.',
    },

    create(values) {
      const m = { tail: null, size: 0 };
      for (const v of values) {
        insertHead({}, m, v, true);
        m.tail = m.tail.next;
      }
      return { model: m, msg: `Built a circle of ${values.length} nodes.` };
    },

    snapshot(m, vars) {
      const nodes = {};
      const visit = (n) => {
        for (; n && !nodes[n.id]; n = n.next) nodes[n.id] = { id: n.id, value: n.value, next: n.next ? n.next.id : null };
      };
      if (m.tail) visit(m.tail.next);
      for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
      return { head: m.tail ? m.tail.next.id : null, tail: m.tail ? m.tail.id : null, nodes };
    },

    scenarios: [
      ['1 2', 'insert_head', [0]],
      ['', 'insert_head', [0]],
      ['1 2', 'insert_tail', [3]],
      ['1 2 3', 'delete_value', [2]],
      ['1 2 3', 'delete_value', [3]],
      ['1', 'delete_value', [1]],
      ['1 2 3', 'delete_value', [9]],
      ['', 'delete_value', [9]],
      ['1 2 3', 'traverse', []],
      ['', 'traverse', []],
    ],

    ops: [
      {
        id: 'insert_head',
        label: 'insert_head(value)',
        args: [{ name: 'value', default: 0 }],
        check: full,
        run(t, m, value) {
          insertHead(t, m, value, false);
        },
      },
      {
        id: 'insert_tail',
        label: 'insert_tail(value)',
        args: [{ name: 'value', default: 5 }],
        check: full,
        run(t, m, value) {
          t.step('call_head', `Call insert_head(${value}): it splices the node in right after tail.`, { value });
          const node = insertHead(t, m, value, false);
          t.step('call_head', 'Back in insert_tail: the new node is the head for now.', { value }, { hl: hl(node, 'new') });
          m.tail = m.tail.next;
          t.step('advance_tail', 'Move tail forward one node. The new node is now the tail, so it was effectively appended in O(1).', { value }, { hl: hl(node, 'found'), ok: true });
        },
      },
      {
        id: 'delete_value',
        label: 'delete_value(value)',
        args: [{ name: 'value', default: 3 }],
        run(t, m, value) {
          t.step('check_empty', m.tail ? 'The list is not empty.' : 'The list is empty.', { value });
          if (!m.tail) return t.step('empty', 'Nothing to delete.', { value }, { ok: false });
          let prev = m.tail;
          t.step('start', 'prev starts at tail, so curr = prev.next starts at the head.', { value, prev }, { hl: hl(prev, 'active') });
          for (;;) {
            const curr = prev.next;
            t.step('load', `curr = prev.next = ${label(curr)}.`, { value, prev, curr }, { hl: hl(prev, 'active', curr, 'active') });
            const eq = curr.value === value;
            t.step('compare', `Is ${curr.value} == ${value}? ${eq ? 'Yes.' : 'No.'}`, { value, prev, curr }, { hl: hl(prev, 'active', curr, eq ? 'removed' : 'active') });
            if (eq) {
              t.step('check_single', curr === prev ? 'curr is prev: it is the only node.' : 'There are other nodes.', { value, prev, curr }, { hl: hl(curr, 'removed') });
              if (curr === prev) {
                m.tail = null;
                t.step('clear', 'The list becomes empty: tail = %null%.', { value, curr }, { hl: hl(curr, 'removed') });
              } else {
                prev.next = curr.next;
                t.step('unlink', `prev.next = curr.next (${label(curr.next)}).`, { value, prev, curr }, { hl: hl(prev, 'active', curr, 'removed') });
                const wasTail = curr === m.tail;
                t.step('check_tail', wasTail ? 'curr was the tail.' : 'curr was not the tail.', { value, prev, curr }, { hl: hl(curr, 'removed') });
                if (wasTail) {
                  m.tail = prev;
                  t.step('move_tail', `tail moves back to ${label(prev)}.`, { value, prev, curr }, { hl: hl(curr, 'removed') });
                }
              }
              m.size--;
              t.step('release', 'Release the unlinked node (C++ deletes it) and decrement size.', { value });
              return t.step('done', `Deleted ${value}.`, { value }, { ok: true });
            }
            prev = curr;
            t.step('advance', `prev moves to ${label(prev)}.`, { value, prev }, { hl: hl(prev, 'active') });
            const lap = prev === m.tail;
            t.step('check_lap', lap ? 'prev is back at tail: we went all the way around.' : 'Not back at tail yet.', { value, prev }, { hl: hl(prev, 'active') });
            if (lap) return t.step('not_found', `${value} is not in the list.`, { value, prev }, { ok: false });
          }
        },
      },
      {
        id: 'traverse',
        label: 'traverse()',
        args: [],
        run(t, m) {
          const result = [];
          t.step('init', 'Start with an empty result.', { result: [] });
          t.step('check_empty', m.tail ? 'The list is not empty.' : 'The list is empty.', { result: [] });
          if (!m.tail) return t.step('empty', 'Return [].', { result: [] }, { ok: true });
          let curr = m.tail.next;
          t.step('start', 'Start at the head (tail.next).', { result: [], curr }, { hl: hl(curr, 'active') });
          for (;;) {
            result.push(curr.value);
            t.mark(curr.id, 'visited');
            t.step('visit', `Append ${curr.value}.`, { result: result.slice(), curr }, { hl: hl(curr, 'found') });
            curr = curr.next;
            t.step('advance', `Move to ${label(curr)}.`, { result: result.slice(), curr }, { hl: hl(curr, 'active') });
            const lap = curr === m.tail.next;
            t.step('check_lap', lap ? 'Back at the head: stop.' : 'Not back at the head yet.', { result: result.slice(), curr }, { hl: hl(curr, 'active') });
            if (lap) return t.step('done', `Result: [${result.join(', ')}].`, { result: result.slice() }, { ok: true });
          }
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
