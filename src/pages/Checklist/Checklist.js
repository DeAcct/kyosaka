import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";

import mapping from "./page.checklist.module.scss";
import raw from "./page.checklist.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";
import { Progress } from "@/components/Progress/Progress";
import { ChecklistItem } from "@/components/ChecklistItem/ChecklistItem";
import { ChecklistControl } from "@/components/ChecklistControl/ChecklistControl";

export const ChecklistPage = define("page-checklist", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(checklistStore);
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
            style="--list-length: ${items.length + 1}"
          >
            <span class="${this.styles.title}">체크리스트 완료 현황</span>
            <strong class="${this.styles.progress}">
              ${allChecked.length} / ${items.length}
            </strong>
          </ky-progress>
          <h2 class="${this.styles.title}">전체 체크리스트</h2>
          <ul class="${this.styles.list}">
            ${items.map(
              (item) => html`
                <checklist-item
                  key="item-${item.id}"
                  :item="${item}"
                  @toggle="${({ detail }) => {
                    checklistStore.toggleItem(detail.id);
                  }}"
                  @longpress="${() => {
                    console.log("longpress");
                  }}"
                  class="${this.styles.item}"
                ></checklist-item>
              `
            )}
          </ul>
        </div>
        <checklist-control
          class="${this.styles.input}"
          @add="${({ detail }) => {
            checklistStore.addItem(detail.text);
          }}"
        ></checklist-control>
      `;
    }
  }
);
