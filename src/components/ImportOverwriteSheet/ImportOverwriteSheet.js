import { Component, define, html } from "@/lib/core";
import { scheduleStore } from "@/store/scheduleStore";
import mapping from "./importOverwriteSheet.module.scss";
import raw from "./importOverwriteSheet.module.scss?inline";

import "@/components/ModalSheet/ModalSheet";
import "@/components/PlanItem/PlanItem";

export const ImportOverwriteSheet = define("import-overwrite-sheet", {
  mapping,
  raw,
})(
  class extends Component {
    state = {
      importData: null,
    };

    open(data) {
      this.setState("importData", data);
      this.$refs.sheet?.open();
    }

    close() {
      this.$refs.sheet?.close();
    }

    handleCancel() {
      this.setState("importData", null);
      this.emit("cancel");
    }

    handleConfirm() {
      if (this.state.importData) {
        scheduleStore.overwritePlan(this.state.importData);
      }
      this.close();
      this.emit("confirm");
    }

    template() {
      const existingPlan = this.state.importData
        ? scheduleStore.getPlan(this.state.importData.id)
        : null;

      return html`
        <modal-sheet
          $sheet
          @close="${() => this.handleCancel()}"
        >
          <div class="${this.styles.container}">
            <strong class="${this.styles.title}"
              >동일한 시간표가 존재합니다</strong
            >
            <p class="${this.styles.sub}">
              가져오면 아래 일정이 완전히 덮어쓰기 됩니다.
            </p>

            ${existingPlan
              ? html`
                  <plan-item
                    :id="${existingPlan.id}"
                    :edited="${existingPlan.edited}"
                    :title="${existingPlan.title}"
                    style="pointer-events: none; margin-bottom: 2rem;"
                  ></plan-item>
                `
              : ""}

            <div class="${this.styles.actions}">
              <button
                type="button"
                class="${this.styles.button}"
                @click="${() => this.close()}"
              >
                취소
              </button>
              <button
                type="button"
                class="${this.styles.button} ${this.styles.danger}"
                @click="${() => this.handleConfirm()}"
              >
                덮어쓰기
              </button>
            </div>
          </div>
        </modal-sheet>
      `;
    }
  },
);
