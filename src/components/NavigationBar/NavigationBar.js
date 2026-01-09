import { define, Component } from "@/lib/dom";

import mapping from "./navigationBar.module.scss";
import raw from "./navigationBar.module.scss?inline";

import { RouterLink } from "@/components/RouterLink/RouterLink";
import { Icon } from "@/components/Icon/Icon";

export const NavigationBar = define("navigation-bar", { mapping, raw })(
  class extends Component {
    get menu() {
      return [
        { to: "/schedule", icon: "event", text: "일정" },
        { to: "/checklist", icon: "list_alt_check", text: "체크리스트" },
        { to: "/gallery", icon: "photo_library", text: "갤러리" },
      ];
    }

    // <router-link to="/schedule" class="${this.styles.link}">
    //       <div class="${this.styles.item}">
    //         <ky-icon class="${this.styles.icon}">event</ky-icon>
    //         <span class="${this.styles.text}">일정</span>
    //       </div>
    //     </router-link>
    //     <router-link to="/checklist" class="${this.styles.link}">
    //       <div class="${this.styles.item}">
    //         <ky-icon class="${this.styles.icon}">list_alt_check</ky-icon>
    //         <span class="${this.styles.text}">체크리스트</span>
    //       </div>
    //     </router-link>
    //     <router-link to="/gallery" class="${this.styles.link}">
    //       <div class="${this.styles.item}">
    //         <ky-icon class="${this.styles.icon}">photo_library</ky-icon>
    //         <span class="${this.styles.text}">갤러리</span>
    //       </div>
    //     </router-link>
    template() {
      return `<nav class="${this.styles.navigationBar}">
        ${this.menu
          .map(
            ({ to, icon, text }) => `
              <router-link to="${to}" class="${this.styles.link}">
                <div class="${this.styles.item}">
                  <ky-icon class="${this.styles.icon}">${icon}</ky-icon>
                  <span class="${this.styles.text}">${text}</span>
                </div>
              </router-link>
            `
          )
          .join("")}
      </nav>`;
    }
  }
);
