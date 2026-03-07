/**
 * File Explorer - Renders the sidebar file tree from manifest data.
 * Animates tree connector lines (├── └──) drawn on canvas as children are revealed.
 */

class FileExplorer {
  constructor(manifest, onFileSelect) {
    this.manifest = manifest;
    this.onFileSelect = onFileSelect;
    this.expandedDirs = new Set(['.claude']);
    this.selectedPath = null;
    this.flatFiles = [];
    this._buildFlatList(manifest.tree);
  }

  _buildFlatList(nodes) {
    for (const node of nodes) {
      if (node.type === 'file') {
        this.flatFiles.push(node);
      } else if (node.children) {
        this._buildFlatList(node.children);
      }
    }
  }

  render() {
    const container = document.getElementById('file-tree');
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(this._renderNodes(this.manifest.tree, 0));
  }

  _renderNodes(nodes, depth) {
    const fragment = document.createDocumentFragment();
    for (const node of nodes) {
      if (node.type === 'directory') {
        fragment.appendChild(this._renderDirectory(node, depth));
      } else {
        fragment.appendChild(this._renderFile(node, depth));
      }
    }
    return fragment;
  }

  _renderDirectory(node, depth) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tree-dir';

    const item = document.createElement('div');
    item.className = 'tree-item tree-item-dir';

    for (let i = 0; i < depth; i++) {
      const indent = document.createElement('span');
      indent.className = 'tree-indent';
      item.appendChild(indent);
    }

    const isExpanded = this.expandedDirs.has(node.path);
    const icon = document.createElement('span');
    icon.className = 'tree-icon tree-icon--svg';
    icon.innerHTML = isExpanded ? Icons.folderOpen(14) : Icons.folderClosed(14);
    item.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = node.name;
    item.appendChild(label);

    if (node.badge) {
      const badge = document.createElement('span');
      badge.className = `tree-badge tree-badge--${node.badge}`;
      badge.textContent = this.manifest.badges[node.badge]?.label || node.badge;
      item.appendChild(badge);
    }

    // Check if this directory's feature is deprecated
    const dirFeature = this._featureForBadge(node.badge);
    if (dirFeature && this.manifest.features[dirFeature]?.deprecated) {
      item.classList.add('tree-item--deprecated');
      const dep = document.createElement('span');
      dep.className = 'tree-badge tree-badge--deprecated';
      dep.textContent = I18n.t('ui.deprecated');
      item.appendChild(dep);
    }

    wrapper.appendChild(item);

    let childrenDiv = null;
    if (node.children) {
      childrenDiv = document.createElement('div');
      childrenDiv.className = 'tree-children';

      const guidedChildren = document.createElement('div');
      guidedChildren.className = 'tree-children-guided';
      guidedChildren.dataset.depth = depth;
      guidedChildren.appendChild(this._renderNodes(node.children, depth + 1));
      childrenDiv.appendChild(guidedChildren);

      if (isExpanded) {
        childrenDiv.classList.add('expanded');
        const items = guidedChildren.querySelectorAll(':scope > .tree-item, :scope > .tree-dir');
        items.forEach(el => el.classList.add('tree-visible'));
        // Draw static lines after DOM is ready (double-rAF ensures layout is complete)
        requestAnimationFrame(() => requestAnimationFrame(() => this._drawStaticLines(guidedChildren, depth)));
      }

      wrapper.appendChild(childrenDiv);
    }

    item.addEventListener('click', () => {
      const expanding = !this.expandedDirs.has(node.path);

      if (expanding) {
        this.expandedDirs.add(node.path);
        icon.innerHTML = Icons.folderOpen(14);
        if (childrenDiv) this._expandChildren(childrenDiv, depth);
      } else {
        this.expandedDirs.delete(node.path);
        icon.innerHTML = Icons.folderClosed(14);
        if (childrenDiv) this._collapseChildren(childrenDiv);
      }
    });

    return wrapper;
  }

  /** Get the x position of the guide line for a given depth */
  _guideX(depth) {
    // padding-left (16px) + depth indents (16px each) + center of icon column (8px)
    return 16 + depth * 16 + 8;
  }

  /**
   * Create and size a canvas for the guided children container.
   * IMPORTANT: This method already applies ctx.scale(dpr, dpr) to the canvas
   * context. Callers must NOT scale again or coordinates will be multiplied
   * by dpr² — causing misaligned lines on high-DPI / scaled displays.
   */
  _createCanvas(guided) {
    // Remove old canvas if any
    const old = guided.querySelector('.tree-guide-canvas');
    if (old) old.remove();

    const canvas = document.createElement('canvas');
    canvas.className = 'tree-guide-canvas';

    // Size to container
    const rect = guided.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    guided.insertBefore(canvas, guided.firstChild);
    return canvas;
  }

  /** Draw tree connector lines for a single child item */
  _drawConnector(ctx, x, prevY, childY, isLast) {
    ctx.strokeStyle = 'rgba(58, 54, 50, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Vertical line from previous Y down to this child's center Y
    ctx.moveTo(x, prevY);
    ctx.lineTo(x, childY);

    // Horizontal branch to the right
    ctx.moveTo(x, childY);
    ctx.lineTo(x + 8, childY);

    ctx.stroke();
  }

  /** Draw all lines statically (for already-expanded folders) */
  _drawStaticLines(guided, depth) {
    const items = guided.querySelectorAll(':scope > .tree-item, :scope > .tree-dir');
    if (items.length === 0) return;

    const rect = guided.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // Container not laid out yet — retry next frame
      requestAnimationFrame(() => this._drawStaticLines(guided, depth));
      return;
    }

    const canvas = this._createCanvas(guided);
    const ctx = canvas.getContext('2d');

    const x = this._guideX(depth);
    let prevY = 0;

    items.forEach((el, i) => {
      // For tree-dir wrappers, use the first .tree-item child's center
      let centerY;
      if (el.classList.contains('tree-dir')) {
        const dirItem = el.querySelector('.tree-item');
        centerY = el.offsetTop + (dirItem ? dirItem.offsetHeight / 2 : el.offsetHeight / 2);
      } else {
        centerY = el.offsetTop + el.offsetHeight / 2;
      }

      const isLast = i === items.length - 1;
      this._drawConnector(ctx, x, prevY, centerY, isLast);
      prevY = centerY;
    });
  }

  /** Animate expanding — draw tree lines segment by segment as children appear */
  _expandChildren(container, depth) {
    container.classList.add('expanded');

    const guided = container.querySelector('.tree-children-guided');
    const items = guided.querySelectorAll(':scope > .tree-item, :scope > .tree-dir');

    // Reset children to hidden
    items.forEach(el => el.classList.remove('tree-visible'));

    // Clip the container so it only reveals as far as we've drawn
    container.style.overflow = 'hidden';
    container.style.maxHeight = '0px';
    container.style.transition = 'max-height 0.15s ease';

    // Need a frame for the container to have layout
    requestAnimationFrame(() => {
      const canvas = this._createCanvas(guided);
      const ctx = canvas.getContext('2d');

      const x = this._guideX(depth);
      let prevY = 0;

      items.forEach((el, i) => {
        const delay = i * 180 + 40;
        const isLast = i === items.length - 1;

        setTimeout(() => {
          // Calculate this child's vertical center
          let centerY;
          let bottomEdge;
          if (el.classList.contains('tree-dir')) {
            const dirItem = el.querySelector('.tree-item');
            centerY = el.offsetTop + (dirItem ? dirItem.offsetHeight / 2 : el.offsetHeight / 2);
            bottomEdge = el.offsetTop + (dirItem ? dirItem.offsetHeight : el.offsetHeight);
          } else {
            centerY = el.offsetTop + el.offsetHeight / 2;
            bottomEdge = el.offsetTop + el.offsetHeight;
          }

          // Grow the container to reveal this child
          container.style.maxHeight = bottomEdge + 'px';

          // Animate the line drawing over many frames so you can see it
          const startY = prevY;
          const targetY = centerY;
          const frames = 16;
          let frame = 0;

          const drawStep = () => {
            frame++;
            const progress = frame / frames;
            const currentY = startY + (targetY - startY) * progress;

            // Draw vertical segment
            ctx.strokeStyle = 'rgba(58, 54, 50, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, startY + (targetY - startY) * ((frame - 1) / frames));
            ctx.lineTo(x, currentY);
            ctx.stroke();

            if (frame === frames) {
              // Draw horizontal branch
              ctx.beginPath();
              ctx.moveTo(x, targetY);
              ctx.lineTo(x + 8, targetY);
              ctx.stroke();

              // Show the child
              el.classList.add('tree-visible');
              prevY = targetY;

              // After last child, remove the clip so nested expansions work
              if (isLast) {
                setTimeout(() => {
                  container.style.maxHeight = '';
                  container.style.overflow = '';
                  container.style.transition = '';
                }, 200);
              }
            } else {
              requestAnimationFrame(drawStep);
            }
          };

          drawStep();
        }, delay);
      });
    });
  }

  /** Animate collapsing — fade children out in reverse, then remove canvas */
  _collapseChildren(container) {
    const guided = container.querySelector('.tree-children-guided');
    const items = guided.querySelectorAll(':scope > .tree-item, :scope > .tree-dir');
    const count = items.length;

    // Fade out in reverse
    items.forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove('tree-visible');
      }, (count - 1 - i) * 40);
    });

    // After all hidden, collapse and clean up
    setTimeout(() => {
      const canvas = guided.querySelector('.tree-guide-canvas');
      if (canvas) canvas.remove();
      container.classList.remove('expanded');
    }, count * 40 + 100);
  }

  _renderFile(node, depth) {
    const item = document.createElement('div');
    item.className = 'tree-item tree-item-file';
    item.setAttribute('data-path', node.path);

    if (this.selectedPath === node.path) {
      item.classList.add('selected');
    }

    for (let i = 0; i < depth; i++) {
      const indent = document.createElement('span');
      indent.className = 'tree-indent';
      item.appendChild(indent);
    }

    const icon = document.createElement('span');
    icon.className = 'tree-icon tree-icon--svg';
    icon.innerHTML = Icons.forFile(node.path, 14);
    item.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = node.name;
    item.appendChild(label);

    if (node.badge) {
      const badge = document.createElement('span');
      badge.className = `tree-badge tree-badge--${node.badge}`;
      badge.textContent = this.manifest.badges[node.badge]?.label || node.badge;
      item.appendChild(badge);
    }

    // Check if this file's feature is deprecated
    if (node.feature && this.manifest.features[node.feature]?.deprecated) {
      item.classList.add('tree-item--deprecated');
    }

    item.addEventListener('click', () => {
      const prev = document.querySelector('.tree-item.selected');
      if (prev) prev.classList.remove('selected');

      this.selectedPath = node.path;
      item.classList.add('selected');

      if (this.onFileSelect) {
        this.onFileSelect(node);
      }
    });

    return item;
  }

  selectPath(path) {
    const node = this._findNode(this.manifest.tree, path);
    if (node) {
      this._expandParents(path);
      this.selectedPath = path;
      this.render();
      if (this.onFileSelect) {
        this.onFileSelect(node);
      }
    }
  }

  _findNode(nodes, path) {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = this._findNode(node.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  /** Map a badge name to its corresponding feature key (they often match) */
  _featureForBadge(badge) {
    if (!badge) return null;
    const features = this.manifest.features;
    if (features[badge]) return badge;
    // Check children for a matching feature
    for (const key of Object.keys(features)) {
      if (this.manifest.badges[badge]?.label === features[key].title?.toLowerCase()) return key;
    }
    return null;
  }

  _expandParents(path) {
    const parts = path.split('/');
    let current = '';
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? current + '/' + parts[i] : parts[i];
      this.expandedDirs.add(current);
    }
  }

  getAdjacentFile(direction) {
    if (!this.selectedPath) {
      return this.flatFiles[0] || null;
    }
    const currentIndex = this.flatFiles.findIndex(f => f.path === this.selectedPath);
    if (currentIndex === -1) return null;
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < this.flatFiles.length) {
      return this.flatFiles[newIndex];
    }
    return null;
  }
}
