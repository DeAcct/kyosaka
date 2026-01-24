import { updateDOM, html } from "./core";
import { createScheduler } from "./schedule";

let instance = null;

export class Router {
  // 🔍 하드코딩 제거: 외부에서 자유롭게 루트 폴더를 지정 가능
  static rootPath = "schedule";
  static redirects = {};
  lastPath = null;

  constructor(container) {
    if (instance) return instance;

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

    // 1. 파일 구조 분석 (모든 경로 소문자화하여 맵 생성)
    Object.keys(mods).forEach((fp) => {
      const parts = fp.split("/pages/")[1].split("/");
      const file = parts.pop().replace(".js", "");
      const dir = parts.join("/"); // "Gallery/Memory" 등
      const lowDir = dir.toLowerCase();

      if (!map[lowDir]) map[lowDir] = { raw: dir, files: {} };
      map[lowDir].files[file] = true;
    });

    const rootDir = Router.rootPath.toLowerCase();

    // 2. 라우트 생성
    return Object.entries(map)
      .filter(([_, data]) => data.files.page || data.files.index)
      .map(([lowDir, data]) => {
        // 🔍 경로 매핑 로직 (rootPath 폴더를 '/'로 취급)
        let path = lowDir === "" || lowDir === rootDir ? "/" : `/${lowDir}`;

        // 중첩 경로에서 rootPath 제거 (예: schedule/sub -> /sub)
        if (lowDir.startsWith(rootDir + "/")) {
          path = lowDir.replace(rootDir, "");
        }

        const parts = data.raw.split("/");
        const pageTag = `page-${(parts[parts.length - 1] || "root").toLowerCase()}`;

        // 🔍 중첩 레이아웃 누적 (부모 폴더로 거슬러 올라감)
        let component = `<${pageTag}></${pageTag}>`;

        for (let i = parts.length; i >= 0; i--) {
          const currentPath = parts.slice(0, i).join("/").toLowerCase();
          if (map[currentPath]?.files.layout) {
            // 레이아웃 태그 결정 (해당 폴더명)
            const folderName = parts[i - 1] || "root";
            const lTag = `layout-${folderName.toLowerCase()}`;
            component = `<${lTag}>${component}</${lTag}>`;
          }
        }

        return {
          path,
          component: () => html([component]),
          // 슬래시 허용 정규식
          regex: new RegExp(`^${path.replace(/\//g, "\\/")}\\/?$`, "i"),
        };
      });
  }

  init() {
    window.addEventListener("popstate", () => this.handleLocationChange());
    document.addEventListener("click", (e) => {
      const link = e
        .composedPath()
        .find((el) => el.tagName === "A" && el.hasAttribute("data-link"));
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute("href"));
      }
    });
    this.render();
  }

  navigate(path, replace = false) {
    // 🔍 동일 경로 클릭 시 히스토리 중복 적재 방지
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

    // 1. 리다이렉트 체크
    const redirectKey = Object.keys(Router.redirects).find(
      (key) => key.toLowerCase() === path,
    );

    if (redirectKey) {
      const target = Router.redirects[redirectKey];
      window.history.replaceState({}, "", target);
      window.dispatchEvent(
        new CustomEvent("locationchange", { detail: { path: target } }),
      );
      // 리다이렉트 시 lastPath 가드를 우회하기 위해 즉시 재귀 호출
      return this.render();
    }

    // 2. 동일 경로 렌더링 방지 가드
    if (this.lastPath === path) return;

    // 3. 실제 매칭 시도
    const match = this.routes.find((r) => r.regex.test(path));
    const targetRoute = match || this.routes.find((r) => r.path === "/");

    if (targetRoute) {
      this.lastPath = path;
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
