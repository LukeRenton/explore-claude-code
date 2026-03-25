/**
 * SVG Icon library — small, clean, monochrome icons.
 * All icons return SVG strings at the specified size.
 */

const Icons = {
  // ── File type icons (for sidebar tree) ─────────────────────

  fileMarkdown(size = 14) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path d="M4 2h5.5L13 5.5V14H4V2z" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M9 2v4h4" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M6.5 8.5L8 10.5 9.5 8.5" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;
  },

  fileJson(size = 14) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path d="M5.5 3C4 3 3.5 3.8 3.5 4.8v1.8c0 .5-.4.9-.9.9.5 0 .9.4.9.9v1.8c0 1 .5 1.8 2 1.8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
      <path d="M10.5 3c1.5 0 2 .8 2 1.8v1.8c0 .5.4.9.9.9-.5 0-.9.4-.9.9v1.8c0 1-.5 1.8-2 1.8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    </svg>`;
  },

  fileCode(size = 14) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path d="M4 2h5.5L13 5.5V14H4V2z" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M9 2v4h4" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M6.5 9l-1 1.5 1 1.5M9.5 9l1 1.5-1 1.5" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;
  },

  fileGeneric(size = 14) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path d="M4 2h5.5L13 5.5V14H4V2z" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M9 2v4h4" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`;
  },

  // ── Folder icons ───────────────────────────────────────────

  folderClosed(size = 14) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path d="M2 4v8.5h12V6H8.5L7 4H2z" stroke-width="1.3" stroke-linejoin="round"/>
    </svg>`;
  },

  folderOpen(size = 14) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path d="M2 4v8.5h12V6H8.5L7 4H2z" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M2 7h10.5l-1.5 5.5H.5L2 7z" stroke-width="1" stroke-linejoin="round" fill="currentColor" opacity="0.08"/>
    </svg>`;
  },

  // ── Feature icons (for welcome cards, ~20px) ──────────────

  featureClaudeMd(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <path d="M4 2h8l4 4v12H4V2z" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M12 2v4h4" stroke-width="1.3" stroke-linejoin="round"/>
      <circle cx="10" cy="11" r="2.5" stroke-width="1.2" fill="none"/>
      <path d="M10 8.5V7M10 15v-1.5M7.5 11H6M14 11h-1.5" stroke-width="1" stroke-linecap="round"/>
    </svg>`;
  },

  featureSettings(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <path d="M4 5h12M4 10h12M4 15h12" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="7" cy="5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="13" cy="10" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="15" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`;
  },

  featureCommands(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke-width="1.3"/>
      <path d="M5.5 8l3 2.5-3 2.5" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 13.5h4" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`;
  },

  featureSkills(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <path d="M10 3a4.5 4.5 0 0 1 2.5 8.2V13h-5v-1.8A4.5 4.5 0 0 1 10 3z" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M7.5 13v1.5a2.5 2.5 0 0 0 5 0V13" stroke-width="1.3"/>
      <path d="M8 15.5h4" stroke-width="1" stroke-linecap="round"/>
    </svg>`;
  },

  featureMcp(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <circle cx="6" cy="10" r="3" stroke-width="1.3"/>
      <circle cx="14" cy="10" r="3" stroke-width="1.3"/>
      <path d="M9 10h2" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M6 5V3M6 17v-2M14 5V3M14 17v-2" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  },

  featureAgents(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <circle cx="10" cy="5" r="2.5" stroke-width="1.3"/>
      <path d="M5.5 14.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="16" cy="8" r="1.5" stroke-width="1"/>
      <path d="M13.5 13.5c.5-1.2 1.5-2 2.5-2" stroke-width="1" stroke-linecap="round"/>
      <circle cx="4" cy="8" r="1.5" stroke-width="1"/>
      <path d="M6.5 13.5c-.5-1.2-1.5-2-2.5-2" stroke-width="1" stroke-linecap="round"/>
    </svg>`;
  },

  featureRules(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <rect x="3" y="2" width="14" height="16" rx="1.5" stroke-width="1.3"/>
      <path d="M7 2v16" stroke-width="1" opacity="0.4"/>
      <path d="M9 6h5M9 9h4M9 12h5M9 15h3" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  },

  featureHooks(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <path d="M10 3v4" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M10 7c0 2.5-3 2.5-3 5a3 3 0 0 0 6 0" stroke-width="1.3" stroke-linecap="round" fill="none"/>
      <circle cx="10" cy="3" r="1.5" stroke-width="1.2"/>
      <path d="M5 6h2M13 6h2" stroke-width="1" stroke-linecap="round"/>
    </svg>`;
  },

  featurePlugins(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <rect x="3" y="7" width="14" height="10" rx="2" stroke-width="1.3"/>
      <path d="M7 7V5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2" stroke-width="1.2"/>
      <path d="M11 7V5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2" stroke-width="1.2"/>
      <path d="M7 12h6" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M7 14.5h4" stroke-width="1" stroke-linecap="round"/>
    </svg>`;
  },

  featureMarketplaces(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <path d="M3 8h14v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" stroke-width="1.3"/>
      <path d="M3 8l1.5-4h11L17 8" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M7 8v1a3 3 0 0 0 6 0V8" stroke-width="1.2"/>
      <path d="M8 14h4" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  },

  featureBundledSkills(size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke-width="1.3"/>
      <path d="M7 7h6M7 10h4M7 13h5" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="14" cy="14" r="3" fill="currentColor" stroke="none" opacity="0.3"/>
      <path d="M13 14l1 1 2-2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  },

  // ── Utility ────────────────────────────────────────────────

  /** Get file icon based on extension */
  forFile(path, size = 14) {
    if (path.endsWith('.md')) return this.fileMarkdown(size);
    if (path.endsWith('.json')) return this.fileJson(size);
    if (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js')) return this.fileCode(size);
    return this.fileGeneric(size);
  },

  /** Get feature icon by feature ID */
  forFeature(id, size = 20) {
    const map = {
      'claude-md': this.featureClaudeMd,
      'settings': this.featureSettings,
      'rules': this.featureRules,
      'commands': this.featureCommands,
      'skills': this.featureSkills,
      'mcp': this.featureMcp,
      'hooks': this.featureHooks,
      'agents': this.featureAgents,
      'plugins': this.featurePlugins,
      'marketplaces': this.featureMarketplaces,
      'bundled-skills': this.featureBundledSkills,
    };
    const fn = map[id];
    return fn ? fn.call(this, size) : this.fileGeneric(size);
  }
};
