import { Component, define, html } from "@/lib/core";

import mapping from "./header.module.scss";
import raw from "./header.module.scss?inline";

export const Header = define("ky-header", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <header class="${this.styles.header}">
          <h1>쿄사카</h1>
        </header>
      `;
    }
  }
);
