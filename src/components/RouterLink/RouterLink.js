import { Component, define, html } from "@/lib/core";
import { router } from "@/lib/router"; // router 인스턴스 추가 임포트

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

      // 3. 객체라면 경로, 파라미터, 쿼리 스트링 조합
      if (typeof to === "object") {
        const { path, query, params } = to;
        let url = path || "";

        // 변경점: params가 존재하면 동적 경로 치환 (:id 또는 [id])
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, value).replace(`[${key}]`, value);
          });
        }

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
      const target = this.purePath;
      if (!target) return;

      const isActive = router.isActive(target);

      this.setAttribute("aria-selected", isActive ? "true" : "false");
    }

    // 변경점: data-link 전역 위임 대신 자체적으로 클릭 이벤트 처리
    handleClick(e) {
      e.preventDefault();
      const path = this.resolvedPath;

      // transition 속성이 존재하면 View Transition 적용
      const useTransition = this.hasAttribute("transition") || this.transition;

      if (useTransition && document.startViewTransition) {
        document.startViewTransition(() => {
          router.navigate(path);
          return new Promise((resolve) => requestAnimationFrame(resolve));
        });
      } else {
        router.navigate(path);
      }
    }

    template() {
      return html`
        <global
          @popstate="${() => this.updateState()}"
          @locationchange="${() => this.updateState()}"
        ></global>
        <a href="${this.resolvedPath}" @click="${(e) => this.handleClick(e)}">
          <slot></slot>
        </a>
      `;
    }
  },
);
