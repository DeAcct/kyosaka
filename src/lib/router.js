//lib/router.js
import { updateDOM } from "./core";

export class Router {
  constructor(routes, container) {
    this.routes = routes;
    this.container = container;
    this.init();
  }

  init() {
    // 1. 뒤로가기/앞으로가기 감지
    window.addEventListener("popstate", () => this.render());

    // 2. 초기 로드 처리
    window.addEventListener("DOMContentLoaded", () => this.render());

    // 3. 전역 클릭 이벤트 위임 (<a> 태그 가로채기)
    document.addEventListener("click", (e) => {
      const path = e.composedPath();
      const link = path.find(
        (el) => el.tagName === "A" && el.hasAttribute("data-link")
      );
      // const link = e.target.closest("a[data-link]");

      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");

        // 🔍 현재 경로와 같으면 무시 (불필요한 리렌더링 방지)
        if (window.location.pathname === href) return;
        this.navigate(href);
      }
    });
  }

  navigate(path) {
    window.history.pushState({}, "", path);
    const navEvent = new CustomEvent("locationchange", { detail: { path } });
    window.dispatchEvent(navEvent);
    this.render();
  }

  render() {
    const path = window.location.pathname;
    const viewFn = this.routes[path] || this.routes["/"];
    updateDOM(this.container, viewFn());
  }
}
