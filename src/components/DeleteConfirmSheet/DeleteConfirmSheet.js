import { Component, define, html } from "@/lib/core";
import "@/components/ModalSheet/ModalSheet";

import mapping from "./deleteConfirmSheet.module.scss";
import raw from "./deleteConfirmSheet.module.scss?inline";

export const DeleteConfirmSheet = define("delete-confirm-sheet", {
  mapping,
  raw,
})(
  class extends Component {
    open() {
      this.$refs.sheet.open();
    }

    close() {
      this.$refs.sheet.close();
    }

    handleConfirm() {
      this.emit("confirm", { bubbles: true });
      this.close();
    }

    template() {
      return html`
        <modal-sheet
          $sheet
          exportparts="content"
          @close="${() => this.emit("close")}"
        >
          <div class="${this.styles.content}">
            <slot></slot>
            <div class="${this.styles.actions}">
              <button
                class="${this.styles.button}"
                @click="${() => this.close()}"
              >
                취소
              </button>
              <button
                class="${this.styles.button} ${this.styles.delete}"
                @click="${() => this.handleConfirm()}"
              >
                삭제
              </button>
            </div>
          </div>
        </modal-sheet>
      `;
    }
  },
);
