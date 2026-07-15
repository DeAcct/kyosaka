import { Component, define, html } from "@/lib/core";

import mapping from "./root.page.module.scss";
import raw from "./root.page.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";

export const RootPage = define("page-root", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <ky-schedule class="${this.styles.doubleCol}">
          <day-selector
            slot="selector"
            class="${this.styles.daySelector}"
          ></day-selector>
        </ky-schedule>
      `;
    }
  },
);

