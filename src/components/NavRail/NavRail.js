import { Component, define, html } from "@/lib/core";

import { Icon } from "@/components/Icon/Icon";

import mapping from "./navRail.module.scss";
import raw from "./navRail.module.scss?inline";

import { navStore } from "@/store/navStore";
import { scheduleStore } from "@/store/scheduleStore";
import { useTimeFormat } from "@/hooks/time";
import { useJSONUpload } from "@/hooks/file";

export const NavRail = define("nav-rail", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(navStore);
      this.subscribe(scheduleStore);
    }
    get plans() {
      return scheduleStore.plans;
    }

    async onJSONButtonClick() {
      await useJSONUpload((data) => {
        // scheduleStore.commit("list", data);
        scheduleStore.newPlan(data);
      });
    }

    template() {
      const { isOpen } = navStore.state;
      return html` <nav
          class="${this.styles.navRail} ${isOpen ? this.styles.open : ""}"
        >
          <div class="${this.styles.sticky}">
            <div class="${this.styles.controller}">
              <button
                class="${this.styles.close}"
                type="button"
                @click="${() => {
                  navStore.toggle();
                }}"
              >
                <ky-icon name="hamburger" class="${this.styles.icon}"></ky-icon>
              </button>
              <strong class="${this.styles.logo}">kyosaka</strong>
            </div>
            <button
              type="button"
              class="${this.styles.button}"
              @click="${this.onJSONButtonClick}"
            >
              <ky-icon class="${this.styles.icon}" name="add"></ky-icon>
              새 계획표
            </button>
          </div>
          <ul class="${this.styles.plans}">
            ${this.plans.map(
              ({ id, edited, title }) => html`
                <li
                  class="${this.styles.planItem} ${id ===
                  scheduleStore.selectedPlan.id
                    ? this.styles.selected
                    : ""}"
                >
                  <button
                    class="${this.styles.planButton}"
                    @click="${() => {
                      scheduleStore.changePlan();
                    }}"
                  >
                    <strong class="${this.styles.planTitle}">${title}</strong>
                    <p class="${this.styles.edited}">
                      ${useTimeFormat(edited)} 수정
                    </p>
                  </button>
                </li>
              `,
            )}
          </ul>
        </nav>
        <div
          class="${this.styles.backdrop}"
          @click="${() => {
            navStore.toggle();
          }}"
        ></div>`;
    }
  },
);
