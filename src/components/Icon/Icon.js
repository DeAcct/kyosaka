import { Stateless, define, html } from "@/lib/core";
import { IconLoader } from "@/lib/icon";

import mapping from "./icon.module.scss";
import raw from "./icon.module.scss?inline";

export const Icon = define("ky-icon", { mapping, raw })(
  class extends Stateless {
    template() {
      const currentName = this.name || this.getAttribute("name");
      const icon = IconLoader[currentName] || {
        d: "",
        viewBox: "0 -960 960 960",
      };

      return html`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="${icon.viewBox}"
          class="${this.styles.icon}"
        >
          <path d="${icon.d}" />
        </svg>
      `;
    }
  },
);
