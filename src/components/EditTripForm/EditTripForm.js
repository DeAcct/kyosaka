// components/EditTripForm/EditTripForm.js
import { scheduleStore } from "@/store/scheduleStore";
import { Component, define, html } from "@/lib/core";

import mapping from "./editTripForm.module.scss";
import raw from "./editTripForm.module.scss?inline";

import "@/components/DatePicker/DatePicker";
import "@/components/ModalSheet/ModalSheet";

export const EditTripForm = define("edit-trip-form", { mapping, raw })(
  class extends Component {
    setup() {
      this.subscribe(scheduleStore);

      this.lastOpenState = false;
      this.state = {
        tripName: "",
        startDate: "",
        endDate: "",
        dayNamesMap: {}, // 🎯 [개선] 절대 날짜가 아닌 '순서 인덱스(0, 1, 2...)' 기준으로 이름을 저장합니다.
      };
    }

    // 🔍 선택 기간에 따른 동적 일차 리스트 생성
    get calculatedDateList() {
      const { startDate, endDate } = this.state;
      if (!startDate || !endDate) return [];

      try {
        const start = Temporal.PlainDate.from(startDate);
        const end = Temporal.PlainDate.from(endDate);
        const dates = [];
        let current = start;

        while (Temporal.PlainDate.compare(current, end) <= 0) {
          dates.push(current.toString());
          current = current.add({ days: 1 });
        }
        return dates;
      } catch (e) {
        return [];
      }
    }

    handleTripNameChange(e) {
      this.setState("tripName", e.target.value);
    }

    handleRangeChange(e) {
      const { startDate, endDate } = e.detail;
      this.setState("startDate", startDate);
      this.setState("endDate", endDate);
    }

    // 🎯 [개선] 입력 제어도 인덱스 기준으로 상태 업데이트
    handleDayNameChange(index, value) {
      const updatedMap = { ...this.state.dayNamesMap, [index]: value };
      this.setState("dayNamesMap", updatedMap);
    }

    handleCancel() {
      scheduleStore.toggleEditTrip(false);
    }

    // 🎯 [핵심 교정] 줄어들 때, 늘어날 때, 이동할 때를 전부 완벽 대응하는 보존 액션
    handleSave() {
      const { tripName, startDate, endDate, dayNamesMap } = this.state;
      const dates = this.calculatedDateList;

      const originalPlan = scheduleStore.selectedPlan || { data: [] };
      // 🎯 기존 원본 데이터도 일차 순서대로 정렬해 준비합니다.
      const originalDays = [...(originalPlan.data || [])].sort((a, b) =>
        a.day.localeCompare(b.day),
      );

      const updatedData = dates.map((dateStr, index) => {
        // 🔥 [완벽 보존] 날짜가 어떻게 바뀌었든, 순서 인덱스 기준으로 기존 일차의 알맹이를 고스란히 이식합니다.
        const existingDay = originalDays[index];
        const existingName = dayNamesMap[index];
        const defaultName =
          existingName && existingName.trim() !== ""
            ? existingName
            : `${index + 1}일차 일정`;

        return {
          day: dateStr, // 새롭게 맵핑된 날짜 문자열
          name: defaultName,

          // 기존에 해당 순서(n일차)의 일정이 존재했다면 세부 일정(schedule)과 하루설명(description)을 통째로 이식합니다.
          // 새로 추가되어 늘어난 일차에만 깨끗한 빈 배열과 기본값을 할당하여 유실과 에러를 완벽히 막습니다.
          description: existingDay ? existingDay.description : "즐거운 여행~",
          schedule: existingDay ? existingDay.schedule : [],
        };
      });

      scheduleStore.updatePlanMetadata({
        name: tripName,
        data: updatedData,
      });

      scheduleStore.toggleEditTrip(false);
    }

    afterRender() {
      const isEditOpen = scheduleStore.isOpenEditTrip;
      const sheet = this.$refs.sheet;

      if (sheet && sheet.$refs.dialog) {
        const isOpen = sheet.$refs.dialog.open;
        if (isEditOpen && !isOpen) {
          sheet.open();
        } else if (!isEditOpen && isOpen) {
          sheet.close();
        }
      }
    }

    template() {
      const isEditOpen = scheduleStore.isOpenEditTrip;

      // 🎯 시트가 열릴 때 단 한번만 데이터를 '순서 인덱스' 기준으로 맵핑해 드래프트 상태로 복제합니다.
      if (isEditOpen && !this.lastOpenState) {
        this.lastOpenState = true;
        const plan = scheduleStore.selectedPlan || { title: "", data: [] };
        const sortedDays = [...(plan.data || [])].sort((a, b) =>
          a.day.localeCompare(b.day),
        );
        this.state.tripName = plan.title || "새로운 여행";
        this.state.startDate =
          sortedDays[0]?.day || Temporal.Now.plainDateISO().toString();
        this.state.endDate =
          sortedDays[sortedDays.length - 1]?.day || this.state.startDate;

        // 🎯 절대 날짜가 아닌 인덱스(0, 1, 2) 기준으로 매핑 초기화!
        this.state.dayNamesMap = {};
        sortedDays.forEach((d, idx) => {
          this.state.dayNamesMap[idx] = d.name;
        });
      } else if (!isEditOpen && this.lastOpenState) {
        this.lastOpenState = false;
      }

      const { tripName, startDate, endDate, dayNamesMap } = this.state;
      const dates = this.calculatedDateList;

      return html`
        <modal-sheet
          $sheet
          @close="${() => scheduleStore.toggleEditTrip(false)}"
        >
          ${isEditOpen
            ? html`
                <div class="${this.styles.formContainer}">
                  <div class="${this.styles.scrollContent}">
                    <h3 class="${this.styles.title}">여정 편집</h3>
                    <section class="${this.styles.section}">
                      <label class="${this.styles.label}" for="tripName"
                        >여행 이름</label
                      >
                      <input
                        type="text"
                        id="tripName"
                        class="${this.styles.input}"
                        value="${tripName}"
                        @change="${(e) => this.handleTripNameChange(e)}"
                        placeholder="어디로 떠나시나요?"
                      />
                    </section>

                    <section class="${this.styles.section}">
                      <i class="${this.styles.label}">여행 기간 선택</i>
                      <div class="${this.styles.calendarWrapper}">
                        <date-picker
                          type="range"
                          :start-date="${startDate}"
                          :end-date="${endDate}"
                          @range-change="${(e) => this.handleRangeChange(e)}"
                        ></date-picker>
                      </div>
                    </section>

                    <section class="${this.styles.section}">
                      <i class="${this.styles.label}" for="dayNames"
                        >일차별 상세 명칭</i
                      >
                      <div class="${this.styles.dayList}">
                        ${dates.map((dateStr, index) => {
                          // 🎯 절대 날짜가 바뀌어도 '순서 인덱스'로 매핑하기 때문에 이름 인풋이 비어버리지 않고 유지됩니다.
                          const currentVal = dayNamesMap[index] || "";
                          const formattedDate = Temporal.PlainDate.from(
                            dateStr,
                          ).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          });

                          return html`
                            <label class="${this.styles.dayItem}">
                              <span class="${this.styles.dayMeta}">
                                <span class="${this.styles.dayNumber}"
                                  >${index + 1}일차</span
                                >
                                <span class="${this.styles.dayDate}"
                                  >${formattedDate}</span
                                >
                              </span>
                              <input
                                type="text"
                                class="${this.styles.dayInput}"
                                value="${currentVal}"
                                placeholder="예) 아키하바라 성지순례"
                                @change="${(e) =>
                                  this.handleDayNameChange(
                                    index,
                                    e.target.value,
                                  )}"
                              />
                            </label>
                          `;
                        })}
                      </div>
                    </section>
                  </div>

                  <div class="${this.styles.mask}"></div>

                  <div class="${this.styles.actions}">
                    <button
                      type="button"
                      class="${this.styles.button}"
                      @click="${() => this.handleCancel()}"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      class="${this.styles.button} ${this.styles.primary}"
                      @click="${() => this.handleSave()}"
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
