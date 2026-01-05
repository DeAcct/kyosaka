import { Component, define } from "@/lib/component";
import { scheduleStore } from "@/store/scheduleStore";

import mapping from "./app.module.scss";
import raw from "./app.module.scss?inline";

import "@/components/Header/Header";
import "@/components/Schedule/Schedule";
import "@/components/Fallback/Fallback";

export const App = define("ky-app", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
    }
    getStyles() {
      return {
        mapping,
        stylesheet,
      };
    }
    template() {
      const { list } = scheduleStore.data;
      return `
      <ky-header></ky-header>
      <main class="${this.styles.app}">
        ${
          list.length !== 0
            ? `<ky-schedule class="${this.styles.doubleCol}"></ky-schedule>`
            : "<ky-fallback></ky-fallback>"
        }
      </main>
    `;
    }
  }
);
