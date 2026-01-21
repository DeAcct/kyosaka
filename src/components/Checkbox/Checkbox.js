import { Component, define, html } from "@/lib/core";
import mapping from "./checkbox.module.scss";
import raw from "./checkbox.module.scss?inline";

export const Checkbox = define("ky-checkbox", { mapping, raw })(
  class extends Component {
    static shadowOptions = {
      mode: "open",
      delegatesFocus: true,
    };
    static formAssociated = true;
    static shadowOptions = { mode: "open", delegatesFocus: true };

    ghostClick(e) {
      if (e.composedPath()[0] !== this) return;
      const $input = this.$refs.input;
      if ($input) {
        $input.click();
      }
    }

    template() {
      const isChecked = this.hasAttribute("checked");

      if (this._internals) {
        this._internals.setFormValue(isChecked ? "on" : "off");
        this._internals.ariaChecked = isChecked ? "true" : "false";
      }
      return html`
        <host @click="${this.ghostClick}"></host>
        <input
          type="checkbox"
          ?checked="${isChecked}"
          class="${this.styles.input} sr-only"
          @change="${(e) => {
            this.emit("change", { bubbles: true, composed: true });
          }}"
          $input
        />
        <ky-icon
          class="${this.styles.real}"
          :name="${isChecked ? "checked" : "circle"}"
        >
        </ky-icon>
      `;
    }
  },
);
