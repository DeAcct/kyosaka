import { Component, define, html } from "@/lib/core";
import { IconLoader } from "@/lib/icon";

import mapping from "./icon.module.scss";
import raw from "./icon.module.scss?inline";

export const Icon = define("ky-icon", { mapping, raw })(
  class extends Component {
    _lastLoadedName = null;
    state = { d: "", viewBox: "0 -960 960 960", loaded: false };

    afterRender() {
      const currentName = this.name || this.getAttribute("name");

      if (!currentName || currentName === this._lastLoadedName) {
        return;
      }
      this._lastLoadedName = currentName;
      this.loadIcon(currentName);
    }

    async loadIcon(name) {
      if (!name || !IconLoader[name]) return;

      try {
        // 이제 IconLoader는 무조건 { d, viewBox } 객체를 반환합니다.
        const { d, viewBox } = await IconLoader[name]();

        this.setState("d", d);
        this.setState("viewBox", viewBox);
        this.setState("loaded", true);
      } catch (err) {
        console.error(`Failed to load icon: ${name}`, err);
      }
    }

    template() {
      return html`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="${this.state.viewBox}"
          class="${this.styles.icon} ${this.state.loaded
            ? this.styles.loaded
            : ""}"
        >
          <path d="${this.state.d}" />
        </svg>
      `;
    }
  },
);
