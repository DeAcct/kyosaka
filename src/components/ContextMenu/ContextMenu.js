import { Component, define, html } from "@/lib/core";
import "@/components/ModalSheet/ModalSheet";

import mapping from "./contextMenu.module.scss";
import raw from "./contextMenu.module.scss?inline";

export const ContextMenu = define("context-menu", { mapping, raw })(
  class extends Component {
    setup() {
      this.state = {
        title: "",
        options: [], // Array of { text, icon, danger, action }
      };
    }

    open({ title, options }) {
      this.setState("title", title || "");
      this.setState("options", options || []);
      this.$refs.sheet.open();
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
      const { title, options } = this.state;
      return html`
        <modal-sheet $sheet>
          <div class="${this.styles.contextMenu}">
            ${title ? html`<h3 class="${this.styles.title}">${title}</h3>` : ""}
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
                      <span class="${this.styles.text}">${option.text}</span>
                    </button>
                  </li>
                `,
              )}
            </ul>
          </div>
        </modal-sheet>
      `;
    }
  },
);
