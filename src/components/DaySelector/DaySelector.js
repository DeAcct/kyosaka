import { scheduleStore } from "@/store/scheduleStore";
import { Component, define, html, kyFor } from "@/lib/core";

import mapping from "./daySelector.module.scss";
import raw from "./daySelector.module.scss?inline";

import { Icon } from "@/components/Icon/Icon";

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
      const { selected } = scheduleStore.selectedPlan;

      if (!this.$refs.button) {
        return;
      }

      let $button = this.$refs.button;
      if (Array.isArray(this.$refs.button)) {
        $button = this.$refs.button[selected];
      }

      if (!$button) {
        return;
      }

      $button.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
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
      // YYYY-MM-DD 문자열을 안전한 PlainDate 인스턴스로 변환 후 즉시 포맷팅
      return Temporal.PlainDate.from(day).toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
      });
    }
    // AS-IS)
    // 수정할 부분을 서로 다른 컴포넌트에 흩뿌려놓기

    // TO-BE)
    // - 상단 헤더에 "편집"버튼을 통해 이름/기간/설명 편집 가능
    // - 세부 일정의 수정은 아코디언 내부 수정버튼에 맡기기
    // 공통적으로 모든 수정 작업은 라우트 전환이 없는 별도 전체화면 뷰를 통해 진행된다.

    // addNewDay() {
    //   const newDayIndex = scheduleStore.addDay();
    //   scheduleStore.changeDay(newDayIndex);
    //   this.centerActiveButton();
    // }
    // editDays() {}

    template() {
      const { selected, data } = scheduleStore.selectedPlan;
      return html`
        <global
          @resize="${() => {
            this.centerActiveButton();
          }}"
        ></global>
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

// <button
//   class="${this.styles.actionButton}"
//   @click="${this.addNewDay}"
// >
//   <ky-icon name="editDays">날짜 변경</ky-icon>
// </button>
