import { Component, define, html } from "@/lib/core";
import { scheduleStore } from "@/store/scheduleStore";
import "@/components/ModalSheet/ModalSheet";
import "@/components/Select/Select";

import mapping from "./checklistMoveSheet.module.scss";
import raw from "./checklistMoveSheet.module.scss?inline";

export const ChecklistMoveSheet = define("checklist-move-sheet", {
  mapping,
  raw,
})(
  class extends Component {
    setup() {
      this.state = { currentValue: "__common__", targetIds: null };
      this.subscribe(scheduleStore);
    }

    open({ currentDay, targetIds } = {}) {
      const val =
        currentDay === null || currentDay === undefined
          ? "__common__"
          : String(currentDay);
      this.setState("currentValue", val);
      this.setState("targetIds", targetIds || null);
      this.$refs.sheet.open();
    }

    close() {
      this.$refs.sheet.close();
    }

    handleConfirm() {
      const val = this.$refs.kySelect?.value;
      const dayIndex = val === "__common__" ? null : Number(val);
      this.emit("confirm", {
        bubbles: true,
        detail: { dayIndex, ids: this.state.targetIds },
      });
      this.close();
    }

    template() {
      const days = scheduleStore.selectedPlan?.data || [];

      const options = [
        { value: "__common__", label: "공통" },
        ...days.map((_, idx) => ({
          value: String(idx),
          label: `${idx + 1}일차`,
        })),
      ];

      return html`
        <modal-sheet
          $sheet
          @close="${() => this.emit("close")}"
        >
          <div class="${this.styles.content}">
            <h3 class="${this.styles.title}">이동할 위치 선택</h3>
            <ky-select
              $ky-select
              :options="${options}"
              :value="${this.state.currentValue}"
              icon="label"
              class="${this.styles.select}"
            ></ky-select>
            <div class="${this.styles.actions}">
              <button
                class="${this.styles.button} ${this.styles.primary} ${this
                  .styles.delete}"
                @click="${() => this.handleConfirm()}"
              >
                이동
              </button>
            </div>
          </div>
        </modal-sheet>
      `;
    }
  },
);
