import { Component, define, html } from "@/lib/core";

import mapping from "./description.module.scss";
import raw from "./description.module.scss?inline";

export const Description = define("ky-description", { mapping, raw })(
  class extends Component {
    template() {
      return html` <ul class="${this.styles.description}">
        ${this.list.map(
          (desc) => html`<li class="${this.styles.item}">${desc}</li>`,
        )}
      </ul>`;
    }
  },
);
