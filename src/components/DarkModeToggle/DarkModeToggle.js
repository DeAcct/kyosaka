import { Component, define, html } from "@/lib/core";
import mapping from "./darkModeToggle.module.scss";
import raw from "./darkModeToggle.module.scss?inline";

import "@/components/Icon/Icon";

const STORAGE_KEY = "kyosaka_theme";

export const DarkModeToggle = define("dark-mode-toggle", { mapping, raw })(
  class extends Component {
    state = {
      isDark: false,
    };

    setup() {
      const saved = localStorage.getItem(STORAGE_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = saved ? saved === "dark" : prefersDark;
      this.applyTheme(isDark);
    }

    applyTheme(isDark) {
      this.setState("isDark", isDark);
      const root = document.documentElement;
      if (isDark) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    }

    toggle() {
      this.applyTheme(!this.state.isDark);
    }

    template() {
      const { isDark } = this.state;
      return html`
        <button
          class="${this.styles.toggle}"
          @click=${this.toggle}
          aria-label="${isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}"
        >
          <span class="${this.styles.track} ${isDark ? this.styles.dark : ""}">
            <span class="${this.styles.thumb}">
              <ky-icon
                name="${isDark ? "dark_mode" : "light_mode"}"
                class="${this.styles.icon}"
              ></ky-icon>
            </span>
          </span>
        </button>
      `;
    }
  },
);
