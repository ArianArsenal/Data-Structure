/* Reusable layouts: frame -> scene (see scene.js). */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  // Pointers for every local variable that currently refers to a node.
  function varPointers(frame, fixed) {
    const ptrs = fixed.slice();
    for (const name of Object.keys(frame.vars)) {
      const v = frame.vars[name];
      if (v.t === 'node') ptrs.push({ name, target: v.id });
    }
    return ptrs;
  }
  DSV.varPointers = varPointers;

  /* Linked lists. state: { head, tail?, nodes: {id: {id, value, next, prev?}} }
   * hint.order: fixed left-to-right order of node ids (used while relinking);
   * hint.float: {id: slot} for detached nodes, drawn one row below.
   * o.shape 'dlist' draws prev links too; o.ptrs adds fixed pointers (tail). */
  const ROW = 95;
  DSV.listLayout = function (frame, o) {
    o = o || {};
    const SP = o.shape === 'dlist' ? 140 : 110;
    const st = frame.state;
    const hint = frame.hint || {};
    const main = [];
    const seen = new Set();
    for (let id = st.head; id && !seen.has(id); id = st.nodes[id].next) {
      seen.add(id);
      main.push(id);
    }
    const pos = {};
    (hint.order || main).forEach((id, i) => {
      if (st.nodes[id]) pos[id] = { x: i * SP, y: 0 };
    });
    const rest = Object.keys(st.nodes).filter((id) => !pos[id]);
    for (let pass = 0; pass < rest.length; pass++) {
      for (const id of rest) {
        if (pos[id]) continue;
        const n = st.nodes[id];
        const f = hint.float && hint.float[id];
        if (f !== undefined) pos[id] = { x: f * SP, y: ROW };
        else if (n.next && pos[n.next] && n.next !== id) pos[id] = { x: pos[n.next].x - SP / 2, y: ROW };
        else if (!n.next || n.next === id) pos[id] = { x: main.length * SP, y: ROW };
      }
    }
    rest.forEach((id, i) => {
      if (!pos[id]) pos[id] = { x: i * SP, y: ROW * 2 };
    });

    const ids = Object.keys(st.nodes);
    const dl = o.shape === 'dlist';
    const edges = [];
    for (const id of ids) {
      const n = st.nodes[id];
      if (n.next) edges.push({ from: id, to: n.next, port: 'right', dy: dl ? -7 : 0, straight: dl });
      if (dl && n.prev) edges.push({ from: id, to: n.prev, port: 'left', dy: 7, straight: true, cls: 'dim' });
    }
    const fixed = [];
    if (st.head && !o.noHead) fixed.push({ name: 'head', target: st.head, cls: 'root' });
    if (st.tail) fixed.push({ name: 'tail', target: st.tail, cls: 'root' });
    return {
      nodes: ids.map((id) => {
        const n = st.nodes[id];
        return {
          id,
          x: pos[id].x,
          y: pos[id].y,
          shape: o.shape || 'list',
          text: n.value,
          nil: !n.next,
          nilPrev: !n.prev,
          cls: frame.hl[id],
        };
      }),
      edges,
      pointers: varPointers(frame, fixed),
    };
  };
  DSV.layouts.linkedList = (frame) => DSV.listLayout(frame);

  /* Binary heap. state: { items: [{id, value}] } drawn as a tree with the
   * backing array underneath; both copies move when elements swap.
   * Index variables (i, parent, ...) point at tree nodes. */
  DSV.layouts.heap = function (frame) {
    const items = frame.state.items;
    const n = items.length;
    const depth = n ? Math.floor(Math.log2(n)) : 0;
    const W = Math.max(4, 2 ** depth) * 56;
    const nodes = [];
    const edges = [];
    items.forEach((it, i) => {
      const d = Math.floor(Math.log2(i + 1));
      const k = i + 1 - 2 ** d;
      nodes.push({ id: it.id, x: ((k + 0.5) / 2 ** d) * W, y: d * 74, shape: 'circle', text: it.value, cls: frame.hl[it.id] });
      if (i > 0) edges.push({ from: items[(i - 1) >> 1].id, to: it.id, kind: 'tree' });
    });
    const ay = (depth + 1) * 74 + 40;
    const cw = 48;
    const x0 = W / 2 - (n * cw) / 2 + cw / 2;
    items.forEach((it, i) => {
      nodes.push({ id: it.id + ':a', x: x0 + i * cw, y: ay, shape: 'box', text: it.value, cls: frame.hl[it.id] });
      nodes.push(DSV.label('ix' + i, x0 + i * cw, ay + 30, i));
    });
    if (n) nodes.push(DSV.label('arr', x0 - cw, ay, 'data', 'strong', 'end'));
    const ptrs = [];
    for (const name of frame.ptrVars || ['i', 'parent', 'smallest', 'largest']) {
      const v = frame.vars[name];
      if (v && v.t === 'val' && v.v >= 0 && v.v < n) ptrs.push({ name, target: items[v.v].id });
    }
    return { nodes, edges, pointers: ptrs };
  };

  /* Binary tree. state: { root, nodes: {id: {id, key, left, right}} }
   * x = in-order rank, y = depth. Nodes outside the tree float to the left. */
  const TX = 58;
  const TY = 82;
  DSV.layouts.binaryTree = function (frame) {
    const st = frame.state;
    const pos = {};
    let rank = 0;
    const walk = (id, d) => {
      if (!id || pos[id]) return;
      const n = st.nodes[id];
      walk(n.left, d + 1);
      pos[id] = { x: rank++ * TX, y: d * TY };
      walk(n.right, d + 1);
    };
    walk(st.root, 0);
    let fx = -TX * 1.5;
    for (const id of Object.keys(st.nodes)) {
      if (!pos[id]) {
        pos[id] = { x: fx, y: 0 };
        fx -= TX;
      }
    }
    const ids = Object.keys(st.nodes);
    const edges = [];
    for (const id of ids) {
      const n = st.nodes[id];
      for (const c of [n.left, n.right]) if (c && st.nodes[c]) edges.push({ from: id, to: c, kind: 'tree' });
    }
    return {
      nodes: ids.map((id) => {
        const n = st.nodes[id]; // optional extras: n.cls (e.g. 'rb red'), n.sub (e.g. height)
        return { id, x: pos[id].x, y: pos[id].y, shape: 'circle', text: n.key, sub: n.sub, cls: [n.cls || '', frame.hl[id] || ''].join(' ') };
      }),
      edges,
      pointers: varPointers(frame, st.root ? [{ name: 'root', target: st.root, cls: 'root' }] : []),
    };
  };


  /* Circular buffer drawn as a ring. state: { data, front, size }.
   * Index locals named in `names` are labelled outside the ring. */
  DSV.ringLayout = function (frame, names) {
    const st = frame.state;
    const n = st.data.length;
    const R = 120;
    const at = (i, r) => {
      const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r };
    };
    const live = (i) => (i - st.front + n) % n < st.size;
    const nodes = st.data.map((v, i) => {
      const p = at(i, R);
      return {
        id: 'c' + i, x: p.x, y: p.y, shape: 'box', text: v === null ? '' : v, sub: i,
        cls: [v === null ? 'ghost' : '', live(i) ? '' : 'ghost', frame.hl['c' + i] || ''].join(' '),
      };
    });
    const stacked = {};
    for (const name of names) {
      const v = frame.vars[name] || (st[name] !== undefined ? { t: 'val', v: st[name] } : null);
      if (!v || v.t !== 'val' || v.v < 0 || v.v >= n) continue;
      const k = (stacked[v.v] = (stacked[v.v] || 0) + 1) - 1;
      const p = at(v.v, R + 52 + k * 17);
      nodes.push(DSV.label('p-' + name, p.x, p.y, name, 'strong'));
    }
    nodes.push(DSV.label('size', 0, 0, `size = ${st.size}`, 'strong'));
    return { nodes, edges: [], pointers: [] };
  };

  /* ---- Helpers shared by structure-specific layouts ---- */

  // A row of array cells with ids `${prefix}${i}` and the index underneath.
  DSV.cells = function (values, o) {
    o = o || {};
    const w = o.w || 48;
    const prefix = o.prefix || 'c';
    return values.map((v, i) => ({
      id: prefix + i,
      x: (o.x0 || 0) + i * (w + (o.gap || 0)),
      y: o.y || 0,
      shape: 'box',
      w,
      h: o.h || 40,
      text: v === null || v === undefined ? '' : v,
      sub: o.sub === false ? undefined : (o.subText ? o.subText(i) : i),
      cls: [o.cls ? o.cls(i, v) : '', v === null || v === undefined ? 'ghost' : '', (o.hl || {})[prefix + i] || '']
        .join(' ')
        .trim(),
    }));
  };

  // Pointers for integer locals that index into a row of cells (e.g. i, top, front).
  DSV.indexPointers = function (frame, names, prefix, size) {
    const out = [];
    for (const n of names) {
      const v = frame.vars[n];
      if (v && v.t === 'val' && v.v >= 0 && v.v < size) out.push({ name: n, target: prefix + v.v });
    }
    return out;
  };

  // Free text placed in the scene (row titles, notes).
  DSV.label = (id, x, y, text, cls, align) => ({
    id, x, y, shape: 'label', text, cls: 'label ' + (cls || ''), align,
    w: (String(text).length * 7.5 + 8) * (align ? 2 : 1), // rough width, for fitting the view
  });

  // Tidy layout for any rooted tree: leaves left to right, parents centered.
  // kids(id) -> child ids; width(id) -> horizontal slots the node needs.
  DSV.tidy = function (roots, kids, o) {
    o = o || {};
    const dx = o.dx || 56;
    const dy = o.dy || 80;
    const width = o.width || (() => 1);
    const pos = {};
    let cursor = o.x0 || 0;
    const place = (id, d) => {
      const ch = kids(id).filter(Boolean);
      if (!ch.length) {
        pos[id] = { x: cursor + (width(id) * dx) / 2, y: (o.y0 || 0) + d * dy };
        cursor += width(id) * dx;
      } else {
        ch.forEach((c) => place(c, d + 1));
        pos[id] = { x: (pos[ch[0]].x + pos[ch[ch.length - 1]].x) / 2, y: (o.y0 || 0) + d * dy };
      }
    };
    roots.forEach((r) => {
      place(r, 0);
      cursor += o.gap || 0;
    });
    return pos;
  };
})(typeof window !== 'undefined' ? window : globalThis);
