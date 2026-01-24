// components/BottomSheet/BottomSheet.js
import { Component, define, html } from "@/lib/core";
import mapping from "./bottomSheet.module.scss";
import raw from "./bottomSheet.module.scss?inline";

export const BottomSheet = define("bottom-sheet", { mapping, raw })(
  class extends Component {
    setup() {
      this.startY = 0;
      this.currentY = 0;
      this.isDragging = false;
    }

    open() {
      this.$refs.dialog.showModal();
      this.$refs.content.style.translate = `-50% 0`;
      this.$refs.content.style.opacity = 1;
    }

    close() {
      this.$refs.content.style.translate = `-50% 150%`;
      this.$refs.content.style.opacity = 0;
      this.emit("close");
      this.$refs.dialog.close();
    }

    // 🔍 딤 영역 클릭 시 닫기
    handleBackdropClick(e) {
      if (e.target === this.$refs.dialog) this.close();
    }

    // 🔍 스와이프 로직
    handleTouchStart(e) {
      this.startY = e.touches[0].clientY;
      this.isDragging = true;
      this.$refs.content.style.transition = "none";
    }

    handleTouchMove(e) {
      if (!this.isDragging) return;
      const delta = e.touches[0].clientY - this.startY;
      if (delta > 0) {
        // 아래로만 스와이프
        this.currentY = delta;
        this.$refs.content.style.translate = `-50% ${delta}px`;
      }
    }

    handleTouchEnd() {
      this.isDragging = false;
      this.$refs.content.style.transition = "all 300ms var(--ease-out-expo)";

      if (this.currentY > 150) {
        // 150px 이상 내려가면 닫기
        this.close();
      } else {
        this.$refs.content.style.translate = `-50% 0`;
        this.$refs.content.style.opacity = 1;
      }
      this.currentY = 0;
    }

    template() {
      return html`
        <dialog
          $dialog
          class="${this.styles.dialog}"
          @click="${this.handleBackdropClick}"
        >
          <div
            $content
            class="${this.styles.content}"
            @touchstart="${this.handleTouchStart}"
            @touchmove="${this.handleTouchMove}"
            @touchend="${this.handleTouchEnd}"
          >
            <div class="${this.styles.handleBar}"></div>
            <slot></slot>
          </div>
        </dialog>
      `;
    }
  },
);
