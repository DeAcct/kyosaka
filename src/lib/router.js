import { updateDOM } from "./core";
import { createScheduler } from "./schedule";

export class Router {
  constructor(routes, container) {
    this.routes = routes.map((route) => ({
      ...route,
      regex: new RegExp(`^${route.path.replace(/:\w+/g, "([^/]+)")}$`),
    }));
    this.container = container;
    console.log(this.routes);

    const { schedule } = createScheduler(() => this.render());
    this.queueRender = schedule;

    this.init();
  }

  init() {
    // 🔍 뒤로가기 시에도 locationchange를 발생시켜야 네비바 클래스가 갱신됩니다.
    window.addEventListener("popstate", () => {
      const path = window.location.pathname;
      const navEvent = new CustomEvent("locationchange", { detail: { path } });
      window.dispatchEvent(navEvent);
      this.render();
    });

    document.addEventListener("click", (e) => {
      const link = e
        .composedPath()
        .find((el) => el.tagName === "A" && el.hasAttribute("data-link"));

      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        if (window.location.pathname === href) return;
        this.navigate(href);
      }
    });

    // 초기 로드 시 렌더링
    this.render();
  }

  // 🔍 사용자님의 원본 로직 유지 (동적 클래스 작동의 핵심)
  navigate(path) {
    window.history.pushState({}, "", path);
    const navEvent = new CustomEvent("locationchange", { detail: { path } });
    window.dispatchEvent(navEvent);
    this.queueRender();
  }

  render() {
    const path = window.location.pathname;
    let match = null;
    let params = {};

    for (const route of this.routes) {
      const result = path.match(route.regex);
      if (result) {
        match = route;
        const paramNames = route.path.match(/:\w+/g) || [];
        paramNames.forEach((name, index) => {
          params[name.slice(1)] = result[index + 1];
        });
        break;
      }
    }

    const targetRoute = match || this.routes.find((r) => r.path === "/");
    if (targetRoute) {
      // route.component() 호출 시 추출된 params 전달
      updateDOM(this.container, targetRoute.component(params));
    }
  }
}
