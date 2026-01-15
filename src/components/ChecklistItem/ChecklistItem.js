import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";

import mapping from "./checklistItem.module.scss";
import raw from "./checklistItem.module.scss?inline";

import { Checkbox } from "@/components/Checkbox/Checkbox";

export const ChecklistItem = define("checklist-item", { mapping, raw })(
  class extends Component {
    // 🔍 부모로부터 item 데이터를 prop으로 전달받음
    template() {
      const { checked, text, id } = this.item;
      return html`
        <li class="${this.styles.item}">
          <label class="${this.styles.label}">
            <ky-checkbox
              ?checked="${checked}"
              @change="${() => {
                this.emit("toggle", { detail: { id } });
              }}"
            ></ky-checkbox>
            <span>${text}</span>
          </label>
        </li>
      `;
    }
  }
);
