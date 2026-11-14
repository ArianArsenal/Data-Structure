/* Singly linked list: traced operations mirroring src/{python,cpp,java}. */
(function (root) {
  'use strict';
  const DSV = root.DSV;
  const MAX = 12;

  const label = (n) => (n ? `node ${n.value}` : '%null%');
  const hl = (...pairs) => {
    const o = {};
    for (let i = 0; i < pairs.length; i += 2) if (pairs[i]) o[pairs[i].id] = pairs[i + 1];
    return o;
  };
  const full = (m) => (m.size >= MAX ? `This demo is limited to ${MAX} nodes.` : null);

  function order(m) {
    const ids = [];
    for (let n = m.head; n; n = n.next) ids.push(n.id);
    return ids;
  }

  DSV.register({
    id: 'singly-linked-list',
    title: 'Singly Linked List',
    layout: 'linkedList',
    about:
      'A chain of nodes where each node stores a value and a pointer to the next node. Inserting or removing at the head is O(1), but reaching position i means walking i links from the head.',
    init: { default: '3, 7, 1, 9', max: MAX, random: [5, 1, 99] },
    complexity: {
      rows: [
        ['Insert at head', 'O(1)', 'O(1)'],
        ['Insert at tail', 'O(n)', 'O(n)'],
        ['Insert at index', 'O(n)', 'O(n)'],
        ['Delete by value', 'O(n)', 'O(n)'],
        ['Search', 'O(n)', 'O(n)'],
        ['Reverse', 'O(n)', 'O(n)'],
      ],
      space: 'O(n)',
      notes: 'Keeping a tail pointer makes insert-at-tail O(1); this version walks the list to keep the code minimal.',
    },

    create(values) {
      const m = { head: null, size: 0 };
      let tail = null;
      for (const v of values) {
        const n = DSV.node({ value: v, next: null });
        if (tail) tail.next = n;
        else m.head = n;
        tail = n;
        m.size++;
      }
      return { model: m, msg: values.length ? `Built a list with ${values.length} nodes. Choose an operation and press Run.` : 'Empty list (head is %null%). Choose an operation and press Run.' };
    },

    snapshot(m, vars) {
      const nodes = {};
      const visit = (n) => {
        for (; n && !nodes[n.id]; n = n.next) nodes[n.id] = { id: n.id, value: n.value, next: n.next ? n.next.id : null };
      };
      visit(m.head);
      for (const k in vars) if (DSV.isNode(vars[k])) visit(vars[k]);
      return { head: m.head ? m.head.id : null, nodes };
    },

    scenarios: [
      ['3 7 1', 'insert_head', [5]],
      ['', 'insert_head', [5]],
      ['3 7 1', 'insert_tail', [5]],
      ['', 'insert_tail', [5]],
      ['3 7 1', 'insert_at', [2, 5]],
      ['3 7 1', 'insert_at', [0, 5]],
      ['3 7 1', 'insert_at', [9, 5]],
      ['3 7 1', 'delete_value', [3]],
      ['3 7 1', 'delete_value', [1]],
      ['3 7 1', 'delete_value', [4]],
      ['', 'delete_value', [4]],
      ['3 7 1', 'search', [7]],
      ['3 7 1', 'search', [4]],
      ['3 7 1', 'reverse', []],
    ],

    ops: [
      {
        id: 'insert_head',
        label: 'insert_head(value)',
        args: [{ name: 'value', default: 5 }],
        check: full,
        run(t, m, value) {
          const node = DSV.node({ value, next: null });
          t.hint = { float: { [node.id]: -0.5 } };
          t.step('create', `Create a new node holding ${value}. Its next starts as %null%.`, { value, node }, { hl: hl(node, 'new') });
          node.next = m.head;
          t.step(
            'link',
            m.head ? `Point the new node's next at the current head (${m.head.value}).` : 'The list is empty, so next is the old head: %null%.',
            { value, node },
            { hl: hl(node, 'new') }
          );
          m.head = node;
          t.hint = {};
          t.step('set_head', `head now points to the new node.`, { value, node }, { hl: hl(node, 'new') });
          m.size++;
          t.step('done', `Size is now ${m.size}. Insert at head is O(1): no traversal needed.`, { value, node }, { hl: hl(node, 'found'), ok: true });
        },
      },
      {
        id: 'insert_tail',
        label: 'insert_tail(value)',
        args: [{ name: 'value', default: 5 }],
        check: full,
        run(t, m, value) {
          const node = DSV.node({ value, next: null });
          t.hint = { float: { [node.id]: Math.max(0, m.size - 0.5) } };
          t.step('create', `Create a new node holding ${value}.`, { value, node }, { hl: hl(node, 'new') });
          t.step('check_empty', m.head ? 'Is head %null%? No, the list has nodes.' : 'Is head %null%? Yes, the list is empty.', { value, node }, { hl: hl(node, 'new') });
          if (!m.head) {
            m.head = node;
            t.hint = {};
            t.step('set_head', 'The new node becomes the head.', { value, node }, { hl: hl(node, 'new') });
          } else {
            let curr = m.head;
            t.step('start', 'Start walking from the head.', { value, node, curr }, { hl: hl(node, 'new', curr, 'active') });
            for (;;) {
              t.step(
                'loop',
                curr.next ? `curr.next is ${label(curr.next)}, so keep walking.` : 'curr.next is %null%: curr is the last node.',
                { value, node, curr },
                { hl: hl(node, 'new', curr, 'active') }
              );
              if (!curr.next) break;
              curr = curr.next;
              t.step('advance', `Move curr to ${label(curr)}.`, { value, node, curr }, { hl: hl(node, 'new', curr, 'active') });
            }
            curr.next = node;
            t.hint = {};
            t.step('link', `Link the last node (${curr.value}) to the new node.`, { value, node, curr }, { hl: hl(node, 'new', curr, 'active') });
          }
          m.size++;
          t.step('done', `Size is now ${m.size}.`, { value, node }, { hl: hl(node, 'found'), ok: true });
        },
      },
      {
        id: 'insert_at',
        label: 'insert_at(index, value)',
        args: [
          { name: 'index', default: 2 },
          { name: 'value', default: 5 },
        ],
        check: full,
        run(t, m, index, value) {
          t.step('check_bounds', `Is ${index} within 0..${m.size}?`, { index, value });
          if (index < 0 || index > m.size) {
            t.step('out_of_range', `No: index ${index} is out of range, so an error is raised.`, { index, value }, { ok: false });
            return;
          }
          t.step('check_front', index === 0 ? 'Index is 0, so this is an insert at the head.' : `Index ${index} is not 0.`, { index, value });
          if (index === 0) {
            const node = DSV.node({ value, next: m.head });
            m.head = node;
            m.size++;
            t.step('call_head', `insert_head(${value}) puts the new node at the front.`, { index, value }, { hl: hl(node, 'found'), ok: true });
            return;
          }
          const node = DSV.node({ value, next: null });
          t.hint = { float: { [node.id]: index - 0.5 } };
          t.step('create', `Create a new node holding ${value}.`, { index, value, node }, { hl: hl(node, 'new') });
          let prev = m.head;
          t.step('start', `prev starts at the head; it must reach position ${index - 1}.`, { index, value, node, prev }, { hl: hl(node, 'new', prev, 'active') });
          let i = 0;
          for (;;) {
            t.step(
              'loop',
              i < index - 1 ? `i = ${i} < ${index - 1}: step forward.` : `i = ${i}: prev is at position ${index - 1}.`,
              { index, value, node, prev, i },
              { hl: hl(node, 'new', prev, 'active') }
            );
            if (i >= index - 1) break;
            prev = prev.next;
            i++;
            t.step('advance', `Move prev to ${label(prev)}.`, { index, value, node, prev, i }, { hl: hl(node, 'new', prev, 'active') });
          }
          node.next = prev.next;
          t.step('link_next', `New node's next = prev.next (${label(prev.next)}).`, { index, value, node, prev }, { hl: hl(node, 'new', prev, 'active') });
          prev.next = node;
          t.hint = {};
          t.step('link_prev', `prev (${prev.value}) now points to the new node.`, { index, value, node, prev }, { hl: hl(node, 'new', prev, 'active') });
          m.size++;
          t.step('done', `Inserted ${value} at index ${index}. Size is now ${m.size}.`, { index, value, node }, { hl: hl(node, 'found'), ok: true });
        },
      },
      {
        id: 'delete_value',
        label: 'delete_value(value)',
        args: [{ name: 'value', default: 7 }],
        run(t, m, value) {
          t.step('check_empty', m.head ? 'Is head %null%? No.' : 'Is head %null%? Yes.', { value });
          if (!m.head) {
            t.step('empty', 'The list is empty: nothing to delete, return %false%.', { value }, { ok: false });
            return;
          }
          const hit = m.head.value === value;
          t.step('check_head', `Does the head hold ${value}? ${hit ? 'Yes.' : `No, it holds ${m.head.value}.`}`, { value }, { hl: hl(m.head, 'active') });
          if (hit) {
            const target = m.head;
            t.step('grab_head', 'Keep a reference to the head node as target.', { value, target }, { hl: hl(target, 'removed') });
            m.head = target.next;
            t.step('unlink_head', `Move head to the next node (${label(m.head)}). The old head is now unlinked.`, { value, target }, { hl: hl(target, 'removed') });
            m.size--;
            t.step('release_head', 'Release the unlinked node (C++ deletes it; Python/Java garbage-collect it) and decrement size.', { value });
            t.step('done_head', `Deleted ${value}; return %true%.`, { value }, { ok: true });
            return;
          }
          let prev = m.head;
          t.step('start', 'prev starts at the head. We always look one node ahead, at prev.next.', { value, prev }, { hl: hl(prev, 'active') });
          for (;;) {
            t.step('loop', prev.next ? `prev.next is ${label(prev.next)}.` : 'prev.next is %null%: reached the end.', { value, prev }, { hl: hl(prev, 'active') });
            if (!prev.next) break;
            const eq = prev.next.value === value;
            t.step('compare', `Is prev.next.value (${prev.next.value}) == ${value}? ${eq ? 'Yes.' : 'No.'}`, { value, prev }, { hl: hl(prev, 'active', prev.next, eq ? 'found' : 'active') });
            if (eq) {
              const target = prev.next;
              t.step('grab', `target = node ${target.value}.`, { value, prev, target }, { hl: hl(prev, 'active', target, 'removed') });
              prev.next = target.next;
              t.step('unlink', `Bypass the target: prev.next = target.next (${label(target.next)}).`, { value, prev, target }, { hl: hl(prev, 'active', target, 'removed') });
              m.size--;
              t.step('release', 'Release the unlinked node (C++ deletes it; Python/Java garbage-collect it) and decrement size.', { value, prev }, { hl: hl(prev, 'active') });
              t.step('done', `Deleted ${value}; return %true%.`, { value, prev }, { ok: true });
              return;
            }
            prev = prev.next;
            t.step('advance', `Move prev to ${label(prev)}.`, { value, prev }, { hl: hl(prev, 'active') });
          }
          t.step('not_found', `${value} is not in the list; return %false%.`, { value, prev }, { ok: false });
        },
      },
      {
        id: 'search',
        label: 'search(value)',
        args: [{ name: 'value', default: 1 }],
        run(t, m, value) {
          let curr = m.head;
          let index = 0;
          t.step('start', 'Start at the head with index 0.', { value, curr, index }, { hl: hl(curr, 'active') });
          for (;;) {
            t.step('loop', curr ? `curr is ${label(curr)}, so keep going.` : 'curr is %null%: walked past the last node.', { value, curr, index }, { hl: hl(curr, 'active') });
            if (!curr) break;
            const eq = curr.value === value;
            t.step('compare', `Is ${curr.value} == ${value}? ${eq ? 'Yes!' : 'No.'}`, { value, curr, index }, { hl: hl(curr, eq ? 'found' : 'active') });
            if (eq) {
              t.step('found', `Found ${value} at index ${index}.`, { value, curr, index }, { hl: hl(curr, 'found'), ok: true });
              return;
            }
            t.mark(curr.id, 'visited');
            curr = curr.next;
            index++;
            t.step('advance', `Move to ${label(curr)} (index ${index}).`, { value, curr, index }, { hl: hl(curr, 'active') });
          }
          t.step('not_found', `${value} is not in the list; return -1.`, { value, curr, index }, { ok: false });
        },
      },
      {
        id: 'reverse',
        label: 'reverse()',
        args: [],
        run(t, m) {
          t.hint = { order: order(m) };
          let prev = null;
          let curr = m.head;
          t.step('init', 'prev = %null%, curr = head. Each pass flips one arrow.', { prev, curr }, { hl: hl(curr, 'active') });
          for (;;) {
            t.step('loop', curr ? `curr is ${label(curr)}: flip its arrow.` : 'curr is %null%: every arrow has been flipped.', { prev, curr }, { hl: hl(curr, 'active') });
            if (!curr) break;
            const nxt = curr.next;
            t.step('save_next', `Save curr.next (${label(nxt)}) before overwriting it.`, { prev, curr, nxt }, { hl: hl(curr, 'active') });
            curr.next = prev;
            t.step('flip', `curr.next = prev: node ${curr.value} now points back to ${label(prev)}.`, { prev, curr, nxt }, { hl: hl(curr, 'active') });
            prev = curr;
            t.step('move_prev', `prev moves to node ${prev.value}.`, { prev, curr, nxt }, { hl: hl(curr, 'active') });
            curr = nxt;
            t.step('move_curr', `curr moves to ${label(curr)}.`, { prev, curr, nxt }, { hl: hl(curr, 'active') });
          }
          m.head = prev;
          t.hint = {};
          t.step('set_head', `head = prev (${label(prev)}). The list is reversed.`, { prev, curr }, { ok: true });
        },
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
