import { Component, define, html } from "@/lib/core";

import mapping from "./controlBar.module.scss";
import raw from "./controlBar.module.scss?inline";
import "@/components/Input/Input";
import "@/components/Icon/Icon";

export const ControlBar = define("control-bar", { mapping, raw })(
  class extends Component {
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
      const placeholder = this.getAttribute("placeholder");
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
            class="${this.styles.counter} ${this.mode === "edit"
              ? this.styles.show
              : ""}"
          >
            <slot name="counter"></slot>
          </strong>
          ${placeholder != null
            ? html`<ky-input
                $input
                class="${this.styles.input} ${this.mode !== "edit"
                  ? this.styles.show
                  : ""}"
                placeholder="${placeholder}"
                @keydown.enter="${() => {
                  this.handleSubmit();
                }}"
              ></ky-input>`
            : ""}

          <slot></slot>

          ${primaryIcon != null
            ? html`<button
                type="submit"
                class="${this.styles.button} ${this.mode === "edit"
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

          <button
            type="button"
            class="${this.styles.button} ${this.styles.delete} ${this.mode !== "edit"
              ? this.styles.hide
              : ""}"
            @click="${(e) => {
              this.emit("delete");
            }}"
          >
            <ky-icon
              class="${this.styles.icon}"
              name="delete"
            ></ky-icon>
          </button>
        </form>
      `;
    }
  },
);
