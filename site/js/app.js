/**
 * App - Main controller. Loads manifest, wires components together.
 */

class App {
  constructor() {
    this.manifest = null;
    this.explorer = null;
    this.contentLoader = null;
    this.progress = null;
    this.terminal = null;
  }

  async init() {
    // i18n 초기화
    await I18n.init();

    // Load manifest
    try {
      const response = await fetch('data/manifest.json');
      this.manifest = await response.json();
    } catch (e) {
      console.error('Failed to load manifest.json:', e);
      document.getElementById('content').innerHTML =
        '<p style="color:#ff5f57;padding:20px;">Failed to load manifest.json. Make sure you\'re serving the site directory.</p>';
      return;
    }

    // manifest에 번역 오버레이
    I18n.applyToManifest(this.manifest);

    // Count features
    const featureCount = Object.keys(this.manifest.features).length;

    // Initialize components
    this.contentLoader = new ContentLoader(this.manifest);
    this.progress = new ProgressTracker(featureCount);

    this.explorer = new FileExplorer(this.manifest, (node) => {
      this._onFileSelected(node);
    });

    // Render
    this.explorer.render();
    this.contentLoader.showWelcome();
    this.progress.init();

    // Terminal
    this.terminal = new Terminal();
    this.terminal.init();

    // Event listeners
    this._setupEventListeners();

    // 언어 토글 버튼
    this._setupLangToggle();

    // Hash navigation
    this._handleHash();

    // void 텍스트 업데이트
    this._updateVoidText();

    // Global reference
    window.app = this;
  }

  async _onFileSelected(node) {
    await this.contentLoader.showFile(node);
    if (node.feature) {
      this.progress.visit(node.feature);
    }
    history.replaceState(null, '', '#' + node.path);
  }

  _setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this._navigate(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this._navigate(1);
      }
      // Escape exits void or fullscreen
      if (e.key === 'Escape') {
        const overlay = document.getElementById('void-overlay');
        if (overlay && overlay.classList.contains('active')) {
          this._exitVoid();
        } else {
          const shell = document.querySelector('.app-shell');
          if (shell && shell.classList.contains('fullscreen')) {
            shell.classList.remove('fullscreen');
          }
        }
      }
    });

    // Hash change
    window.addEventListener('hashchange', () => this._handleHash());

    // 언어 변경 이벤트
    window.addEventListener('langchange', () => this._onLangChange());

    // Traffic light buttons
    this._setupTrafficLights();
  }

  _setupTrafficLights() {
    const shell = document.querySelector('.app-shell');
    const closeBtn = document.querySelector('.traffic-light--close');
    const minimizeBtn = document.querySelector('.traffic-light--minimize');
    const maximizeBtn = document.querySelector('.traffic-light--maximize');
    const escapeBtn = document.getElementById('void-escape');

    // Close — playful wobble + tooltip
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shell.classList.remove('wobble');
        void shell.offsetWidth; // force reflow
        shell.classList.add('wobble');

        const tooltip = document.getElementById('close-tooltip');
        if (tooltip) {
          const rect = closeBtn.getBoundingClientRect();
          tooltip.style.left = (rect.left + rect.width / 2 - 30) + 'px';
          tooltip.style.top = (rect.bottom + 8) + 'px';
          tooltip.classList.add('visible');
          setTimeout(() => tooltip.classList.remove('visible'), 1200);
        }

        shell.addEventListener('animationend', () => {
          shell.classList.remove('wobble');
        }, { once: true });
      });
    }

    // Minimize — enter the void
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._enterVoid();
      });
    }

    // Maximize — toggle fullscreen
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shell.classList.toggle('fullscreen');
      });
    }

    // Escape the void
    if (escapeBtn) {
      escapeBtn.addEventListener('click', () => this._exitVoid());
    }
  }

  _enterVoid() {
    const shell = document.querySelector('.app-shell');
    const overlay = document.getElementById('void-overlay');

    shell.classList.remove('exiting-void');
    shell.classList.add('entering-void');

    // Show void overlay after suck-in completes
    setTimeout(() => {
      overlay.classList.add('active');
      this._startVoidParticles();
    }, 700);
  }

  _exitVoid() {
    const shell = document.querySelector('.app-shell');
    const overlay = document.getElementById('void-overlay');

    overlay.classList.remove('active');
    this._stopVoidParticles();

    // Reset canvas opacity (may have been faded by easter egg)
    const canvas = document.getElementById('void-canvas');
    if (canvas) {
      canvas.style.transition = '';
      canvas.style.opacity = '';
    }

    // Reset void content visibility
    const voidContent = document.querySelector('.void__content');
    if (voidContent) {
      voidContent.style.transition = '';
      voidContent.style.opacity = '';
    }
    const voidGlow = document.querySelector('.void__glow');
    if (voidGlow) voidGlow.style.display = '';

    // Restore original void text
    this._updateVoidText();

    // Reset escape button
    const escapeBtn = document.getElementById('void-escape');
    if (escapeBtn) {
      escapeBtn.style.opacity = '0';
      void escapeBtn.offsetWidth;
      escapeBtn.style.opacity = '';
    }

    shell.classList.remove('entering-void');
    shell.classList.add('exiting-void');

    shell.addEventListener('animationend', () => {
      shell.classList.remove('exiting-void');
    }, { once: true });
  }

  _startVoidParticles() {
    const canvas = document.getElementById('void-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    const maxDim = Math.max(canvas.width, canvas.height);

    // Spawn a particle at the edges, spiraling inward
    const spawnParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = maxDim * 0.6 + Math.random() * maxDim * 0.4;
      const speed = 1.5 + Math.random() * 4;
      const warm = Math.random() < 0.3;
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        angle,
        dist,
        speed,
        angularVel: (Math.random() - 0.5) * 0.04,
        size: warm ? 1.5 + Math.random() * 2 : 0.8 + Math.random() * 1.5,
        warm,
        alpha: 0.4 + Math.random() * 0.6,
        trail: [],
        trailMax: 12 + Math.floor(Math.random() * 20),
        alive: true,
      };
    };

    // Create initial burst of particles spread across all distances
    const particles = [];
    for (let i = 0; i < 300; i++) {
      const p = spawnParticle();
      // Spread initial particles across the field, not just edges
      const startDist = 30 + Math.random() * maxDim * 0.8;
      p.x = cx + Math.cos(p.angle) * startDist;
      p.y = cy + Math.sin(p.angle) * startDist;
      p.dist = startDist;
      particles.push(p);
    }

    let time = 0;
    let absorbed = 0;
    let orbRadius = 6;
    let consumed = false;
    const screenRadius = Math.sqrt(cx * cx + cy * cy);
    this._voidAnimId = null;

    // Hide the text/escape — they'll show AFTER the orb consumes the screen
    const voidContent = document.querySelector('.void__content');
    const voidGlow = document.querySelector('.void__glow');
    if (voidContent) voidContent.style.opacity = '0';
    if (voidGlow) voidGlow.style.display = 'none';

    const draw = () => {
      // Fade trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.016;

      // Orb growth — aggressive passive growth that accelerates exponentially
      const growthAccel = 1 + orbRadius * 0.025;
      orbRadius += 0.8 * growthAccel * 0.016;

      const killRadius = orbRadius + 8;

      // Check if orb has consumed the entire screen
      if (!consumed && orbRadius >= screenRadius) {
        consumed = true;
        this._onVoidConsumed();
      }

      if (consumed) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this._voidAnimId = requestAnimationFrame(draw);
        return;
      }

      // Spawn particles — gets hungrier as it grows
      const spawnCount = Math.min(Math.floor(4 + orbRadius * 0.05), 12);
      if (particles.length < 600) {
        for (let i = 0; i < spawnCount; i++) {
          particles.push(spawnParticle());
        }
      }

      // --- Draw particles (behind the orb) ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        const dx = cx - p.x;
        const dy = cy - p.y;
        p.dist = Math.sqrt(dx * dx + dy * dy);

        // Gravity scales hard with orb size
        const gravStr = 1000 + orbRadius * 30;
        const gravity = gravStr / (p.dist * p.dist + 80);
        const pullX = (dx / (p.dist + 0.1)) * gravity * p.speed;
        const pullY = (dy / (p.dist + 0.1)) * gravity * p.speed;

        const tangentX = -dy / (p.dist + 0.1) * p.angularVel * p.dist * 0.02;
        const tangentY = dx / (p.dist + 0.1) * p.angularVel * p.dist * 0.02;

        p.x += pullX + tangentX;
        p.y += pullY + tangentY;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailMax) p.trail.shift();

        // Absorb at orb surface
        if (p.dist < killRadius) {
          absorbed++;
          orbRadius += 0.6 + orbRadius * 0.003;
          particles.splice(i, 1);
          continue;
        }

        const stretch = Math.min(p.dist < 100 ? (100 / p.dist) * 1.5 : 1, 5);

        // Trail
        if (p.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          const trailAlpha = p.alpha * Math.min(1, p.dist / (orbRadius + 60)) * 0.5;
          ctx.strokeStyle = p.warm
            ? `rgba(196, 140, 100, ${trailAlpha})`
            : `rgba(180, 175, 168, ${trailAlpha})`;
          ctx.lineWidth = p.size * 0.6;
          ctx.stroke();
        }

        // Head
        ctx.beginPath();
        const headSize = p.size * (0.5 + stretch * 0.3);
        ctx.arc(p.x, p.y, headSize, 0, Math.PI * 2);
        const headAlpha = p.alpha * Math.min(1, p.dist / (orbRadius + 30));
        ctx.fillStyle = p.warm
          ? `rgba(220, 160, 110, ${headAlpha})`
          : `rgba(220, 215, 208, ${headAlpha})`;
        ctx.fill();

        // Glow halo
        if (p.size > 1.2 && p.dist < 300) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, headSize * 4, 0, Math.PI * 2);
          ctx.fillStyle = p.warm
            ? `rgba(196, 122, 80, ${headAlpha * 0.12})`
            : `rgba(200, 195, 188, ${headAlpha * 0.06})`;
          ctx.fill();
        }
      }

      // --- Draw the orb on top — black hole with depth ---
      const pulse = Math.sin(time * 2.5) * 0.06;

      // Warm glow bleeding out from the edge
      const edgeGlow = Math.min(30 + orbRadius * 0.15, 80);
      const glowGrad = ctx.createRadialGradient(cx, cy, Math.max(orbRadius - 2, 0), cx, cy, orbRadius + edgeGlow);
      glowGrad.addColorStop(0, `rgba(196, 122, 80, ${0.4 + pulse})`);
      glowGrad.addColorStop(0.3, `rgba(196, 122, 80, ${0.12 + pulse * 0.5})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius + edgeGlow, 0, Math.PI * 2);
      ctx.fill();

      // Dark base fill
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#020101';
      ctx.fill();

      // Clip interior for depth effects
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius - 1, 0, Math.PI * 2);
      ctx.clip();

      // Depth gradient — lighter warm tint at the rim fading to pure black at center
      // Creates the illusion of looking into a curved well
      const depthGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius);
      depthGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      depthGrad.addColorStop(0.6, 'rgba(0, 0, 0, 1)');
      depthGrad.addColorStop(0.85, 'rgba(40, 22, 12, 0.4)');
      depthGrad.addColorStop(1, 'rgba(80, 45, 25, 0.15)');
      ctx.fillStyle = depthGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.fill();

      // Swirling arcs — thin curved strokes rotating at different speeds/depths
      const swirls = 7;
      for (let s = 0; s < swirls; s++) {
        const depth = 0.3 + (s / swirls) * 0.65; // 0.3 to 0.95 of radius
        const r = orbRadius * depth;
        const speed = (1.1 - depth) * 0.6; // inner ones rotate faster
        const startAngle = time * speed + s * 2.1;
        const arcLen = 0.4 + depth * 0.8; // longer arcs near edge
        const alpha = (depth - 0.2) * 0.09 * (0.6 + 0.4 * Math.sin(time * 1.2 + s * 0.9));

        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + arcLen);
        ctx.strokeStyle = `rgba(160, 100, 65, ${alpha})`;
        ctx.lineWidth = 0.5 + depth * 1;
        ctx.stroke();
      }

      // Counter-rotating inner swirls — tighter, faster
      for (let s = 0; s < 4; s++) {
        const depth = 0.1 + (s / 4) * 0.35;
        const r = orbRadius * depth;
        const startAngle = -time * 0.8 + s * 1.6;
        const arcLen = 0.3 + depth * 0.5;
        const alpha = 0.04 + 0.03 * Math.sin(time * 1.5 + s);

        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + arcLen);
        ctx.strokeStyle = `rgba(180, 120, 80, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Dim pinpoint at the very center — the singularity
      const coreAlpha = 0.12 + 0.06 * Math.sin(time * 3);
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(3, orbRadius * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 140, 90, ${coreAlpha})`;
      ctx.fill();

      // Tiny trapped motes orbiting at various depths
      for (let m = 0; m < 12; m++) {
        const mDepth = 0.1 + 0.7 * ((m * 0.618) % 1); // golden ratio spacing
        const mR = orbRadius * mDepth;
        const mSpeed = (1 - mDepth) * 0.5 + 0.1;
        const mAngle = time * mSpeed + m * 2.09;
        const mX = cx + Math.cos(mAngle) * mR;
        const mY = cy + Math.sin(mAngle) * mR * (0.6 + mDepth * 0.35); // perspective squash
        const mAlpha = (mDepth * 0.15 + 0.03) * (0.5 + 0.5 * Math.sin(time * 2.5 + m * 1.7));

        ctx.beginPath();
        ctx.arc(mX, mY, 0.5 + mDepth * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 140, 100, ${mAlpha})`;
        ctx.fill();
      }

      ctx.restore(); // un-clip

      // Rim highlight — thin bright edge
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(196, 140, 100, ${0.25 + pulse})`;
      ctx.lineWidth = Math.min(1.5 + orbRadius * 0.005, 3);
      ctx.stroke();

      this._voidAnimId = requestAnimationFrame(draw);
    };

    draw();

    // Handle resize
    this._voidResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cx = canvas.width / 2;
      cy = canvas.height / 2;
    };
    window.addEventListener('resize', this._voidResize);
  }

  _onVoidConsumed() {
    // The orb has eaten the whole screen — easter egg time
    const overlay = document.getElementById('void-overlay');
    const canvas = document.getElementById('void-canvas');
    const voidContent = document.querySelector('.void__content');
    const voidGlow = document.querySelector('.void__glow');

    // Flash white then fade to warm dark
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0; z-index: 10001;
      background: rgba(255, 230, 200, 0.9);
      pointer-events: none;
      transition: opacity 1.5s ease;
    `;
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 1600);
    }, 100);

    // After flash, show the easter egg content
    setTimeout(() => {
      // Fade canvas to dark
      if (canvas) canvas.style.transition = 'opacity 1s ease';
      if (canvas) canvas.style.opacity = '0';

      // Replace void text with easter egg
      const voidText = document.getElementById('void-text');
      if (voidText) {
        voidText.innerHTML = `
          <p class="void__line void__line--bold">${I18n.t('void.easterLine1')}</p>
          <p class="void__line void__line--main">${I18n.t('void.easterLine2')}</p>
          <p class="void__line void__line--dim void__line--small">${I18n.t('void.easterLine3')}</p>
        `;
      }

      // Show the content with fresh animations
      if (voidGlow) {
        voidGlow.style.display = '';
      }
      if (voidContent) {
        voidContent.style.transition = 'opacity 0.8s ease';
        voidContent.style.opacity = '1';
      }

      // Re-trigger the line animations
      if (overlay) {
        overlay.classList.remove('active');
        void overlay.offsetWidth;
        overlay.classList.add('active');
      }

      // Show escape button
      const escapeBtn = document.getElementById('void-escape');
      if (escapeBtn) {
        escapeBtn.style.opacity = '0';
        void escapeBtn.offsetWidth;
        escapeBtn.style.opacity = '';
      }
    }, 800);
  }

  _stopVoidParticles() {
    if (this._voidAnimId) {
      cancelAnimationFrame(this._voidAnimId);
      this._voidAnimId = null;
    }
    if (this._voidResize) {
      window.removeEventListener('resize', this._voidResize);
      this._voidResize = null;
    }
    const canvas = document.getElementById('void-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  _navigate(direction) {
    const adjacent = this.explorer.getAdjacentFile(direction);
    if (adjacent) {
      this.explorer.selectPath(adjacent.path);
    }
  }

  _handleHash() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.explorer.selectPath(hash);
    }
  }

  _setupLangToggle() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.textContent = I18n.t('ui.langToggle');
    btn.addEventListener('click', () => {
      const next = I18n.getLang() === 'en' ? 'ko' : 'en';
      I18n.setLang(next);
    });
  }

  _updateVoidText() {
    const voidText = document.getElementById('void-text');
    if (voidText) {
      voidText.innerHTML = `
        <p class="void__line void__line--dim">${I18n.t('void.line1')}</p>
        <p class="void__line void__line--bold">${I18n.t('void.line2')}</p>
        <p class="void__line void__line--main">${I18n.t('void.line3')}</p>
        <p class="void__line void__line--dim void__line--small">${I18n.t('void.line4')}</p>
      `;
    }
    const escapeBtn = document.getElementById('void-escape');
    if (escapeBtn) escapeBtn.textContent = I18n.t('void.escape');
    const closeTooltip = document.getElementById('close-tooltip');
    if (closeTooltip) closeTooltip.textContent = I18n.t('ui.closeTooltip');
  }

  async _onLangChange() {
    // manifest 재로드 및 번역 적용
    try {
      const response = await fetch('data/manifest.json');
      this.manifest = await response.json();
    } catch (e) {
      return;
    }
    I18n.applyToManifest(this.manifest);

    // 컴포넌트 재렌더링
    this.contentLoader.manifest = this.manifest;
    this.explorer = new FileExplorer(this.manifest, (node) => {
      this._onFileSelected(node);
    });
    this.explorer.render();
    this.contentLoader.showWelcome();
    this._updateVoidText();

    // 토글 버튼 텍스트 업데이트
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = I18n.t('ui.langToggle');

    // 터미널 재초기화
    this.terminal = new Terminal();
    this.terminal.init();

    // placeholder 업데이트
    const termInput = document.getElementById('terminal-input');
    if (termInput) termInput.placeholder = I18n.t('ui.terminalPlaceholder');

    // SEO 업데이트
    document.title = I18n.getLang() === 'ko'
      ? 'Explore Claude Code - Claude Code 탐험하기'
      : 'Explore Claude Code';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
