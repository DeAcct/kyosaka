// DatePicker.js
import { Component, define, html } from "@/lib/core";
import { switcher } from "@/lib/switcher";

import mapping from "./datePicker.module.scss";
import raw from "./datePicker.module.scss?inline";

import { DatePickerHeader } from "./Header";
import { DatePickerGrid } from "./Grid";
import { DatePickerYear } from "./Year";
import { SwipeWrap } from "@/components/SwipeWrap/SwipeWrap";

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

    // const METHOD_MAP = {
    //   prev: "substract",
    //   next: "add"
    // }
    // handlePrevMonth() {
    //   // 🎯 연도 피커 뷰 모드일 때는 대구간(12년 전) 이동 버스로 변모
    //   if (this.state.showYearPicker) {
    //     this.setState("viewYear", this._viewYear - 12); //
    //     return;
    //   }

    //   const currentView = Temporal.PlainDate.from({
    //     year: this._viewYear,
    //     month: this._viewMonth,
    //     day: 1,
    //   });
    //   const prevMonthView = currentView.subtract({ months: 1 });

    //   this.setState("viewYear", prevMonthView.year);
    //   this.setState("viewMonth", prevMonthView.month);
    // }

    // handleNextMonth() {
    //   // 🎯 연도 피커 뷰 모드일 때는 대구간(12년 후) 이동 버스로 변모
    //   if (this.state.showYearPicker) {
    //     this.setState("viewYear", this._viewYear + 12); //
    //     return;
    //   }

    //   const currentView = Temporal.PlainDate.from({
    //     year: this._viewYear,
    //     month: this._viewMonth,
    //     day: 1,
    //   });
    //   const nextMonthView = currentView.add({ months: 1 });

    //   this.setState("viewYear", nextMonthView.year);
    //   this.setState("viewMonth", nextMonthView.month);
    // }
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
      const startDate = this._startDate;
      const endDate = this._endDate;

      // 🎯 switcher 유틸리티를 활용해 연립부등식 조건 분기 뎁스를 1단계로 파괴
      const { nextStartDate, nextEndDate } = switcher({
        startDate,
        endDate,
        clickedTime,
      })
        // 조건 1: 이미 시작일과 종료일이 달라서 범위가 형성되어 있는 경우 -> 시작점으로 지정
        .case(
          ({ startDate, endDate }) => startDate !== endDate,
          () => ({ nextStartDate: clickedTime, nextEndDate: clickedTime }),
        )
        // 조건 2: 날짜 하나만 찍혀서 대기 중인데, 현재 선택된 날짜보다 과거를 클릭한 경우 -> 1년 가드 검사 후 시작점으로 리셋
        .case(
          ({ startDate, clickedTime }) => clickedTime < startDate,
          () => ({ nextStartDate: clickedTime, nextEndDate: clickedTime }),
        )
        // 조건 3: 날짜 하나만 찍혀서 대기 중인데, 1년 이상 미래를 클릭 -> 리셋
        .case(
          ({ startDate, clickedTime }) =>
            Temporal.PlainDate.from(startDate).until(clickedTime, {
              largestUnit: "year",
            }).years >= 1,
          () => {
            return { nextStartDate: clickedTime, nextEndDate: clickedTime };
          },
        )
        // 기본값 (조건 4): 정상적인 1년 미만의 미래 날짜를 찍은 경우 -> 그대로 반영
        .default(() => ({
          nextStartDate: startDate,
          nextEndDate: clickedTime,
        }));

      // 1. 내부 상태 동기 동기화
      this.setState("startDate", nextStartDate);
      this.setState("endDate", nextEndDate);

      console.log(nextStartDate, nextEndDate);

      // 2. 부모 컴포넌트에 정제 데이터 실시간 즉시 송출
      this.emit("change", {
        detail: {
          startDate: nextStartDate,
          endDate: nextEndDate,
        },
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
      return html`
        <div class="${this.styles.container}">
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
                    :view-year="${this._viewYear}"
                    :view-month="${this._viewMonth}"
                    :start-date="${this._startDate}"
                    :end-date="${this._endDate}"
                    @select="${(e) => this.handleDateSelect(e)}"
                  ></date-picker-grid>
                `}
          </swipe-wrap>
        </div>
      `;
    }
  },
);
