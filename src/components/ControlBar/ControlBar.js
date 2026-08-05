import { Component, define, html } from "@/lib/core";

import mapping from "./controlBar.module.scss";
import raw from "./controlBar.module.scss?inline";
import "@/components/Input/Input";
import "@/components/Icon/Icon";

export const ControlBar = define("control-bar", { mapping, raw })(
  class extends Component {
    get mode() {
      return this._mode || this.getAttribute("mode") || "view";
    }

    set mode(val) {
      this._mode = val;
    }

    handleSubmit() {
      const input = this.$refs.input?.shadowRoot?.querySelector("input");
      const val = input ? input.value : "";
      this.emit("submit", { detail: { value: val } });
    }

    clear() {
      const input = this.$refs.input?.shadowRoot?.querySelector("input");
      if (input) input.value = "";
    }

    focus() {
      const input = this.$refs.input?.shadowRoot?.querySelector("input");
      if (input) input.focus();
    }

    template() {
      const mode = this.mode;
      const placeholder = this.placeholder || this.getAttribute("placeholder");
      const primaryIcon = this.getAttribute("primary-icon");
      const isLoading = this.loading || this.getAttribute("loading") === "true";

      return html`
        <form
          class="${this.styles.form}"
          @submit.prevent="${(e) => {
            this.handleSubmit(e);
          }}"
        >
          <strong
            class="${this.styles.counter} ${mode === "edit"
              ? this.styles.show
              : ""}"
          >
            <slot name="counter"></slot>
          </strong>
          ${placeholder != null
            ? html`<ky-input
                $input
                class="${this.styles.input} ${mode !== "edit"
                  ? this.styles.show
                  : ""}"
                placeholder="${placeholder}"
                @keydown.enter="${() => {
                  this.handleSubmit();
                }}"
              ></ky-input>`
            : ""}

          <div class="${this.styles.actions}">
            ${primaryIcon != null
              ? html`<button
                  type="submit"
                  class="${this.styles.button} ${mode === "edit"
                    ? this.styles.cancel
                    : ""}"
                  ${isLoading ? "disabled" : ""}
                >
                  <ky-icon
                    name="${primaryIcon}"
                    class="${this.styles.icon} ${isLoading
                      ? this.styles.spin
                      : ""}"
                  ></ky-icon>
                </button>`
              : ""}
            <slot name="actions"></slot>
          </div>
        </form>
      `;
    }
  },
);
