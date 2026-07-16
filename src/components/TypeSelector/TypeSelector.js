// components/TypeSelector/TypeSelector.js
import { Component, define, html } from "@/lib/core";
import mapping from "./typeSelector.module.scss";
import raw from "./typeSelector.module.scss?inline";

import "@/components/Icon/Icon";

export const TypeSelector = define("type-selector", { mapping, raw })(
  class extends Component {
    handleSelect(value) {
      this.emit("change", { detail: { value } });
    }

    centerActiveButton() {
      console.log(this.$refs.button);
      if (this.$refs.button) {
        const buttons = Array.isArray(this.$refs.button)
          ? this.$refs.button
          : [this.$refs.button];
        const activeBtn = buttons.find((btn) =>
          btn.classList.contains(this.styles.active),
        );
        if (activeBtn) {
          activeBtn.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
        }
      }
    }

    afterRender() {
      this.centerActiveButton();
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
                $button
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
