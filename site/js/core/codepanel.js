/* Code panel: shows the active operation (or the whole file) in the chosen
 * language and highlights the line(s) tagged with the current frame's step. */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  class CodePanel {
    constructor(el, code) {
      this.el = el;
      this.code = code; // DS_CODE[dsId]
      this.lang = 'python';
      this.op = null;
      this.full = false;
      this.rendered = '';
    }

    setLang(lang) {
      this.lang = lang;
      this.render();
    }

    setOp(op) {
      this.op = op;
      this.render();
    }

    setFull(full) {
      this.full = full;
      this.render();
    }

    src() {
      return this.code[this.lang];
    }

    linesFor(frame) {
      if (!frame || !frame.step) return [];
      const op = this.src().ops[frame.op];
      return (op && op.steps[frame.step]) || [];
    }

    render() {
      const src = this.src();
      const op = src.ops[this.op];
      const from = this.full || !op ? 0 : op.start;
      const to = this.full || !op ? src.lines.length : op.end;
      const key = [this.lang, from, to].join(':');
      if (key === this.rendered) return;
      this.rendered = key;
      let html = '';
      for (let i = from; i < to; i++) {
        html += `<div class="ln" data-i="${i}"><span class="no">${i + 1}</span><span class="src">${
          DSV.highlight(src.lines[i], this.lang) || ' '
        }</span></div>`;
      }
      this.el.innerHTML = html;
      this.el.scrollTop = 0;
      if (this.frame) this.showFrame(this.frame, this.prevFrame);
    }

    showFrame(frame, prevFrame) {
      this.frame = frame;
      this.prevFrame = prevFrame;
      if (frame && frame.op && frame.op !== this.op) {
        this.op = frame.op;
        this.render();
      }
      const cur = new Set(this.linesFor(frame));
      const prev = new Set(this.linesFor(prevFrame));
      let first = null;
      for (const div of this.el.children) {
        const i = +div.dataset.i;
        div.classList.toggle('cur', cur.has(i));
        div.classList.toggle('prev', !cur.has(i) && prev.has(i));
        if (cur.has(i) && !first) first = div;
      }
      if (first) this.scrollTo(first);
    }

    scrollTo(div) {
      const box = this.el;
      const top = div.offsetTop; // the code box is position: relative
      if (top < box.scrollTop + 20 || top > box.scrollTop + box.clientHeight - 40) {
        box.scrollTo({ top: Math.max(0, top - box.clientHeight / 3), behavior: 'smooth' });
      }
    }
  }
  DSV.CodePanel = CodePanel;
})(typeof window !== 'undefined' ? window : globalThis);
