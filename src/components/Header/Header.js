import { Component, define, html } from "@/lib/core";

import { Icon } from '@/components/Icon/Icon';

import mapping from "./header.module.scss";
import raw from "./header.module.scss?inline";

export const Header = define("ky-header", { mapping, raw })(
  class extends Component {
    template() {
      return html`
        <header class="${this.styles.header}">
        <ky-icon name="hamburger" class="${this.styles.icon}"></ky-icon>
          <h1 class="${this.styles.text}">쿄사카</h1>
        </header>
      `;
    }
  }
);
