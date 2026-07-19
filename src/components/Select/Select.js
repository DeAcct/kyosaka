import { Component, define, html } from "@/lib/core";
import mapping from "./select.module.scss";
import raw from "./select.module.scss?inline";

import "@/components/Icon/Icon";

export const Select = define("ky-select", { mapping, raw })(
  class extends Component {
    setup() {
      this.state = { selectedValue: null };
      const id = Math.random().toString(36).slice(2, 8);
      this._anchorName = `--ky-sel-${id}`;
      this._popoverId = `ky-sel-${id}`;
    }

    get value() {
      const { selectedValue } = this.state;
      const options = this.options || [];
      return selectedValue ?? options[0]?.value ?? null;
    }

    set value(v) {
      this.setState("selectedValue", v);
    }

    selectOption(opt) {
      this.setState("selectedValue", opt.value);
      this.$refs.popover?.hidePopover();
      this.emit("change", { detail: { value: opt.value } });
    }

    template() {
      const icon = this.getAttribute("icon");
      const options = this.options || [];
      const currentValue = this.state.selectedValue ?? options[0]?.value;
      const selected = options.find((o) => o.value === currentValue) || options[0];

      return html`
        <div class="${this.styles.kyselect}">
          ${icon
            ? html`<ky-icon name="${icon}" class="${this.styles.icon}"></ky-icon>`
            : ""}
          <button
            $trigger
            class="${this.styles.trigger}"
            popovertarget="${this._popoverId}"
            style="anchor-name: ${this._anchorName}"
          >
            <span class="${this.styles.label}">${selected?.label || ""}</span>
            <ky-icon name="expand_more" class="${this.styles.chevron}"></ky-icon>
          </button>
        </div>

        <div
          $popover
          id="${this._popoverId}"
          popover
          class="${this.styles.popover}"
          style="position-anchor: ${this._anchorName}"
        >
          ${options.map(
            (opt) => html`
              <button
                class="${this.styles.option} ${opt.value === currentValue
                  ? this.styles.optionSelected
                  : ""}"
                @click="${() => this.selectOption(opt)}"
              >
                ${opt.label}
              </button>
            `,
          )}
        </div>
      `;
    }
  },
);
