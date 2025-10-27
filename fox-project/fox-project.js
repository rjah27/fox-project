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
        background-color: var(--ddd-theme-accent);
        font-family: var(--ddd-font-navigation);
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
    `];
  }

  // Lit render the HTML
  render() {
    return html`
<div class="wrapper">
  <h3><span>${this.t.title}:</span> ${this.title}</h3>
  <slot></slot>

  ${this.photos && this.photos.length
      ? html`
        <div class="slideshow">
          <button class="control" @click=${this._prev} aria-label="Previous">◀</button>
          <photo-card .photo=${this.photos[this.currentIndex]}></photo-card>
          <button class="control" @click=${this._next} aria-label="Next">▶</button>
        </div>
        <div class="counter">${this.currentIndex + 1} / ${this.photos.length}</div>
      `
      : html`<div>Loading photos…</div>`}

</div>`;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    this._loadPhotos();
  }

  async _loadPhotos() {
    try {
      const url = new URL("./lib/photos.json", import.meta.url).href;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch photos');
      const json = await res.json();
      this.photos = json.photos || [];
      this.currentIndex = 0;
    } catch (e) {
      // keep photos empty on error
      console.error(e);
    }
  }

  _prev() {
    if (!this.photos || !this.photos.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
  }

  _next() {
    if (!this.photos || !this.photos.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
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