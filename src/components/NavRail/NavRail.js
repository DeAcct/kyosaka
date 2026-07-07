import { Component, define, html } from "@/lib/core";

import mapping from "./navRail.module.scss";
import raw from "./navRail.module.scss?inline";

export const NavRail = define("nav-rail", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <nav class="${this.styles.navRail}">
          <div class="${this.styles.actions}"></div>
          <ul class="${this.styles.plans}"></ul>
        </nav>
      `;
    }
  },
);
