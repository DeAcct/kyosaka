// lib/router.js
import { updateDOM } from "./diff";

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
      const link = e.target.closest("a[data-link]");
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute("href"));
      }
    });
  }

  navigate(path) {
    window.history.pushState({}, "", path);
    this.render();
  }

  render() {
    const path = window.location.pathname;
    const viewFn = this.routes[path] || this.routes["/"];

    // 🔍 핵심: innerHTML 대신 updateDOM을 사용하여 디핑 적용
    // viewFn()이 리턴하는 템플릿 문자열을 기존 컨테이너와 비교하여 패치합니다.
    updateDOM(this.container, viewFn());
  }
}
