import { Component, define, html } from "@/lib/core";
import "@/components/ModalSheet/ModalSheet";

import mapping from "./checklistDeleteSheet.module.scss";
import raw from "./checklistDeleteSheet.module.scss?inline";

export const ChecklistDeleteSheet = define("checklist-delete-sheet", {
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

    handleDelete() {
      this.emit("confirm", { bubbles: true });
      this.close();
    }

    template() {
      return html`
        <modal-sheet
          $sheet
          @close="${() => this.emit("close")}"
        >
          <div class="${this.styles.content}">
            <h3 class="${this.styles.title}">항목을 삭제하시겠습니까?</h3>
            <div class="${this.styles.actions}">
              <button
                class="${this.styles.button}"
                @click="${() => this.close()}"
              >
                취소
              </button>
              <button
                class="${this.styles.button} ${this.styles.primary} ${this
                  .styles.delete}"
                @click="${() => this.handleDelete()}"
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
