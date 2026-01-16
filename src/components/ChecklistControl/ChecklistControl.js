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
        <form
          class="${this.styles.form}"
          @submit="${(e) => {
            this.handleSubmit(e);
          }}"
        >
          <input
            type="text"
            $input
            placeholder="체크리스트 추가"
            class="${this.styles.input}"
          />
          <button type="submit" class="${this.styles.button}">
            <ky-icon>add</ky-icon>
          </button>
        </form>
      `;
    }
  }
);
