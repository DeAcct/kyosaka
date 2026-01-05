import { Component, define } from "@/lib/component";

import mapping from "./routeCard.module.scss";
import raw from "./routeCard.module.scss?inline";

export const RouteCard = define("route-card", { mapping, raw })(
  class extends Component {
    template() {
      const from = this.getAttribute("from");
      const to = this.getAttribute("to");
      return `
      <div class="${this.styles.routeCard}">
        <div class="${this.styles.card}">
          <p class="${this.styles.point}">
            <span class="${this.styles.label}">출발지</span>
            <strong ${this.styles.value}>${from}</strong>
          </p>
          <p class="${this.styles.point}">
            <span class="${this.styles.label}">도착지</span>
            <strong ${this.styles.value}>${to}</strong>
          </p>
        </div>
      </div>
      `;
    }
  }
);
