// src/components/Checklist/ChecklistInput.js
import { Component, define, html } from "@/lib/core";

import mapping from "./checklistInput.module.scss";
import raw from "./checklistInput.module.scss?inline";

export const ChecklistInput = define("checklist-input", { mapping, raw })(
  class extends Component {
    handleSubmit(e) {
      e.preventDefault();
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
        <form class="${this.styles.form}" @submit="${this.handleSubmit}">
          <input
            type="text"
            $input
            placeholder="필요한 준비물을 입력하세요"
            class="${this.styles.input}"
          />
          <button type="submit" class="${this.styles.addButton}">
            <ky-icon>add</ky-icon>
          </button>
        </form>
      `;
    }
  }
);
