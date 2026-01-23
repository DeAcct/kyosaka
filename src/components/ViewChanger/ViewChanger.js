import { Component, define, html } from "@/lib/core";

import mapping from "./viewChanger.module.scss";
import raw from "./viewChanger.module.scss?inline";

const VIEW_TYPE = [
  {
    key: "grid",
    text: "그리드뷰",
  },
  {
    key: "list",
    text: "리스트뷰",
  },
];
export const ViewChanger = define("view-changer", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <div class="${this.styles.viewChanger}">
          ${VIEW_TYPE.map(
            ({ key, text }) => html`
              <button class="${this.styles.tab}" data-key="${key}">
                <ky-icon :name="${key}"></ky-icon>
                <span class="sr-only">text</span>
              </button>
            `,
          )}
        </div>
      `;
    }
  },
);
