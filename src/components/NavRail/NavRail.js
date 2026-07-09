import { Component, define, html } from "@/lib/core";

import { Icon } from "@/components/Icon/Icon";

import mapping from "./navRail.module.scss";
import raw from "./navRail.module.scss?inline";

import { navStore } from "@/store/navStore";
import { scheduleStore } from "@/store/scheduleStore";
import { useTimeFormat } from "@/hooks/time";
import { useJSONUpload } from "@/hooks/file";
import { useEdit } from "@/hooks/edit";

import { PlanItem } from "@/components/PlanItem/PlanItem";
import { BottomSheet } from "@/components/BottomSheet/BottomSheet";
import { PlanEditbar } from "@/components/PlanEditbar/PlanEditbar";

export const NavRail = define("nav-rail", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(navStore);
      this.subscribe(scheduleStore);

      this.editor = useEdit(this);
      this.state = {
        ...this.editor.state, // 훅의 초기 상태 병합
      };
    }
    get plans() {
      return scheduleStore.plans;
    }

    // async onJSONButtonClick() {
    // await useJSONUpload((data) => {
    //   // scheduleStore.commit("list", data);
    //   scheduleStore.importPlan(data);
    // });
    // }

    async importJSON() {
      await useJSONUpload((data) => {
        // scheduleStore.commit("list", data);
        scheduleStore.importPlan(data);
      });
    }

    newPlan() {
      scheduleStore.newPlan();
    }

    get actions() {
      return [
        { icon: "import", action: this.importJSON, text: "가져오기" },
        { icon: "add", action: this.newPlan, text: "새로 만들기" },
      ];
    }

    closeNav() {
      navStore.toggle();
      this.editor.exitEdit();
    }

    onDelete() {
      scheduleStore.removePlan(this.state.deleteSelected);
      this.editor.exitEdit();
    }

    template() {
      const { isOpen } = navStore.state;
      return html`
        <nav class="${this.styles.navRail} ${isOpen ? this.styles.open : ""}">
          <header class="${this.styles.controller}">
            <button
              class="${this.styles.close}"
              type="button"
              @click="${this.closeNav}"
            >
              <ky-icon name="hamburger" class="${this.styles.icon}"></ky-icon>
            </button>
            <strong class="${this.styles.logo}">kyosaka</strong>
          </header>
          <div class="${this.styles.actions}">
            ${this.actions.map(
              ({ icon, action, text }) => html`
                <button
                  type="button"
                  class="${this.styles.button}"
                  @click="${() => {
                    if (this.state.mode !== "edit") action();
                  }}"
                >
                  <ky-icon class="${this.styles.icon}" name="${icon}"></ky-icon>
                  ${text}
                </button>
              `,
            )}
          </div>
          <ul class="${this.styles.plans}">
            ${this.plans.map(
              ({ id, edited, title }) => html`
                <plan-item
                  :id="${id}"
                  :edited="${edited}"
                  :title="${title}"
                  @longpress="${(e) => {
                    this.editor.onLongpressItem({ detail: { id } });
                  }}"
                  @click="${() => {
                    this.editor.onClickItem(id);
                  }}"
                  class="${this.styles
                    .item} ${this.state.deleteSelected.includes(id)
                    ? this.styles.selected
                    : ""}"
                  :editmode="${this.state.mode === "edit"}"
                ></plan-item>
              `,
            )}
          </ul>
        </nav>
        ${this.state.mode === "edit"
          ? html` <plan-editbar
              @delete="${this.onDelete}"
              @exit="${this.editor.exitEdit}"
              :counter="${this.state.deleteSelected.length}"
              class="${this.styles.editbar}"
            ></plan-editbar>`
          : ""}
        <div class="${this.styles.backdrop}" @click="${this.closeNav}"></div>
      `;
    }
  },
);
