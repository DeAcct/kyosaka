// components/EditScheduleForm/EditScheduleForm.js
import { Component, define, html } from "@/lib/core";
import { scheduleStore } from "@/store/scheduleStore";
import { toastStore } from "@/store/toastStore";

import mapping from "./editScheduleForm.module.scss";
import raw from "./editScheduleForm.module.scss?inline";

import "@/components/ModalSheet/ModalSheet";
import "@/components/Icon/Icon";
import "@/components/Input/Input";
import "@/components/TypeSelector/TypeSelector";
import "@/components/TimeRange/TimeRange";
import "@/components/EditPositionItem/EditPositionItem";
import { generateScheduleFromPrompt } from "@/intelligence/api/schedule";
import {
  checkPromptAPIAvailability,
  getUnsupportedReason,
} from "@/intelligence/supports";

const SCHEDULE_TYPES = [
  { value: "transport", label: "이동", icon: "transport" },
  { value: "hotel", label: "숙소", icon: "hotel" },
  { value: "food", label: "식사", icon: "food" },
  { value: "attractions", label: "명소", icon: "attractions" },
  { value: "landscape", label: "풍경", icon: "landscape" },
  { value: "onsen", label: "온천", icon: "onsen" },
  { value: "shopping", label: "쇼핑", icon: "shopping" },
  { value: "photo_camera", label: "사진", icon: "photo_camera" },
  { value: "temple_buddhist", label: "전통", icon: "temple_buddhist" },
];

const SUPPORTS_PROMPT_API =
  typeof window !== "undefined" &&
  ("LanguageModel" in window ||
    ("ai" in window && "languageModel" in window.ai));

export const EditScheduleForm = define("edit-schedule-form", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);
      this.state = {
        ...this.parseScheduleToState(),
        isAiLoading: false,
      };
    }

    setState(key, newState) {
      if (key === "now") {
        this.state = { ...this.state, ...newState };
        this.queueRender();
      } else {
        super.setState(key, newState);
      }
    }

    parseScheduleToState(item) {
      const target = item || {};
      const positions =
        Array.isArray(target.position) && target.position.length > 0
          ? target.position.map((p) => ({
              name: p.name || "",
              address: p.address || "",
              map: p.map || "",
            }))
          : [{ name: "", address: "", map: "" }];

      return {
        name: target.name || "",
        type: target.type || "transport",
        timeFrom: target.time?.from || "09:00",
        timeTo: target.time?.to || "10:00",
        budget: target.budget || 0,
        routeFrom: target.route?.from || "",
        routeTo: target.route?.to || "",
        positions,
        descriptionText: Array.isArray(target.description)
          ? target.description.join("\n")
          : target.description || "",
      };
    }

    parseStateToSchedule(state) {
      const {
        name,
        type,
        timeFrom,
        timeTo,
        budget,
        routeFrom,
        routeTo,
        positions,
        descriptionText,
      } = state;

      const updatedItem = {
        name,
        type,
        time: { from: timeFrom, to: timeTo },
        budget,
        description: descriptionText
          .split("\n")
          .filter((line) => line.trim() !== ""),
      };

      if (type === "transport") {
        updatedItem.route = {
          from: routeFrom,
          to: routeTo,
        };
        updatedItem.position = null;
      } else {
        const validPositions = (positions || []).filter(
          (pos) => pos.name.trim() || pos.address.trim() || pos.map.trim(),
        );
        updatedItem.position = validPositions;
        updatedItem.route = null;
      }

      return updatedItem;
    }

    addPosition() {
      const positions = [
        ...this.state.positions,
        { name: "", address: "", map: "" },
      ];
      this.setState("positions", positions);
    }

    removePosition(index) {
      const positions = this.state.positions.filter((_, idx) => idx !== index);
      const updatedPositions =
        positions.length > 0 ? positions : [{ name: "", address: "", map: "" }];
      this.setState("positions", updatedPositions);
    }

    updatePositionField(index, field, value) {
      const positions = this.state.positions.map((pos, idx) => {
        if (idx === index) {
          return { ...pos, [field]: value };
        }
        return pos;
      });
      this.setState("positions", positions);
    }

    handleTypeChange(typeValue) {
      this.setState("type", typeValue);
    }

    handleTimeChange({ detail }) {
      const { start, end } = detail;
      this.setState("timeFrom", start);
      this.setState("timeTo", end);
    }

    handleNameChange(e) {
      this.setState("name", e.detail.value);
    }

    handleCancel() {
      scheduleStore.toggleEditSchedule(false);
    }

    async handlePaste() {
      try {
        const text = await navigator.clipboard.readText();
        const item = JSON.parse(text);

        if (!item || typeof item !== "object" || !item.name) {
          toastStore.add("올바른 일정 복사 데이터가 아닙니다.", "error", 2000);
          return;
        }

        this.state = this.parseScheduleToState(item);

        toastStore.add("일정 정보를 붙여넣었어요!", "success", 2000);
      } catch (err) {
        toastStore.add(
          "클립보드 읽기에 실패했거나 올바르지 않은 데이터입니다.",
          "error",
          2000,
        );
      }
    }

    async handleAi() {
      const { name, type } = this.state;
      let promptText = name.trim();

      if (!promptText) {
        const defaultPrompts = {
          transport: "이동 경로 또는 교통편 추천",
          hotel: "가까운 숙소 또는 인기 호텔 추천",
          food: "주변 맛집 또는 식사할 곳 추천",
          attractions: "근처 대표적인 관광 명소 추천",
          landscape: "풍경이 멋진 뷰포인트나 산책로 추천",
          onsen: "근처 온천 또는 센토 추천",
          shopping: "근처 기념품점 또는 대형 쇼핑몰 추천",
          photo_camera: "사진 찍기 좋은 핫플레이스나 명소 추천",
          temple_buddhist: "근처 유명한 절, 신사 또는 전통 문화재 추천",
        };
        promptText = defaultPrompts[type] || "여행 일정 추천";
      }

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

      this.setState("isAiLoading", true);
      toastStore.add("AI가 일정을 분석하고 있어요...", "info", 3000);

      try {
        const currentSchedules = scheduleStore.selectedDayList?.schedule || [];
        const editingIndex = scheduleStore.editingScheduleIndex;
        const filteredSchedules = currentSchedules.filter(
          (_, idx) => idx < editingIndex,
        );

        const result = await generateScheduleFromPrompt(
          promptText,
          filteredSchedules,
        );

        this.setState("now", this.parseScheduleToState(result));
        toastStore.add("일정 정보를 채워넣었어요!", "success", 2000);
      } catch (err) {
        toastStore.add(err.message || "AI 분석에 실패했습니다.", "error", 2000);
      } finally {
        this.setState("isAiLoading", false);
      }
    }

    handleSave() {
      const { name } = this.state;

      if (!name.trim()) {
        toastStore.add("일정 이름을 입력해 주세요.", "error", 2000);
        return;
      }

      const updatedItem = this.parseStateToSchedule(this.state);
      const isNew = this.isNew;

      scheduleStore.updateScheduleItem(
        scheduleStore.editingScheduleIndex,
        updatedItem,
      );

      scheduleStore.toggleEditSchedule(false);
      toastStore.add(
        isNew ? "새 일정을 추가했어요!" : "일정을 수정했어요!",
        "success",
        2000,
      );
    }

    get isNew() {
      return scheduleStore.editingScheduleIndex === -1;
    }

    onPropsPatchComplete() {
      if (this.isConnected && this.scheduleData) {
        this.state = this.parseScheduleToState(this.scheduleData);
      }
    }

    afterRender() {
      const isOpen = scheduleStore.isOpenEditSchedule;
      const sheet = this.$refs.sheet;

      if (sheet && sheet.$refs.dialog) {
        const dialogOpen = sheet.$refs.dialog.open;
        if (isOpen && !dialogOpen) {
          sheet.open();
        } else if (!isOpen && dialogOpen) {
          sheet.close();
        }
      }
    }

    template() {
      const isOpen = scheduleStore.isOpenEditSchedule;

      if (isOpen && !this._isOpen) {
        this.state = this.parseScheduleToState(
          this.scheduleData || scheduleStore.editingScheduleItem,
        );
      }
      this._isOpen = isOpen;

      const {
        name,
        type,
        timeFrom,
        timeTo,
        budget,
        routeFrom,
        routeTo,
        positions,
        descriptionText,
        isAiLoading,
      } = this.state;

      const tooltips = [
        { icon: "paste", title: "일정 붙여넣기", onClick: this.handlePaste },
        ...(SUPPORTS_PROMPT_API
          ? [
              {
                icon: "ai",
                title: "일정 ai추천",
                onClick: () => this.handleAi(),
              },
            ]
          : []),
      ];

      return html`
        <modal-sheet
          $sheet
          @close="${() => scheduleStore.toggleEditSchedule(false)}"
        >
          ${isOpen
            ? html`
                <div class="${this.styles.formContainer}">
                  <div class="${this.styles.scrollContent}">
                    <header class="${this.styles.titleRow}">
                      <h3 class="${this.styles.titleText}">
                        ${this.isNew ? "일정 추가" : "일정 편집"}
                      </h3>
                      <div class="${this.styles.tooltips}">
                        ${tooltips.map(
                          (tip) => html`
                            <button
                              type="button"
                              class="${this.styles.pasteButton}"
                              ?disabled="${tip.icon === "ai" && isAiLoading}"
                              @click="${tip.onClick}"
                              title="${tip.title}"
                            >
                              <ky-icon
                                name="${tip.icon}"
                                class="${this.styles.pasteIcon} ${tip.icon ===
                                  "ai" && isAiLoading
                                  ? this.styles.spin
                                  : ""}"
                              ></ky-icon>
                            </button>
                          `,
                        )}
                      </div>
                    </header>

                    <!-- 1. 일정 이름 & 타입 선택 -->
                    <section class="${this.styles.formRow}">
                      <i class="${this.styles.label}">일정 및 AI 프롬프트</i>
                      <div
                        class="${this.styles.inputWrapper} ${isAiLoading
                          ? this.styles.aiLoading
                          : ""}"
                      >
                        <ky-input
                          class="${this.styles.nameInput}"
                          value="${name}"
                          placeholder="원하는 일정이나 궁금한 장소 입력"
                          @change="${this.handleNameChange}"
                        >
                          <type-selector
                            :items="${SCHEDULE_TYPES}"
                            value="${type}"
                            @change="${(e) =>
                              this.handleTypeChange(e.detail.value)}"
                            class="${this.styles.typeSelector}"
                          ></type-selector>
                        </ky-input>
                      </div>
                    </section>

                    <!-- 2. 시간 범위 -->
                    <section class="${this.styles.formRow}">
                      <i class="${this.styles.label}">시간</i>
                      <time-range
                        start-time="${timeFrom}"
                        end-time="${timeTo}"
                        @change="${this.handleTimeChange}"
                      ></time-range>
                    </section>

                    <!-- 3. 경로 또는 장소 -->
                    ${type === "transport"
                      ? html`
                          <section class="${this.styles.formRow}">
                            <i class="${this.styles.label}">경로</i>
                            <div class="${this.styles.routeRow}">
                              <ky-input
                                icon="locationPin"
                                placeholder="출발지"
                                value="${routeFrom}"
                                @change="${(e) =>
                                  this.setState("routeFrom", e.detail.value)}"
                              ></ky-input>
                              <ky-icon
                                name="chevron"
                                class="${this.styles.icon}"
                              ></ky-icon>
                              <ky-input
                                icon="locationPin"
                                placeholder="도착지"
                                value="${routeTo}"
                                @change="${(e) =>
                                  this.setState("routeTo", e.detail.value)}"
                              ></ky-input>
                            </div>
                          </section>
                        `
                      : html`
                          <div class="${this.styles.positionList}">
                            ${(positions || []).map(
                              (pos, index) => html`
                                <edit-position-item
                                  index="${index}"
                                  ?show-delete="${(positions || []).length > 1}"
                                  :data="${pos}"
                                  class="${this.styles.positionItem}"
                                  @remove="${() => this.removePosition(index)}"
                                  @change-field="${(e) =>
                                    this.updatePositionField(
                                      index,
                                      e.detail.field,
                                      e.detail.value,
                                    )}"
                                ></edit-position-item>
                              `,
                            )}
                            <button
                              type="button"
                              class="${this.styles.addPositionBtn}"
                              @click="${this.addPosition}"
                            >
                              <ky-icon
                                name="add"
                                class="${this.styles.addIcon}"
                              ></ky-icon>
                              장소 추가
                            </button>
                          </div>
                        `}

                    <section class="${this.styles.formRow}">
                      <i class="${this.styles.label}">예산</i>
                      <ky-input
                        icon="shopping"
                        type="number"
                        placeholder="예)100000"
                        value="${budget || ""}"
                        @change="${(e) =>
                          this.setState(
                            "budget",
                            parseInt(e.detail.value, 10) || 0,
                          )}"
                      ></ky-input>
                    </section>

                    <section class="${this.styles.formRow}">
                      <i class="${this.styles.label}">메모</i>
                      <ky-input
                        icon="checklist"
                        type="textarea"
                        placeholder="한 줄에 하나씩, 메모를 입력해주세요"
                        value="${descriptionText}"
                        @change="${(e) =>
                          this.setState("descriptionText", e.detail.value)}"
                      ></ky-input>
                    </section>
                  </div>

                  <div class="${this.styles.actions}">
                    <button
                      type="button"
                      class="${this.styles.button}"
                      @click="${this.handleCancel}"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      class="${this.styles.button} ${this.styles.primary}"
                      @click="${this.handleSave}"
                    >
                      저장
                    </button>
                  </div>
                </div>
              `
            : html``}
        </modal-sheet>
      `;
    }
  },
);
