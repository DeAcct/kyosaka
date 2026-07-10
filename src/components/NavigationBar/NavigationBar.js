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
      const currentScrollY = window.scrollY;

      // 1. 페이지 최상단에 도달하면 무조건 네비게이션 바를 보여줌 (모바일 바운스 효과 대응)
      if (currentScrollY <= 0) {
        if (this.state.isHidden) {
          this.setState("isHidden", false);
        }
        this.lastScrollY = currentScrollY;
        return;
      }

      // 2. 스크롤 방향 판단
      // 현재 좌표가 이전 좌표보다 작으면 '위로 스크롤' 중인 상태
      const isScrollingUp = currentScrollY < this.lastScrollY;
      const shouldHide = !isScrollingUp;

      // 상태 변화가 일어날 때만 동기적으로 setState 트리거
      if (this.state.isHidden !== shouldHide) {
        this.setState("isHidden", shouldHide);
      }

      // 다음 비교를 위해 현재 위치를 저장
      this.lastScrollY = currentScrollY;
    }

    template() {
      const { isHidden } = this.state;

      const navbarClass = `${this.styles.navigationBar} ${isHidden ? this.styles.hidden : ""}`;

      return html` <global @scroll="${this.handleScroll}"></global>
        <div class="${this.styles.mask}"></div>
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
