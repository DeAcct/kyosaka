// components/ToastConsumer/ToastConsumer.js
import { Component, define, html } from "@/lib/core";
import { toastStore } from "@/store/toastStore";
import mapping from "./toastConsumer.module.scss";
import raw from "./toastConsumer.module.scss?inline";

export const ToastConsumer = define("toast-consumer", { mapping, raw })(
  class extends Component {
    setup() {
      // 🔍 스토어 구독: 토스트 추가/삭제 시 자동 리렌더링
      this.subscribe(toastStore);
      this.lastToastCount = 0;
    }

    afterRender() {
      const container = this.$refs.container;
      const currentCount = toastStore.state.toasts.length;

      if (container && typeof container.showPopover === "function") {
        try {
          if (currentCount > 0) {
            if (currentCount !== this.lastToastCount) {
              try {
                container.hidePopover();
              } catch (e) {}
              container.showPopover();
            }
          } else {
            try {
              container.hidePopover();
            } catch (e) {}
          }
        } catch (e) {
          console.warn("Popover control failed:", e);
        }
      }
      this.lastToastCount = currentCount;
    }

    template() {
      const { toasts } = toastStore.state;

      return html`
        <ul $container class="${this.styles.container}" popover="manual">
          ${toasts.map(
            (toast) => html`
              <li
                class="${this.styles.toast}"
                key="${toast.id}"
              >
                <ky-icon
                  name="${this.getIconName(toast.type)}"
                  class="${this.styles.icon} ${this.styles[toast.type]}"
                ></ky-icon>
                <span class="${this.styles.message}">${toast.message}</span>
              </li>
            `,
          )}
        </ul>
      `;
    }

    getIconName(type) {
      const icons = {
        success: "checked",
        error: "error",
        info: "info",
      };
      return icons[type] || "info";
    }
  },
);
