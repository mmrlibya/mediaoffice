// Measure Arabic text with the paragraph font after the fonts have loaded.
(() => {
  const selector = '.hero .lead,.vbody h3,.card h3,.slide h3,.m-body h3,.plat p,.sec-head p,.slide .txt p,.card p,.srv p,.c-cta p,.m-body p,.policy-card p,.notice p,.delivery p,.warn p';
  const context = document.createElement('canvas').getContext('2d');
  const originals = new WeakMap();
  const breaks = /([بتثجحخسشصضطظعغفقكلمنهيئ])(\p{M}*)(?=[آأإابتثجحخدذرزسشصضطظعغفقكلمنهوىيئةؤ])/gu;

  function stretch(text, count) {
    const points = Array.from(text.matchAll(breaks)).filter(match =>
      !(match[1] === 'ل' && /[اإأآ]/.test(text[match.index + match[0].length]))
    );
    let result = text;
    for (let i = points.length - 1; i >= 0; i--) {
      const end = points[i].index + points[i][0].length;
      const copies = Math.floor((i + 1) * count / points.length) - Math.floor(i * count / points.length);
      result = result.slice(0, end) + 'ـ'.repeat(copies) + result.slice(end);
    }
    return result;
  }

  // Choose line breaks together so that the last line also has enough words.
  function balancedLines(words, width, freeLast) {
    const space = context.measureText(' ').width;
    const widths = words.map(word => context.measureText(word).width);
    const cost = Array(words.length + 1).fill(Infinity);
    const next = [];
    cost[words.length] = 0;
    for (let i = words.length - 1; i >= 0; i--) {
      let used = 0;
      for (let j = i; j < words.length; j++) {
        used += widths[j] + (j === i ? 0 : space);
        if (used > width && j > i) break;
        const score = (freeLast && j === words.length - 1 ? 0 : (width - used) ** 2) + cost[j + 1];
        if (score < cost[i]) {
          cost[i] = score;
          next[i] = j + 1;
        }
      }
    }
    const lines = [];
    for (let i = 0; i < words.length; i = next[i]) lines.push(words.slice(i, next[i]).join(' '));
    return lines;
  }

  function fit(el) {
    if (!el.getClientRects().length) return;
    const style = getComputedStyle(el);
    const width = parseFloat(style.width) - (style.boxSizing === 'border-box'
      ? ['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'].reduce((sum, key) => sum + parseFloat(style[key]), 0) : 0);
    if (!(width > 0)) return;
    if (!originals.has(el)) originals.set(el, el.textContent.trim().replace(/ـ/g, '').replace(/\s+/g, ' '));
    const text = originals.get(el);
    if (!text) return;
    context.font = [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily].join(' ');
    context.direction = 'rtl';
    const natural = el.matches('.m-body p');
    const lines = balancedLines(text.split(' '), width, natural);
    el.replaceChildren();
    if (lines.length === 1) {
      el.textContent = text;
      return;
    }
    const step = Math.max(1, context.measureText('بـب').width - context.measureText('بب').width);
    for (const [index, line] of lines.entries()) {
      const row = document.createElement('span');
      const run = document.createElement('span');
      row.className = 'fitted-line';
      run.className = 'fitted-run';
      if (natural && index === lines.length - 1) {
        // The last line of a news paragraph keeps its natural spacing and starts at the line start.
        run.textContent = line;
        row.append(run);
        el.append(row, ' ');
        continue;
      }
      const remaining = width - context.measureText(line).width;
      run.textContent = stretch(line, Math.max(0, Math.round(remaining / step)));
      row.append(run);
      el.append(row, ' ');
      // Use the shaped DOM width to correct the fraction left by whole kashidas.
      const measured = parseFloat(getComputedStyle(run).width);
      if (measured > 0) run.style.transform = 'scaleX(' + (width / measured) + ')';
    }
  }
  function all(root = document) { root.querySelectorAll(selector).forEach(fit); }
  window.kashida = all;
  document.fonts.ready.then(() => all());
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(all, 100);
  });
})();

// Reveal the footer stripe on its first appearance per page load.
(() => {
  const footer = document.getElementById('footer');
  if (!footer || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    footer.classList.add('flag-in-view');
    observer.disconnect();
  });
  observer.observe(footer);
})();
