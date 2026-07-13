// components/DatePickerGrid.js
import { Component, define, html } from "@/lib/core";
import mapping from "./grid.module.scss";
import raw from "./grid.module.scss?inline";

export const DatePickerGrid = define("date-picker-grid", { mapping, raw })(
  class extends Component {
    handleDayClick(day) {
      const dateStr = `${this.viewYear}-${String(this.viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      console.log(this.type);
      this.emit("select", { detail: dateStr });
    }

    // components/DatePickerGrid.js

    template() {
      if (this.viewYear === undefined) return html``;

      const firstOfMonth = Temporal.PlainDate.from({
        year: this.viewYear,
        month: this.viewMonth,
        day: 1,
      });
      const daysInMonth = firstOfMonth.daysInMonth;
      const blanksCount = firstOfMonth.dayOfWeek % 7;

      const weekdays = ["일", "월", "화", "수", "목", "금", "토"].map(
        (day) =>
          html`<div class="${this.styles.item} ${this.styles.weekday}">
            ${day}
          </div>`,
      );

      const blanks = Array.from(
        { length: blanksCount },
        () =>
          html`<div
            class="${this.styles.item} ${this.styles.day} ${this.styles.empty}"
          ></div>`,
      );

      const start = this.startDate
        ? Temporal.PlainDate.from(this.startDate)
        : null;
      const end = this.endDate ? Temporal.PlainDate.from(this.endDate) : null;

      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
        (day) => {
          const current = Temporal.PlainDate.from({
            year: this.viewYear,
            month: this.viewMonth,
            day,
          });
          const currentStr = current.toString();

          const isStart =
            start && Temporal.PlainDate.compare(current, start) === 0;
          const isEnd = end && Temporal.PlainDate.compare(current, end) === 0;

          // 🔗 [공통] 계획표 기간 내 전체 음영 타깃 조건 (start <= current <= end)
          const isInRange =
            start &&
            end &&
            Temporal.PlainDate.compare(current, start) >= 0 &&
            Temporal.PlainDate.compare(current, end) <= 0;

          const isActiveDay = this.activeDate && currentStr === this.activeDate;

          let modifiers = "";
          if (isInRange) modifiers += ` ${this.styles.inRange}`;
          if (isStart) modifiers += ` ${this.styles.start}`;
          if (isEnd) modifiers += ` ${this.styles.end}`;
          if (isActiveDay) modifiers += ` ${this.styles.activeDay}`;

          return html`
            <div
              class="${this.styles.item} ${this.styles.day} ${modifiers}"
              @click="${() => this.handleDayClick(day)}"
            >
              <span class="${this.styles.dayText}">${day}</span>
            </div>
          `;
        },
      );

      const allGridItems = [...weekdays, ...blanks, ...days];

      const currentType = this.getAttribute("type") || "range";
      const typeClass =
        currentType === "day" ? this.styles.dayMode : this.styles.rangeMode;

      return html`<div class="${this.styles.grid} ${typeClass}">
        ${allGridItems}
      </div>`;
    }
  },
);
