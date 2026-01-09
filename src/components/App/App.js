import { Component, define } from "@/lib/dom";
import { Router } from "@/lib/router";
import { routes } from "@/routes"; // 라우트 설정 파일

import mapping from "./app.module.scss";
import raw from "./app.module.scss?inline";

import { SchedulePage } from "@/pages/Schedule/Schedule";
import { Header } from "@/components/Header/Header";
import { NavigationBar } from "@/components/NavigationBar/NavigationBar";

export const App = define("ky-app", { mapping, raw })(
  class extends Component {
    afterRender() {
      // 🔍 1. 내부의 뷰 컨테이너를 찾습니다.
      const $container = this.$selector("[data-router-view]");
      window.kyRouter = new Router(routes, $container);
    }

    template() {
      return `
        <ky-header></ky-header>

        <main class="${this.styles.view}" data-router-view></main>

        <navigation-bar class="${this.styles.navigationBar}"></navigation-bar>
      `;
    }
  }
);
