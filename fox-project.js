/**
 * Copyright 2025 rjah27
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
// simplified gallery component — no external photo-card used

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
    this.gallery = [];
    this.likes = {};
  this.dislikes = {};
    this.t = this.t || {};
    this.t = {
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

  static get properties() {
    return Object.assign({}, super.properties, {
      title: { type: String },
      gallery: { type: Array },
      dislikes: { type: Object },
      likes: { type: Object }
    });
  }

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
        margin: var(--ddd-spacing-4);
        padding: var(--ddd-spacing-6);
      }
      h3 {
        font-size: var(--ddd-font-weight-regular, var(--ddd-font-size-s));
      }
      .slideshow { display:flex; 
        align-items:center; 
        gap:12px; 
        justify-content:center; 
    }
      .control { background: transparent; 
        border: none; 
        font-size: 1.3rem; 
        cursor: pointer; 
        padding:8px 10px; 
    }
      .counter { text-align:center; 
        margin-top:8px; 
        color:var(--ddd-theme-primary); }

        
      .card {
        width: var(--fox-project-card-width, 480px);
        background: var(--ddd-theme-default-navy40);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        box-shadow: 0 6px 14px rgba(0,0,0,0.4);
        padding: 12px;
        align-items: center;
        margin-left: var(--ddd-spacing-20);
      }

      .card h3 {
        margin: 8px 10px 12px;
        font-size: 1rem;
      }

      .card .photo-frame {
        width: 100%;
        height: var(--fox-project-photo-height, 340px);
        overflow: hidden;
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
    return html`
    <div class="wrapper">
        <h3>${this.t.title}: ${this.title}</h3>
        <slot></slot>

    ${this.gallery && this.gallery.length
        ? this.gallery.map((item) => html`
        <div class="card">
            <div class="header">
                <div class="profile-pic"></div>
                <div class="username">${item.author || 'Unknown'}</div>
            </div>

        <div class="photo-frame image-container">
            <img src="${item.url}" alt="${item.caption || ''}" />
        </div>

        <div class="actions">
            <button @click=${() => this.handleLike(item.id)} title="Like">
                Like <span class="likes-count">${this.likes[item.id] || item.likes || 0}</span>                  </button>
            <button @click=${() => this.handleDislike(item.id)} title="Dislike">
                Dislike <span class="dislikes-count">${this.dislikes[item.id] || item.dislikes || 0}</span>
            </button>
            <button @click=${() => this.handleShare(encodeURIComponent(item.id))} title="Share">
                <simple-icon icon="icons:share">Share</simple-icon>
            </button>
        </div>
        </div>
            `)
        : html`<div>Loading gallery</div>`}
    </div>
    `;
  }


  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    this.loadGallery();
    this.loadLikes();
    this.loadDislikes();
  }

  async loadGallery() {
    try {
      const res = await fetch(new URL('./lib/fox_photos.json', import.meta.url));
      const data = await res.json();
      this.gallery = data.gallery || data.photos || [];
      console.log('Loaded gallery data:', this.gallery.length, 'items');
    } catch (err) {
      console.error('Error loading gallery:', err);
      this.gallery = [];
    }
  }

  loadLikes() {
    var saved = localStorage.getItem('foxGalleryLikes');
    if (saved) {
      try {
        this.likes = JSON.parse(saved) || {};
      } catch (e) {
        this.likes = {};
      }
    }
  }

  saveLikes() {
    try {
      localStorage.setItem('foxGalleryLikes', JSON.stringify(this.likes));
    } catch (e) {}
  }

  handleLike(id) {
    this.likes[id] = (this.likes[id] || 0) + 1;
    this.saveLikes();
    this.requestUpdate();
  }

  loadDislikes() {
    var saved = localStorage.getItem('foxGalleryDislikes');
    if (saved) {
      try {
        this.dislikes = JSON.parse(saved) || {};
      } catch (e) {
        this.dislikes = {};
      }
    }
  }
  saveDislikes() {
    try {
        localStorage.setItem('foxGalleryDislikes', JSON.stringify(this.dislikes));
    }
     catch (e) {}
  } 

  handleDislike(id) {
    this.dislikes[id] = (this.dislikes[id] || 0) + 1;
    this.saveDislikes();
    this.requestUpdate();
  }

  async handleShare(idEncoded) {
    // Simple copy-to-clipboard for a stable share link: ?img=<id>
    try {
      const id = decodeURIComponent(idEncoded || "");
      const shareUrl = window.location.origin + window.location.pathname + '?img=' + encodeURIComponent(id);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        return;
      }
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
      } catch (e) {
        console.warn('Fallback copy failed', e);
        alert('Unable to copy link automatically — please select and copy: ' + shareUrl);
      }
      document.body.removeChild(ta);
    } catch (e) {
      console.warn('Copy failed', e);
      alert('Unable to copy link.');
    }
  }
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(FoxProject.tag, FoxProject);


