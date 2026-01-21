import { Component, define, html } from "@/lib/core";

import mapping from "./navigationBar.module.scss";
import raw from "./navigationBar.module.scss?inline";

import { RouterLink } from "@/components/RouterLink/RouterLink";
import { Icon } from "@/components/Icon/Icon";

export const NavigationBar = define("navigation-bar", { mapping, raw })(
  class extends Component {
    get menu() {
      return [
        { to: "/", icon: "event", text: "일정" },
        { to: "/checklist", icon: "list", text: "체크리스트" },
        { to: "/gallery", icon: "gallery", text: "갤러리" },
      ];
    }
    template() {
      return html`<nav class="${this.styles.navigationBar}">
        ${this.menu.map(
          ({ to, icon, text }) => html`
            <router-link to="${to}" class="${this.styles.link}">
              <div class="${this.styles.item}">
                <ky-icon class="${this.styles.icon}" :name="${icon}"></ky-icon>
                <span class="${this.styles.text}">${text}</span>
              </div>
            </router-link>
          `,
        )}
      </nav>`;
    }
  },
);
