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
        (e, target) => {
          const index = parseInt(target.dataset.ref);
          if (!isNaN(index)) {
            scheduleStore.commit("selectedDay", index);
          }
        },
        { signal }
      );
    }
    afterRender() {
      this.centerActiveButton();
    }
    centerActiveButton() {
      const { selectedDay } = scheduleStore.data;

      const $activeBtn = this.$selector(
        `.${this.styles.button}[data-ref="${selectedDay}"]`
      );

      if ($activeBtn) {
        $activeBtn.scrollIntoView({
          behavior: "smooth", // 부드럽게
          inline: "center", // 👈 핵심: 가로 중앙 정렬
          block: "nearest", // 세로 위치는 유지
        });
      }
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
                  <li class="${this.styles.item}">
                    <button 
                      class="${this.styles.button} ${
                    selectedDay === index ? this.styles.selected : ""
                  }" 
                      data-ref="${index}"
                    >
                      <span>${index + 1}일차</span>
                      <strong>
                        ${this.formatter(day)}
                      </strong>
                    </button>
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
