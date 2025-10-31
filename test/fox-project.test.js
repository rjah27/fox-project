import { expect, fixture, html } from '@open-wc/testing';
import './fox-project.js';

describe('fox-project', () => {
  it('is defined', async () => {
    const el = await fixture(html`<fox-project></fox-project>`);
    expect(el).to.exist;
  });
});
