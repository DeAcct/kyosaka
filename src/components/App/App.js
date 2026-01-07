import { Component, define } from "@/lib/dom";
import { scheduleStore } from "@/store/scheduleStore";

import mapping from "./app.module.scss";
import raw from "./app.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Header } from "@/components/Header/Header";
import { Schedule } from "@/components/Schedule/Schedule";

export const App = define("ky-app", { mapping, raw })(
  class extends Component {
    getStyles() {
      return {
        mapping,
        stylesheet,
      };
    }
    template() {
      return `
      <ky-header></ky-header>
      <main class="${this.styles.app}">
        <ky-schedule class="${this.styles.doubleCol}">
          <day-selector slot="selector"></day-selector>
        </ky-schedule>
      </main>
    `;
    }
  }
);
