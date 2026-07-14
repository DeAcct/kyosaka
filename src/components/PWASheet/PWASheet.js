import { Component, define, html } from "@/lib/core";
import { toastStore } from "@/store/toastStore";

import mapping from "./pwaSheet.module.scss";
import raw from "./pwaSheet.module.scss?inline";

import { BottomSheet } from "@/components/BottomSheet/BottomSheet";

export const PWASheet = define("pwa-sheet", { mapping, raw })(
  class extends Component {
    deferredPrompt = null;

    onInstallable(e) {
      this.deferredPrompt = e;
      this.$refs.sheet.open();
    }

    async handleInstall() {
      if (!this.deferredPrompt) return;

      this.deferredPrompt.prompt();

      this.reset();
      this.$refs.sheet.close();
    }

    handleCancel() {
      this.$refs.sheet.close();
    }

    reset() {
      this.deferredPrompt = null;
    }

    template() {
      return html`
        <global
          @beforeinstallprompt="${(e) => {
            this.onInstallable(e);
          }}"
          @appinstalled="${() => {
            toastStore.add("앱이 설치되었어요!", "checked", 1500);
          }}"
        ></global>
        <bottom-sheet $sheet @close="${this.reset}">
          <div class="${this.styles.pwaSheet}">
            <strong class="${this.styles.title}">앱을 사용해보실래요?</strong>
            <p class="${this.styles.sub}">
              홈 화면에서 더 빠르게 여행 계획을 만나보세요!
            </p>

            <div class="${this.styles.actions}">
              <button
                class="${this.styles.button}"
                @click="${this.handleCancel}"
              >
                나중에
              </button>
              <button
                class="${this.styles.button} ${this.styles.primary}"
                @click="${this.handleInstall}"
              >
                지금 설치
              </button>
            </div>
          </div>
        </bottom-sheet>
      `;
    }
  },
);
