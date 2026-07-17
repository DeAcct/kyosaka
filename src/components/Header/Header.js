import { Component, define, html } from "@/lib/core";

import "@/components/Icon/Icon";

import mapping from "./header.module.scss";
import raw from "./header.module.scss?inline";

import { scheduleStore } from "@/store/scheduleStore";
import { navStore } from "@/store/navStore";
import { toastStore } from "@/store/toastStore";

export const Header = define("ky-header", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
    }
    get actions() {
      const plans = scheduleStore.plans || [];
      const hasPlan = plans.length > 0;

      return [
        // 🔥 플랜이 정말 존재할 때만 수정 버튼 액션을 배열에 추가합니다.
        ...(hasPlan ? [{ icon: "edit", action: () => this.editTrip() }] : []),
        { icon: "export", action: () => this.exportJSON() },
      ];
    }

    exportJSON() {
      const plan = scheduleStore.selectedPlan;
      if (!plan || !plan.id) {
        toastStore.add("내보낼 계획표가 없습니다.", "error", 2000);
        return;
      }

      const filename = `${plan.title || "trip"}.json`;
      const blob = new Blob([JSON.stringify(plan, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toastStore.add("계획표를 다운로드했어요!", "success", 2000);
    }
    editTrip() {
      scheduleStore.toggleEditTrip(true);
      console.log(scheduleStore.isOpenEditTrip);
    }
    template() {
      return html`
        <header class="${this.styles.header}">
          <button class="${this.styles.button}" type="button" @click="${() => {
            navStore.toggle();
          }}">
            <ky-icon name="hamburger" class="${this.styles.icon}"></ky-icon>
          </button>
          <h1 class="sr-only">쿄사카</h2>
          <h2 class="${this.styles.text}">
            ${scheduleStore.selectedPlan.title || "계획표"}
          </h2>
          ${this.actions.map(
            ({ icon, action }) => html`
              <button
                type="button"
                class="${this.styles.button}"
                @click="${action}"
              >
                <ky-icon
                  name="${icon}"
                  class="${this.styles.icon}"
                ></ky-icon>
              </button>
            `,
          )}

          
        </header>
      `;
    }
  },
);
