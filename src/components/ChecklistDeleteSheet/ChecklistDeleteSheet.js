import { Component, define, html } from "@/lib/core";
import "@/components/ModalSheet/ModalSheet";

import mapping from "./checklistDeleteSheet.module.scss";
import raw from "./checklistDeleteSheet.module.scss?inline";

export const ChecklistDeleteSheet = define("checklist-delete-sheet", {
  mapping,
  raw,
})(
  class extends Component {
    setup() {
      this.state = { count: 1, targetIds: null };
    }

    open({ count = 1, targetIds } = {}) {
      this.setState("count", count);
      this.setState("targetIds", targetIds || null);
      this.$refs.sheet.open();
    }

    close() {
      this.$refs.sheet.close();
    }

    handleDelete() {
      this.emit("confirm", {
        bubbles: true,
        detail: { ids: this.state.targetIds },
      });
      this.close();
    }

    template() {
      const { count } = this.state;
      const title =
        count > 1 ? `${count}개 항목을 삭제하시겠습니까?` : "항목을 삭제하시겠습니까?";

      return html`
        <modal-sheet
          $sheet
          exportparts="content"
          @close="${() => this.emit("close")}"
        >
          <div class="${this.styles.content}">
            <h3 class="${this.styles.title}">${title}</h3>
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
