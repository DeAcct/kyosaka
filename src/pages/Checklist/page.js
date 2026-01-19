import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";

import mapping from "./checklist.page.module.scss";
import raw from "./checklist.page.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";
import { Progress } from "@/components/Progress/Progress";
import { ChecklistItem } from "@/components/ChecklistItem/ChecklistItem";
import { ChecklistControl } from "@/components/ChecklistControl/ChecklistControl";

export const ChecklistPage = define("page-checklist", { mapping, raw })(
  class extends Component {
    state = {
      mode: "view",
      deleteSelected: [],
    };
    setup() {
      this.subscribe(checklistStore);
    }

    onToggleItem({ detail }) {
      if (this.state.mode === "edit") return;
      checklistStore.toggleItem(detail.id);
    }

    onLongpressItem({ detail }) {
      this.setState("mode", "edit");
      this.setState("deleteSelected", [
        ...this.state.deleteSelected,
        detail.id,
      ]);
      console.log(this.state);
    }

    onClickItem(id) {
      if (this.state.mode === "view") return;
      const isSelected = this.state.deleteSelected.includes(id);
      console.log(id, isSelected);
      const result = isSelected
        ? this.state.deleteSelected.filter((item) => item !== id)
        : [...this.state.deleteSelected, id];

      this.setState("deleteSelected", result);
    }

    template() {
      const {
        percentage: percent,
        progress,
        items,
        allChecked,
      } = checklistStore;
      return html`
        <div class="${this.styles.doubleCol}">
          <ky-progress
            :progress="${progress}"
            class="${this.styles.sticky}"
            style="--list-length: ${items.length + 2}"
          >
            <span class="${this.styles.title}">체크리스트 완료 현황</span>
            <strong class="${this.styles.progress}">
              ${allChecked.length} / ${items.length}
            </strong>
          </ky-progress>
          <h2 class="${this.styles.title}">전체 체크리스트</h2>
          <ul class="${this.styles.list}">
            ${items.map(
              (item, index) => html`
                <checklist-item
                  key="item-${item.id}"
                  class="${this.styles
                    .item} ${this.state.deleteSelected.includes(item.id)
                    ? this.styles.selected
                    : ""}"
                  style="--i:${index}"
                  :item="${item}"
                  @toggle="${(e) => {
                    this.onToggleItem(e);
                  }}"
                  @longpress="${(e) => {
                    this.onLongpressItem(e);
                  }}"
                  @click="${() => {
                    this.onClickItem(item.id);
                  }}"
                  :selectmode="${this.state.mode === "edit"}"
                ></checklist-item>
              `,
            )}
          </ul>
        </div>
        <checklist-control
          class="${this.styles.control}"
          @add="${({ detail }) => {
            checklistStore.addItem(detail.text);
          }}"
          @delete=${() => {
            checklistStore.removeList(this.state.deleteSelected);
            this.setState("mode", "view");
          }}
          @cancel=${() => {
            this.setState("deleteSelected", []);
            this.setState("mode", "view");
          }}
          :mode="${this.state.mode}"
        ></checklist-control>
      `;
    }
  },
);
