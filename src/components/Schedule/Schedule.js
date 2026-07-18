import { Component, define, html } from "@/lib/core";
import { switcher } from "@/lib/switcher";
import { scheduleStore } from "@/store/scheduleStore";
import { toastStore } from "@/store/toastStore";
import { generateDayScheduleFromPrompt } from "@/intelligence/api/yolo";
import {
  checkPromptAPIAvailability,
  getUnsupportedReason,
} from "@/intelligence/supports";

import mapping from "./schedule.module.scss";
import raw from "./schedule.module.scss?inline";

import "@/components/Fallback/Fallback";
import "@/components/SwipeWrap/SwipeWrap";
import "@/components/EditTripForm/EditTripForm";
import "@/components/EditScheduleForm/EditScheduleForm";
import "@/components/ContextMenu/ContextMenu";
import "@/components/YoloConfirmSheet/YoloConfirmSheet";
import "@/components/YoloBox/YoloBox";

import "@/components/ScheduleIcon/ScheduleIcon";
import "@/components/RouteCard/RouteCard";
import "@/components/PositionBox/PositionBox";
import "@/components/Description/Description";
import "@/components/Icon/Icon";

export const Schedule = define("ky-schedule", { mapping, raw })(
  class extends Component {
    #longPressTimer = null;
    #startPos = { x: 0, y: 0 };

    state = {
      isYoloLoading: false,
    };

    setup() {
      this.subscribe(scheduleStore);
    }

    daySwipe({ detail }) {
      return switcher(detail)
        .case(
          ({ direction }) => direction === "left",
          () => scheduleStore.nextDay(),
        )
        .case(
          ({ direction }) => direction === "right",
          () => scheduleStore.prevDay(),
        )
        .default(() => {
          throw new Error(
            `정의되지 않은 방향이 감지되었습니다.\n(Event detail: ${JSON.stringify(detail)})`,
          );
        });
    }

    handlePointerDown(e, item, index) {
      this.#startPos = { x: e.clientX, y: e.clientY };
      if (this.#longPressTimer) clearTimeout(this.#longPressTimer);

      this.#longPressTimer = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(50);
        this.triggerLongPress(item, index);
      }, 450);
    }

    handlePointerMove(e) {
      if (!this.#longPressTimer) return;

      const dist = Math.sqrt(
        Math.pow(e.clientX - this.#startPos.x, 2) +
          Math.pow(e.clientY - this.#startPos.y, 2),
      );
      if (dist > 8) this.cancelLongPress();
    }

    cancelLongPress() {
      if (this.#longPressTimer) {
        clearTimeout(this.#longPressTimer);
        this.#longPressTimer = null;
      }
    }

    handleContextMenu(item, index) {
      if (navigator.vibrate) navigator.vibrate(50);
      this.triggerLongPress(item, index);
    }

    triggerLongPress(item, index) {
      this.#longPressTimer = null;

      const contextMenu = this.$refs.contextMenu;
      if (!contextMenu) return;

      contextMenu.open({
        title: item.name,
        options: [
          {
            text: "수정",
            icon: "edit",
            action: () => {
              scheduleStore.toggleEditSchedule(true, index);
            },
          },
          {
            text: "복사",
            icon: "copy",
            action: async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify(item));
                toastStore.add("일정을 복사했어요!", "info", 2000);
              } catch (err) {
                toastStore.add("일정 복사에 실패했어요", "error", 2000);
              }
            },
          },
          {
            text: "삭제",
            icon: "delete",
            danger: true,
            action: () => {
              scheduleStore.removeScheduleItem(index);
              toastStore.add("일정을 삭제했어요!", "info", 2000);
            },
          },
        ],
      });
    }

    handleYolo(e) {
      const promptText = e.detail.prompt.trim();
      if (!promptText) {
        toastStore.add(
          "AI에게 부탁할 하루 일정을 입력해 주세요.",
          "error",
          2000,
        );
        return;
      }

      const confirmSheet = this.$refs.yoloConfirmSheet;
      if (confirmSheet) {
        confirmSheet.open(promptText);
      }
    }

    async executeYolo(promptText) {
      const availability = await checkPromptAPIAvailability();

      if (availability === "no") {
        toastStore.add(getUnsupportedReason(), "error", 3000);
        return;
      }

      if (availability === "after-download") {
        toastStore.add(
          "AI 연산에 필요한 로컬 인공지능 모델을 다운로드하고 있습니다. 다운로드가 끝날 때까지 잠시만 기다리신 후 다시 시도해 주세요.",
          "error",
          3000,
        );
        return;
      }

      this.setState("isYoloLoading", true);
      toastStore.add("AI가 하루 일정을 설계하고 있어요...", "info", 3000);

      try {
        const plan = scheduleStore.plans.find(
          (p) => p.id === scheduleStore.state.selected,
        );
        const dayIndex = plan ? plan.selected : -1;
        const totalDays = plan ? plan.data.length : 0;

        const isFirstDay = dayIndex === 0;
        const isLastDay = dayIndex === totalDays - 1;

        const result = await generateDayScheduleFromPrompt(promptText, {
          isFirstDay,
          isLastDay,
        });

        scheduleStore.setDaySchedule(
          result.schedules,
          result.dayName,
          result.dayDescription,
        );
        if (this.$refs.yoloBox) {
          this.$refs.yoloBox.clear();
        }
        toastStore.add("하루 일정을 성공적으로 채워넣었어요!", "success", 2000);
      } catch (err) {
        toastStore.add(
          err.message || "AI 일정 생성에 실패했습니다.",
          "error",
          2000,
        );
      } finally {
        this.setState("isYoloLoading", false);
      }
    }

    template() {
      const plans = scheduleStore.plans;
      const list = scheduleStore.selectedDayList;

      if (!plans || plans.length === 0) {
        return html`<ky-fallback>등록된 여행 플랜이 없습니다.</ky-fallback>`;
      }

      return html`
        <slot name="selector"></slot>
        <div class="${this.styles.colBG}">
          <p class="${this.styles.emptyHolder}">일정을 누르면 열립니다</p>
        </div>

        <swipe-wrap
          @swipe="${(e) => this.daySwipe(e)}"
          @pointermove="${this.handlePointerMove}"
          @pointerup="${this.cancelLongPress}"
          @pointerleave="${this.cancelLongPress}"
        >
          <yolo-box
            $yolo-box
            loading="${this.state.isYoloLoading}"
            @yolo="${(e) => this.handleYolo(e)}"
            class="${this.state.yoloFeature}"
          ></yolo-box>
          ${list.schedule.map(
            (item, index) => html`
              <details
                name="itinerary"
                class="${this.styles.schedule}"
                $details
                style="--schedule-rows:${list.schedule.length +
                1}; --i:${index};"
              >
                <summary
                  class="${this.styles.shrink}"
                  @pointerdown="${(e) =>
                    this.handlePointerDown(e, item, index)}"
                  @contextmenu.prevent="${() =>
                    this.handleContextMenu(item, index)}"
                  style="user-select: none; -webkit-user-select: none;"
                >
                  <schedule-icon
                    class="${this.styles.icon}"
                    name="${item.type}"
                  ></schedule-icon>

                  <div class="${this.styles.text}">
                    <h2 class="${this.styles.name}">${item.name}</h2>
                    <p class="${this.styles.time}">
                      ${item.time.from} ~ ${item.time.to}
                    </p>
                  </div>
                  <ky-icon
                    class="${this.styles.arrow}"
                    name="chevron"
                  ></ky-icon>
                </summary>

                <div class="${this.styles.content}">
                  <strong class="${this.styles.contentTitle}">
                    ${item.name}
                  </strong>

                  ${item.route
                    ? html`<route-card
                        :from="${item.route.from}"
                        :to="${item.route.to}"
                      ></route-card>`
                    : ""}
                  ${item.position
                    ? item.position.map(
                        (location) =>
                          html`<position-box
                            :data="${location}"
                          ></position-box>`,
                      )
                    : ""}
                  <ky-description
                    :list="${item.description || []}"
                  ></ky-description>
                </div>

                <div class="${this.styles.mask}"></div>
              </details>
            `,
          )}
          <button
            type="button"
            class="${this.styles.schedule}"
            @click="${() => scheduleStore.toggleEditSchedule(true, -1)}"
          >
            <ky-icon
              name="add"
              class="${this.styles.addIcon}"
            ></ky-icon>
            일정 추가
          </button>
        </swipe-wrap>
        <edit-trip-form></edit-trip-form>
        <edit-schedule-form
          :schedule-data="${scheduleStore.editingScheduleItem}"
        ></edit-schedule-form>
        <context-menu $context-menu></context-menu>
        <yolo-confirm-sheet
          $yolo-confirm-sheet
          @confirm="${(e) => this.executeYolo(e.detail.prompt)}"
        ></yolo-confirm-sheet>
      `;
    }
  },
);
