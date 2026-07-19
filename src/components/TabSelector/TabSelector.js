import { Component, define, html } from "@/lib/core";

import mapping from "./tabSelector.module.scss";
import raw from "./tabSelector.module.scss?inline";

export const TabSelector = define("tab-selector", { mapping, raw })(
  class extends Component {
    template() {
      const activeValue = this.getAttribute("value");
      
      return html`
        <div class="${this.styles.tabs}">
          ${this.tabs.map(
            (tab) =>
              tab.to
                ? html`
                    <router-link
                      class="${this.styles.tab}"
                      to="${tab.to}"
                    >
                      ${tab.name}
                    </router-link>
                  `
                : html`
                    <button
                      type="button"
                      class="${this.styles.tab}"
                      aria-selected="${activeValue === tab.value}"
                      @click="${() => this.emit("change", { detail: tab.value })}"
                    >
                      ${tab.name}
                    </button>
                  `
          )}
        </div>
      `;
    }
  },
);
