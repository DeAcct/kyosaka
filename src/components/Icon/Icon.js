import { Component, define, html } from "@/lib/v2/core";

import mapping from "./icon.module.scss";
import raw from "./icon.module.scss?inline";

export const Icon = define("ky-icon", { raw, mapping })(
  class extends Component {
    async setup() {
      // 🔍 브라우저에게 아이콘 폰트가 로드될 때까지 기다리라고 명령
      try {
        await document.fonts.load('18px "Material Symbols Outlined"');
        this.setState({ loaded: true });
        // ???
      } catch (e) {
        console.error("아이콘 폰트 로드 실패", e);
      }
    }
    template() {
      const { loaded } = this.state;
      return html`
        <i
          class="material-symbols-outlined ${this.styles.icon} ${loaded
            ? this.styles.loaded
            : ""}"
        >
          <slot></slot>
        </i>
      `;
    }
  }
);
