import { Component, define } from "@/lib/dom";
import mapping from "./button.module.scss";
import raw from "./button.module.scss?inline";

// 고차 함수 방식으로 클래스를 감쌉니다.
export const Button = define("ky-button", { mapping, raw })(
  class extends Component {
    template() {
      return `
        <button class="${this.styles.button}" type="button">
          <slot></slot>
        </button>
      `;
    }

    initEventListeners() {
      this.addEvent("click", `.${this.styles.button}`, () => {
        this.dispatchEvent(
          new CustomEvent("ky-click", {
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }
);
