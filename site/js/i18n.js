/**
 * I18n - 런타임 다국어 지원 유틸리티
 */

const I18n = {
  _data: {},
  _fallback: {},
  _lang: 'en',
  _listeners: [],

  async init() {
    this._lang = this._detectLang();
    await this._load('en');
    if (this._lang !== 'en') {
      await this._load(this._lang);
    }
    this._updateHtmlLang();
  },

  /** dot-path 키로 번역 문자열 조회 */
  t(key) {
    return this._resolve(this._data, key)
      || this._resolve(this._fallback, key)
      || key;
  },

  getLang() {
    return this._lang;
  },

  async setLang(lang) {
    if (lang === this._lang) return;
    this._lang = lang;
    localStorage.setItem('tcc-lang', lang);

    // URL 파라미터 업데이트
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url.toString());

    // 번역 데이터 로드
    if (lang !== 'en') {
      await this._load(lang);
    } else {
      this._data = {};
    }

    this._updateHtmlLang();
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  },

  /** manifest의 badges, features, tree nodes에 번역 오버레이 */
  applyToManifest(manifest) {
    const m = this._resolve(this._data, 'manifest') || this._resolve(this._fallback, 'manifest');
    if (!m) return;

    // badges
    if (m.badges) {
      for (const [key, label] of Object.entries(m.badges)) {
        if (manifest.badges[key]) {
          manifest.badges[key].label = label;
        }
      }
    }

    // features
    if (m.features) {
      for (const [key, data] of Object.entries(m.features)) {
        if (manifest.features[key]) {
          if (data.title) manifest.features[key].title = data.title;
          if (data.description) manifest.features[key].description = data.description;
        }
      }
    }

    // tree nodes (label, description)
    if (m.nodes) {
      this._applyNodeTranslations(manifest.tree, m.nodes);
    }
  },

  _applyNodeTranslations(nodes, translations) {
    for (const node of nodes) {
      const t = translations[node.path];
      if (t) {
        if (t.label) node.label = t.label;
        if (t.description) node.description = t.description;
      }
      if (node.children) {
        this._applyNodeTranslations(node.children, translations);
      }
    }
  },

  _detectLang() {
    // 1. URL 파라미터
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && ['en', 'ko'].includes(urlLang)) return urlLang;

    // 2. localStorage
    const stored = localStorage.getItem('tcc-lang');
    if (stored && ['en', 'ko'].includes(stored)) return stored;

    // 3. 브라우저 언어
    if (navigator.language && navigator.language.startsWith('ko')) return 'ko';

    // 4. 기본값
    return 'en';
  },

  async _load(lang) {
    try {
      const resp = await fetch(`data/i18n/${lang}.json`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (lang === 'en') {
        this._fallback = data;
      } else {
        this._data = data;
      }
    } catch (e) {
      console.warn(`Failed to load i18n/${lang}.json:`, e);
    }
  },

  _resolve(obj, path) {
    if (!obj || !path) return null;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current == null || typeof current !== 'object') return null;
      current = current[key];
    }
    return current === undefined ? null : current;
  },

  _updateHtmlLang() {
    document.documentElement.lang = this._lang;
  }
};
