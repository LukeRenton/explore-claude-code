/**
 * Progress Tracker - Tracks which features the user has explored.
 * Persists to localStorage.
 */

class ProgressTracker {
  constructor(totalFeatures) {
    this.storageKey = 'tcc-progress';
    this.totalFeatures = totalFeatures;
    this.visited = new Set(this._load());
  }

  /** Mark a feature as visited */
  visit(featureId) {
    if (!featureId) return;
    this.visited.add(featureId);
    this._save();
    this._updateUI();
  }

  /** Get count of visited features */
  getCount() {
    return this.visited.size;
  }

  /** Check if a feature has been visited */
  hasVisited(featureId) {
    return this.visited.has(featureId);
  }

  /** Reset all progress */
  reset() {
    this.visited.clear();
    this._save();
    this._updateUI();
  }

  /** Update UI elements showing progress */
  _updateUI() {
    const count = this.visited.size;
    const total = this.totalFeatures;
    const percentage = total > 0 ? (count / total) * 100 : 0;

    // CRT progress bar
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    if (fill) fill.style.width = percentage + '%';
    if (text) text.textContent = `${count}/${total}`;

    // Win98 progress text
    const win98Text = document.getElementById('win98-progress-text');
    if (win98Text) win98Text.textContent = `${count}/${total} ${I18n.t('ui.features')}`;
  }

  /** Load from localStorage */
  _load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /** Save to localStorage */
  _save() {
    localStorage.setItem(this.storageKey, JSON.stringify([...this.visited]));
  }

  /** Initialize UI on load */
  init() {
    this._updateUI();
  }
}
