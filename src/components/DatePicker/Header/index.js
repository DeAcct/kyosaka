// components/DatePickerHeader.js
import { Component, define, html } from "@/lib/core";
import mapping from "./header.module.scss";
import raw from "./header.module.scss?inline";
import "@/components/Icon/Icon";

export const DatePickerHeader = define("date-picker-header", { mapping, raw })(
  class extends Component {
    template() {
      // updateProps에 의해 부모의 데이터가 this.viewYear로 직접 주입됨
      if (this.viewYear === undefined) return html``;
      const monthLabels = [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ];

      return html`
        <header class="${this.styles.header}">
          <button
            class="${this.styles.button}"
            @click="${() => this.emit("prev")}"
            type="button"
          >
            <ky-icon name="back" class="${this.styles.back}"></ky-icon>
          </button>
          <button
            class="${this.styles.month}"
            @click="${() => this.emit("toggle-year")}"
            type="button"
          >
            ${this.viewYear}년 ${monthLabels[this.viewMonth - 1]}
          </button>
          <button
            class="${this.styles.button}"
            @click="${() => this.emit("next")}"
            type="button"
          >
            <ky-icon name="back" class="${this.styles.next}"></ky-icon>
          </button>
        </header>
      `;
    }
  },
);
