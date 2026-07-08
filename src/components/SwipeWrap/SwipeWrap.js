import { Component, define, html } from "@/lib/core";
import { scheduleStore } from "@/store/scheduleStore";
import { useSwipe } from "@/hooks/touch";

export const SwipeWrap = define("swipe-wrap")(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
      this.swipe = useSwipe({
        left: () => this.emit("swipe", { detail: { direction: "left" } }),
        right: () => this.emit("swipe", { detail: { direction: "right" } }),
      });
    }

    template() {
      return html`
        <host
          @pointerdown="${this.swipe.start}"
          @pointermove="${this.swipe.move}"
          @pointerup="${this.swipe.end}"
          @pointercancel="${this.swipe.end}"
          style="touch-action: pan-y; user-select: none; -webkit-user-drag: none;"
        ></host>
        <slot></slot>
      `;
    }
  },
);
