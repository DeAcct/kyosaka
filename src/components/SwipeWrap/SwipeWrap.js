import { Component, define, html } from "@/lib/core";
import { scheduleStore } from "@/store/scheduleStore";
import { useSwipe } from "@/hooks/touch";

export const SwipeWrap = define("swipe-wrap")(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
      this.swipe = useSwipe({
        left: () => scheduleStore.nextDay(),
        right: () => scheduleStore.prevDay(),
      });
    }

    template() {
      return html`
        <host
          @pointerdown="${this.swipe.start}"
          @pointermove="${this.swipe.move}"
          @pointerup="${this.swipe.end}"
          @pointercancel="${this.swipe.end}"
          style="display: contents; touch-action: pan-y; user-select: none; -webkit-user-drag: none;"
        ></host>
        <slot></slot>
      `;
    }
  }
);
