// components/DaySelector.js
import { scheduleStore } from "@/store/scheduleStore";
import { Component, define, html } from "@/lib/core";

import mapping from "./daySelector.module.scss";
import raw from "./daySelector.module.scss?inline";

import { Icon } from "@/components/Icon/Icon";
import { DatePicker } from "@/components/DatePicker/DatePicker";

export const DaySelector = define("day-selector", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
      // 🎯 아코디언의 강제 개폐 통제 및 DatePicker 동기화를 위한 로컬 상태 주입
      this.state = { isOpen: false };
    }

    // 🔍 스토어에서 선택된 플랜 안전하게 픽업
    get selectedPlan() {
      return scheduleStore.selectedPlan || { selected: 0, data: [] };
    }

    get days() {
      return this.selectedPlan.data || [];
    }

    // 🔍 현재 활성화된 일차의 상세 데이터를 추출하는 게터
    get currentDayInfo() {
      const { selected } = this.selectedPlan;
      return (
        this.days[selected] || {
          name: "지정된 일정 없음",
          day: "",
          description: "",
        }
      );
    }

    // 🔍 현재 플랜의 첫날과 마지막날 구간을 연산하여 달력의 이탈 가드로 전달
    get tripBounds() {
      if (this.days.length === 0) return { start: null, end: null };
      const sorted = [...this.days].sort((a, b) => a.day.localeCompare(b.day));
      return {
        start: sorted[0].day,
        end: sorted[sorted.length - 1].day,
      };
    }

    formatter(day) {
      if (!day) return "";
      return Temporal.PlainDate.from(day).toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
      });
    }

    handleDayChange(e) {
      const targetDayStr = e.detail;
      const targetIndex = this.days.findIndex(
        (item) => item.day === targetDayStr,
      );

      if (targetIndex !== -1) {
        scheduleStore.changeDay(targetIndex);
      }

      this.setState("isOpen", false);
    }

    template() {
      const { selected } = this.selectedPlan;
      const current = this.currentDayInfo;
      const bounds = this.tripBounds;
      const isOpen = this.state.isOpen;

      return html`
        <details class="${this.styles.schedule}" ?open="${isOpen}">
          <summary
            class="${this.styles.shrink}"
            @click="${(e) => {
              e.preventDefault(); // 브라우저 고유 무반응 개폐를 막고 바인딩 상태 루프로 통제합니다.
              this.setState("isOpen", !isOpen);
            }}"
          >
            <div class="${this.styles.text}">
              <div class="${this.styles.titleRow}">
                <strong class="${this.styles.time}"
                  >${this.formatter(current.day)}</strong
                >
                <span class="${this.styles.name}">${current.name}</span>
              </div>
              ${current.description
                ? html`<p class="${this.styles.description}">
                    ${current.description}
                  </p>`
                : html``}
            </div>

            <ky-icon class="${this.styles.arrow}" name="chevron"></ky-icon>
          </summary>

          <div class="${this.styles.content}">
            <date-picker
              type="day"
              :start-date="${bounds.start}"
              :end-date="${bounds.end}"
              :active-date="${current.day}"
              @day-change="${(e) => this.handleDayChange(e)}"
            ></date-picker>
          </div>
        </details>
      `;
    }
  },
);
