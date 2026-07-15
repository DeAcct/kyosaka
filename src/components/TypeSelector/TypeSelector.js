// components/TypeSelector/TypeSelector.js
import { Component, define, html } from "@/lib/core";
import mapping from "./typeSelector.module.scss";
import raw from "./typeSelector.module.scss?inline";

import "@/components/Icon/Icon";

export const TypeSelector = define("ky-type-selector", { mapping, raw })(
  class extends Component {
    handleSelect(value, e) {
      this.emit("change", { detail: { value } });
      this.centerChip(e.currentTarget, true);
    }

    centerChip(chipEl, smooth = true) {
      if (!chipEl) return;

      chipEl.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        inline: "center",
        block: "nearest",
      });
    }

    afterRender() {
      const activeChip = this.querySelector(`.${this.styles.active}`);
      if (activeChip) {
        this.centerChip(activeChip);
      }
    }

    template() {
      const items = this.items || [];
      const value = this.getAttribute("value") || "";

      return html`
        <div class="${this.styles.typeSelector}">
          ${items.map(
            (t) => html`
              <button
                type="button"
                class="${this.styles.typeChip} ${value === t.value
                  ? this.styles.active
                  : ""}"
                @click="${(e) => this.handleSelect(t.value, e)}"
              >
                <ky-icon
                  class="${this.styles.icon}"
                  name="${t.icon}"
                ></ky-icon>
                <span class="${this.styles.chipLabel}">${t.label}</span>
              </button>
            `,
          )}
        </div>
      `;
    }
  },
);
