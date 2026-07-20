import { Component, define, html, block } from "@/lib/core";

import mapping from "./navRail.module.scss";
import raw from "./navRail.module.scss?inline";

import { navStore } from "@/store/navStore";
import { scheduleStore } from "@/store/scheduleStore";
import { toastStore } from "@/store/toastStore";
import { useJSONUpload } from "@/hooks/file";
import { useEdit } from "@/hooks/edit";

import "@/components/Icon/Icon";
import "@/components/PlanItem/PlanItem";
import "@/components/ModalSheet/ModalSheet";
import "@/components/PlanEditbar/PlanEditbar";
import "@/components/ImportOverwriteSheet/ImportOverwriteSheet";
import "@/components/DarkModeToggle/DarkModeToggle";

const planItemBlock = block(
  (props) => html`
    <plan-item
      :id="${props.id}"
      :edited="${props.edited}"
      :title="${props.title}"
      @longpress="${props.onLongPress}"
      @click="${props.onClick}"
      class="${props.itemClass} ${props.isSelected ? props.selectedClass : ""}"
      :editmode="${props.editMode}"
    ></plan-item>
  `,
);

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
        if (scheduleStore.hasPlan(data.id)) {
          this.$refs.overwriteSheet.open(data);
        } else {
          scheduleStore.importPlan(data);
          this.closeNav();
        }
      });
    }

    newPlan() {
      scheduleStore.newPlan();
    }

    get actions() {
      return [
        {
          icon: "import",
          action: () => {
            this.importJSON();
          },
          text: "가져오기",
        },
        {
          icon: "add",
          action: () => {
            this.newPlan();
          },
          text: "새로 만들기",
        },
      ];
    }

    closeNav() {
      navStore.toggle();
      this.editor.exitEdit();
    }

    onDelete() {
      scheduleStore.removePlan(this.state.deleteSelected);
      this.editor.exitEdit();
      toastStore.add("플랜을 삭제했어요!", "info", 2000);
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
              <ky-icon
                name="hamburger"
                class="${this.styles.icon}"
              ></ky-icon>
            </button>
            <strong class="${this.styles.logo}">kyosaka</strong>
            <dark-mode-toggle
              class="${this.styles.darkmode}"
            ></dark-mode-toggle>
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
                  <ky-icon
                    class="${this.styles.icon}"
                    name="${icon}"
                  ></ky-icon>
                  ${text}
                </button>
              `,
            )}
          </div>
          <ul class="${this.styles.plans}">
            ${this.plans.map(({ id, edited, title }) =>
              planItemBlock({
                id,
                edited,
                title,
                itemClass: this.styles.item,
                isSelected: this.state.deleteSelected.includes(id),
                selectedClass: this.styles.selected,
                editMode: this.state.mode === "edit",
                onLongPress: (e) =>
                  this.editor.onLongpressItem({ detail: { id } }),
                onClick: () => this.editor.onClickItem(id),
              }),
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
        <div
          class="${this.styles.backdrop}"
          @click="${this.closeNav}"
        ></div>
        <import-overwrite-sheet
          $overwrite-sheet
          @confirm="${() => this.closeNav()}"
        ></import-overwrite-sheet>
      `;
    }
  },
);
