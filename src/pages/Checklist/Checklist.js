import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";

import mapping from "./page.checklist.module.scss";
import raw from "./page.checklist.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";
import { Progress } from "@/components/Progress/Progress";

export const ChecklistPage = define("page-checklist", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(checklistStore);
    }

    get mock() {
      return [{ done: false, text: "여권 챙기기", id: 123 }];
    }

    template() {
      return html`
        <div class="${this.styles.doubleCol}">
          <section class="${this.styles.stickyBoard}">
            <h2 class="${this.styles.title}">준비물 현황</h2>
            <ky-progress
              :percent="${checklistStore.percentage}"
              class="${this.styles.progress}"
              >${checklistStore.percentage}</ky-progress
            >
          </section>
          <ul class="${this.styles.list}">
            ${this.mock.map(
              (item) => html`
                <li
                  key="chk-${item.id}"
                  class="${this.styles.item} ${item.done
                    ? this.styles.done
                    : ""}"
                >
                  <ky-icon>${item.done ? "check_circle" : "circle"}</ky-icon>
                  <span>${item.text}</span>
                </li>
              `
            )}
          </ul>
        </div>
      `;
    }
  }
);
