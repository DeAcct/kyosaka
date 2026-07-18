import { Stateless, define, html } from "@/lib/core";

import mapping from "./description.module.scss";
import raw from "./description.module.scss?inline";

export const Description = define("ky-description", { mapping, raw })(
  class extends Stateless {
    template() {
      // 💡 확실하게 배열 타입으로 정제
      const safeList = Array.isArray(this.list)
        ? this.list
        : typeof this.list === "string" && this.list.trim()
          ? [this.list]
          : [];

      if (safeList.length === 0) {
        return html``;
      }

      return html`
        <ul class="${this.styles.description}">
          ${safeList.map(
            (desc) => html`<li class="${this.styles.item}">${desc}</li>`,
          )}
        </ul>
      `;
    }
  },
);
