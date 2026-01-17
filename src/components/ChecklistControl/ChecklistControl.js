// src/components/Checklist/ChecklistInput.js
import { Component, define, html } from "@/lib/core";

import mapping from "./checklistControl.module.scss";
import raw from "./checklistControl.module.scss?inline";

export const ChecklistControl = define("checklist-control", { mapping, raw })(
  class extends Component {
    handleSubmit(e) {
      e.preventDefault();
      console.log(this);
      const $input = this.$refs.input;
      const text = $input.value.trim();

      if (text) {
        this.emit("add", { detail: { text } });
        $input.value = "";
        $input.focus();
      }
    }

    template() {
      return html`
        <form class="${this.styles.form}">
          <input
            name="newItem"
            type="text"
            $input
            placeholder="체크리스트 추가"
            class="${this.styles.input} ${this.mode === "view"
              ? this.styles.show
              : ""}"
          />
          <div class="${this.styles.buttonWrap}">
            <button
              type="button"
              class="${this.styles.button} ${this.mode === "edit"
                ? this.styles.cancel
                : ""}"
              @click="${(e) => {
                if (this.mode === "edit") {
                  this.emit("cancel");
                  return;
                }
                this.handleSubmit(e);
              }}"
            >
              <ky-icon class="${this.styles.icon}">add</ky-icon>
            </button>

            ${this.mode === "edit"
              ? html`<button
                  type="button"
                  class="${this.styles.button}"
                  @click="${(e) => {
                    this.emit("delete");
                  }}"
                >
                  <ky-icon class="${this.styles.icon}">delete</ky-icon>
                </button>`
              : ""}
          </div>
        </form>
      `;
    }
  }
);
