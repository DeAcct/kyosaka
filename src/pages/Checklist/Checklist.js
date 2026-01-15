import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";

import mapping from "./page.checklist.module.scss";
import raw from "./page.checklist.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";
import { Progress } from "@/components/Progress/Progress";
import { ChecklistItem } from "@/components/ChecklistItem/ChecklistItem";
import { ChecklistInput } from "@/components/ChecklistInput/ChecklistInput";

export const ChecklistPage = define("page-checklist", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(checklistStore);
    }

    template() {
      const { percentage: percent, progress } = checklistStore;
      return html`
        <div class="${this.styles.doubleCol}">
          <ky-progress
            :progress="${progress}"
            class="${this.styles.sticky}"
            style="--list-length: ${checklistStore.items.length + 1}"
          >
            <h2 class="${this.styles.title}">준비물 현황</h2>
            <span class="${this.styles.progress}">
              ${checklistStore.allChecked.length} /
              ${checklistStore.items.length}
            </span>
          </ky-progress>
          <ul class="${this.styles.list}">
            ${checklistStore.items.map(
              (item) => html`
                <checklist-item
                  key="item-${item.id}"
                  :item="${item}"
                  @toggle="${({ detail }) => {
                    checklistStore.toggleItem(detail.id);
                    console.log(item.checked);
                  }}"
                  class="${this.styles.item}"
                ></checklist-item>
              `
            )}
          </ul>
        </div>
        <checklist-input class="${this.styles.input}"></checklist-input>
      `;
    }
  }
);
