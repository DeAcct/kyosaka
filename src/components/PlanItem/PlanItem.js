import { Component, define, html } from "@/lib/core";

import mapping from "./planItem.module.scss";
import raw from "./planItem.module.scss?inline";

import { scheduleStore } from "@/store/scheduleStore";
import { navStore } from "@/store/navStore";
import { useTimeFormat } from "@/hooks/time";
import { useLongPress } from "@/hooks/touch";

export const PlanItem = define("plan-item", { mapping, raw })(
  class extends Component {
    setup() {
      // 🔍 롱프레스 핸들러 정의
      this.longPressHandlers = useLongPress(() => {
        this.emit("longpress");
      });
    }
    template() {
      const { id, edited, title, editmode } = this;
      const { pointerdown, pointermove, pointerup, pointerleave } =
        this.longPressHandlers;
      return html`
        <li
          class="${this.styles.planItem} ${id === scheduleStore.selectedPlan.id
            ? this.styles.selected
            : ""}"
        >
          <button
            class="${this.styles.button}"
            @click="${() => {
              console.log(editmode);
              if (editmode) {
                return;
              }
              scheduleStore.changePlan(id);
              navStore.close();
            }}"
            @pointerdown="${pointerdown}"
            @pointerup="${pointerup}"
            @pointermove="${pointermove}"
            @pointerleave="${pointerleave}"
            @contextmenu.prevent="${() => {}}"
          >
            <strong class="${this.styles.title}">${title}</strong>
            <p class="${this.styles.edited}">
              ${useTimeFormat(edited)} 전 수정
            </p>
          </button>
        </li>
      `;
    }
  },
);
