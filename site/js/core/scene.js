/* SVG scene renderer. A layout turns a frame into a scene:
 *   { nodes: [{id, x, y, shape, text, sub?, nil?, cls?}],
 *     edges: [{from, to, port?: 'right'|'left', dy?, straight?, kind?: 'tree'|'line', cls?}],
 *     pointers: [{name, target, cls?}] }
 * Nodes are matched by id between scenes and tweened, so a node moving from one
 * place to another animates instead of jumping. */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  const SHAPES = {
    list: { w: 78, h: 38 },
    dlist: { w: 100, h: 38 },
    label: { w: 40, h: 18 },
    box: { w: 48, h: 40 },
    circle: { w: 42, h: 42 },
  };
  const PTR_H = 15; // vertical space per stacked pointer label

  const half = (n) => {
    const s = SHAPES[n.shape] || SHAPES.box;
    return { hw: (n.w || s.w) / 2, hh: (n.h || s.h) / 2 };
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r1 = (v) => Math.round(v * 10) / 10;

  // Point where the segment from p towards the center of node n meets n's outline.
  function clip(n, c, p) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    if (!dx && !dy) return { x: c.x, y: c.y };
    const { hw, hh } = half(n);
    if (n.shape === 'circle') {
      const d = Math.hypot(dx, dy);
      return { x: c.x + (dx / d) * hw, y: c.y + (dy / d) * hw };
    }
    const s = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
    return { x: c.x + dx * s, y: c.y + dy * s };
  }

  function ptrStacks(scene) {
    const by = {};
    for (const p of scene.pointers || []) (by[p.target] = by[p.target] || []).push(p);
    return by;
  }

  function viewFor(scene) {
    if (!scene.nodes.length) return { x: -210, y: -110, w: 420, h: 220 };
    const stacks = ptrStacks(scene);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of scene.nodes) {
      const { hw, hh } = half(n);
      const top = n.y - hh - (stacks[n.id] ? stacks[n.id].length * PTR_H + 12 : 0);
      x0 = Math.min(x0, n.x - hw);
      x1 = Math.max(x1, n.x + hw);
      y0 = Math.min(y0, top);
      y1 = Math.max(y1, n.y + hh + (n.sub !== undefined ? 18 : 0));
    }
    const pad = 36;
    let w = x1 - x0 + pad * 2;
    let h = y1 - y0 + pad * 2;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    w = Math.max(w, 420);
    h = Math.max(h, 240);
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }

  const lerp = (a, b, e) => a + (b - a) * e;
  const lerpView = (a, b, e) => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), w: lerp(a.w, b.w, e), h: lerp(a.h, b.h, e) });

  class SceneView {
    constructor(svg) {
      this.svg = svg;
      this.pos = {};
      this.scene = null;
      this.view = null;
      this.raf = 0;
      svg.innerHTML =
        '<defs><marker id="dsv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker>' +
        '<marker id="dsv-arrow-ptr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="ptrhead"/></marker></defs>' +
        '<g class="layer"></g>';
      this.layer = svg.querySelector('.layer');
    }

    show(scene, dur) {
      cancelAnimationFrame(this.raf);
      const live = new Set(scene.nodes.map((n) => n.id));
      const gone = this.scene ? this.scene.nodes.filter((n) => !live.has(n.id) && this.pos[n.id]) : [];
      const from = this.pos;
      const fromView = this.view;
      const toView = viewFor(scene);
      this.scene = scene;
      const start = performance.now();
      const tick = (now) => {
        const k = dur > 0 ? Math.min(1, (now - start) / dur) : 1;
        const e = ease(k);
        const cur = {};
        for (const n of scene.nodes) {
          const f = from[n.id];
          cur[n.id] = f
            ? { x: lerp(f.x, n.x, e), y: lerp(f.y, n.y, e), o: lerp(f.o, 1, e) }
            : { x: n.x, y: n.y, o: e };
        }
        for (const n of gone) {
          const f = from[n.id];
          cur[n.id] = { x: f.x, y: f.y, o: f.o * (1 - e) };
        }
        this.pos = cur;
        this.view = fromView ? lerpView(fromView, toView, e) : toView;
        this.draw(scene, k < 1 ? gone : [], cur);
        if (k < 1) this.raf = requestAnimationFrame(tick);
        else for (const n of gone) delete this.pos[n.id];
      };
      if (dur > 0) this.raf = requestAnimationFrame(tick);
      else tick(start);
    }

    draw(scene, gone, cur) {
      const v = this.view;
      this.svg.setAttribute('viewBox', `${r1(v.x)} ${r1(v.y)} ${r1(v.w)} ${r1(v.h)}`);
      const byId = {};
      for (const n of scene.nodes) byId[n.id] = n;
      let out = '';

      for (const e of scene.edges || []) {
        const a = byId[e.from], b = byId[e.to];
        if (!a || !b) continue;
        const pa = cur[e.from], pb = cur[e.to];
        const o = Math.min(pa.o, pb.o);
        const dy = e.dy || 0;
        let s = { x: pa.x, y: pa.y + dy };
        if (e.port === 'right') s.x = pa.x + half(a).hw - 13;
        if (e.port === 'left') s.x = pa.x - half(a).hw + 13;
        const tree = e.kind === 'tree' || e.kind === 'line';
        const marker = tree ? '' : ' marker-end="url(#dsv-arrow)"';
        const cls = `edge ${tree ? 'tree' : ''} ${e.cls || ''}`;
        const back = !tree && !e.straight && pb.x < pa.x - 1 && Math.abs(pb.y - pa.y) < 5;
        if (e.from === e.to) {
          // Self loop: out of the next field, around underneath, back into the node.
          const { hw, hh } = half(a);
          out += `<path class="${cls}" d="M${r1(s.x)},${r1(s.y)} C${r1(s.x + 45)},${r1(pa.y + 75)} ${r1(pa.x - hw - 30)},${r1(pa.y + 75)} ${r1(pa.x - hw / 2)},${r1(pa.y + hh)}" opacity="${r1(o)}"${marker}/>`;
          continue;
        }
        if (back) {
          // Arc underneath when pointing backwards along a row.
          const c = { x: (s.x + pb.x) / 2, y: pa.y + 70 };
          const t = clip(b, pb, c);
          out += `<path class="${cls}" d="M${r1(s.x)},${r1(s.y)} Q${r1(c.x)},${r1(c.y)} ${r1(t.x)},${r1(t.y)}" opacity="${r1(o)}"${marker}/>`;
        } else {
          const from = tree || !e.port ? clip(a, pa, pb) : s; // portless edges leave from the outline
          const t = clip(b, { x: pb.x, y: pb.y + dy }, from);
          out += `<line class="${cls}" x1="${r1(from.x)}" y1="${r1(from.y)}" x2="${r1(t.x)}" y2="${r1(t.y)}" opacity="${r1(o)}"${marker}/>`;
        }
      }

      for (const n of scene.nodes.concat(gone)) {
        const p = cur[n.id];
        if (!p) continue;
        out += `<g class="node ${n.shape} ${n.cls || ''}" transform="translate(${r1(p.x)},${r1(p.y)})" opacity="${r1(p.o)}">${shape(n)}</g>`;
      }

      const stacks = ptrStacks(scene);
      for (const id in stacks) {
        const p = cur[id];
        if (!p || !byId[id]) continue;
        const { hh } = half(byId[id]);
        const top = p.y - hh;
        stacks[id].forEach((ptr, i) => {
          out += `<text class="ptr ${ptr.cls || ''}" x="${r1(p.x)}" y="${r1(top - 16 - i * PTR_H)}" opacity="${r1(p.o)}">${esc(ptr.name)}</text>`;
        });
        out += `<line class="ptrline" x1="${r1(p.x)}" y1="${r1(top - 12)}" x2="${r1(p.x)}" y2="${r1(top - 2)}" opacity="${r1(p.o)}" marker-end="url(#dsv-arrow-ptr)"/>`;
      }
      this.layer.innerHTML = out;
    }
  }

  function shape(n) {
    const { hw, hh } = half(n);
    const text = esc(n.text);
    if (n.shape === 'circle')
      return `<circle r="${hw}"/><text class="nt">${text}</text>` + (n.sub !== undefined ? `<text class="nsub" x="${hw + 4}" y="${-hh + 2}" style="text-anchor:start">${esc(n.sub)}</text>` : '');
    if (n.shape === 'label') return `<text class="nl" style="text-anchor:${n.align || 'middle'}">${text}</text>`; // style beats the CSS default
    let s = `<rect x="${-hw}" y="${-hh}" width="${hw * 2}" height="${hh * 2}" rx="6"/>`;
    if (n.shape === 'list') {
      const div = hw - 26;
      s += `<line class="ndiv" x1="${div}" y1="${-hh}" x2="${div}" y2="${hh}"/>`;
      s += `<text class="nt" x="${(-hw + div) / 2}">${text}</text>`;
      s += n.nil
        ? `<text class="nnil" x="${hw - 13}">∅</text>`
        : `<circle class="ndot" cx="${hw - 13}" r="3"/>`;
    } else if (n.shape === 'dlist') {
      s += `<line class="ndiv" x1="${-hw + 26}" y1="${-hh}" x2="${-hw + 26}" y2="${hh}"/>`;
      s += `<line class="ndiv" x1="${hw - 26}" y1="${-hh}" x2="${hw - 26}" y2="${hh}"/>`;
      s += n.nilPrev ? `<text class="nnil" x="${-hw + 13}">∅</text>` : `<circle class="ndot" cx="${-hw + 13}" r="3"/>`;
      s += `<text class="nt">${text}</text>`;
      s += n.nil ? `<text class="nnil" x="${hw - 13}">∅</text>` : `<circle class="ndot" cx="${hw - 13}" r="3"/>`;
    } else if (n.align === 'start') {
      s += `<text class="nt" x="${-hw + 10}" style="text-anchor:start">${text}</text>`;
    } else {
      s += `<text class="nt">${text}</text>`;
    }
    if (n.sub !== undefined) s += `<text class="nsub" y="${hh + 13}">${esc(n.sub)}</text>`;
    return s;
  }

  DSV.SceneView = SceneView;
})(typeof window !== 'undefined' ? window : globalThis);
