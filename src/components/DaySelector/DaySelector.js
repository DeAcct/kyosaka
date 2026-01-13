import { scheduleStore } from "@/store/scheduleStore";
import { Component, define, html, kyFor } from "@/lib/v2/core";

import mapping from "./daySelector.module.scss";
import raw from "./daySelector.module.scss?inline";

import { Calendar } from "@/icons/Calendar";

export const DaySelector = define("day-selector", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
    }
    onDayClick(e, index) {
      const { selectedDay } = scheduleStore.data;

      if (selectedDay === index) {
        return;
      }
      scheduleStore.commit("selectedDay", index);
      // this.centerActiveButton();
    }
    afterRender() {
      this.centerActiveButton();
    }
    centerActiveButton() {
      const { selectedDay } = scheduleStore.data;

      if (this.$refs.button) {
        const $button = this.$refs.button[selectedDay];
        $button.scrollIntoView({
          behavior: "smooth", // 부드럽게
          inline: "center", // 👈 핵심: 가로 중앙 정렬
          block: "nearest", // 세로 위치는 유지
        });
      }
    }
    get days() {
      return scheduleStore.allList.map(({ name, day, description }) => ({
        name,
        day,
        description,
      }));
    }
    formatter(day) {
      return Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
      }).format(new Date(day));
    }

    template() {
      const { selectedDay } = scheduleStore.data;
      return html`
        <global-event @resize="${this.centerActiveButton}"></global-event>
        <div class="${this.styles.daySelector}">
          <div class="${this.styles.scrollClip}">
            <ul class="${this.styles.scrollBody}">
              ${this.days.map(
                ({ name, day, description }, index) => html`
                  <li
                    class="${this.styles.item}"
                    key="${this.formatter(day)}, ${name}"
                  >
                    <button
                      class="${this.styles.button} ${selectedDay === index
                        ? this.styles.selected
                        : ""}"
                      @click="${(e) => this.onDayClick(e, index)}"
                      $button
                    >
                      <span>${index + 1}일차</span>
                      <strong> ${this.formatter(day)} </strong>
                    </button>
                  </li>
                `
              )}
            </ul>
          </div>
        </div>
      `;
    }
  }
);
