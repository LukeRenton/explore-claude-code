/**
 * Search - Cmd/Ctrl+K command palette. Fuzzy-searches every file and feature
 * in the manifest and jumps straight to it via the explorer.
 */

const SEARCH_ICON_SVG =
  '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

class Search {
  constructor(manifest, onSelect) {
    this.manifest = manifest;
    this.onSelect = onSelect;
    this.index = [];
    this.results = [];
    this.selectedIndex = 0;
    this._open = false;
    this._buildIndex(manifest.tree);
    this._buildDom();
  }

  /** Flatten the tree into a searchable index of file nodes */
  _buildIndex(nodes) {
    for (const node of nodes) {
      if (node.type === 'file') {
        const feature = node.feature ? this.manifest.features[node.feature] : null;
        const title = node.label || (feature ? feature.title : node.name);
        const desc = node.description || (feature ? feature.description : '') || '';
        const badge = node.badge && this.manifest.badges[node.badge]
          ? this.manifest.badges[node.badge].label
          : '';
        this.index.push({
          path: node.path,
          name: node.name,
          title,
          desc,
          badge,
          badgeId: node.badge || '',
          haystack: `${title} ${node.name} ${node.path} ${desc} ${badge}`.toLowerCase(),
        });
      } else if (node.children) {
        this._buildIndex(node.children);
      }
    }
  }

  /** Build the overlay DOM once and append it to the body */
  _buildDom() {
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-panel" role="dialog" aria-modal="true" aria-label="Search">
        <div class="search-input-row">
          <span class="search-icon">${SEARCH_ICON_SVG}</span>
          <input class="search-input" type="text" placeholder="Search files and features..." spellcheck="false" autocomplete="off" aria-label="Search">
          <kbd class="search-kbd search-kbd--esc">esc</kbd>
        </div>
        <div class="search-results" id="search-results"></div>
        <div class="search-footer">
          <span class="search-hint"><kbd class="search-kbd">&uarr;</kbd><kbd class="search-kbd">&darr;</kbd> navigate</span>
          <span class="search-hint"><kbd class="search-kbd">&crarr;</kbd> open</span>
          <span class="search-hint"><kbd class="search-kbd">esc</kbd> close</span>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.input = overlay.querySelector('.search-input');
    this.resultsEl = overlay.querySelector('#search-results');

    // Click outside the panel closes
    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay) this.close();
    });

    this.input.addEventListener('input', () => {
      this.selectedIndex = 0;
      this._runQuery(this.input.value);
    });

    // Keep all navigation keys inside the palette (stop the global handlers)
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); e.stopPropagation();
        this._move(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation();
        this._move(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault(); e.stopPropagation();
        this._choose(this.selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        this.close();
      } else {
        e.stopPropagation();
      }
    });
  }

  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.overlay.classList.add('visible');
    this.input.value = '';
    this.selectedIndex = 0;
    this._runQuery('');
    requestAnimationFrame(() => this.input.focus());
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.overlay.classList.remove('visible');
    this.input.blur();
  }

  toggle() {
    this._open ? this.close() : this.open();
  }

  _runQuery(q) {
    q = (q || '').trim().toLowerCase();
    let matches;
    if (!q) {
      matches = this.index.map((item, i) => ({ item, order: i, score: 0 }));
    } else {
      matches = [];
      for (let i = 0; i < this.index.length; i++) {
        const score = this._score(this.index[i], q);
        if (score > 0) matches.push({ item: this.index[i], order: i, score });
      }
      matches.sort((a, b) => b.score - a.score || a.order - b.order);
    }
    this.results = matches.slice(0, 40).map(m => m.item);
    this._render(q);
  }

  _score(item, q) {
    const title = item.title.toLowerCase();
    const name = item.name.toLowerCase();
    if (title === q) return 120;
    if (title.startsWith(q)) return 100;
    if (name.startsWith(q)) return 85;
    if (title.includes(q)) return 70;
    if (name.includes(q)) return 60;
    if (item.path.toLowerCase().includes(q)) return 45;
    if (item.desc.toLowerCase().includes(q)) return 30;
    if (item.badge.toLowerCase().includes(q)) return 25;
    if (this._subseq(item.haystack, q)) return 10;
    return 0;
  }

  /** True if every char of needle appears in order within hay */
  _subseq(hay, needle) {
    let j = 0;
    for (let i = 0; i < hay.length && j < needle.length; i++) {
      if (hay[i] === needle[j]) j++;
    }
    return j === needle.length;
  }

  _render(q) {
    if (this.results.length === 0) {
      this.resultsEl.innerHTML = `<div class="search-empty">No matches for "<strong>${this._esc(q)}</strong>"</div>`;
      return;
    }

    let html = '';
    this.results.forEach((item, i) => {
      const sel = i === this.selectedIndex ? ' selected' : '';
      const badge = item.badgeId
        ? `<span class="search-result__badge tree-badge--${item.badgeId}">${this._esc(item.badge)}</span>`
        : '';
      html += `
        <div class="search-result${sel}" data-index="${i}">
          <span class="search-result__icon">${Icons.forFile(item.path, 14)}</span>
          <span class="search-result__text">
            <span class="search-result__title">${this._highlight(item.title, q)}</span>
            <span class="search-result__path">${this._esc(item.path)}</span>
          </span>
          ${badge}
        </div>`;
    });
    this.resultsEl.innerHTML = html;

    this.resultsEl.querySelectorAll('.search-result').forEach(el => {
      const idx = parseInt(el.dataset.index, 10);
      el.addEventListener('mousemove', () => {
        if (this.selectedIndex !== idx) {
          this.selectedIndex = idx;
          this._syncSelection();
        }
      });
      el.addEventListener('click', () => this._choose(idx));
    });

    this._scrollToSelected();
  }

  _syncSelection() {
    this.resultsEl.querySelectorAll('.search-result').forEach((el, i) => {
      el.classList.toggle('selected', i === this.selectedIndex);
    });
  }

  _move(dir) {
    if (this.results.length === 0) return;
    this.selectedIndex = (this.selectedIndex + dir + this.results.length) % this.results.length;
    this._syncSelection();
    this._scrollToSelected();
  }

  _scrollToSelected() {
    const el = this.resultsEl.querySelector('.search-result.selected');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  _choose(i) {
    const item = this.results[i];
    if (!item) return;
    this.close();
    if (this.onSelect) this.onSelect(item.path);
  }

  /** Wrap the first case-insensitive occurrence of q in a <mark> */
  _highlight(text, q) {
    if (!q) return this._esc(text);
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return this._esc(text);
    const before = this._esc(text.slice(0, idx));
    const match = this._esc(text.slice(idx, idx + q.length));
    const after = this._esc(text.slice(idx + q.length));
    return `${before}<mark class="search-mark">${match}</mark>${after}`;
  }

  _esc(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str == null ? '' : String(str)));
    return div.innerHTML;
  }
}
