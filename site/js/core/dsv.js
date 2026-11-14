/* DSV core: structure registry, node helper, value formatting and the tracer
 * that records one frame per executed code step. Loaded as a classic script so
 * pages work straight from file://. */
(function (root) {
  'use strict';
  const DSV = (root.DSV = root.DSV || {});
  DSV.registry = {};
  DSV.layouts = {};

  DSV.register = function (ds) {
    DSV.registry[ds.id] = ds;
  };

  // Nodes carry a stable id so the renderer can animate them between frames.
  let nextId = 1;
  DSV.node = function (fields) {
    return Object.assign({ id: 'n' + nextId++, __node: true }, fields);
  };
  DSV.isNode = (v) => !!(v && typeof v === 'object' && v.__node);
  DSV.nodeLabel = (n) => {
    if (n.keys) return `[${n.keys.join(', ')}]`; // B-tree node
    if (n.ch !== undefined) return n.ch || 'root'; // trie node
    if (n.key !== undefined && n.value !== undefined) return `${n.key}:${n.value}`;
    return String(n.value !== undefined ? n.value : n.key);
  };

  // Freeze a variable's value at the moment of the step, in a language-neutral form.
  function fmt(v) {
    if (v === null || v === undefined) return { t: 'null' };
    if (DSV.isNode(v)) return { t: 'node', id: v.id, label: DSV.nodeLabel(v) };
    if (Array.isArray(v)) return { t: 'list', items: v.map(fmt) };
    if (typeof v === 'boolean') return { t: 'bool', v };
    if (typeof v === 'string') return { t: 'str', v };
    return { t: 'val', v };
  }
  DSV.fmt = fmt;

  const clone = (o) => JSON.parse(JSON.stringify(o || {}));

  class Tracer {
    constructor(ds, model, op) {
      this.ds = ds;
      this.model = model;
      this.op = op;
      this.frames = [];
      this.marks = {}; // persistent highlights, e.g. visited nodes
      this.hint = {}; // layout hints, e.g. a fixed node order
    }

    // Record one frame: `step` is the step id tagged in every language's source.
    step(step, msg, vars, opts) {
      vars = vars || {};
      opts = opts || {};
      const fv = {};
      for (const k of Object.keys(vars)) fv[k] = fmt(vars[k]);
      this.frames.push({
        op: opts.op || this.op,
        step,
        msg,
        vars: fv,
        state: this.ds.snapshot(this.model, vars),
        hl: Object.assign({}, this.marks, opts.hl),
        hint: clone(this.hint),
        ok: opts.ok,
      });
    }

    mark(id, cls) {
      if (cls) this.marks[id] = cls;
      else delete this.marks[id];
    }
  }
  DSV.Tracer = Tracer;

  DSV.findOp = (ds, opId) => ds.ops.find((o) => o.id === opId);

  DSV.runOp = function (ds, model, opId, args) {
    const t = new Tracer(ds, model, opId);
    DSV.findOp(ds, opId).run(t, model, ...args);
    return t.frames;
  };

  DSV.buildFrame = (ds, model, msg) => ({
    op: null,
    step: null,
    msg,
    vars: {},
    state: ds.snapshot(model, {}),
    hl: {},
    hint: {},
  });

  DSV.parseInts = function (text, { min = -999, max = 999 } = {}) {
    const parts = String(text).split(/[\s,]+/).filter(Boolean);
    const out = [];
    for (const p of parts) {
      if (!/^-?\d+$/.test(p)) throw new Error(`"${p}" is not a whole number`);
      const v = parseInt(p, 10);
      if (v < min || v > max) throw new Error(`${v} is outside ${min}..${max}`);
      out.push(v);
    }
    return out;
  };


  // Lowercase words, e.g. for a trie: "car, cat dog" -> ['car', 'cat', 'dog'].
  DSV.parseWords = function (text) {
    const words = String(text).toLowerCase().split(/[\s,]+/).filter(Boolean);
    for (const w of words) if (!/^[a-z]{1,12}$/.test(w)) throw new Error(`"${w}" must be 1-12 letters a-z`);
    return words;
  };

  // One operation argument: {name, type: 'int' (default) | 'str'}.
  DSV.parseArg = function (spec, raw) {
    if (spec.type === 'str') {
      const w = DSV.parseWords(raw);
      if (w.length !== 1) throw new Error('enter one word');
      return w[0];
    }
    const v = DSV.parseInts(raw, spec);
    if (v.length !== 1) throw new Error('enter one whole number');
    return v[0];
  };

  // Captions may say %null% / %true% / %false%; spelled per language when shown.
  DSV.LANGS = {
    python: { label: 'Python', null: 'None', true: 'True', false: 'False' },
    cpp: { label: 'C++', null: 'nullptr', true: 'true', false: 'false' },
    java: { label: 'Java', null: 'null', true: 'true', false: 'false' },
  };
  DSV.langText = (s, lang) =>
    String(s).replace(/%(null|true|false)%/g, (_, w) => DSV.LANGS[lang][w]);
})(typeof window !== 'undefined' ? window : globalThis);
