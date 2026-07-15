import { Component, define, html } from "@/lib/core";
import mapping from "./timeRange.module.scss";
import raw from "./timeRange.module.scss?inline";

import "@/components/Icon/Icon";

export const TimeRange = define("time-range", { mapping, raw })(
  class extends Component {
    static get observedAttributes() {
      return ["start-time", "end-time"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (this.isConnected && oldValue !== newValue) {
        this.initRange();
      }
    }

    state = {
      startTime: "09:00",
      endTime: "18:00",
    };

    setup() {
      this.initRange();
    }

    onPropsPatchComplete() {
      if (this.isConnected) {
        this.initRange();
      }
    }

    initRange() {
      const startProp =
        this.startTime || this.getAttribute("start-time") || "09:00";
      const endProp = this.endTime || this.getAttribute("end-time") || "18:00";

      if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startProp)) {
        this.state.startTime = startProp;
      }
      if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endProp)) {
        this.state.endTime = endProp;
      }
    }

    handleStartChange(e) {
      const nextStart = e.target.value;
      if (this.state.startTime !== nextStart) {
        this.setState("startTime", nextStart);
        this.emitChange();
      }
    }

    handleEndChange(e) {
      const nextEnd = e.target.value;
      if (this.state.endTime !== nextEnd) {
        this.setState("endTime", nextEnd);
        this.emitChange();
      }
    }

    emitChange() {
      this.emit("change", {
        detail: {
          startTime: this.state.startTime,
          endTime: this.state.endTime,
        },
      });
    }

    template() {
      return html`
        <div class="${this.styles.container}">
          <ky-input
            type="time"
            placeholder="시작"
            value="${this.state.startTime}"
            @change="${this.handleStartChange}"
            part="start"
            class="${this.styles.input}"
          ></ky-input>
          <ky-icon
            name="chevron"
            class="${this.styles.icon}"
          ></ky-icon>
          <ky-input
            type="time"
            placeholder="종료"
            value="${this.state.endTime}"
            @change="${this.handleEndChange}"
            part="end"
            class="${this.styles.input}"
          ></ky-input>
        </div>
      `;
    }
  },
);
