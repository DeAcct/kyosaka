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

    return Object.entries(map)
      .filter(([_, data]) => data.files.page || data.files.index)
      .map(([lowDir, data]) => {
        let path = lowDir === "" || lowDir === rootDir ? "/" : `/${lowDir}`;

        if (lowDir.startsWith(rootDir + "/")) {
          path = lowDir.replace(rootDir, "");
        }

        // 🔍 동적 파라미터 추출 로직 추가
        const paramKeys = [];

        // 1) [id] 형태 지원
        let regexPath = path.replace(/\[([^\]]+)\]/g, (_, key) => {
          paramKeys.push(key);
          return "([^/]+)";
        });

        // 2) :id 형태 지원
        regexPath = regexPath.replace(/:([^\/]+)/g, (_, key) => {
          paramKeys.push(key);
          return "([^/]+)";
        });

        // 슬래시 이스케이프 처리
        regexPath = regexPath.replace(/\//g, "\\/");

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
          paramKeys, // 🔍 추출한 파라미터 키 배열 저장
          component: () => html([component]),
          regex: new RegExp(`^${regexPath}\\/?$`, "i"),
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
    const matchRoute = this.routes.find((r) => r.regex.test(path));
    const targetRoute = matchRoute || this.routes.find((r) => r.path === "/");

    if (targetRoute) {
      this.lastPath = path;

      // 🔍 URL에서 파라미터 값 추출하여 instance에 저장
      this.params = {};
      if (matchRoute && matchRoute.paramKeys.length > 0) {
        const matchedValues = path.match(matchRoute.regex).slice(1);
        matchRoute.paramKeys.forEach((key, index) => {
          this.params[key] = matchedValues[index];
        });
      }

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
  // 🔍 params getter 추가
  get params() {
    return instance?.params || {};
  },
  navigate: (path, replace) => instance?.navigate(path, replace),
};
