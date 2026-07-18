import { Stateless, define, html } from "@/lib/core";

import mapping from "./tabSelector.module.scss";
import raw from "./tabSelector.module.scss?inline";

export const TabSelector = define("tab-selector", { mapping, raw })(
  class extends Stateless {
    template() {
      return html`
        <div class="${this.styles.tabs}">
          ${this.tabs.map(
            ({ name, to }) => html`
              <router-link class="${this.styles.tab}" to="${to}">
                ${name}
              </router-link>
            `,
          )}
        </div>
      `;
    }
  },
);
