// src/components/Checklist/ChecklistInput.js
import { Component, define, html } from "@/lib/core";

import mapping from "./controlBar.module.scss";
import raw from "./controlBar.module.scss?inline";

export const ControlBar = define("control-bar", { mapping, raw })(
  class extends Component {
    template() {
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
          <div class="${this.styles.box}">
            <slot></slot>
            ${this.mode === "edit"
              ? html`<button
                  type="button"
                  class="${this.styles.button}"
                  @click="${(e) => {
                    this.emit("delete");
                  }}"
                >
                  <ky-icon class="${this.styles.icon}" name="delete"></ky-icon>
                </button>`
              : ""}
          </div>
        </form>
      `;
    }
  },
);
