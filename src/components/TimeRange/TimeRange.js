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
      start: "09:00",
      end: "18:00",
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
        this.start || this.getAttribute("start-time") || "09:00";
      const endProp = this.end || this.getAttribute("end-time") || "18:00";

      if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startProp)) {
        this.state.start = startProp;
      }
      if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endProp)) {
        this.state.end = endProp;
      }
    }

    handleChange(target, { detail }) {
      const next = detail.value;
      if (this.state[target] !== next) {
        this.setState(target, next);
        this.emitChange();
      }
    }

    emitChange() {
      this.emit("change", {
        detail: {
          start: this.state.start,
          end: this.state.end,
        },
      });
    }

    template() {
      return html`
        <div class="${this.styles.container}">
          <ky-input
            type="time"
            placeholder="시작"
            value="${this.state.start}"
            @change="${(e) => this.handleChange("start", e)}"
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
            value="${this.state.end}"
            @change="${(e) => this.handleChange("end", e)}"
            part="end"
            class="${this.styles.input}"
          ></ky-input>
        </div>
      `;
    }
  },
);
