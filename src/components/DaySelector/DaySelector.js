import { scheduleStore } from "@/store/scheduleStore";
import { Component, define, html, kyFor } from "@/lib/core";

import mapping from "./daySelector.module.scss";
import raw from "./daySelector.module.scss?inline";

export const DaySelector = define("day-selector", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
    }
    onDayClick(e, index) {
      const currentPlan = scheduleStore.selectedPlan;

      if (currentPlan && currentPlan.selected !== index) {
        scheduleStore.changeDay(index);
      }
    }
    afterRender() {
      this.centerActiveButton();
    }
    centerActiveButton() {
      const { selected, data } = scheduleStore.selectedPlan;

      if (this.$refs.button) {
        const $button = this.$refs.button[selected];
        $button.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
    get days() {
      // 🔍 selectedPlan이나 내부 data 배열이 없는 순간에는 안전하게 빈 배열([])을 반환
      return (
        scheduleStore.selectedPlan?.data?.map(({ name, day, description }) => ({
          name,
          day,
          description,
        })) || []
      );
    }
    formatter(day) {
      return Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
      }).format(new Date(day));
    }

    template() {
      const { selected, data } = scheduleStore.selectedPlan;
      return html`
        <global @resize="${this.centerActiveButton}"></global>
        <div class="${this.styles.daySelector}">
          <div class="${this.styles.scrollClip}">
            <ul class="${this.styles.scrollBody}">
              ${this.days.map(
                ({ name, day, description }, index) => html`
                  <li
                    class="${this.styles.item}"
                    data-key="${this.formatter(day)}, ${name}"
                  >
                    <button
                      class="${this.styles.button} ${selected === index
                        ? this.styles.selected
                        : ""}"
                      @click="${(e) => this.onDayClick(e, index)}"
                      $button
                    >
                      <span>${name}</span>
                      <strong> ${this.formatter(day)} </strong>
                    </button>
                  </li>
                `,
              )}
            </ul>
          </div>
        </div>
      `;
    }
  },
);
