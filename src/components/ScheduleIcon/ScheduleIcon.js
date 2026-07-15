import { Component, define, html } from "@/lib/core";

import mapping from "./scheduleIcon.module.scss";
import raw from "./scheduleIcon.module.scss?inline";

import "@/components/Icon/Icon";

export const ScheduleIcon = define("schedule-icon", { mapping, raw })(
  class extends Component {
    template() {
      return html`<ky-icon name="${this.getAttribute("name")}"></ky-icon>`;
    }
  },
);
