import { html, fixture, expect } from '@open-wc/testing';
import "../fox-project.js";

describe("FoxProject test", () => {
  let element;
  beforeEach(async () => {
    element = await fixture(html`
      <fox-project
        title="title"
      ></fox-project>
    `);
  });

  it("basic will it blend", async () => {
    expect(element).to.exist;
  });

  it("passes the a11y audit", async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
