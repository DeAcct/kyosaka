import { Stateless, define, html } from "@/lib/core";
import { toastStore } from "@/store/toastStore";

import mapping from "./positionBox.module.scss";
import raw from "./positionBox.module.scss?inline";

import "@/components/Icon/Icon";

function isDomestic(name = "", address = "") {
  const text = `${name} ${address}`;
  const domesticPattern = /대한민국|서울|경기|인천|강원|충북|충남|전북|전남|경북|경남|제주|부산|대구|광주|대전|울산|세종|특별시|광역시|특별자치/i;
  if (domesticPattern.test(text)) return true;

  const krAddressPattern = /[가-힣]+(?:시|군|구|읍|면|동|리|가|로|길)\s?\d*/;
  return krAddressPattern.test(address);
}

export const PositionBox = define("position-box", { mapping, raw })(
  class extends Stateless {
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
      const qStr = query.trim();
      if (isDomestic(this.data.name, this.data.address)) {
        return `https://map.naver.com/p/search/${encodeURIComponent(qStr)}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(qStr)}`;
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

export const PositionList = define("ky-position-list", { mapping, raw })(
  class extends Stateless {
    template() {
      if (!this.list || this.list.length === 0) return html``;
      return html`
        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
          ${this.list.map(
            (location) =>
              html`<position-box :data="${location}"></position-box>`,
          )}
        </div>
      `;
    }
  },
);
