import { Component, define, html } from "@/lib/core";
import mapping from "./editPositionItem.module.scss";
import raw from "./editPositionItem.module.scss?inline";

import "@/components/Icon/Icon";
import "@/components/Input/Input";

export const EditPositionItem = define("edit-position-item", { mapping, raw })(
  class extends Component {
    handleFieldChange(field, value) {
      this.emit("change-field", { detail: { field, value } });
    }

    handleRemove() {
      this.emit("remove");
    }

    template() {
      const index = parseInt(this.getAttribute("index"), 10) || 0;
      const pos = this.data || { name: "", address: "", map: "" };

      const fields = [
        {
          key: "name",
          label: "장소명",
          icon: "locationPin",
          placeholder: "예)도쿄 도청 전망대",
        },
        {
          key: "address",
          label: "주소",
          icon: "map",
          placeholder: "예) 일본 〒163-8001 Tokyo, Shinjuku City",
        },
        {
          key: "map",
          label: "링크",
          icon: "info",
          placeholder: "구글맵 공유 링크",
        },
      ];

      return html`
        <details
          class="${this.styles.positionBlock}"
          name="schedule-positions"
          ?open="${index === 0}"
        >
          <summary class="${this.styles.summary}">
            ${pos.name || "새 장소"}
            <ky-icon
              name="chevron"
              class="${this.styles.arrow}"
            ></ky-icon>
          </summary>

          <div class="${this.styles.content}">
            ${fields.map(
              (f) => html`
                <section class="${this.styles.formRow}">
                  <i class="${this.styles.label}">${f.label}</i>
                  <ky-input
                    icon="${f.icon}"
                    placeholder="${f.placeholder}"
                    value="${pos[f.key] || ""}"
                    @change="${(e) =>
                      this.handleFieldChange(f.key, e.detail.value)}"
                    class="${this.styles.input}"
                  ></ky-input>
                </section>
              `,
            )}
            <button
              type="button"
              class="${this.styles.removeBtn}"
              @click="${this.handleRemove}"
            >
              <ky-icon
                name="delete"
                class="${this.styles.icon}"
              ></ky-icon>
              <span> 장소 삭제 </span>
            </button>
          </div>
        </details>
      `;
    }
  },
);
