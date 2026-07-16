import { Component, define, html } from "@/lib/core";
import { toastStore } from "@/store/toastStore";

import mapping from "./positionBox.module.scss";
import raw from "./positionBox.module.scss?inline";

import "@/components/Icon/Icon";

export const PositionBox = define("position-box", { mapping, raw })(
  class extends Component {
    get mapUrl() {
      if (
        this.data.map &&
        this.data.map.trim() &&
        this.data.map.startsWith("http")
      ) {
        return this.data.map;
      }
      const query = this.data.address
        ? `${this.data.name} ${this.data.address}`
        : this.data.name;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
    }

    async handleCopy() {
      try {
        await navigator.clipboard.writeText(this.data.address);

        // 햅틱 피드백 (폴드 7의 진동 활용)
        if (navigator.vibrate) navigator.vibrate(30);

        // 💡 토스트 메시지 알림 (시스템에 Toast 기능이 있다고 가정)
        // 혹은 간단히 alert나 UI 상태로 피드백을 줍니다.
        toastStore.add("주소를 복사했어요!", "info", 3000);
      } catch (err) {
        console.error("복사 실패:", err);
      }
    }
    template() {
      return html`
        <div class="${this.styles.positionBox}">
          <div class="${this.styles.infoBox}">
            <strong class="${this.styles.name}">${this.data.name}</strong>
            <address class="${this.styles.address}">
              ${this.data.address}
            </address>
          </div>
          <div class="${this.styles.actions}">
            <button
              class="${this.styles.actionItem}"
              @click="${() => this.handleCopy()}"
            >
              <ky-icon
                name="copy"
                class="${this.styles.icon}"
              ></ky-icon>
              <span>주소 복사</span>
            </button>
            <a
              class="${this.styles.actionItem}"
              href="${this.mapUrl}"
              target="_blank"
            >
              <ky-icon
                name="map"
                class="${this.styles.icon}"
              ></ky-icon>
              <span>지도 보기</span>
            </a>
          </div>
        </div>
      `;
    }
  },
);
