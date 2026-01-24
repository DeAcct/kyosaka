import { Component, define, html } from "@/lib/core";
import { Router } from "@/lib/router";

export const RouterLink = define("router-link")(
  class extends Component {
    setup() {
      this.updateState();
    }

    get resolvedPath() {
      // 1. 프로퍼티(this.to)나 속성(getAttribute)에서 값을 가져옴
      const to = this.to || this.getAttribute("to");

      if (!to) return "";

      // 2. 문자열이면 그대로 반환
      if (typeof to === "string") return to.toLowerCase();

      // 3. 객체라면 경로와 쿼리 스트링 조합
      if (typeof to === "object") {
        const { path, query } = to;
        let url = path || "";

        if (query) {
          const queryString = new URLSearchParams(query).toString();
          url += `?${queryString}`;
        }
        return url.toLowerCase();
      }

      return "";
    }

    /**
     * 매칭용 순수 경로 (쿼리 스트링 제외)
     */
    get purePath() {
      return this.resolvedPath.split("?")[0];
    }

    updateState() {
      const current = location.pathname.toLowerCase();
      const target = this.purePath;
      if (!target) return;

      const rootPath = `/${Router.rootPath.toLowerCase()}`;
      const normalizedCurrent =
        current === rootPath || current === rootPath + "/" ? "/" : current;

      // 🔍 3. 정규화된 경로와 비교
      const isActive =
        target === "/"
          ? normalizedCurrent === "/"
          : normalizedCurrent.startsWith(target);

      this.setAttribute("aria-selected", isActive ? "true" : "false");
    }

    template() {
      return html`
        <global
          @popstate="${() => this.updateState()}"
          @locationchange="${() => this.updateState()}"
        ></global>
        <a href="${this.resolvedPath}" data-link>
          <slot></slot>
        </a>
      `;
    }
  },
);
