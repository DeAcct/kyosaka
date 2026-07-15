// components/EditScheduleForm/EditScheduleForm.js
import { Component, define, html } from "@/lib/core";
import { scheduleStore } from "@/store/scheduleStore";
import { toastStore } from "@/store/toastStore";

import mapping from "./editScheduleForm.module.scss";
import raw from "./editScheduleForm.module.scss?inline";

import "@/components/BottomSheet/BottomSheet";
import "@/components/Icon/Icon";
import "@/components/Input/Input";
import "@/components/TypeSelector/TypeSelector";
import "@/components/TimeRange/TimeRange";

const SCHEDULE_TYPES = [
  { value: "transport", label: "이동", icon: "transport" },
  { value: "hotel", label: "숙소", icon: "hotel" },
  { value: "food", label: "식사", icon: "food" },
  { value: "attractions", label: "명소", icon: "attractions" },
  { value: "landscape", label: "풍경", icon: "landscape" },
  { value: "onsen", label: "온천", icon: "onsen" },
  { value: "shopping", label: "쇼핑", icon: "shopping" },
  { value: "photo_camera", label: "사진", icon: "photo_camera" },
  { value: "temple_buddhist", label: "사찰", icon: "temple_buddhist" },
];

export const EditScheduleForm = define("edit-schedule-form", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);

      this.state = {
        name: "",
        type: "transport",
        timeFrom: "09:00",
        timeTo: "10:00",
        budget: 0,
        routeFrom: "",
        routeTo: "",
        posName: "",
        posAddress: "",
        posMap: "",
        descriptionText: "",
      };
    }

    handleTypeChange(typeValue) {
      this.setState("type", typeValue);
    }

    handleTimeChange(e) {
      const { startTime, endTime } = e.detail;
      this.setState("timeFrom", startTime);
      this.setState("timeTo", endTime);
    }

    handleNameChange(e) {
      this.setState("name", e.target.value);
    }

    handleCancel() {
      scheduleStore.toggleEditSchedule(false);
    }

    handleSave() {
      const {
        name,
        type,
        timeFrom,
        timeTo,
        budget,
        routeFrom,
        routeTo,
        posName,
        posAddress,
        posMap,
        descriptionText,
      } = this.state;

      if (!name.trim()) {
        toastStore.add("일정 이름을 입력해 주세요.", "error", 2000);
        return;
      }

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
        if (posName.trim() || posAddress.trim() || posMap.trim()) {
          updatedItem.position = [
            {
              name: posName,
              address: posAddress,
              map: posMap,
            },
          ];
        } else {
          updatedItem.position = [];
        }
        updatedItem.route = null;
      }

      scheduleStore.updateScheduleItem(
        scheduleStore.editingScheduleIndex,
        updatedItem,
      );

      scheduleStore.toggleEditSchedule(false);
      toastStore.add("일정을 수정했어요!", "success", 2000);
    }

    onPropsPatchComplete() {
      if (this.isConnected && this.scheduleData) {
        const item = this.scheduleData;
        this.state = {
          name: item.name || "",
          type: item.type || "transport",
          timeFrom: item.time?.from || "09:00",
          timeTo: item.time?.to || "10:00",
          budget: item.budget || 0,
          routeFrom: item.route?.from || "",
          routeTo: item.route?.to || "",
          posName: item.position?.[0]?.name || "",
          posAddress: item.position?.[0]?.address || "",
          posMap: item.position?.[0]?.map || "",
          descriptionText: (item.description || []).join("\n"),
        };
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

      const {
        name,
        type,
        timeFrom,
        timeTo,
        budget,
        routeFrom,
        routeTo,
        posName,
        posAddress,
        posMap,
        descriptionText,
      } = this.state;

      const fields = [
        { key: "posName", icon: "locationPin", placeholder: "장소명" },
        { key: "posAddress", icon: "map", placeholder: "주소 (선택)" },
        {
          key: "posMap",
          icon: "info",
          placeholder: "구글맵 공유 링크 (선택)",
        },
      ];

      return html`
        <bottom-sheet
          $sheet
          @close="${() => scheduleStore.toggleEditSchedule(false)}"
        >
          ${isOpen
            ? html`
                <div class="${this.styles.formContainer}">
                  <div class="${this.styles.scrollContent}">
                    <h3 class="${this.styles.title}">일정 편집</h3>

                    <!-- 1. 일정 이름 & 타입 선택 -->
                    <section class="${this.styles.formRow}">
                      <i class="${this.styles.label}">일정 이름</i>
                      <ky-input
                        class="${this.styles.nameInput}"
                        value="${name}"
                        placeholder="일정 이름을 입력해주세요"
                        @change="${this.handleNameChange}"
                      >
                        <ky-type-selector
                          :items="${SCHEDULE_TYPES}"
                          value="${type}"
                          @change="${(e) =>
                            this.handleTypeChange(e.detail.value)}"
                          class="${this.styles.typeSelector}"
                        ></ky-type-selector>
                      </ky-input>
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
                      : fields.map(
                          (f) => html`
                            <section class="${this.styles.formRow}">
                              <i class="${this.styles.label}">${f.label}</i>
                              <ky-input
                                icon="${f.icon}"
                                placeholder="${f.placeholder}"
                                value="${this.state[f.key]}"
                                @change="${(e) =>
                                  this.setState(f.key, e.detail.value)}"
                              ></ky-input>
                            </section>
                          `,
                        )}

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
        </bottom-sheet>
      `;
    }
  },
);
