import { Component, define, html } from "@/lib/core";

import mapping from "./navigationBar.module.scss";
import raw from "./navigationBar.module.scss?inline";

import { RouterLink } from "@/components/RouterLink/RouterLink";
import { Icon } from "@/components/Icon/Icon";

export const NavigationBar = define("navigation-bar", { mapping, raw })(
  class extends Component {
    setup() {
      // 초기 진입 시점의 스크롤 위치를 고려해 기본 상태 설정
      this.state = {
        isHidden: window.scrollY > 0,
      };
    }

    get menu() {
      return [
        { to: "/", icon: "event", text: "일정" },
        { to: "/checklist", icon: "checklist", text: "체크리스트" },
        { to: "/gallery", icon: "gallery", text: "갤러리" },
      ];
    }

    handleScroll() {
      const shouldHide = window.scrollY > 0;

      // 🔍 불필요한 중복 리렌더링 방지 가드
      if (this.state.isHidden !== shouldHide) {
        this.setState("isHidden", shouldHide);
      }
    }

    template() {
      const { isHidden } = this.state;

      const navbarClass = `${this.styles.navigationBar} ${isHidden ? this.styles.hidden : ""}`;

      return html` <global @scroll="${this.handleScroll}"></global>
        <nav class="${navbarClass}">
          ${this.menu.map(
            ({ to, icon, text }) => html`
              <router-link to="${to}" class="${this.styles.link}">
                <div class="${this.styles.item}">
                  <ky-icon
                    class="${this.styles.icon}"
                    :name="${icon}"
                  ></ky-icon>
                  <span class="${this.styles.text}">${text}</span>
                </div>
              </router-link>
            `,
          )}
        </nav>`;
    }
  },
);
