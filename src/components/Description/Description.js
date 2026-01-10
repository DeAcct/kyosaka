import { Component, define, html } from "@/lib/v2/core";

import mapping from "./description.module.scss";
import raw from "./description.module.scss?inline";

export const Description = define("ky-description", { mapping, raw })(
  class extends Component {
    _list = [];

    set list(data) {
      this._list = Array.isArray(data) ? data : [];
      this.render(); // 데이터가 들어오면 다시 그리기
    }

    get list() {
      return this._list;
    }

    template() {
      return html` <ul class="${this.styles.description}">
        ${this.list.map(
          (desc) => html`<li class="${this.styles.item}">${desc}</li>`
        )}
      </ul>`;
    }
  }
);
