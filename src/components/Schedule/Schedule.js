import { Component, define } from "@/lib/component";
import { switcher } from "@/lib/switcher";
import { scheduleStore } from "@/store/scheduleStore";

import mapping from "./schedule.module.scss";
import raw from "./schedule.module.scss?inline";

import "@/icons/Arrow";
import "@/components/RouteCard/RouteCard";
import "@/components/Description/Description";

export const Schedule = define("ky-schedule", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
    }
    getIcon(item) {
      return switcher(item.type)
        .case((type) => type === "transport", "🚅")
        .case((type) => type === "sightseeing", "📍")
        .case((type) => type === "hotel", "🏨")
        .case((type) => type === "food", "🍣")
        .default(() => "❤️");
    }
    template() {
      const list = scheduleStore.currentDayData;
      return `
        ${list.schedule
          .map(
            (item, index) => `
              <details 
                name="itinerary" 
                class="${this.styles.schedule}" 
                ${index === 0 ? "open" : ""}
              >
                <summary class="${this.styles.shrink}">
                  <i class="${this.styles.icon}">${this.getIcon(item)}</i>
                  <div class="${this.styles.text}">
                    <h2 class="${this.styles.name}">${item.name}</h2>
                    <p class="${this.styles.time}">
                    ${item.time.from} ~ ${item.time.to}
                    </p>
                  </div>
                  <icon-arrow class="${this.styles.arrow}"></icon-arrow>
                </summary>

                <div class="${this.styles.content}">
                  ${
                    item.route
                      ? `<route-card from="${item.route.from}" to="${item.route.to}"></route-card>`
                      : ""
                  }
                  <ky-description data-ref="${index}"></ky-description>
                </div>
              </details>
              `
          )
          .join("")}
      <p class="${this.styles.fallback}">일정을 누르면 여기에 열립니다</p>
    `;
    }
    afterRender() {
      const { schedule } = scheduleStore.currentDayData;

      // 획기적으로 줄어든 데이터 주입 코드
      schedule.forEach((item, index) => {
        this.applyProps({
          [`ky-description[data-ref="${index}"]`]: {
            list: item.description || [],
          },
        });
      });
    }
  }
);
