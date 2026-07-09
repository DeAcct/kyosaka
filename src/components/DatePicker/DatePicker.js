// DatePicker.js
import { Component, define, html } from "@/lib/core";
import mapping from "./datePicker.module.scss";
import raw from "./datePicker.module.scss?inline";

import { DatePickerHeader } from "./Header";
import { DatePickerGrid } from "./Grid";
import { DatePickerYear } from "./Year";

export const DatePicker = define("date-picker", { mapping, raw })(
  class extends Component {
    setup() {
      this.state = {
        viewYear: null,
        viewMonth: null,
        startDate: null,
        endDate: null,
        showYearPicker: false,
      };
    }

    _resolve(stateValue, propValue, fallback) {
      // 사용자가 직접 조작한 내부 상태
      if (stateValue !== null && stateValue !== undefined) return stateValue;
      // 외부에서 주입된 유효한 프로퍼티
      if (propValue !== undefined && propValue !== null) return propValue;
      // 둘 다 없으면 시스템 기본값
      return typeof fallback === "function" ? fallback() : fallback;
    }

    get defaultDate() {
      return Temporal.Now.plainDateISO();
    }

    get _startDate() {
      return this._resolve(this.state.startDate, this.startDate, () =>
        this.defaultDate.toString(),
      );
    }

    get _endDate() {
      return this._resolve(
        this.state.endDate,
        this.endDate,
        () => this._startDate,
      );
    }

    // 🔍 구형 Date 분쇄 및 Temporal 인스턴스에서 연도 추출
    get _viewYear() {
      return this._resolve(
        this.state.viewYear,
        this.viewYear,
        () => Temporal.PlainDate.from(this._startDate).year,
      );
    }

    // 🔍 구형 Date 분쇄 및 Temporal 인스턴스에서 정직한 월(1~12) 추출
    get _viewMonth() {
      return this._resolve(
        this.state.viewMonth,
        this.viewMonth,
        () => Temporal.PlainDate.from(this._startDate).month,
      );
    }

    handlePrevMonth() {
      // 🎯 연도 피커 뷰 모드일 때는 대구간(12년 전) 이동 버스로 변모
      if (this.state.showYearPicker) {
        this.setState("viewYear", this._viewYear - 12); //
        return;
      }

      const currentView = Temporal.PlainDate.from({
        year: this._viewYear,
        month: this._viewMonth,
        day: 1,
      });
      const prevMonthView = currentView.subtract({ months: 1 });

      this.setState("viewYear", prevMonthView.year);
      this.setState("viewMonth", prevMonthView.month);
    }

    handleNextMonth() {
      // 🎯 연도 피커 뷰 모드일 때는 대구간(12년 후) 이동 버스로 변모
      if (this.state.showYearPicker) {
        this.setState("viewYear", this._viewYear + 12); //
        return;
      }

      const currentView = Temporal.PlainDate.from({
        year: this._viewYear,
        month: this._viewMonth,
        day: 1,
      });
      const nextMonthView = currentView.add({ months: 1 });

      this.setState("viewYear", nextMonthView.year);
      this.setState("viewMonth", nextMonthView.month);
    }

    handleDateSelect(e) {
      const clickedTime = e.detail; // 'YYYY-MM-DD' 문자열 규격
      const startDate = this._startDate;
      const endDate = this._endDate;

      let nextStartDate = startDate;
      let nextEndDate = endDate;

      // ISO 문자열('YYYY-MM-DD') 간의 부등호 비교는 자바스크립트 엔진에서 완벽하게 정렬 연산됩니다.
      if (startDate === endDate) {
        if (clickedTime < startDate) {
          nextStartDate = clickedTime;
          nextEndDate = clickedTime;
        } else {
          nextEndDate = clickedTime;
        }
      } else {
        nextStartDate = clickedTime;
        nextEndDate = clickedTime;
      }

      this.setState("startDate", nextStartDate);
      this.setState("endDate", nextEndDate);

      console.log(nextStartDate, nextEndDate);

      this.emit("change", {
        detail: {
          startDate: nextStartDate,
          endDate: nextEndDate,
        },
      }); //
    }

    handleToggleYear() {
      this.setState("showYearPicker", !this.state.showYearPicker);
    }

    handleYearSelect(e) {
      const selectedYear = e.detail;
      this.setState("viewYear", selectedYear);
      this.setState("showYearPicker", false);
    }

    template() {
      const showYearPicker = this.state.showYearPicker;
      return html`
        <div class="${this.styles.container}">
          <date-picker-header
            :view-year="${this._viewYear}"
            :view-month="${this._viewMonth}"
            @prev="${() => {
              this.handlePrevMonth();
            }}"
            @next="${() => {
              this.handleNextMonth();
            }}"
            @toggle-year="${() => this.handleToggleYear()}"
          ></date-picker-header>

          ${showYearPicker
            ? html`
                <date-picker-year
                  :current-year="${this._viewYear}"
                  @select="${(e) => this.handleYearSelect(e)}"
                ></date-picker-year>
              `
            : html`
                <date-picker-grid
                  :view-year="${this._viewYear}"
                  :view-month="${this._viewMonth}"
                  :start-date="${this._startDate}"
                  :end-date="${this._endDate}"
                  @select="${(e) => this.handleDateSelect(e)}"
                ></date-picker-grid>
              `}
        </div>
      `;
    }
  },
);
