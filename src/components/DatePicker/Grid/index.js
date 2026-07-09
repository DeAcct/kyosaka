// components/DatePickerGrid.js
import { Component, define, html } from "@/lib/core";
import mapping from "./grid.module.scss";
import raw from "./grid.module.scss?inline";

export const DatePickerGrid = define("date-picker-grid", { mapping, raw })(
  class extends Component {
    handleDayClick(day) {
      // 패딩 처리를 통해 'YYYY-MM-DD' 정격 규격 문자열 생산
      const dateStr = `${this.viewYear}-${String(this.viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // 🎯 [교정] 부모(DatePicker.js)의 @select 와 가뿐하게 이름을 일치시킵니다.
      this.emit("select", { detail: dateStr });
    }

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

      // 2. 월 시작 전의 빈 날짜(blanks) 배열 생성
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

      // 실제 날짜 칸 빌드
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
        (day) => {
          const current = Temporal.PlainDate.from({
            year: this.viewYear,
            month: this.viewMonth,
            day,
          });

          const isStart =
            start && Temporal.PlainDate.compare(current, start) === 0;
          const isEnd = end && Temporal.PlainDate.compare(current, end) === 0;
          const isSelected = isStart || isEnd;

          const isInRange =
            start &&
            end &&
            Temporal.PlainDate.compare(current, start) > 0 &&
            Temporal.PlainDate.compare(current, end) < 0;
          const hasRange =
            start && end && Temporal.PlainDate.compare(start, end) !== 0;

          let modifiers = "";
          if (isSelected) modifiers += ` ${this.styles.selected}`;
          if (isInRange) modifiers += ` ${this.styles.inRange}`;
          if (isStart && hasRange) modifiers += ` ${this.styles.start}`;
          if (isEnd && hasRange) modifiers += ` ${this.styles.end}`;

          // 🎯 [구조 개선] 텍스트 레이어 분리 기법 적용 (dayText)
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

      // cocktail JS 엔진의 연속 Comment 마커 버그 우회를 위한 단일 flat 배열 구조 유지
      const allGridItems = [...weekdays, ...blanks, ...days];

      return html` <div class="${this.styles.grid}">${allGridItems}</div> `;
    }
  },
);
