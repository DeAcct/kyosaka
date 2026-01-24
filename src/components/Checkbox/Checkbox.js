import { Component, define, html } from "@/lib/core";
import mapping from "./checkbox.module.scss";
import raw from "./checkbox.module.scss?inline";

export const Checkbox = define("ky-checkbox", { mapping, raw })(
  class extends Component {
    static formAssociated = true;
    static shadowOptions = {
      mode: "open",
      delegatesFocus: true,
    };

    setup() {
      // 🔍 초기 상태 설정 (setState "key", value 준수)
      this.state = { checked: this.hasAttribute("checked") };
    }

    // 🔍 외부에서 .checked = true 로 조작할 때 대응
    set checked(val) {
      const boolVal = Boolean(val);
      if (this.state.checked === boolVal) return;

      this.setState("checked", boolVal);

      if (this._internals) {
        this._internals.setFormValue(boolVal ? "on" : "off");
        this._internals.ariaChecked = String(boolVal);
      }
    }

    get checked() {
      return this.state.checked;
    }

    ghostClick(e) {
      // host 클릭 시 내부 input 클릭 유도
      if (e.composedPath()[0] !== this) return;
      this.$refs.input?.click();
    }

    handleInternalChange(e) {
      // 🎯 내부 인풋 상태를 컴포넌트 상태로 동기화
      this.checked = e.target.checked;

      this.emit("change", {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      });
    }

    template() {
      const isChecked = this.checked;

      return html`
        <host @click="${this.ghostClick}"></host>
        <input
          type="checkbox"
          $input
          class="${this.styles.input} sr-only"
          ?checked="${isChecked}"
          @change="${(e) => this.handleInternalChange(e)}"
        />
        <ky-icon
          class="${this.styles.real}"
          :name="${isChecked ? "checked" : "circle"}"
        >
        </ky-icon>
      `;
    }
  },
);
