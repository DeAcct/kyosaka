import { Component, define, html } from "@/lib/core";

import "@/components/Icon/Icon";
import "@/components/ContextMenu/ContextMenu";

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
        { icon: "export", action: () => this.openExportMenu() },
      ];
    }

    getExportFile() {
      const plan = scheduleStore.selectedPlan;
      if (!plan || !plan.id) {
        toastStore.add("내보낼 계획표가 없습니다.", "error", 2000);
        return null;
      }

      const filename = `${plan.title || "trip"}.json`;
      return {
        plan,
        file: new File([JSON.stringify(plan, null, 2)], filename, {
          type: "application/json",
        }),
        filename,
      };
    }

    openExportMenu() {
      this.$refs.contextMenu.open({
        title: "계획표 내보내기",
        options: [
          { text: "공유하기", icon: "share", action: () => this.shareJSON() },
          { text: "저장하기", icon: "export", action: () => this.saveJSON() },
        ],
      });
    }

    shareJSON() {
      const exportData = this.getExportFile();
      if (!exportData) return;

      const { file, plan } = exportData;
      if (typeof navigator.share !== "function") {
        toastStore.add("이 브라우저에서는 공유할 수 없어요.", "error", 2000);
        return;
      }

      navigator
        .share({ files: [file], title: `${plan.title || "계획표"} 공유` })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("계획표 공유에 실패했습니다.", error);
          }
        });
    }

    saveJSON() {
      const exportData = this.getExportFile();
      if (!exportData) return;

      const { file, filename } = exportData;
      const url = URL.createObjectURL(file);
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
        <context-menu $context-menu></context-menu>
      `;
    }
  },
);
