import { updateDOM, html } from "./core";
import { createScheduler } from "./schedule";

export class Router {
  constructor(container) {
    this.routes = this._generateAutoRoutes();
    this.container = container;

    const { schedule } = createScheduler(() => this.render());
    this.queueRender = schedule;

    this.init();
  }

  _generateAutoRoutes() {
    const modules = import.meta.glob("@/pages/**/*.js", { eager: true });
    const groups = {};

    // 1. 파일들을 폴더별로 그룹화 (page와 layout 구분)
    Object.keys(modules).forEach((filePath) => {
      const parts = filePath.split("/");
      const fileName = parts.pop().replace(".js", "");
      const folder = parts[parts.length - 1] === "pages" ? "root" : parts.pop();

      if (!groups[folder])
        groups[folder] = { hasPage: false, hasLayout: false };

      if (fileName === "page" || fileName === "index")
        groups[folder].hasPage = true;
      if (fileName === "layout") groups[folder].hasLayout = true;
    });

    // 2. 그룹화된 데이터를 바탕으로 라우트 배열 생성
    return Object.entries(groups)
      .filter(([_, config]) => config.hasPage)
      .map(([folder, config]) => {
        const path = folder === "root" ? "/" : `/${folder}`;
        const pageTag = `page-${folder.toLowerCase()}`;
        const layoutTag = `layout-${folder.toLowerCase()}`;

        const templateStr = config.hasLayout
          ? `<${layoutTag}><${pageTag}></${pageTag}></${layoutTag}>`
          : `<${pageTag}></${pageTag}>`;

        return {
          path,
          component: () => html([templateStr]),
          regex: new RegExp(`^${path.replace(/\//g, "\\/")}\\/?$`, "i"),
        };
      });
  }
  // _generateAutoRoutes() {
  //   // 🔍 eager: false (기본값)를 사용하여 비동기 로더 함수를 가져옴
  //   const modules = import.meta.glob("@/pages/**/*.js");
  //   const groups = {};

  //   Object.keys(modules).forEach((filePath) => {
  //     const parts = filePath.replace(/\\/g, "/").split("/");
  //     const fileName = parts.pop().replace(".js", "");
  //     const pagesIndex = parts.indexOf("pages");
  //     let folder =
  //       pagesIndex !== -1 && parts[pagesIndex + 1]
  //         ? parts[pagesIndex + 1]
  //         : "root";

  //     if (!groups[folder])
  //       groups[folder] = { hasPage: false, hasLayout: false, loader: null };

  //     // 페이지 파일의 로더(import 함수)를 저장
  //     if (fileName === "page" || fileName === "index") {
  //       groups[folder].hasPage = true;
  //       groups[folder].loader = modules[filePath]; // () => import(...)
  //     }
  //     if (fileName === "layout") groups[folder].hasLayout = true;
  //   });

  //   return Object.entries(groups)
  //     .filter(([_, config]) => config.hasPage)
  //     .map(([folder, config]) => {
  //       const folderLower = folder.toLowerCase();
  //       const isRoot = folderLower === "root" || folderLower === "schedule";
  //       const path = isRoot ? "/" : `/${folderLower}`;

  //       const pageTag = `page-${folderLower}`;
  //       const layoutTag = `layout-${folderLower}`;

  //       const templateStr = config.hasLayout
  //         ? `<${layoutTag}><${pageTag}></${pageTag}></${layoutTag}>`
  //         : `<${pageTag}></${pageTag}>`;

  //       return {
  //         path,
  //         loader: config.loader, // 🔍 나중에 호출할 비동기 로더
  //         component: () => html([templateStr], []),
  //         regex: new RegExp(`^${path.replace(/\//g, "\\/")}\\/?$`, "i"),
  //       };
  //     });
  // }

  init() {
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

    this.render();
  }

  navigate(path) {
    window.history.pushState({}, "", path);
    const navEvent = new CustomEvent("locationchange", { detail: { path } });
    window.dispatchEvent(navEvent);
    this.queueRender();
  }

  render() {
    const path = window.location.pathname;
    let match =
      this.routes.find((r) => r.regex.test(path)) ||
      this.routes.find((r) => r.path === "/");

    if (match) {
      updateDOM(this.container, match.component());
    }
  }

  // async render() {
  //   const path = window.location.pathname;
  //   const match =
  //     this.routes.find((r) => r.regex.test(path)) ||
  //     this.routes.find((r) => r.path === "/");

  //   if (match) {
  //     try {
  //       // 🔍 해당 페이지의 JS 파일을 서버에서 가져오고 실행함
  //       // 이 과정에서 해당 파일 내의 define()이 실행되어 태그가 등록됨
  //       if (typeof match.loader === "function") {
  //         await match.loader();
  //       }

  //       updateDOM(this.container, match.component());
  //     } catch (error) {
  //       console.error("컴포넌트 로드 실패 (네트워크 오류 등):", error);
  //       this.container.innerHTML = `<p>페이지를 불러오는 중 오류가 발생했습니다.</p>`;
  //     }
  //   }
  // }
}
