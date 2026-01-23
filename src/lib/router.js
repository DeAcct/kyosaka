import { updateDOM, html } from "./core";
import { createScheduler } from "./schedule";

let instance = null;

export class Router {
  static redirects = {};
  lastPath = null;

  constructor(container) {
    if (instance) return instance;
    console.log("init!");

    this.container = container;
    this.routes = this._generateAutoRoutes();

    const { schedule } = createScheduler(() => this.render());
    this.queueRender = schedule;

    this.init();
    instance = this;
  }

  _generateAutoRoutes() {
    const mods = import.meta.glob("@/pages/**/*.js", { eager: true });
    const map = {};

    // 1. 파일 구조 분석
    Object.keys(mods).forEach((fp) => {
      const parts = fp.split("/pages/")[1].split("/");
      const file = parts.pop().replace(".js", "");
      const dir = parts.join("/");
      (map[dir] ||= {})[file] = true;
    });

    // 2. 라우트 생성 및 레이아웃 중첩
    return Object.entries(map)
      .filter(([_, c]) => c.page || c.index)
      .map(([dir, c]) => {
        const parts = dir ? dir.split("/") : [];
        const path = (dir ? `/${dir.toLowerCase()}` : "/").replace(
          "/schedule",
          "/",
        );

        let component = `<page-${(parts.at(-1) || "root").toLowerCase()}></page-${(parts.at(-1) || "root").toLowerCase()}>`;

        for (let i = parts.length; i >= 0; i--) {
          const d = parts.slice(0, i).join("/");
          if (map[d]?.layout) {
            const lTag = `layout-${(parts[i - 1] || "root").toLowerCase()}`;
            component = `<${lTag}>${component}</${lTag}>`;
          }
        }

        return {
          path,
          component: () => html([component]),
          regex: new RegExp(`^${path.replace(/\//g, "\\/")}\\/?$`, "i"),
        };
      });
  }

  init() {
    window.addEventListener("popstate", () => {
      this.handleLocationChange();
    });

    document.addEventListener("click", (e) => {
      const link = e
        .composedPath()
        .find((el) => el.tagName === "A" && el.hasAttribute("data-link"));
      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        this.navigate(href);
      }
    });

    this.render();
  }

  navigate(path, replace = false) {
    if (window.location.pathname === path) return;

    if (replace) window.history.replaceState({}, "", path);
    else window.history.pushState({}, "", path);
    this.handleLocationChange();
  }

  handleLocationChange() {
    window.dispatchEvent(
      new CustomEvent("locationchange", {
        detail: { path: window.location.pathname },
      }),
    );
    this.queueRender();
  }

  render() {
    const rawPath = window.location.pathname;
    const path = (rawPath.replace(/\/$/, "") || "/").toLowerCase();

    // 🔍 1. 리다이렉트 체크
    const redirectKey = Object.keys(Router.redirects).find(
      (key) => key.toLowerCase() === path,
    );

    if (redirectKey) {
      const target = Router.redirects[redirectKey];

      window.history.replaceState({}, "", target);
      window.dispatchEvent(
        new CustomEvent("locationchange", { detail: { path: target } }),
      );

      return this.render();
    }

    if (this.lastPath === path) return;

    // 🔍 2. 실제 매칭 시도
    const match = this.routes.find((r) => r.regex.test(path));
    const targetRoute = match || this.routes.find((r) => r.path === "/");

    if (targetRoute) {
      this.lastPath = path; // 성공 시 마지막 경로 업데이트
      updateDOM(this.container, targetRoute.component());
    }
  }

  static getInstance() {
    return instance;
  }
}

export const router = {
  get current() {
    return instance;
  },
  navigate: (path, replace) => instance?.navigate(path, replace),
};
