// components/ModalSheet/ModalSheet.js
import { Component, define, html } from "@/lib/core";
import mapping from "./modalSheet.module.scss";
import raw from "./modalSheet.module.scss?inline";

export const ModalSheet = define("modal-sheet", { mapping, raw })(
  class extends Component {
    setup() {
      this.startY = 0;
      this.currentY = 0;
      this.isDragging = false;
      this.scrollEl = null;
      this.state = {
        passthrough: false,
      };
    }

    open(options = {}) {
      const isPassthrough =
        options.passthrough ??
        options.noBackdrop ??
        this.hasAttribute("passthrough") ??
        this.hasAttribute("no-backdrop");

      this.setState("passthrough", Boolean(isPassthrough));

      const dialog = this.$refs.dialog;
      if (dialog) {
        if (dialog.open && typeof dialog.close === "function") {
          dialog.close();
        }
        if (isPassthrough) {
          if (typeof dialog.show === "function") {
            dialog.show();
          } else {
            dialog.setAttribute("open", "");
          }
        } else {
          if (typeof dialog.showModal === "function") {
            dialog.showModal();
          } else {
            dialog.setAttribute("open", "");
          }
          document.documentElement.classList.add("is-locked");
        }
      }

      this.$refs.content.style.setProperty("--translate-y", "0px");
      this.$refs.content.style.opacity = 1;
    }

    close() {
      if (this.$refs.content) {
        this.$refs.content.style.opacity = 0;
        this.$refs.content.style.setProperty("--translate-y", "100%");
      }
      this.emit("close");
      if (this.$refs.dialog) {
        if (typeof this.$refs.dialog.close === "function") {
          this.$refs.dialog.close();
        } else {
          this.$refs.dialog.removeAttribute("open");
        }
      }
      document.documentElement.classList.remove("is-locked");
    }

    // 🔍 딤 영역 클릭 시 닫기
    handleBackdropClick(e) {
      if (!this.state.passthrough && e.target === this.$refs.dialog) {
        this.close();
      }
    }

    // 🔍 스와이프 로직
    handleTouchStart(e) {
      this.startY = e.touches[0].clientY;
      this.currentY = 0;
      this.isDragging = true;
      this.$refs.content.style.transition = "none";

      this.scrollEl = null;

      const path = e.composedPath();

      for (const cur of path) {
        if (cur === this || cur === this.$refs.content) {
          break;
        }

        if (cur && cur.nodeType === 1) {
          const style = window.getComputedStyle(cur);
          if (
            (style.overflowY === "auto" || style.overflowY === "scroll") &&
            cur.scrollHeight > cur.clientHeight
          ) {
            this.scrollEl = cur;
            break;
          }
        }
      }
    }

    handleTouchMove(e) {
      if (!this.isDragging) return;
      const currentY = e.touches[0].clientY;
      const delta = currentY - this.startY;

      if (this.scrollEl) {
        if (this.scrollEl.scrollTop > 0) {
          return;
        }
        if (delta < 0) {
          return;
        }
      }

      if (delta > 0) {
        if (e.cancelable) e.preventDefault();
        this.currentY = delta;
        this.$refs.content.style.setProperty("--translate-y", `${delta}px`);
      }
    }

    handleTouchEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.$refs.content.style.transition = "all 300ms var(--ease-out-expo)";

      if (this.currentY > 150) {
        this.close();
      } else {
        this.$refs.content.style.setProperty("--translate-y", `0px`);
        this.$refs.content.style.opacity = 1;
      }
      this.currentY = 0;
      this.scrollEl = null;
    }

    template() {
      const isPassthrough =
        this.state.passthrough ||
        this.hasAttribute("passthrough") ||
        this.hasAttribute("no-backdrop");

      return html`
        <dialog
          $dialog
          class="${this.styles.dialog} ${isPassthrough
            ? this.styles.passthrough
            : ""}"
          @click="${(e) => this.handleBackdropClick(e)}"
        >
          <div
            part="content"
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
