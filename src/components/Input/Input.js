// components/Input/Input.js
import { Component, define, html } from "@/lib/core";
import mapping from "./input.module.scss";
import raw from "./input.module.scss?inline";

import "@/components/Icon/Icon";

export const Input = define("ky-input", { mapping, raw })(
  class extends Component {
    handleChange(e) {
      // 🎯 1. 네이티브 input의 change 이벤트가 외부로 나가서 이중 실행되는 것을 차단합니다.
      e.stopPropagation();
      this.emit("change", { detail: { value: e.target.value } });
    }

    template() {
      const icon = this.getAttribute("icon");
      const placeholder = this.getAttribute("placeholder") || "";
      const value = this.getAttribute("value") || "";
      const type = this.getAttribute("type") || "text";

      return html`
        <div
          class="${this.styles.kyinput}"
          part="box"
        >
          ${icon
            ? html`
                <ky-icon
                  name="${icon}"
                  class="${this.styles.icon}"
                ></ky-icon>
              `
            : ""}

          <div
            class="${this.styles.rowContent}"
            @change="${(e) => e.stopPropagation()}"
          >
            ${type === "textarea"
              ? html` <textarea
                  class="${this.styles.textarea}"
                  placeholder="${placeholder}"
                  rows="4"
                  @change="${this.handleChange}"
                  part="input"
                >
${value}</textarea
                >`
              : html`
                  <input
                    type="${type}"
                    class="${this.styles.input}"
                    value="${value}"
                    placeholder="${placeholder}"
                    @change="${this.handleChange}"
                    @keydown="${(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        this.emit("enter", {
                          detail: { value: e.target.value },
                        });
                      }
                    }}"
                    part="input"
                  />
                `}
            <slot></slot>
          </div>
        </div>
      `;
    }
  },
);
