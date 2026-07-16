import { Component, define, html } from "@/lib/core";
import mapping from "./yoloConfirmSheet.module.scss";
import raw from "./yoloConfirmSheet.module.scss?inline";

import "@/components/BottomSheet/BottomSheet";

export const YoloConfirmSheet = define("yolo-confirm-sheet", { mapping, raw })(
  class extends Component {
    state = {
      prompt: "",
    };

    open(prompt) {
      this.setState("prompt", prompt);
      const sheet = this.$refs.sheet;
      if (sheet) {
        sheet.open();
      }
    }

    close() {
      const sheet = this.$refs.sheet;
      if (sheet) {
        sheet.close();
      }
    }

    handleCancel() {
      this.emit("cancel");
    }

    handleConfirm() {
      this.close();
      this.emit("confirm", { detail: { prompt: this.state.prompt } });
    }

    template() {
      return html`
        <bottom-sheet
          $sheet
          @close="${() => this.handleCancel()}"
        >
          <div class="${this.styles.container}">
            <h3 class="${this.styles.title}">하루 일정 AI 생성</h3>
            <strong class="${this.styles.strong}">${this.state.prompt}</strong>
            <p class="${this.styles.sub}">
              기준으로 하루 일정을 새로 생성할까요?
            </p>
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
                class="${this.styles.button} ${this.styles.primary}"
                @click="${() => this.handleConfirm()}"
              >
                생성해서 덮어쓰기
              </button>
            </div>
          </div>
        </bottom-sheet>
      `;
    }
  },
);
