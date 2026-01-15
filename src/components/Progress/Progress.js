import { Component, define, html } from "@/lib/core";

import mapping from "./progress.module.scss";
import raw from "./progress.module.scss?inline";

export const Progress = define("ky-progress", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <div class="${this.styles.back}">
          <span class="${this.styles.body}" style="--progress:${this.progress}">
          </span>
        </div>
        <slot></slot>
      `;
    }
  }
);
