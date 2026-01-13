import { Component, define, html } from "@/lib/core";
import { switcher } from "@/lib/switcher";
import { scheduleStore } from "@/store/scheduleStore";
import { useSwipe } from "@/hooks/touch";

import mapping from "./schedule.module.scss";
import raw from "./schedule.module.scss?inline";

import { Arrow } from "@/icons/Arrow";
import { Description } from "@/components/Description/Description";
import { Fallback } from "@/components/Fallback/Fallback";
import { RouteCard } from "@/components/RouteCard/RouteCard";
import { SwipeWrap } from "@/components/SwipeWrap/SwipeWrap";

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
      const list = scheduleStore.currentDayList;

      if (!list) {
        return html`<ky-fallback></ky-fallback>`;
      }
      return html`
        <slot name="selector"></slot>
        <div class="${this.styles.colBG}">
          <p class="${this.styles.emptyHolder}">일정을 누르면 열립니다</p>
        </div>
        <swipe-wrap>
          ${list.schedule.map(
            (item, index) => html`
              <details
                name="itinerary"
                class="${this.styles.schedule}"
                $details
                style="--schedule-rows:${list.schedule.length +
                1}; --i:${index};"
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
                  <strong class="${this.styles.contentTitle}">
                    ${item.name}
                  </strong>
                  ${item.route
                    ? html`<route-card
                        :from="${item.route.from}"
                        :to="${item.route.to}"
                      ></route-card>`
                    : ""}
                  <ky-description
                    :list="${item.description || []}"
                  ></ky-description>
                </div>
              </details>
            `
          )}
        </swipe-wrap>
      `;
    }
    afterRender() {
      const list = scheduleStore.currentDayList;
      if (!list) {
        return;
      }
      this.$refs.details[0]?.setAttribute("open", "");
    }
  }
);
