import { Component, define, html } from "@/lib/core";
import { switcher } from "@/lib/switcher";
import { scheduleStore } from "@/store/scheduleStore";
import { useSwipe } from "@/hooks/touch";

import mapping from "./schedule.module.scss";
import raw from "./schedule.module.scss?inline";

import { Description } from "@/components/Description/Description";
import { Fallback } from "@/components/Fallback/Fallback";
import { RouteCard } from "@/components/RouteCard/RouteCard";
import { SwipeWrap } from "@/components/SwipeWrap/SwipeWrap";
import { Icon } from "@/components/Icon/Icon";

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

    daySwipe({ detail }) {
      return switcher(detail)
        .case(
          ({ direction }) => direction === "left",
          () => scheduleStore.nextDay(),
        )
        .case(
          ({ direction }) => direction === "right",
          () => scheduleStore.prevDay(),
        )
        .default(() => {
          throw new Error(
            `정의되지 않은 방향이 감지되었습니다.\n(Event detail: ${JSON.stringify(detail)})`,
          );
        });
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
        <swipe-wrap
          @swipe="${(e) => {
            this.daySwipe(e);
          }}"
        >
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
                  <ky-icon
                    class="${this.styles.arrow}"
                    name="chevron"
                  ></ky-icon>
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
            `,
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
  },
);
