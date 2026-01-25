// src/components/Checklist/ChecklistInput.js
import { Component, define, html } from "@/lib/core";

import mapping from "./checklistControl.module.scss";
import raw from "./checklistControl.module.scss?inline";

export const ChecklistControl = define("checklist-control", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <form
          class="${this.styles.form}"
          @submit.prevent="${(e) => {
            this.handleSubmit(e);
          }}"
        >
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
        </form>
      `;
    }
  },
);
