import { scheduleStore } from "@/store/scheduleStore";
import { Component, define } from "@/lib/dom";

import mapping from "./daySelector.module.scss";
import raw from "./daySelector.module.scss?inline";

import { Calendar } from "@/icons/Calendar";

export const DaySelector = define("day-selector", { mapping, raw })(
  class extends Component {
    _observer = null;
    setup() {
      this.subscribe(scheduleStore);
    }
    initEventListeners(signal) {
      this.addEvent(
        "click",
        `.${this.styles.button}`,
        (e) => {
          const index = parseInt(e.target.dataset.index);
          scheduleStore.commit("selectedDay", index);
        },
        signal
      );
    }
    // afterRender() {
    //   const { selectedDay } = scheduleStore.data;
    //   const $buttons = this.shadowRoot.querySelectorAll(
    //     `.${this.styles.button}`
    //   );

    //   $buttons.forEach(($btn, index) => {
    //     const isSelected = index === selectedDay;
    //     // 기존 요소를 유지하며 클래스만 토글
    //     $btn.classList.toggle(this.styles.selected, isSelected);
    //   });
    // }
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
      return `
        <div class="${this.styles.daySelector}">
          <div class="${this.styles.scrollClip}">
            <ul class="${this.styles.scrollBody}">
              ${this.days
                .map(
                  ({ name, day, description }, index) => `
                  <li>
                    <button class="${this.styles.button} ${
                    selectedDay === index ? this.styles.selected : ""
                  }" data-index="${index}">${this.formatter(day)}</button>
                  </li>
                  `
                )
                .join("")}
            </ul>
          </div>
        </div>
        `;
    }
  }
);
