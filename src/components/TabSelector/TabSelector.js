import { Component, define, html } from "@/lib/core";

import mapping from "./tabSelector.module.scss";
import raw from "./tabSelector.module.scss?inline";

export const TabSelector = define("tab-selector", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <nav class="${this.styles.tabs}">
          ${this.tabs.map(
            ({ name, to }) => html`
              <router-link class="${this.styles.tab}" to="${to}">
                ${name}
              </router-link>
            `,
          )}
        </nav>
      `;
    }
  },
);
