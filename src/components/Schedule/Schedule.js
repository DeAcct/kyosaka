import { Component, define, html, block } from "@/lib/core";
import { switcher } from "@/lib/switcher";
import { scheduleStore } from "@/store/scheduleStore";
import { toastStore } from "@/store/toastStore";
import { generateDayScheduleFromPrompt } from "@/intelligence/api/yolo";

import mapping from "./schedule.module.scss";
import raw from "./schedule.module.scss?inline";

import "@/components/Fallback/Fallback";
import "@/components/SwipeWrap/SwipeWrap";
import "@/components/EditScheduleForm/EditScheduleForm";
import "@/components/ContextMenu/ContextMenu";
import "@/components/YoloConfirmSheet/YoloConfirmSheet";
import "@/components/ControlBar/ControlBar";
import "@/components/DeleteConfirmSheet/DeleteConfirmSheet";

import "@/components/ScheduleIcon/ScheduleIcon";
import "@/components/RouteCard/RouteCard";
import "@/components/PositionBox/PositionBox";
import "@/components/Description/Description";
import "@/components/Icon/Icon";

const scheduleItemBlock = (props) => html`
  <details
    name="itinerary"
    class="${props.styles.schedule}"
    $details
    style="--schedule-rows:${props.totalRows}; --i:${props.index};"
  >
    <summary
      class="${props.styles.shrink}"
      @pointerdown="${props.onPointerDown}"
      @contextmenu.prevent="${props.onContextMenu}"
      style="user-select: none; -webkit-user-select: none;"
    >
      <schedule-icon
        class="${props.styles.icon}"
        name="${props.item.type}"
      ></schedule-icon>

      <div class="${props.styles.text}">
        <h2 class="${props.styles.name}">${props.item.name}</h2>
        <p class="${props.styles.time}">
          ${props.item.time.from} ~ ${props.item.time.to}
        </p>
      </div>
      <ky-icon
        class="${props.styles.arrow}"
        name="chevron"
      ></ky-icon>
    </summary>

    <div class="${props.styles.content}">
      <strong class="${props.styles.contentTitle}"> ${props.item.name} </strong>

      ${props.item.route
        ? html`<route-card
            :from="${props.item.route.from}"
            :to="${props.item.route.to}"
          ></route-card>`
        : ""}
      <ky-position-list :list="${props.item.position || []}"></ky-position-list>
      <ky-description :list="${props.item.description || []}"></ky-description>
    </div>

    <div class="${props.styles.mask}"></div>
  </details>
`;

export const Schedule = define("ky-schedule", { mapping, raw })(
  class extends Component {
    #longPressTimer = null;
    #startPos = { x: 0, y: 0 };

    state = {
      isYoloLoading: false,
      pendingDeleteIndex: -1,
      temporarySchedule: null,
      yoloStatusText: "",
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
              this.setState("pendingDeleteIndex", index);
              this.$refs.deleteSheet.open({ name: item.name });
            },
          },
        ],
      });
    }

    handleYolo(e) {
      const promptText = (e.detail.value || "").trim();
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
      this.setState("isYoloLoading", true);
      this.setState("temporarySchedule", []);
      this.setState("yoloStatusText", "AI에 요청중...");
      toastStore.add("AI가 하루 일정을 설계하고 있어요...", "info", 3000);

      try {
        const plan = scheduleStore.plans.find(
          (p) => p.id === scheduleStore.state.selected,
        );
        const dayIndex = plan ? plan.selected : -1;
        const totalDays = plan ? plan.data.length : 0;

        const isFirstDay = dayIndex === 0;
        const isLastDay = dayIndex === totalDays - 1;

        const stream = generateDayScheduleFromPrompt(promptText, {
          isFirstDay,
          isLastDay,
        });

        let finalResult = null;
        for await (const result of stream) {
          this.setState("yoloStatusText", "AI가 만든 일정 분석중...");
          this.setState("temporarySchedule", result.schedules);
          finalResult = result;
        }

        if (finalResult) {
          scheduleStore.setDaySchedule(
            finalResult.schedules,
            finalResult.dayName,
            finalResult.dayDescription,
          );
        }

        if (this.$refs.controlBar) {
          this.$refs.controlBar.clear();
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
        this.setState("temporarySchedule", null);
        this.setState("yoloStatusText", "");
      }
    }

    template() {
      const plans = scheduleStore.plans;
      const list = scheduleStore.selectedDayList;

      if (!plans || plans.length === 0) {
        return html`<ky-fallback>등록된 여행 플랜이 없습니다.</ky-fallback>`;
      }

      const renderSchedule =
        this.state.isYoloLoading && this.state.temporarySchedule
          ? this.state.temporarySchedule
          : list.schedule;

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
          <control-bar
            $controlBar
            class="${this.styles.yoloBar} ${this.state.yoloFeature}"
            loading="${this.state.isYoloLoading}"
            @submit="${(e) => this.handleYolo(e)}"
            :placeholder="${this.state.isYoloLoading
              ? this.state.yoloStatusText
              : "AI에게 부탁할 하루 일정 입력..."}"
            primary-icon="dice"
          ></control-bar>
          ${renderSchedule.map((item, index) =>
            scheduleItemBlock({
              item,
              index,
              totalRows: renderSchedule.length + 1,
              styles: this.styles,
              onPointerDown: (e) => this.handlePointerDown(e, item, index),
              onContextMenu: () => this.handleContextMenu(item, index),
            }),
          )}
          ${this.state.isYoloLoading
            ? []
            : [
                html`
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
                `,
              ]}
        </swipe-wrap>
        <edit-schedule-form
          :schedule-data="${scheduleStore.editingScheduleItem}"
        ></edit-schedule-form>
        <context-menu $context-menu></context-menu>
        <delete-confirm-sheet
          $delete-sheet
          @confirm="${() => {
            const idx = this.state.pendingDeleteIndex;
            if (idx >= 0) {
              scheduleStore.removeScheduleItem(idx);
              toastStore.add("일정을 삭제했어요!", "info", 2000);
              this.setState("pendingDeleteIndex", -1);
            }
          }}"
        >
          <h3 class="title">일정을 삭제하시겠습니까?</h3>
        </delete-confirm-sheet>
        <yolo-confirm-sheet
          $yolo-confirm-sheet
          @confirm="${(e) => this.executeYolo(e.detail.prompt)}"
        ></yolo-confirm-sheet>
      `;
    }
  },
);
