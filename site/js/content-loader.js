/**
 * Content Loader - Renders feature explanations and file previews.
 */

class ContentLoader {
  constructor(manifest) {
    this.manifest = manifest;
  }

  /** Show welcome/intro content */
  showWelcome() {
    const content = document.getElementById('content');
    if (!content) return;

    const features = this.manifest.features;
    const featureIds = Object.keys(features).sort((a, b) => features[a].order - features[b].order);

    let cardsHtml = '';
    for (const id of featureIds) {
      const f = features[id];
      const depTag = f.deprecated ? `<span class="feature-card__deprecated">${I18n.t('ui.deprecated')}</span>` : '';
      cardsHtml += `
        <div class="feature-card${f.deprecated ? ' feature-card--deprecated' : ''}" data-feature="${id}">
          <div class="feature-card__icon">${Icons.forFeature(id, 22)}</div>
          <div class="feature-card__title">${f.title}${depTag}</div>
          <div class="feature-card__desc">${f.description}</div>
        </div>`;
    }

    content.innerHTML = `
      <div class="welcome">
        <div class="welcome__label">${I18n.t('welcome.label')}</div>
        <h1 class="welcome__title">${I18n.t('welcome.title')}</h1>
        <p class="welcome__subtitle">${I18n.t('welcome.subtitle')}</p>
        <p class="welcome__subtitle welcome__subtitle--secondary">${I18n.t('welcome.subtitleSecondary')}</p>
        <div class="feature-cards">${cardsHtml}</div>
      </div>`;

    // Attach click handlers to feature cards
    content.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('click', () => {
        const featureId = card.getAttribute('data-feature');
        this._navigateToFeature(featureId);
      });
    });
  }

  /** Navigate to the first file of a feature */
  _navigateToFeature(featureId) {
    const node = this._findFirstFileForFeature(this.manifest.tree, featureId);
    if (node && window.app && window.app.explorer) {
      window.app.explorer.selectPath(node.path);
    }
  }

  /** Find first file node matching a feature ID */
  _findFirstFileForFeature(nodes, featureId) {
    for (const node of nodes) {
      if (node.type === 'file' && node.feature === featureId) return node;
      if (node.children) {
        const found = this._findFirstFileForFeature(node.children, featureId);
        if (found) return found;
      }
    }
    return null;
  }

  /** Show content for a file node */
  async showFile(node) {
    const content = document.getElementById('content');
    if (!content) return;

    // 언어별 콘텐츠 로드
    const lang = I18n.getLang();
    const cacheKey = `_content_${lang}`;
    if (node.contentFile && !node[cacheKey]) {
      const paths = lang !== 'en'
        ? [`content/${lang}/${node.contentFile}`, `content/${node.contentFile}`]
        : [`content/${node.contentFile}`];
      for (const path of paths) {
        try {
          const resp = await fetch(path);
          if (resp.ok) {
            node[cacheKey] = await resp.text();
            break;
          }
        } catch (e) {
          // 다음 경로 시도
        }
      }
    }
    node.content = node[cacheKey] || null;

    // Update tab bar
    this._updateTab(node);

    let html = '<div class="file-view">';

    // Header section
    html += '<div class="file-view__header">';

    // Badge
    if (node.badge) {
      const badgeData = this.manifest.badges[node.badge];
      if (badgeData) {
        html += `<span class="file-view__badge tree-badge--${node.badge}" style="background: rgba(${this._hexToRgb(badgeData.color)}, 0.15); color: ${badgeData.color};">${badgeData.label}</span>`;
      }
    }

    // Title & description
    const feature = node.feature ? this.manifest.features[node.feature] : null;
    html += `<h1 class="file-view__title">${feature ? feature.title : (node.label || node.name)}</h1>`;
    if (node.description) {
      html += `<p class="file-view__desc">${node.description}</p>`;
    }

    // Deprecation notice
    if (feature && feature.deprecated) {
      html += `<div class="file-view__deprecated">${I18n.t('ui.deprecationNotice')}</div>`;
    }

    // File path
    html += `<div class="file-view__meta">${I18n.t('ui.filePrefix')} <code>${node.path}</code></div>`;

    // Command
    if (node.command) {
      html += `
        <div class="file-view__command">
          <span class="file-view__command-prompt">$</span>
          <span class="file-view__command-text">${this._escapeHtml(node.command)}</span>
          <button class="file-view__command-copy" data-command="${this._escapeAttr(node.command)}">${I18n.t('ui.copy')}</button>
        </div>`;
    }

    html += '</div>';

    // Related files
    if (feature) {
      const relatedNodes = this._findAllFilesForFeature(this.manifest.tree, node.feature);
      const others = relatedNodes.filter(n => n.path !== node.path);
      if (others.length > 0) {
        html += '<div class="file-view__related">';
        html += `<div class="file-view__related-title">${I18n.t('ui.relatedFiles')}</div>`;
        for (const other of others) {
          html += `<a class="file-view__related-link" data-path="${other.path}">${other.path}</a>`;
        }
        html += '</div>';
      }
    }

    // Code preview
    if (node.content) {
      const lang = this._detectLanguage(node.path);
      const isMd = lang === 'markdown';

      let highlighted;
      try {
        if (Prism.languages[lang]) {
          highlighted = Prism.highlight(node.content, Prism.languages[lang], lang);
        } else {
          highlighted = this._escapeHtml(node.content);
        }
      } catch {
        highlighted = this._escapeHtml(node.content);
      }

      if (isMd) {
        const rendered = this._renderMarkdown(node.content);
        html += `
          <div class="code-preview" data-md-toggle>
            <div class="code-preview__header">
              <span>${node.path}</span>
              <div class="code-preview__actions">
                <div class="code-preview__toggle">
                  <button class="code-preview__toggle-btn active" data-view="rendered">${I18n.t('ui.rendered')}</button>
                  <button class="code-preview__toggle-btn" data-view="raw">${I18n.t('ui.raw')}</button>
                </div>
                <button class="code-preview__copy" data-content="${this._escapeAttr(node.content)}">${I18n.t('ui.copy')}</button>
              </div>
            </div>
            <div class="code-preview__rendered">${rendered}</div>
            <div class="code-preview__body" style="display:none">
              <pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>
            </div>
          </div>`;
      } else {
        html += `
          <div class="code-preview">
            <div class="code-preview__header">
              <span>${node.path}</span>
              <button class="code-preview__copy" data-content="${this._escapeAttr(node.content)}">${I18n.t('ui.copy')}</button>
            </div>
            <div class="code-preview__body">
              <pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>
            </div>
          </div>`;
      }
    }

    html += '</div>';
    content.innerHTML = html;

    // Attach event handlers
    this._attachHandlers(content);
  }

  /** Attach click handlers for copy buttons and related links */
  _attachHandlers(container) {
    // Copy buttons
    container.querySelectorAll('[data-command]').forEach(btn => {
      if (btn.classList.contains('file-view__command-copy')) {
        btn.addEventListener('click', () => this._copyText(btn, btn.getAttribute('data-command')));
      }
    });

    container.querySelectorAll('.code-preview__copy').forEach(btn => {
      btn.addEventListener('click', () => this._copyText(btn, btn.getAttribute('data-content')));
    });

    // Related file links
    container.querySelectorAll('.file-view__related-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('data-path');
        if (window.app && window.app.explorer) {
          window.app.explorer.selectPath(path);
        }
      });
    });

    // Markdown rendered/raw toggle
    container.querySelectorAll('[data-md-toggle]').forEach(preview => {
      const btns = preview.querySelectorAll('.code-preview__toggle-btn');
      const rendered = preview.querySelector('.code-preview__rendered');
      const raw = preview.querySelector('.code-preview__body');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          const view = btn.getAttribute('data-view');
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          rendered.style.display = view === 'rendered' ? '' : 'none';
          raw.style.display = view === 'raw' ? '' : 'none';
        });
      });
    });
  }

  /** Copy text to clipboard and show feedback */
  _copyText(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = I18n.t('ui.copied');
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  }

  /** Update the tab bar to show current file */
  _updateTab(node) {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    // Get badge color for this file
    const badgeColor = node.badge && this.manifest.badges[node.badge]
      ? this.manifest.badges[node.badge].color
      : null;

    // Remove active from all tabs, reset their border colors
    tabBar.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.style.borderBottomColor = 'transparent';
    });

    // Check if tab already exists
    let existingTab = tabBar.querySelector(`[data-tab="${CSS.escape(node.path)}"]`);
    if (!existingTab) {
      existingTab = document.createElement('div');
      existingTab.className = 'tab active';
      existingTab.setAttribute('data-tab', node.path);
      if (badgeColor) {
        existingTab.setAttribute('data-badge-color', badgeColor);
      }

      // Dot colored by badge
      const dot = document.createElement('span');
      dot.className = 'tab__dot';
      if (badgeColor) dot.style.background = badgeColor;
      existingTab.appendChild(dot);

      // File icon
      const iconSpan = document.createElement('span');
      iconSpan.className = 'tab__icon';
      iconSpan.innerHTML = Icons.forFile(node.path, 12);
      existingTab.appendChild(iconSpan);

      // Label
      const label = document.createElement('span');
      label.className = 'tab__label';
      label.textContent = node.name;
      existingTab.appendChild(label);

      // Close button
      const closeBtn = document.createElement('span');
      closeBtn.className = 'tab__close';
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._closeTab(existingTab);
      });
      existingTab.appendChild(closeBtn);

      // Click to re-show this file
      existingTab.addEventListener('click', () => {
        tabBar.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          t.style.borderBottomColor = 'transparent';
        });
        existingTab.classList.add('active');
        const color = existingTab.getAttribute('data-badge-color');
        if (color) existingTab.style.borderBottomColor = color;
        if (window.app && window.app.explorer) {
          window.app.explorer.selectPath(node.path);
        }
      });

      tabBar.appendChild(existingTab);

      // Limit to 8 file tabs (plus Welcome)
      const fileTabs = tabBar.querySelectorAll('.tab:not([data-tab="welcome"])');
      if (fileTabs.length > 8) {
        fileTabs[0].remove();
      }
    } else {
      existingTab.classList.add('active');
    }

    // Apply badge color to active tab's bottom border
    if (badgeColor) {
      existingTab.style.borderBottomColor = badgeColor;
    }

    // Scroll active tab into view
    existingTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

    // Make Welcome tab clickable to return
    const welcomeTab = tabBar.querySelector('[data-tab="welcome"]');
    if (welcomeTab && !welcomeTab._hasListener) {
      welcomeTab.addEventListener('click', () => {
        tabBar.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          t.style.borderBottomColor = 'transparent';
        });
        welcomeTab.classList.add('active');
        if (window.app && window.app.contentLoader) {
          window.app.contentLoader.showWelcome();
        }
      });
      welcomeTab._hasListener = true;
    }
  }

  /** Close a tab and show the nearest remaining tab */
  _closeTab(tab) {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    const wasActive = tab.classList.contains('active');
    const allTabs = [...tabBar.querySelectorAll('.tab')];
    const idx = allTabs.indexOf(tab);

    tab.remove();

    // If this was the active tab, activate the nearest one
    if (wasActive) {
      const remaining = [...tabBar.querySelectorAll('.tab')];
      if (remaining.length === 0) return;

      // Prefer the tab to the left, or fall back to the first
      const newActive = remaining[Math.min(idx, remaining.length) - 1] || remaining[0];
      newActive.classList.add('active');

      const color = newActive.getAttribute('data-badge-color');
      if (color) newActive.style.borderBottomColor = color;

      const path = newActive.getAttribute('data-tab');
      if (path === 'welcome') {
        if (window.app && window.app.contentLoader) {
          window.app.contentLoader.showWelcome();
        }
      } else if (window.app && window.app.explorer) {
        window.app.explorer.selectPath(path);
      }
    }
  }

  /** Find all file nodes for a feature */
  _findAllFilesForFeature(nodes, featureId) {
    let results = [];
    for (const node of nodes) {
      if (node.type === 'file' && node.feature === featureId) {
        results.push(node);
      }
      if (node.children) {
        results = results.concat(this._findAllFilesForFeature(node.children, featureId));
      }
    }
    return results;
  }

  /** Render markdown to HTML (lightweight, no library) */
  _renderMarkdown(md) {
    const esc = (s) => this._escapeHtml(s);

    // Normalize line endings (Windows \r\n → \n)
    md = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Handle YAML frontmatter: if content starts with ---, extract and render as table
    let frontmatter = '';
    let body = md;
    if (md.startsWith('---\n')) {
      const endIdx = md.indexOf('\n---', 3);
      if (endIdx !== -1) {
        const fmContent = md.substring(4, endIdx).trim();
        const fmLines = fmContent.split('\n');
        const rows = [];
        for (const fmLine of fmLines) {
          // Match top-level key: value lines, optionally with # comment
          const kvMatch = fmLine.match(/^([a-z][\w-]*)\s*:\s*(.+?)(?:\s+#\s*(.+))?$/);
          if (kvMatch) {
            const val = kvMatch[2].replace(/#\s*.*$/, '').trim();
            const comment = kvMatch[3] || '';
            rows.push({ key: kvMatch[1], val, comment });
          } else if (fmLine.match(/^([a-z][\w-]*)\s*:\s*$/)) {
            // Key with no value (like "metadata:"), check for # comment
            const emptyMatch = fmLine.match(/^([a-z][\w-]*)\s*:\s*(?:#\s*(.+))?$/);
            if (emptyMatch) {
              rows.push({ key: emptyMatch[1], val: '(nested)', comment: emptyMatch[2] || '' });
            }
          }
        }
        frontmatter = '<div class="md-frontmatter"><div class="md-frontmatter__label">frontmatter</div>';
        if (rows.length > 0) {
          const hasComments = rows.some(r => r.comment);
          frontmatter += '<table class="md-table md-frontmatter__table"><thead><tr>';
          frontmatter += `<th>${esc('field')}</th><th>${esc('value')}</th>`;
          if (hasComments) frontmatter += `<th></th>`;
          frontmatter += '</tr></thead><tbody>';
          for (const r of rows) {
            frontmatter += `<tr><td><code class="md-inline-code">${esc(r.key)}</code></td><td>${esc(r.val)}</td>`;
            if (hasComments) frontmatter += `<td class="md-frontmatter__comment">${esc(r.comment)}</td>`;
            frontmatter += '</tr>';
          }
          frontmatter += '</tbody></table>';
        }
        frontmatter += '</div>';
        body = md.substring(endIdx + 4).trim();
      }
    }

    const lines = body.split('\n');
    let html = frontmatter;
    let inList = false;
    let inOl = false;
    let inCode = false;
    let codeBuffer = [];

    const closeLists = () => {
      if (inList) { html += '</ul>'; inList = false; }
      if (inOl) { html += '</ol>'; inOl = false; }
    };

    // Check if a line is a table separator (|---|---|)
    const isTableSep = (l) => /^\|[\s:]*[-]+[\s:]*(\|[\s:]*[-]+[\s:]*)*\|?\s*$/.test(l.trim());
    // Check if a line is a table row (| cell | cell |)
    const isTableRow = (l) => l.trim().startsWith('|') && l.trim().endsWith('|');
    // Parse cells from a table row
    const parseCells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Fenced code blocks
      if (line.startsWith('```')) {
        if (!inCode) {
          closeLists();
          inCode = true;
          codeBuffer = [];
          continue;
        } else {
          const codeText = esc(codeBuffer.join('\n'));
          html += `<pre class="md-code-block"><code>${codeText}</code></pre>`;
          inCode = false;
          continue;
        }
      }
      if (inCode) { codeBuffer.push(line); continue; }

      // Tables: detect header row followed by separator
      if (isTableRow(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        closeLists();
        const headers = parseCells(line);
        i++; // skip separator
        html += '<table class="md-table"><thead><tr>';
        for (const h of headers) {
          html += `<th>${this._inlineMarkdown(h)}</th>`;
        }
        html += '</tr></thead><tbody>';
        // Consume body rows
        while (i + 1 < lines.length && isTableRow(lines[i + 1])) {
          i++;
          const cells = parseCells(lines[i]);
          html += '<tr>';
          for (const c of cells) {
            html += `<td>${this._inlineMarkdown(c)}</td>`;
          }
          html += '</tr>';
        }
        html += '</tbody></table>';
        continue;
      }

      // Close open lists if line doesn't continue them
      if (inList && !line.match(/^\s*[-*]\s/)) {
        html += '</ul>'; inList = false;
      }
      if (inOl && !line.match(/^\s*\d+\.\s/)) {
        html += '</ol>'; inOl = false;
      }

      // Blank line
      if (line.trim() === '') { continue; }

      // Headings
      const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        closeLists();
        const level = hMatch[1].length;
        html += `<h${level} class="md-h">${this._inlineMarkdown(hMatch[2])}</h${level}>`;
        continue;
      }

      // Unordered list
      const ulMatch = line.match(/^\s*[-*]\s+(.+)$/);
      if (ulMatch) {
        if (inOl) { html += '</ol>'; inOl = false; }
        if (!inList) { html += '<ul class="md-list">'; inList = true; }
        html += `<li>${this._inlineMarkdown(ulMatch[1])}</li>`;
        continue;
      }

      // Ordered list
      const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
      if (olMatch) {
        if (inList) { html += '</ul>'; inList = false; }
        if (!inOl) { html += '<ol class="md-list">'; inOl = true; }
        html += `<li>${this._inlineMarkdown(olMatch[2])}</li>`;
        continue;
      }

      // Horizontal rule
      if (line.match(/^[-*_]{3,}\s*$/)) {
        closeLists();
        html += '<hr class="md-hr">';
        continue;
      }

      // Paragraph
      html += `<p class="md-p">${this._inlineMarkdown(line)}</p>`;
    }

    closeLists();
    if (inCode) {
      html += `<pre class="md-code-block"><code>${esc(codeBuffer.join('\n'))}</code></pre>`;
    }
    return html;
  }

  /** Render inline markdown (bold, italic, code, links) */
  _inlineMarkdown(text) {
    let s = this._escapeHtml(text);
    // Inline code
    s = s.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
    // Bold
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Tooltips — [text](^tooltip text)
    s = s.replace(/\[([^\]]+)\]\(\^([^)]+)\)/g, '<span class="md-tooltip" tabindex="0">$1<span class="md-tooltip__tip">$2</span></span>');
    // Links (open in new tab)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="md-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return s;
  }

  /** Detect syntax language from file extension */
  _detectLanguage(path) {
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.md')) return 'markdown';
    if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml';
    if (path.endsWith('.sh')) return 'bash';
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
    if (path.endsWith('.js')) return 'javascript';
    return 'plaintext';
  }

  /** Escape HTML entities */
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /** Escape for HTML attributes */
  _escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** Convert hex color to RGB values */
  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
}
