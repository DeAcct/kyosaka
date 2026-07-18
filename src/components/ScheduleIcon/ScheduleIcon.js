import { Stateless, define, html } from "@/lib/core";

import mapping from "./scheduleIcon.module.scss";
import raw from "./scheduleIcon.module.scss?inline";

import "@/components/Icon/Icon";

export const ScheduleIcon = define("schedule-icon", { mapping, raw })(
  class extends Stateless {
    template() {
      return html`<ky-icon name="${this.getAttribute("name")}"></ky-icon>`;
    }
  },
);
