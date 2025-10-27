/**
 * Small photo-card component used by fox-project for the slideshow/gallery
 */
import { LitElement, html, css } from "lit";

export class PhotoCard extends LitElement {
  static get tag() {
    return "photo-card";
  }

  static get properties() {
    return {
      photo: { type: Object },
      liked: { type: String }
    };
  }

  constructor() {
    super();
    this.photo = null;
    this.liked = "none"; // "like" | "dislike" | "none"
  }

  static get styles() {
    return css`
      :host { display: block; max-width: 760px; }
      .card { background: var(--ddd-surface-1, #fff); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
      img { width: 100%; height: auto; display: block; }
      .meta { padding: 12px; display:flex; justify-content:space-between; align-items:center; gap:12px; }
      .info { flex:1; }
      .caption { font-size: 0.95rem; margin:0 0 6px 0; }
      .author { font-size: 0.8rem; color: #666; }
      .actions { display:flex; gap:8px; align-items:center; }
      button { background: transparent; border: none; cursor: pointer; padding:6px 8px; border-radius:6px; }
      button[aria-pressed="true"] { background: rgba(0,0,0,0.06); }
      .flash { position: absolute; right: 12px; top: 12px; background: rgba(0,0,0,0.7); color: #fff; padding:6px 10px; border-radius: 6px; opacity:0; transition:opacity .2s; }
      .card-wrap{ position:relative; }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadLike();
  }

  updated(changed) {
    if (changed.has('photo')) {
      this._loadLike();
    }
  }

  _storageKey() {
    return 'fox-project-likes';
  }

  _loadLike() {
    try {
      const map = JSON.parse(localStorage.getItem(this._storageKey()) || '{}');
      if (this.photo && this.photo.id) this.liked = map[this.photo.id] || 'none';
    } catch (e) {
      // ignore
    }
  }

  _setLike(val) {
    if (!this.photo || !this.photo.id) return;
    try {
      const map = JSON.parse(localStorage.getItem(this._storageKey()) || '{}');
      map[this.photo.id] = val;
      localStorage.setItem(this._storageKey(), JSON.stringify(map));
      this.liked = val;
      this.dispatchEvent(new CustomEvent('like-changed', { detail: { id: this.photo.id, value: val }, bubbles: true, composed: true }));
    } catch (e) {
      // ignore
    }
  }

  _toggleLike(state) {
    const next = this.liked === state ? 'none' : state;
    this._setLike(next);
  }

  async _onShare() {
    const url = (location.href.split('#')[0]) + `#photo-${this.photo?.id}`;
    const title = this.photo?.caption || 'Photo';
    try {
      if (navigator.share) {
        await navigator.share({ title, text: this.photo?.caption, url });
        this._flash('Shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        this._flash('Link copied');
      } else {
        this._flash('Share not supported');
      }
      this.dispatchEvent(new CustomEvent('photo-shared', { detail: { id: this.photo?.id, url }, bubbles: true, composed: true }));
    } catch (e) {
      this._flash('Unable to share');
    }
  }

  _flash(msg) {
    const el = this.shadowRoot.getElementById('flash');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => (el.style.opacity = '0'), 1800);
  }

  render() {
    if (!this.photo) {
      return html`<div>Loading…</div>`;
    }

    return html`
      <div class="card-wrap">
        <div class="card">
          <img src="${this.photo.url}" alt="${this.photo.caption || ''}" />
          <div class="meta">
            <div class="info">
              <div class="caption">${this.photo.caption}</div>
              <div class="author">by ${this.photo.author} • ${new Date(this.photo.timestamp).toLocaleDateString()}</div>
            </div>
            <div class="actions">
              <button title="Like" @click="${() => this._toggleLike('like')}" aria-pressed="${this.liked === 'like'}">👍</button>
              <button title="Dislike" @click="${() => this._toggleLike('dislike')}" aria-pressed="${this.liked === 'dislike'}">👎</button>
              <button title="Share" @click="${() => this._onShare()}">🔗</button>
            </div>
          </div>
        </div>
        <div id="flash" class="flash" aria-hidden="true"></div>
      </div>
    `;
  }
}

customElements.define(PhotoCard.tag, PhotoCard);
