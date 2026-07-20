import { Component, define, html } from "@/lib/core";
import "@/components/ModalSheet/ModalSheet";

import mapping from "./contextMenu.module.scss";
import raw from "./contextMenu.module.scss?inline";

export const ContextMenu = define("context-menu", { mapping, raw })(
  class extends Component {
    setup() {
      this.state = {
        title: "",
        options: [],
        passthrough: false,
      };
    }

    open({ title, options, passthrough, noBackdrop } = {}) {
      const isPassthrough =
        passthrough ??
        noBackdrop ??
        this.hasAttribute("passthrough") ??
        this.hasAttribute("no-backdrop");

      this.setState("title", title || "");
      this.setState("options", options || []);
      this.setState("passthrough", Boolean(isPassthrough));

      this.$refs.sheet.open({ passthrough: isPassthrough });
    }

    close() {
      this.$refs.sheet.close();
    }

    handleAction(option) {
      if (option.action) {
        option.action();
      }
      this.close();
    }

    template() {
      const { title, options, passthrough } = this.state;

      const isPassthrough =
        passthrough ||
        this.hasAttribute("passthrough") ||
        this.hasAttribute("no-backdrop");

      return html`
        <modal-sheet
          $sheet
          ?passthrough="${isPassthrough}"
          @close="${() => this.emit("close", { bubbles: true })}"
        >
          <div class="${this.styles.contextMenu}">
            <slot name="title">
              ${title
                ? html`<h3 class="${this.styles.title}">${title}</h3>`
                : ""}
            </slot>
            <slot name="content"></slot>
            <slot></slot>
            ${options && options.length > 0
              ? html`
                  <ul class="${this.styles.list}">
                    ${options.map(
                      (option) => html`
                        <li class="${this.styles.item}">
                          <button
                            type="button"
                            class="${this.styles.button} ${option.danger
                              ? this.styles.danger
                              : ""}"
                            @click="${() => this.handleAction(option)}"
                          >
                            ${option.icon
                              ? html`<ky-icon
                                  class="${this.styles.icon}"
                                  name="${option.icon}"
                                ></ky-icon>`
                              : ""}
                            <span class="${this.styles.text}"
                              >${option.text}</span
                            >
                          </button>
                        </li>
                      `,
                    )}
                  </ul>
                `
              : ""}
          </div>
        </modal-sheet>
      `;
    }
  },
);
