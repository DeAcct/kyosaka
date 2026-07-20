import { Component, define, html } from "@/lib/core";
import { useLongPress } from "@/hooks/touch";

import mapping from "./checklistItem.module.scss";
import raw from "./checklistItem.module.scss?inline";

import "@/components/Checkbox/Checkbox";

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
      const isSelectMode = this.selectmode || false;
      const { pointerdown, pointermove, pointerup, pointerleave } =
        this.longPressHandlers;

      return html`
        <host
          @pointerdown="${pointerdown}"
          @pointerup="${pointerup}"
          @pointermove="${pointermove}"
          @pointerleave="${pointerleave}"
          @contextmenu.prevent="${() => {}}"
          @click="${(e) => {
            if (isSelectMode) {
              e.stopPropagation();
              e.preventDefault();
              this.emit("item-click", { detail: { id } });
            }
          }}"
        ></host>
        <label class="${this.styles.label}">
          <ky-checkbox
            :checked="${checked}"
            ?disabled="${isSelectMode}"
            @change="${(e) => {
              e?.stopPropagation?.();
              if (!isSelectMode) {
                this.emit("toggle", { detail: { id } });
              }
            }}"
            class="${this.styles.checkbox}"
          ></ky-checkbox>
          <span>${text}</span>
        </label>
      `;
    }
  },
);
