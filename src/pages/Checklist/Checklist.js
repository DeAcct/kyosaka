import { Component, define, html } from "@/lib/core";
import { checklistStore } from "@/store/checklistStore";

import mapping from "./page.checklist.module.scss";
import raw from "./page.checklist.module.scss?inline";

import { DaySelector } from "@/components/DaySelector/DaySelector";
import { Schedule } from "@/components/Schedule/Schedule";

export const ChecklistPage = define("page-checklist", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(checklistStore);
    }

    template() {
      // 🔍 html 태그를 사용한 선언적 템플릿
      return html`
        <div class="${this.styles.doubleCol}">
          <section class="${this.styles.leftCol}">
            <h2 class="${this.styles.title}">준비물 현황</h2>
            <div class="${this.styles.progressCard}">
              <span>전체 완료율:${checklistStore.percentage * 100}%</span>
            </div>
          </section>

          <section class="${this.styles.rightCol}">
            <ul class="${this.styles.itemList}">
              ${checklistStore.items.map(
                (item) => html`
                  <!--li
                    key="chk-${item.id}"
                    class="${item.done ? this.styles.done : ""}"
                  >
                    <ky-icon>${item.done ? "check_circle" : "circle"}</ky-icon>
                    <span>${item.text}</span>
                  </li-->
                `
              )}
            </ul>
          </section>
        </div>
      `;
    }
  }
);
