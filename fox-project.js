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
                    <button class="control" @click=${() => this.like(photo.id)} title="Like">Like</button>
                    <span class="count">${photo.likes ?? 0}</span>
                    <button class="control" @click=${() => this.dislike(photo.id)} title="Dislike">Dislike</button>
                    <span class="count">${photo.dislikes ?? 0}</span>
                  </div>

                  <div class="share">
                    <button class="control" @click=${() => this.copyShareLink(photo.id)}>Copy Link</button>
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
    this.loadPhotos();
  }

  loadPhotos() {
    try {

      var total = 51;
      var now = new Date();
      var generated = Array.from({ length: total }, function (_, i) {
        var id = i + 1;
        return {
          id: String(id),
          url: '',
          author: 'Random Fox',
          caption: 'Fox ' + id,
          timestamp: new Date(now.getTime() - i * 86400000).toISOString(),
          likes: 0,
          dislikes: 0,
          loaded: false
        };
      });

      this.photos = generated;
      var params = new URLSearchParams(window.location.search);
      var foxNum = parseInt(params.get('fox'));
      var imgParam = params.get('img');

      if (imgParam) {
        var imageId = parseInt(imgParam);
        if (imageId) {
          this.setSlotImage(0, 'https://randomfox.ca/images/' + imageId + '.jpg', String(imageId));
          var updated = [...this.photos];
          updated[0].caption = 'Fox ' + imageId;
          this.photos = updated;
          this.currentIndex = 0;
        }
      } else if (foxNum && foxNum >= 1 && foxNum <= this.photos.length) {
        this.currentIndex = foxNum - 1;
      } else {
        this.currentIndex = 0;
      }

      // fetch the current image and prefetch the next one
      this.fetchImageForIndex(this.currentIndex);
      if (this.currentIndex + 1 < this.photos.length) {
        this.fetchImageForIndex(this.currentIndex + 1);
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  fetchImageForIndex(index) {
  if (!this.photos || !this.photos[index]) return Promise.resolve();

  const slot = this.photos[index];
  if (slot.loaded && slot.url) return Promise.resolve();

  return fetch('https://randomfox.ca/floof/')
    .then(res => res.json())
    .then(json => {
      const imageUrl = json.image || json.link || '';
      const match = imageUrl.match(/\/images\/(\d+)\.jpg/);
      const imageId = match ? match[1] : '';
      this.setSlotImage(index, imageUrl, imageId);
    })
    .catch(() => {
      const fallbackId = (index % 51) + 1;
      const fallbackUrl = `https://randomfox.ca/images/${fallbackId}.jpg`;
      this.setSlotImage(index, fallbackUrl, String(fallbackId));
    });
}

  setSlotImage(index, imageUrl, imageId) {
    const updated = [...this.photos];
    const slot = updated[index] || {};
    updated[index] = { ...slot, url: imageUrl, imageId, loaded: true };
    this.photos = updated;
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
    const idx = this.photos.findIndex(p => p.id === String(id) || p.id === id);
    if (idx === -1) return;
    this.incrementSlotField(idx, 'likes', 1);
  }

  dislike(id) {
    if (!id) return;
    const idx = this.photos.findIndex(p => p.id === String(id) || p.id === id);
    if (idx === -1) return;
    this.incrementSlotField(idx, 'dislikes', 1);
  }

  incrementSlotField(index, field, amount = 1) {
    const updated = [...this.photos];
    const slot = updated[index] || {};
    const current = Number(slot[field] || 0);
    updated[index] = { ...slot, [field]: current + amount };
    this.photos = updated;
  }

  copyShareLink(id) {
    var photo = (this.photos && this.photos[this.currentIndex]) || null;
    if (!photo) return;

    function doCopy() {
      var updatedPhoto = (this.photos && this.photos[this.currentIndex]) || photo;
      var shareId = updatedPhoto.imageId || updatedPhoto.id;
      var url = window.location.origin + window.location.pathname + '?img=' + encodeURIComponent(shareId);

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).catch(function () {});
        }
      } catch (e) {
      }

      try {
        var u = new URL(window.location.href);
        u.searchParams.set('img', shareId);
        window.history.replaceState({}, '', u);
      } catch (e) {
      }
    }

    if (!photo.imageId) {
      var self = this;
      this.fetchImageForIndex(this.currentIndex).then(function () {
        doCopy.call(self);
      }).catch(function () {
        doCopy.call(self);
      });
    } else {
      doCopy.call(this);
    }
  }
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(FoxProject.tag, FoxProject);


