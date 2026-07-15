// DatePicker.js
import { Component, define, html } from "@/lib/core";
import { switcher } from "@/lib/switcher";

import mapping from "./datePicker.module.scss";
import raw from "./datePicker.module.scss?inline";

import { DatePickerHeader } from "./Header";
import { DatePickerGrid } from "./Grid";
import { DatePickerYear } from "./Year";
import "@/components/SwipeWrap/SwipeWrap";

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
    /**
     * 보여주고 있는 연 또는 월을 다음 또는 이전으로 변경합니다.
     * @param {"next"|"prev"} direction 변경할 방향입니다.
     */
    moveCalendar(direction) {
      const _direction = direction === "prev" ? -1 : 1;
      if (this.state.showYearPicker) {
        this.setState("viewYear", this._viewYear + 12 * _direction); //
        return;
      }

      const METHOD_MAP = {
        prev: "subtract",
        next: "add",
      };

      const oldView = Temporal.PlainDate.from({
        year: this._viewYear,
        month: this._viewMonth,
        day: 1,
      });
      // const prevMonthView = oldView.subtract({ months: 1 });
      const newView = oldView[METHOD_MAP[direction]]({ months: 1 });

      this.setState("viewYear", newView.year);
      this.setState("viewMonth", newView.month);
    }

    handleDateSelect(e) {
      const clickedTime = e.detail; // 'YYYY-MM-DD'
      const currentType = this.type || this.getAttribute("type") || "range";

      if (currentType !== "day" && currentType !== "range") {
        throw new Error(
          "정의되지 않은 컴포넌트 타입입니다. day 또는 range 중 하나를 선택해 주세요.",
        );
      }

      if (currentType === "day") {
        this.emit("day-change", { detail: clickedTime });
        return;
      }
      const startDate = this._startDate;
      const endDate = this._endDate;

      const { nextStartDate, nextEndDate } = switcher({
        startDate,
        endDate,
        clickedTime,
      })
        .case(
          ({ startDate, endDate }) => startDate !== endDate,
          () => ({ nextStartDate: clickedTime, nextEndDate: clickedTime }),
        )
        .case(
          ({ startDate, clickedTime }) => clickedTime < startDate,
          () => ({ nextStartDate: clickedTime, nextEndDate: clickedTime }),
        )
        .case(
          ({ startDate, clickedTime }) =>
            Temporal.PlainDate.from(startDate).until(clickedTime, {
              largestUnit: "year",
            }).years >= 1,
          () => {
            console.warn("1년 이상의 플랜은 수립할 수 없습니다.");
            return { nextStartDate: clickedTime, nextEndDate: clickedTime };
          },
        )
        .default(() => ({
          nextStartDate: startDate,
          nextEndDate: clickedTime,
        }));

      this.setState("startDate", nextStartDate);
      this.setState("endDate", nextEndDate);

      this.emit("range-change", {
        detail: { startDate: nextStartDate, endDate: nextEndDate },
      });
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
      const swipeAction = {
        left: () => this.moveCalendar("next"),
        right: () => this.moveCalendar("prev"),
      };
      const showYearPicker = this.state.showYearPicker;
      console.log(this.type);
      return html`
        <date-picker-header
          :view-year="${this._viewYear}"
          :view-month="${this._viewMonth}"
          @prev="${() => {
            this.moveCalendar("prev");
          }}"
          @next="${() => {
            this.moveCalendar("next");
          }}"
          @toggle-year="${() => this.handleToggleYear()}"
        ></date-picker-header>

        <swipe-wrap @swipe="${(e) => swipeAction[e.detail.direction]?.()}">
          ${showYearPicker
            ? html`
                <date-picker-year
                  :current-year="${this._viewYear}"
                  @select="${(e) => this.handleYearSelect(e)}"
                ></date-picker-year>
              `
            : html`
                <date-picker-grid
                  type="${this.getAttribute("type")}"
                  :view-year="${this._viewYear}"
                  :view-month="${this._viewMonth}"
                  :start-date="${this._startDate}"
                  :end-date="${this._endDate}"
                  :active-date="${this.activeDate}"
                  @select="${(e) => this.handleDateSelect(e)}"
                ></date-picker-grid>
              `}
        </swipe-wrap>
      `;
    }
  },
);
