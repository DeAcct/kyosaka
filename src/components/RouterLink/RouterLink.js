// import { Component, define, html } from "@/lib/v2/core";
import { Component, define, html } from "@/lib/v2/core";

export const RouterLink = define("router-link")(
  class extends Component {
    setup() {
      this.updateState();
      // 🔍 전역 경로 변경 이벤트 구독
      window.addEventListener("popstate", () => this.updateState());
      // 2. 내부 소프트 라우팅 (우리가 만든 이벤트)
      window.addEventListener("locationchange", () => this.updateState());
    }

    updateState() {
      const href = this.getAttribute("to");
      if (!href) {
        throw new Error("to가 정의되지 않았어요");
      }
      const isActive = window.location.pathname === href;
      this.setAttribute("aria-selected", isActive ? "true" : "false");
    }

    template() {
      const to = this.getAttribute("to");

      return html`
        <a href="${to}" data-link>
          <slot></slot>
        </a>
      `;
    }
  }
);
