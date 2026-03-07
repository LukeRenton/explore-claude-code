/**
 * Terminal - Interactive Claude Code terminal emulator.
 * Supports slash commands with animated responses.
 */

class Terminal {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.isAnimating = false;
    this.collapsed = false;
    this.resizing = false;
    this.panel = null;
    this.output = null;
    this.input = null;
  }

  init() {
    this.panel = document.getElementById('terminal-panel');
    this.output = document.getElementById('terminal-output');
    this.input = document.getElementById('terminal-input');
    if (!this.panel || !this.output || !this.input) return;

    this._setupInput();
    this._setupHeader();
    this._setupResize();
    this._showWelcome();
  }

  _setupInput() {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = this.input.value.trim();
        if (cmd && !this.isAnimating) {
          this._execute(cmd);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._navigateHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._navigateHistory(1);
      }
    });
    // Prevent global keyboard nav when terminal is focused
    this.input.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });
  }

  _setupHeader() {
    const header = this.panel.querySelector('.terminal-header');
    const chevron = this.panel.querySelector('.terminal-header__chevron');

    if (header) {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.terminal-header__btn')) return;
        this._toggleCollapse();
      });
    }
    if (chevron) {
      chevron.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleCollapse();
      });
    }
  }

  _setupResize() {
    const handle = this.panel.querySelector('.terminal-resize');
    if (!handle) return;

    const mainLayout = this.panel.closest('.main-layout');
    if (!mainLayout) return;

    let startX, startWidth;

    const onMouseMove = (e) => {
      if (!this.resizing) return;
      const delta = startX - e.clientX;
      const maxWidth = mainLayout.offsetWidth - 300; // leave room for sidebar + content
      const newWidth = Math.max(200, Math.min(startWidth + delta, maxWidth));
      this.panel.style.width = newWidth + 'px';
    };

    const onMouseUp = () => {
      this.resizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.resizing = true;
      startX = e.clientX;
      startWidth = this.panel.offsetWidth;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  _toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.panel.classList.toggle('collapsed', this.collapsed);
    if (!this.collapsed) {
      this.input.focus();
    }
  }

  _showWelcome() {
    const b = (key) => I18n.t(`terminal.banner.${key}`);
    this._appendHtml(`
      <div class="term-welcome-banner">
        <div class="term-brand">
          <div class="term-brand__rule"></div>
          <pre class="term-brand__ascii"><span class="term-brand__char-bright">█▀▀ ▀▄▀ █▀█ █   █▀█ █▀█ █▀▀</span>
<span class="term-brand__char-bright">█▀▀  █  █▀▀ █   █ █ █▀▄ █▀▀</span>
<span class="term-brand__char-bright">▀▀▀ ▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀ ▀ ▀▀▀</span></pre>
          <pre class="term-brand__ascii term-brand__ascii--sub"><span class="term-brand__char-accent">█▀▀ █   █▀█ █ █ █▀▄ █▀▀</span>
<span class="term-brand__char-accent">█   █   █▀█ █ █ █ █ █▀▀</span>
<span class="term-brand__char-accent">▀▀▀ ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀▀▀</span>
<span class="term-brand__char-dim">█▀▀ █▀█ █▀▄ █▀▀</span>
<span class="term-brand__char-dim">█   █ █ █ █ █▀▀</span>
<span class="term-brand__char-dim">▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀</span></pre>
          <div class="term-brand__rule"></div>
        </div>

        <div class="term-banner-tagline">${b('tagline')}</div>

        <div class="term-banner-divider"></div>

        <div class="term-banner-section">
          <div class="term-banner-section__title">${b('quickStartTitle')}</div>
          <div class="term-banner-cmd-row">
            <span class="term-text--accent">/help</span>
            <span class="term-text--dim">${b('helpDesc')}</span>
          </div>
          <div class="term-banner-cmd-row">
            <span class="term-text--accent">/init</span>
            <span class="term-text--dim">${b('initDesc')}</span>
          </div>
          <div class="term-banner-cmd-row">
            <span class="term-text--accent">/doctor</span>
            <span class="term-text--dim">${b('doctorDesc')}</span>
          </div>
          <div class="term-banner-cmd-row">
            <span class="term-text--accent">/diff</span>
            <span class="term-text--dim">${b('diffDesc')}</span>
          </div>
        </div>

        <div class="term-banner-divider"></div>

        <div class="term-banner-section">
          <div class="term-banner-section__title">${b('howToTitle')}</div>
          <div class="term-banner-step">
            <span class="term-banner-step__num">1</span>
            <span>${b('step1')}</span>
          </div>
          <div class="term-banner-step">
            <span class="term-banner-step__num">2</span>
            <span>${b('step2')}</span>
          </div>
          <div class="term-banner-step">
            <span class="term-banner-step__num">3</span>
            <span>${b('step3')}</span>
          </div>
        </div>

        <div class="term-banner-divider"></div>

        <div class="term-banner-info">
          <div class="term-banner-row">
            <span class="term-banner-key">version</span>
            <span class="term-banner-val">${b('version')}</span>
          </div>
          <div class="term-banner-row">
            <span class="term-banner-key">model</span>
            <span class="term-banner-val term-text--accent">${b('model')}</span>
          </div>
          <div class="term-banner-row">
            <span class="term-banner-key">project</span>
            <span class="term-banner-val">${b('project')}</span>
          </div>
        </div>
      </div>
    `);
  }

  _execute(rawCmd) {
    // Store in history
    this.history.push(rawCmd);
    this.historyIndex = this.history.length;

    // Echo the command
    this._appendHtml(`
      <div class="term-cmd">
        <span class="term-prompt-echo">claude &gt;</span> ${this._esc(rawCmd)}
      </div>
    `);

    this.input.value = '';

    // Parse command
    const cmd = rawCmd.startsWith('/') ? rawCmd.split(/\s+/)[0].toLowerCase() : rawCmd.toLowerCase();

    // Route to handler
    const handlers = {
      '/help': () => this._cmdHelp(),
      '/init': () => this._cmdInit(),
      '/doctor': () => this._cmdDoctor(),
      '/cost': () => this._cmdCost(),
      '/compact': () => this._cmdCompact(),
      '/model': () => this._cmdModel(),
      '/diff': () => this._cmdDiff(),
      '/clear': () => this._clearOutput(),
      '/status': () => this._cmdStatus(),
      '/config': () => this._cmdConfig(),
      '/memory': () => this._cmdMemory(),
    };

    if (handlers[cmd]) {
      handlers[cmd]();
    } else {
      this._appendHtml(`
        <div class="term-block">
          <div class="term-text--error">${I18n.t('terminal.error.unknown')} ${this._esc(rawCmd)}</div>
          <div class="term-text--dim">${I18n.t('terminal.error.tip')}</div>
        </div>
      `);
    }

    this._scrollToBottom();
  }

  _navigateHistory(direction) {
    if (this.history.length === 0) return;
    this.historyIndex = Math.max(0, Math.min(this.historyIndex + direction, this.history.length));
    this.input.value = this.historyIndex < this.history.length ? this.history[this.historyIndex] : '';
  }

  // ── Command Handlers ──────────────────────────────────────

  _cmdHelp() {
    const cmds = I18n.t('terminal.help.cmds');

    let rows = '';
    for (const [cmd, desc] of cmds) {
      rows += `<div class="term-row"><span class="term-col term-col--cmd">${cmd}</span><span class="term-col term-col--desc">${desc}</span></div>`;
    }

    this._appendHtml(`
      <div class="term-block">
        <div class="term-heading">${I18n.t('terminal.help.heading')}</div>
        <div class="term-table">${rows}</div>
        <hr class="term-hr">
        <div class="term-text--dim">${I18n.t('terminal.help.tip')}</div>
      </div>
    `);
  }

  _cmdInit() {
    const t = (key) => I18n.t(`terminal.init.${key}`);
    const lines = I18n.t('terminal.init.lines');
    const lineSteps = lines.map((line, i) => ({
      html: `<div class="term-text--dim">${this._esc(line)}</div>`,
      delay: line.trim() === '' ? 50 : (line.startsWith('  ##') ? 100 : 80),
    }));

    this._animateSequence([
      { html: `<div class="term-text--dim">${t('scanning')}</div>`, delay: 400 },
      { html: `<div class="term-text">${t('found')}</div>`, delay: 600 },
      { html: `<div class="term-text--dim">${t('generating')}</div>`, delay: 500 },
      { html: '<hr class="term-hr">', delay: 200 },
      { html: `<div class="term-heading">${t('created')}</div>`, delay: 300 },
      ...lineSteps,
      { html: '<hr class="term-hr">', delay: 200 },
      { html: `<div class="term-text--success">${t('success')}</div>`, delay: 0 },
    ]);
  }

  _cmdDoctor() {
    const checksData = I18n.t('terminal.doctor.checks');
    const delays = [500, 400, 350, 300, 450, 300, 350];

    this._animateSequence([
      { html: `<div class="term-heading">${I18n.t('terminal.doctor.heading')}</div>`, delay: 400 },
      ...checksData.map(([label, detail], i) => ({
        html: `<div class="term-check">
          <span class="term-check__icon term-check__icon--pass">\u2713</span>
          <span class="term-check__label">${label}</span>
          <span class="term-check__detail">${detail}</span>
        </div>`,
        delay: delays[i] || 300,
      })),
      { html: '<hr class="term-hr">', delay: 200 },
      { html: `<div class="term-text--success">${I18n.t('terminal.doctor.success')}</div>`, delay: 0 },
    ]);
  }

  _cmdCost() {
    const t = (key) => I18n.t(`terminal.cost.${key}`);
    this._appendHtml(`
      <div class="term-block">
        <div class="term-heading">${t('heading')}</div>
        <div class="term-stat"><span class="term-stat__key">${t('inputTokens')}</span><span class="term-stat__val">42,817</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('outputTokens')}</span><span class="term-stat__val">18,243</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('cacheRead')}</span><span class="term-stat__val">156,092</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('cacheWrite')}</span><span class="term-stat__val">28,451</span></div>
        <hr class="term-hr">
        <div class="term-stat"><span class="term-stat__key">${t('totalCost')}</span><span class="term-stat__val term-stat__val--accent">$0.847</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('messages')}</span><span class="term-stat__val">23</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('duration')}</span><span class="term-stat__val">14m 32s</span></div>
      </div>
    `);
  }

  _cmdCompact() {
    const t = (key) => I18n.t(`terminal.compact.${key}`);
    const block = document.createElement('div');
    block.className = 'term-block';
    block.innerHTML = `
      <div class="term-text--dim">${t('compressing')}</div>
      <div class="term-progress">
        <div class="term-progress__bar"><div class="term-progress__fill" id="compact-fill"></div></div>
        <span class="term-progress__label" id="compact-pct">0%</span>
      </div>
    `;
    this.output.appendChild(block);
    this._scrollToBottom();

    const fill = document.getElementById('compact-fill');
    const pct = document.getElementById('compact-pct');
    let progress = 0;
    this.isAnimating = true;

    const step = () => {
      progress += 2 + Math.random() * 6;
      if (progress >= 100) {
        progress = 100;
        fill.style.width = '100%';
        pct.textContent = '100%';

        setTimeout(() => {
          block.innerHTML += `
            <hr class="term-hr">
            <div class="term-stat"><span class="term-stat__key">${t('before')}</span><span class="term-stat__val">187,204 tokens</span></div>
            <div class="term-stat"><span class="term-stat__key">${t('after')}</span><span class="term-stat__val term-stat__val--accent">24,817 tokens</span></div>
            <div class="term-stat"><span class="term-stat__key">${t('reduction')}</span><span class="term-stat__val term-stat__val--accent">86.7%</span></div>
            <div class="term-text--success" style="margin-top:6px">${t('success')}</div>
          `;
          this.isAnimating = false;
          this._scrollToBottom();
        }, 300);
        return;
      }

      fill.style.width = progress + '%';
      pct.textContent = Math.floor(progress) + '%';
      setTimeout(step, 40 + Math.random() * 60);
    };

    setTimeout(step, 300);
  }

  _cmdModel() {
    const modelsData = I18n.t('terminal.model.models');

    let rows = '';
    modelsData.forEach(([name, desc], i) => {
      const active = i === 0;
      rows += `<div class="term-model">
        <span class="term-model__indicator term-model__indicator--${active ? 'active' : 'inactive'}"></span>
        <span class="term-model__name ${active ? 'term-model__name--active' : ''}">${name}</span>
        <span class="term-model__desc">${desc}</span>
      </div>`;
    });

    this._appendHtml(`
      <div class="term-block">
        <div class="term-heading">${I18n.t('terminal.model.heading')}</div>
        ${rows}
        <hr class="term-hr">
        <div class="term-text--dim">${I18n.t('terminal.model.tip')}</div>
      </div>
    `);
  }

  _cmdDiff() {
    const t = (key) => I18n.t(`terminal.diff.${key}`);
    this._animateSequence([
      { html: `<div class="term-text--dim">${t('checking')}</div>`, delay: 400 },
      { html: '<div class="term-diff-hdr">--- a/src/utils/auth.ts</div>', delay: 200 },
      { html: '<div class="term-diff-hdr">+++ b/src/utils/auth.ts</div>', delay: 100 },
      { html: '<div class="term-diff-ctx">@@ -14,7 +14,9 @@ export function validateToken(token: string) {</div>', delay: 150 },
      { html: '<div class="term-diff-ctx">  const decoded = jwt.verify(token, SECRET);</div>', delay: 80 },
      { html: '<div class="term-diff-del">  return decoded;</div>', delay: 80 },
      { html: '<div class="term-diff-add">  if (!decoded.exp || decoded.exp &lt; Date.now() / 1000) {</div>', delay: 80 },
      { html: '<div class="term-diff-add">    throw new TokenExpiredError(\'Token has expired\');</div>', delay: 80 },
      { html: '<div class="term-diff-add">  }</div>', delay: 80 },
      { html: '<div class="term-diff-add">  return decoded;</div>', delay: 80 },
      { html: '<div class="term-diff-ctx">}</div>', delay: 80 },
      { html: '<hr class="term-hr">', delay: 200 },
      { html: `<div class="term-stat"><span class="term-stat__key">${t('filesChanged')}</span><span class="term-stat__val">1</span></div>`, delay: 100 },
      { html: `<div class="term-stat"><span class="term-stat__key">${t('insertions')}</span><span class="term-stat__val term-text--success">+4</span></div>`, delay: 80 },
      { html: `<div class="term-stat"><span class="term-stat__key">${t('deletions')}</span><span class="term-stat__val term-text--error">-1</span></div>`, delay: 0 },
    ]);
  }

  _cmdStatus() {
    const t = (key) => I18n.t(`terminal.status.${key}`);
    this._appendHtml(`
      <div class="term-block">
        <div class="term-heading">${t('heading')}</div>
        <div class="term-stat"><span class="term-stat__key">${t('version')}</span><span class="term-stat__val">1.0.42</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('modelLabel')}</span><span class="term-stat__val term-stat__val--accent">claude-opus-4-6</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('account')}</span><span class="term-stat__val">user@example.com</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('plan')}</span><span class="term-stat__val">${t('planValue')}</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('projectLabel')}</span><span class="term-stat__val">my-project</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('workingDir')}</span><span class="term-stat__val">${t('workingDirValue')}</span></div>
        <hr class="term-hr">
        <div class="term-stat"><span class="term-stat__key">${t('mcpServers')}</span><span class="term-stat__val">${t('mcpServersValue')}</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('claudeMd')}</span><span class="term-stat__val term-text--success">${t('claudeMdValue')}</span></div>
        <div class="term-stat"><span class="term-stat__key">${t('permissions')}</span><span class="term-stat__val">${t('permissionsValue')}</span></div>
      </div>
    `);
  }

  _cmdConfig() {
    this._appendHtml(`
      <div class="term-block">
        <div class="term-text--dim">${I18n.t('terminal.config.opening')}</div>
      </div>
    `);
    // Navigate to settings.json in the file explorer
    setTimeout(() => {
      if (window.app && window.app.explorer) {
        window.app.explorer.selectPath('.claude/settings.json');
      }
    }, 300);
  }

  _cmdMemory() {
    const entries = I18n.t('terminal.memory.entries');
    const entrySteps = entries.map((entry, i) => ({
      html: `<div class="term-text">\u2022 ${entry}</div>`,
      delay: i === 0 ? 150 : 120,
    }));

    this._animateSequence([
      { html: `<div class="term-heading">${I18n.t('terminal.memory.heading')}</div>`, delay: 300 },
      { html: `<div class="term-text--dim">${I18n.t('terminal.memory.source')}</div>`, delay: 200 },
      { html: '<hr class="term-hr">', delay: 150 },
      ...entrySteps,
      { html: '<hr class="term-hr">', delay: 150 },
      { html: `<div class="term-text--dim">${I18n.t('terminal.memory.footer')}</div>`, delay: 0 },
    ]);
  }

  // ── Utilities ─────────────────────────────────────────────

  _clearOutput() {
    this.output.innerHTML = '';
    this._showWelcome();
  }

  _appendHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    while (div.firstChild) {
      this.output.appendChild(div.firstChild);
    }
    this._scrollToBottom();
  }

  _scrollToBottom() {
    requestAnimationFrame(() => {
      this.output.scrollTop = this.output.scrollHeight;
    });
  }

  /** Animate a sequence of HTML blocks with delays */
  _animateSequence(steps) {
    this.isAnimating = true;
    let totalDelay = 0;

    const block = document.createElement('div');
    block.className = 'term-block';
    this.output.appendChild(block);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      totalDelay += step.delay;

      setTimeout(() => {
        const div = document.createElement('div');
        div.innerHTML = step.html;
        while (div.firstChild) {
          block.appendChild(div.firstChild);
        }
        this._scrollToBottom();

        if (i === steps.length - 1) {
          this.isAnimating = false;
        }
      }, totalDelay);
    }
  }

  _esc(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
}
