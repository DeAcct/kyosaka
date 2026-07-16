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
    }

    template() {
      const { toasts } = toastStore.state;

      return html`
        <ul class="${this.styles.container}">
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
