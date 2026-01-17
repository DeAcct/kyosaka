import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";
import { useLongPress } from "@/hooks/touch";

import mapping from "./checklistItem.module.scss";
import raw from "./checklistItem.module.scss?inline";

import { Checkbox } from "@/components/Checkbox/Checkbox";

export const ChecklistItem = define("checklist-item", { mapping, raw })(
  class extends Component {
    setup() {
      // 🔍 롱프레스 핸들러 정의
      this.longPressHandlers = useLongPress(() => {
        this.emit("longpress", {
          detail: { id: this.item.id },
          bubbles: true,
          composed: true,
        });
      });
    }

    template() {
      const { checked, text, id } = this.item;
      const { pointerdown, pointerup, pointerleave, contextmenu } =
        this.longPressHandlers;

      return html`
        <li
          class="${this.styles.item}"
          @pointerdown="${pointerdown}"
          @pointerup="${pointerup}"
          @pointerleave="${pointerleave}"
          @contextmenu="${contextmenu}"
        >
          <label class="${this.styles.label}">
            <ky-checkbox
              ?checked="${checked}"
              @change="${() => {
                this.emit("toggle", { detail: { id } });
              }}"
              ?disabled="${this.selectmode}"
            ></ky-checkbox>
            <span>${text}</span>
          </label>
        </li>
      `;
    }
  }
);
