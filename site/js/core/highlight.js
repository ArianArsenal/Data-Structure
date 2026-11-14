/* Minimal line-based syntax highlighter for Python, C++ and Java. */
(function (root) {
  'use strict';
  const DSV = root.DSV;

  const KEYWORDS = {
    python:
      'def class return if elif else while for in not and or is None True False self pass break continue raise import from as with try except finally lambda yield del global nonlocal assert',
    cpp:
      'int bool void char double float long auto const constexpr static struct class public private protected return if else while for do break continue new delete nullptr true false this using namespace template typename include pragma once explicit default operator throw try catch virtual override size_t std',
    java:
      'int boolean void char double float long final static class public private protected return if else while for do break continue new null true false this import package extends implements interface throw throws try catch var',
  };
  const kwSets = {};
  for (const k in KEYWORDS) kwSets[k] = new Set(KEYWORDS[k].split(' '));

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const TOKEN = {
    python: /(#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g,
    cpp: /(\/\/.*$|\/\*.*?\*\/|^\s*#\s*\w+)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g,
    java: /(\/\/.*$|\/\*.*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g,
  };

  DSV.highlight = function (line, lang) {
    const re = TOKEN[lang];
    const kws = kwSets[lang];
    let out = '';
    let last = 0;
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      const [tok, comment, str, num, word] = m;
      let cls = null;
      if (comment) cls = comment.trim().startsWith('#') && lang === 'cpp' ? 'kw' : 'cm';
      else if (str) cls = 'st';
      else if (num) cls = 'nu';
      else if (word) {
        if (kws.has(word)) cls = 'kw';
        else if (/^[A-Z]/.test(word)) cls = 'ty';
        else if (line[re.lastIndex] === '(') cls = 'fn';
      }
      out += cls ? `<span class="tk-${cls}">${esc(tok)}</span>` : esc(tok);
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  };
})(typeof window !== 'undefined' ? window : globalThis);
