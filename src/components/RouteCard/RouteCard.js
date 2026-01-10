import { Component, define, html } from "@/lib/v2/core";

import mapping from "./routeCard.module.scss";
import raw from "./routeCard.module.scss?inline";

export const RouteCard = define("route-card", { mapping, raw })(
  class extends Component {
    template() {
      // const from = this.getAttribute("from");
      // const to = this.getAttribute("to");
      return html`
        <div class="${this.styles.routeCard}">
          <p class="${this.styles.point}">
            <span class="${this.styles.label}">출발지</span>
            <strong class="${this.styles.value}">${this.from}</strong>
          </p>
          <p class="${this.styles.point}">
            <span class="${this.styles.label}">도착지</span>
            <strong class="${this.styles.value}">${this.to}</strong>
          </p>
        </div>
      `;
    }
  }
);
