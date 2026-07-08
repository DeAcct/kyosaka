import { Component, define, html } from "@/lib/core";

import { Icon } from "@/components/Icon/Icon";

import mapping from "./header.module.scss";
import raw from "./header.module.scss?inline";

import { useJSONUpload } from "@/hooks/file";
import { scheduleStore } from "@/store/scheduleStore";
import { navStore } from "@/store/navStore";

export const Header = define("ky-header", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
    }
    get actions() {
      return [{ icon: "export", action: this.exportJSON }];
    }

    exportJSON() {}
    template() {
      return html`
        <header class="${this.styles.header}">
          <button class="${this.styles.button}" type="button" @click="${() => {
            navStore.toggle();
          }}">
            <ky-icon name="hamburger" class="${this.styles.icon}"></ky-icon>
          </button>
          <h1 class="sr-only">쿄사카</h2>
          <h2 class="${this.styles.text}">
            ${scheduleStore.selectedPlan.title || "계획표"}
          </h2>
          ${this.actions.map(
            ({ icon, action }) => html`
              <button
                type="button"
                class="${this.styles.button}"
                @click="${action}"
              >
                <ky-icon name="${icon}" class="${this.styles.icon}"></ky-icon>
              </button>
            `,
          )}

          
        </header>
      `;
    }
  },
);
