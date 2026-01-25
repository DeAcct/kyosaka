import { Component, define, html } from "@/lib/core";

import mapping from "./radioGroup.module.scss";
import raw from "./radioGroup.module.scss?inline";

export const RadioGroup = define("radio-group", { mapping, raw })(
  class extends Component {
    static formAssociated = true;
    static shadowOptions = { mode: "open", delegatesFocus: true };
    state = {
      selected: "",
    };

    afterOnce() {
      // 🔍 렌더링 후 부모가 넘겨준 초기값이 있다면 상태 업데이트
      if (this.value) {
        this.setState("selected", this.value);
      }
    }

    set value(val) {
      if (this.state.selected === val) return;
      this.setState("selected", val);
      if (this._internals) this._internals.setFormValue(val);
    }

    get value() {
      return this.state.selected || this.getAttribute("value") || "";
    }

    handleChange(e) {
      const newValue = e.target.value;
      this.value = newValue; // 세터를 통해 setState("selected", newValue) 호출됨

      this.emit("change", {
        detail: { value: newValue, name: this.name },
      });
    }

    template() {
      const selectedValue = this.value; // getter에서 처리된 값
      const options = this.options || [];

      return html`
        <div class="${this.styles.radioGroup}">
          ${options.map(
            ({ key, text }) => html`
              <label
                class="${this.styles.tab} ${selectedValue === key
                  ? this.styles.active
                  : ""}"
              >
                <input
                  type="radio"
                  class="sr-only"
                  name="${this.name}"
                  value="${key}"
                  ?checked="${selectedValue === key}"
                  @change="${(e) => this.handleChange(e)}"
                />${text}
              </label>
            `,
          )}
        </div>
      `;
    }
  },
);
