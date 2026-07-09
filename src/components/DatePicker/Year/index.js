// components/Year.js
import { Component, define, html } from "@/lib/core";
import mapping from "./year.module.scss";
import raw from "./year.module.scss?inline";

export const DatePickerYear = define("date-picker-year", { mapping, raw })(
  class extends Component {
    template() {
      if (!this.currentYear) return html``;

      // 🔍 주입받은 연도를 기준으로 앞뒤 12개년 그리드 스코프 계산
      const baseYear = parseInt(this.currentYear, 10);
      const startYear = baseYear - 4; // 현재 보고 있는 연도가 중앙 즈음 위치하도록 배치
      const years = Array.from({ length: 12 }, (_, i) => startYear + i);

      return html`
        <div class="${this.styles.year}">
          ${years.map((year) => {
            const isSelected = year === baseYear;

            return html`
              <div
                class="${this.styles.item} ${isSelected
                  ? this.styles.selected
                  : ""}"
                @click="${() => this.emit("select", { detail: year })}"
              >
                ${year}
              </div>
            `;
          })}
        </div>
      `;
    }
  },
);
