import { Component, define, html } from "@/lib/core";

import { Icon } from "@/components/Icon/Icon";

import mapping from "./header.module.scss";
import raw from "./header.module.scss?inline";

import { scheduleStore } from "@/store/scheduleStore";
import { navStore } from "@/store/navStore";

export const Header = define("ky-header", { mapping, raw })(
  class extends Component {
    get actions() {
      return ["import", "export"];
    }
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
          <button type="button" class="${this.styles.button}">
            <ky-icon name="export" class="${this.styles.icon}"></ky-icon>
          </button>
        </header>
      `;
    }
  },
);
