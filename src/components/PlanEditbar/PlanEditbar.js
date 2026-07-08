import { Component, define, html } from "@/lib/core";

import mapping from "./planEditbar.module.scss";
import raw from "./planEditbar.module.scss?inline";

export const PlanEditbar = define("plan-editbar", { mapping, raw })(
  class extends Component {
    requestDelete() {
      this.$refs.sheet.open();
    }
    onDelete() {
      this.emit("delete");
    }
    exit() {
      this.emit("exit");
    }

    template() {
      const { counter } = this;

      return html`
        <div class="${this.styles.planEditbar} ">
          <button
            type="button"
            class="${this.styles.button} ${this.styles.cancel}"
            @click="${this.exit}"
          >
            <ky-icon name="exit" class="${this.styles.icon}"></ky-icon>
            취소
          </button>
          <button
            type="button"
            class="${this.styles.button} ${counter === 0
              ? this.styles.disabled
              : ""}"
            @click="${this.requestDelete}"
          >
            <ky-icon name="delete" class="${this.styles.icon}"></ky-icon>
            삭제 (${counter})
          </button>
        </div>
        <bottom-sheet $sheet>
          <div class="${this.styles.editSheet}">
            <strong class="${this.styles.title}"
              >정말 ${counter}개의 여행 계획표를 삭제하시겠어요?</strong
            >
            <p class="${this.styles.sub}">삭제 후 복구할 수 없어요</p>

            <div class="${this.styles.actions}">
              <button
                class="${this.styles.button}"
                @click="${() => {
                  this.$refs.sheet.close();
                  this.exit();
                }}"
              >
                취소
              </button>
              <button
                class="${this.styles.button} ${this.styles.primary}"
                @click="${this.onDelete}"
              >
                삭제
              </button>
            </div>
          </div>
        </bottom-sheet>
      `;
    }
  },
);
