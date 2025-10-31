/**
 * Copyright 2025 rjah27
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
import "./photo-card.js";

/**
 * `fox-project`
 * 
 * @demo index.html
 * @element fox-project
 */
export class FoxProject extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "fox-project";
  }

  constructor() {
    super();
    this.title = "";
    this.photos = [];
    this.currentIndex = 0;
    this.t = this.t || {};
    this.t = {
      ...this.t,
      title: "Title",
    };
    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/fox-project.ar.json", import.meta.url).href +
        "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      photos: { type: Array },
      currentIndex: { type: Number }
    };
  }

  // Lit scoped styles
  static get styles() {
    return [super.styles,
    css`
      :host {
        display: block;
        color: var(--ddd-theme-primary);
        background-color: var(--ddd-theme-accent, #636363);
        font-family: var(--ddd-font-navigation, Arial, sans-serif);
      }
      .wrapper {
        margin: var(--ddd-spacing-2);
        padding: var(--ddd-spacing-4);
      }
      h3 span {
        font-size: var(--fox-project-label-font-size, var(--ddd-font-size-s));
      }
      .slideshow { display:flex; align-items:center; gap:12px; justify-content:center; }
      .control { background: transparent; border: none; font-size: 1.3rem; cursor: pointer; padding:8px 10px; }
      .counter { text-align:center; margin-top:8px; color:var(--ddd-theme-primary); }

        
      .card {
        width: var(--fox-project-card-width, 480px);
        background: var(--ddd-theme-default-navy40);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        box-shadow: 0 6px 14px rgba(0,0,0,0.06);
        padding: 12px;
      }

      .card h3 {
        margin: 8px 10px 12px;
        font-size: 1rem;
      }

      .card .photo-frame {
        width: 100%;
        height: var(--fox-project-photo-height, 340px);
        overflow: hidden;
        background: #313131;
        border-radius: 8px;
      }

      .card .photo-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    `];
  }


  render() {
    const photo = (this.photos && this.photos[this.currentIndex]) || {};
    return html`
      <div class="wrapper">
        <h3><span>${this.t.title}:</span> ${this.title}</h3>
        <slot></slot>

        ${this.photos && this.photos.length
          ? html`
              <div class="slideshow">
                <button class="control" @click=${this.prev} aria-label="Previous">◀</button>

                <div class="card">
                  <h3>Fox ${this.currentIndex + 1}</h3>

                  <div class="photo-frame">
                    ${photo.url
                      ? html`<img src="${photo.url}" alt="${photo.caption || ''}" />`
                      : html`<div class="placeholder">Loading photo…</div>`}
                  </div>

                  <div class="actions">
                    <button class="control" @click=${() => this.like(photo.id)} title="Like">👍</button>
                    <span class="count">${photo.likes ?? 0}</span>
                    <button class="control" @click=${() => this.dislike(photo.id)} title="Dislike">👎</button>
                    <span class="count">${photo.dislikes ?? 0}</span>
                  </div>

                  <div class="share">
                    <button class="control" @click=${() => this.copyShareLink(photo.id)}>Copy Share Link</button>
                  </div>
                </div>

                <button class="control" @click=${this.next} aria-label="Next">▶</button>
              </div>
              <div class="counter">${this.currentIndex + 1} / ${this.photos.length}</div>
            `
          : html`<div>Loading photos…</div>`}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    this._loadPhotos();
  }

  async _loadPhotos() {
    try {
      
      const total = 51;
      const now = new Date();
      const generated = Array.from({ length: total }, (_, i) => {
        const id = i + 1;
        return {
          id: String(id),
          url: '', // will be filled by fetchImageForIndex when needed
          author: 'Random Fox',
          caption: `Fox ${id}`,
          timestamp: new Date(now.getTime() - i * 86400000).toISOString(), // stagger dates
          likes: 0,
          dislikes: 0,
          loaded: false
        };
      });

      this.photos = generated;

      // If URL contains ?fox=NN, restore that index
      const params = new URLSearchParams(window.location.search);
      const foxNum = parseInt(params.get('fox'));
      const imgParam = params.get('img'); // optional: specific fetched image id

      if (imgParam) {
        // If the URL includes an explicit image id (from a share link),
        // put that specific image into the first slot so the link
        // reproduces the same fox image.
        const imageId = parseInt(imgParam);
        if (imageId) {
          const copy = [...this.photos];
          copy[0] = {
            ...copy[0],
            url: `https://randomfox.ca/images/${imageId}.jpg`,
            imageId: String(imageId),
            loaded: true,
            caption: `Fox ${imageId}`
          };
          this.photos = copy;
          this.currentIndex = 0;
        }
      } else if (foxNum && foxNum >= 1 && foxNum <= this.photos.length) {
        this.currentIndex = foxNum - 1;
      } else {
        this.currentIndex = 0;
      }

      // lazy-load the initial image and prefetch the next one
      this.fetchImageForIndex(this.currentIndex);
      if (this.currentIndex + 1 < this.photos.length) {
        this.fetchImageForIndex(this.currentIndex + 1);
      }
    } catch (e) {
      // keep photos empty on error
      console.error(e);
    }
  }


  // Behavior:
  // - If the slot is already loaded, do nothing.
  // - Otherwise, call the RandomFox API endpoint and set the
  //   returned image URL into the slot. If the fetch fails we set
  //   a predictable fallback URL so the UI still shows an image.
  
  async fetchImageForIndex(index) {
   
    if (!this.photos || !this.photos[index]) return;
  const slot = this.photos[index];
    if (slot.loaded && slot.url) return;
    try {
     
      const response = await fetch('https://randomfox.ca/floof/');
      const data = await response.json();
      const imageUrl = data.image || data.link || '';
      let imageId = '';
      try {
        const m = imageUrl && imageUrl.match(/\/images\/(\d+)\.jpg/);
        if (m && m[1]) imageId = String(m[1]);
      } catch (e) {}

      const copy = [...this.photos];
      copy[index] = { ...slot, url: imageUrl, imageId, loaded: true };
      this.photos = copy;
    } catch (err) {
      const fallback = `https://randomfox.ca/images/${(index % 51) + 1}.jpg`;
      const copy = [...this.photos];
      copy[index] = { ...slot, url: fallback, imageId: String((index % 51) + 1), loaded: true };
      this.photos = copy;
    }
  }

 
  prev() {
    if (!this.photos || !this.photos.length) return;
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.fetchImageForIndex(this.currentIndex);
    if (this.currentIndex - 1 >= 0) this.fetchImageForIndex(this.currentIndex - 1);
  }

  next() {
    if (!this.photos || !this.photos.length) return;
    this.currentIndex = Math.min(this.photos.length - 1, this.currentIndex + 1);
    this.fetchImageForIndex(this.currentIndex);
    if (this.currentIndex + 1 < this.photos.length) this.fetchImageForIndex(this.currentIndex + 1);
  }

  like(id) {
    if (!id) return;
    this.photos = this.photos.map(p => p.id === String(id) || p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p);
  }

  dislike(id) {
    if (!id) return;
    this.photos = this.photos.map(p => p.id === String(id) || p.id === id ? { ...p, dislikes: (p.dislikes || 0) + 1 } : p);
  }

  // copy a shareable link to the clipboard (simple fallback included)
  async copyShareLink(id) {
    const photo = (this.photos && this.photos[this.currentIndex]) || null;
    if (!photo) return;

    if (!photo.imageId) {
      // ensure the slot has a fetched image id before sharing
      try {
        await this.fetchImageForIndex(this.currentIndex);
      } catch (e) {
        // ignore fetch errors; we'll fall back to slot id below
      }
    }

    const updatedPhoto = (this.photos && this.photos[this.currentIndex]) || photo;
    const shareId = updatedPhoto.imageId || updatedPhoto.id;
    const url = `${window.location.origin}${window.location.pathname}?img=${encodeURIComponent(shareId)}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
      // update the URL in the address bar to the share link
      const u = new URL(window.location.href);
      u.searchParams.set('img', shareId);
      window.history.replaceState({}, '', u);
    } catch (e) {
      console.error('copy failed', e);
    }
  }

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(FoxProject.tag, FoxProject);


