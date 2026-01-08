import { Component, define } from "@/lib/dom";
import { Router } from "@/lib/router";
import { routes } from "@/routes"; // 라우트 설정 파일

import mapping from "./app.module.scss";

import { Header } from "@/components/Header/Header";
import { SchedulePage } from "@/pages/Schedule/Schedule";

export const App = define("ky-app", { mapping })(
  class extends Component {
    afterRender() {
      // 🔍 1. 내부의 뷰 컨테이너를 찾습니다.
      const $container = this.$selector("[data-router-view]");
      window.kyRouter = new Router(routes, $container);
    }

    template() {
      return `
        <ky-header></ky-header>

        <main class="${this.styles.view}" data-rotuer-view></main>

        <nav class="${this.styles.bottomNav}">
          <a href="/schedule" data-link class="${this.styles.link}">📅 일정</a>
          <a href="/checklist" data-link class="${this.styles.link}">✅ 체크</a>
          <a href="/gallery" data-link class="${this.styles.link}">🖼️ 갤러리</a>
        </nav>
      `;
    }
  }
);
