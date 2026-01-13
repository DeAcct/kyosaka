import { Component, define, html } from "@/lib/v2/core";
import { scheduleStore } from "@/store/scheduleStore";
import { useSwipe } from "@/hooks/touch";

import mapping from "./swipeWrap.module.scss";
import raw from "./swipeWrap.module.scss?inline";

export const SwipeWrap = define("swipe-wrap", { mapping, raw })(
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
        <host-event
          @pointerdown="${this.swipe.start}"
          @pointermove="${this.swipe.move}"
          @pointerup="${this.swipe.end}"
          @pointercancel="${this.swipe.end}"
        ></host-event>
        <host-event></host-event>
        <slot></slot>
      `;
    }
  }
);
