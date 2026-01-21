import { Component, define, html } from "@/lib/core";
import { iconLoader } from "@/icons/iconLoader";

import mapping from "./icon.module.scss";
import raw from "./icon.module.scss?inline";

export const Icon = define("ky-icon", { mapping, raw })(
  class extends Component {
    _lastLoadedName = null;
    state = { d: "", loaded: false };

    afterRender() {
      const currentName = this.name || this.getAttribute("name");

      if (!currentName || currentName === this._lastLoadedName) {
        return;
      }
      this._lastLoadedName = currentName;
      this.loadIcon(currentName);
    }

    async loadIcon(name) {
      if (!name || !iconLoader[name]) return;

      try {
        const { d } = await iconLoader[name]();
        this.setState("d", d);
        this.setState("loaded", true);
      } catch (err) {
        console.error(`Failed to load icon: ${name}`, err);
      }
    }

    template() {
      return html`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
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
