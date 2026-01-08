import { Component, define } from "@/lib/dom";
import { scheduleStore } from "@/store/scheduleStore";

import mapping from "./page.schedule.module.scss";
import raw from "./page.schedule.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";

export const SchedulePage = define("page-schedule", { mapping, raw })(
  class extends Component {
    getStyles() {
      return {
        mapping,
        stylesheet,
      };
    }
    template() {
      return `
        <ky-schedule class="${this.styles.doubleCol}">
          <day-selector slot="selector" class="${this.styles.daySelector}"></day-selector>
        </ky-schedule>
    `;
    }
  }
);
