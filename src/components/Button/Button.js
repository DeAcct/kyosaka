import { Component, define, html } from "@/lib/core";
import mapping from "./button.module.scss";
import raw from "./button.module.scss?inline";

export const Button = define("ky-button", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <button class="${this.styles.button}" type="button">
          <slot></slot>
        </button>
      `;
    }
  },
);
