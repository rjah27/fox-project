/**
 * Copyright 2025 rjah27
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
// removed simple-icon imports per user request; will use plain text buttons
// simplified gallery component — no external photo-card used

/**
 * `fox-project`
 * 
 * @demo index.html
 * @element fox-project
 */

export class FoxProject extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return 'fox-project';
  }

  constructor() {
    super();
    this.title = 'Fox Gallery Generator';
    this.gallery = [];
    this.visibleGallery = [];
    this.nextIndex = 0;
    this.likes = {};
    this.dislikes = {};
    this.t = { title: 'Title' };

   
  }

  static get properties() {
    return Object.assign({}, super.properties, {
      title: { type: String },
      gallery: { type: Array },
      visibleGallery: { type: Array },
      nextIndex: { type: Number },
      likes: { type: Object },
      dislikes: { type: Object }
    });
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          font-family: Arial, sans-serif;
          color: var(--ddd-theme-default-accent);
        }

        .wrapper {
          padding: 12px;
        }

        .controls {
          margin: 12px 0;
        }

        button {
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }

        .cards-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .card {
          flex: 1 1 320px;
          max-width: 480px;
          background: var(--ddd-theme-default-potentialMidnight);
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          border: var(--ddd-border-sm);
        }

        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }

        .author {
          font-weight: 600;
        }

        .image-container {
          width: 100%;
          height: 300px;
          overflow: hidden;
          border-radius: 6px;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .caption, .timestamp {
          margin-top: 8px;
          text-align: center;
          color: var(--ddd-theme-default-accent);
          font-size: 0.95rem;
          font-style: italic;
        }

        .actions {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }

        .actions button {
          display:flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 6px;
          background: var(--ddd-theme-default-accent);
          border: 1px solid white;
        }

        .counter {
          font-weight: 300;
          margin-left: 6px;
        }
      `,
    ];
  }

//had help from AI to create a function that adds a new card, when visible, loads each fox image. (controls)
  render() {
    return html`
      <div class="wrapper">
        <h3>${this.t.title}: ${this.title}</h3>

        <div class="controls"> 
          <button @click=${this.addFox} ?disabled=${this.gallery && this.gallery.length ? this.nextIndex >= this.gallery.length : false}>Add Fox</button>
        </div>

        ${this.visibleGallery && this.visibleGallery.length
          ? html`
              <div class="cards-row">
                ${this.visibleGallery.map(item => html`
                  <div class="card">
                    <div class="header">
                      <div class="author">${item.author}</div>
                    </div>
                    <div class="image-container">
                      <img src="${item.url}" alt="${item.caption}">
                    </div>
                    <div class="caption">${item.caption}</div>
                    <div class="timestamp">${item.timestamp}</div>
                    <div class="actions">
                      <button @click=${() => this.handleLike(item.id)} title="Like">Like<span class="counter">${this.likes[item.id] || item.likes || 0}</span></button>
                      <button @click=${() => this.handleDislike(item.id)} title="Dislike">Dislike<span class="counter">${this.dislikes[item.id] || item.dislikes || 0}</span></button>
                      <button @click=${() => this.handleShare(item.id)} title="Share">Share</button>
                    </div>
                  </div>
                `)}
              </div>
            `
          : html`${this.gallery && this.gallery.length ? html`` : html`<div></div>`}`}
      </div>
    `;
  }
//help trying to get it to function with formatting and console logs.
//I understand the use of async to load the gallery, when it is called from the JSON as a constant, gallery.
  async loadGallery() {
    try {
      const res = await fetch(new URL('./lib/fox_photos.json', import.meta.url));
      const photoData = await res.json();
      this.gallery = photoData.photos || [];
      this.requestUpdate();
      console.log('Loaded gallery', this.gallery.length, 'items');
    } catch (e) {
      console.error('loadGallery error', e);
      this.gallery = [];
    }
  }
//same here, the visible Gallery was something that "worked" after I did some debugging issues trying to see if the image loading needed to be "true" for the button to operate.
  async addFox() {
    if (!this.gallery || !this.gallery.length) {
      await this.loadGallery();
      this.loadLikes();
      this.loadDislikes();
    }
    const item = this.gallery[this.nextIndex];
    this.visibleGallery = (this.visibleGallery || []).concat([item]);
    this.nextIndex++;
    this.requestUpdate();
  }

  loadLikes() {
    const saved = localStorage.getItem('foxGalleryLikes');
    if (saved) {
      this.likes = JSON.parse(saved);
    }
  }

  saveLikes() {
    localStorage.setItem('foxGalleryLikes', JSON.stringify(this.likes));
  }

  handleLike(id) {
    this.likes[id] = (this.likes[id] || 0) + 1;
    this.saveLikes();
    this.requestUpdate();
  }

  loadDislikes() {
    const saved = localStorage.getItem('foxGalleryDislikes');
    if (saved) {
      this.dislikes = JSON.parse(saved);
    }
  }

  saveDislikes() {
    localStorage.setItem('foxGalleryDislikes', JSON.stringify(this.dislikes));
  }

  handleDislike(id) {
    this.dislikes[id] = (this.dislikes[id] || 0) + 1;
    this.saveDislikes();
    this.requestUpdate();
  }

  async handleShare(id) {
    const url = window.location.origin + window.location.pathname + '?img=' + encodeURIComponent(String(id));
    try {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.warn('clipboard failed', err);
      alert('Could not copy link to clipboard.');
    }
  }

  static get haxProperties() { return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url).href; }
}

globalThis.customElements.define(FoxProject.tag, FoxProject);

