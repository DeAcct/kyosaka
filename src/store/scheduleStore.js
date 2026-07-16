import Store from "@/lib/store";

const DEFAULT_SCHEDULE = {
  name: "공항버스",
  type: "transport",
  time: { from: "05:10", to: "07:10" },
  description: ["버스 탑승하기"],
};
const DEFAULT_DAY = {
  name: "제목 없는 날",
  day: "2000-01-01",
  description: "즐거운 여행~",
  schedule: [DEFAULT_SCHEDULE],
};

class ScheduleStore extends Store {
  importPlan(data = {}) {
    const newItem = {
      id: crypto.randomUUID(),
      edited: Temporal.Now.plainDateTimeISO(),
      title: "제목 없는 여행",
      data: [DEFAULT_DAY],
      ...data,
      selected: 0,
    };

    this.commit("plans", (currentPlans) => [newItem, ...currentPlans]);
    this.changePlan(newItem.id);
  }
  newPlan() {
    // 인자 없이 호출하면 빈 객체({})가 들어가면서 기본값들로 채워짐
    this.importPlan();
  }
  editPlan(id, updatedData) {
    this.commit("plans", (currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== id) {
          return plan;
        }

        return {
          ...plan,
          edited: Temporal.Now.plainDateTimeISO(),
          data: [...plan.data, ...updatedData], // 무조건 배열이므로 단순 병합
        };
      }),
    );
  }
  addDay(id = this.state.selected) {
    const plan = this.plans.find((p) => p.id === id);
    if (!plan) {
      return -1;
    }

    // 🎯 추가되기 전의 배열 길이가 새로 추가될 요소의 인덱스가 됨
    const newIndex = plan.data.length;

    this.editPlan(id, [DEFAULT_DAY]);

    // 🎯 생성된 요소의 인덱스 반환
    return newIndex;
  }

  changeDay(index) {
    const currentPlanId = this.state.selected;
    if (!currentPlanId) return;

    this.commit("plans", (currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === currentPlanId ? { ...plan, selected: index } : plan,
      ),
    );
  }
  changePlan(id) {
    if (this.state.selected === id) {
      return;
    }
    this.commit("selected", () => id);
  }

  removePlan(targetId) {
    this.commit("plans", (current) =>
      current.filter(({ id }) => {
        if (Array.isArray(targetId)) {
          return !targetId.includes(id);
        }
        return targetId !== id;
      }),
    );
    if (this.validSelected) {
      return;
    }
    this.commit("selected", () =>
      this.plans.length > 0 ? this.plans[0].id : null,
    );
  }

  removeScheduleItem(scheduleIndex) {
    const currentPlanId = this.state.selected;
    if (!currentPlanId) return;

    this.commit("plans", (currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== currentPlanId) {
          return plan;
        }

        const dayIndex = plan.selected;
        const targetDay = plan.data[dayIndex];
        if (!targetDay) return plan;

        const updatedSchedule = targetDay.schedule.filter(
          (_, index) => index !== scheduleIndex,
        );

        const updatedData = plan.data.map((day, index) =>
          index === dayIndex ? { ...day, schedule: updatedSchedule } : day,
        );

        return {
          ...plan,
          data: updatedData,
          edited: Temporal.Now.plainDateTimeISO(),
        };
      }),
    );
  }

  get plans() {
    return this.state.plans;
  }

  get validSelected() {
    return this.plans.some(({ id }) => id === this.state.selected);
  }

  get selectedPlan() {
    const { plans, selected } = this.state;
    if (plans.length === 0) {
      return [];
    }

    if (!selected) {
      this.commit("selected", () => plans[0].id);
      return plans[0];
    }

    return plans.find(({ id }) => id === selected);
  }

  get selectedPeriod() {
    const planData = this.selectedPlan;

    if (!planData || !planData.data || planData.data.length === 0) {
      return { start: null, end: null, days: 0 };
    }

    const dayStrings = planData.data.map((planDay) => planDay.day);
    dayStrings.sort();

    const start = dayStrings[0];
    const end = dayStrings[dayStrings.length - 1];
    const startDateObj = Temporal.PlainDate.from(start);
    const duration = startDateObj.until(end, { largestUnit: "day" });

    // 3. 최종 정제 데이터 반환
    return {
      start,
      end,
      days: duration.days,
    };
  }

  get selectedDayList() {
    const plan = this.selectedPlan;

    // 플랜이 없거나, 플랜 내부에 날짜 데이터 배열이 없으면 안전하게 null 반환
    if (!plan || !plan.data) return null;

    // 해당 인덱스의 날짜 데이터가 없으면 null 반환
    return plan.data[plan.selected] || null;
  }

  #move(offset, mode = "infinite") {
    const { data, selected } = this.selectedPlan;
    const len = data.length;
    if (len === 0) return;

    const nextValue =
      mode === "infinite"
        ? (selected + offset + len) % len // 음수 대응 순환 로직
        : Math.max(0, Math.min(len - 1, selected + offset)); // 범위 제한 로직

    this.changeDay(nextValue);
  }
  nextDay(mode) {
    this.#move(1, mode);
  }
  prevDay(mode) {
    this.#move(-1, mode);
  }

  toggleEditTrip(changeTo) {
    this.commit("ui/editTrip", (current) =>
      typeof changeTo === "boolean" ? changeTo : !current,
    );
  }
  get isOpenEditTrip() {
    return this.state.ui.editTrip;
  }
  updatePlanMetadata({ name, data }) {
    const currentPlanId = this.state.selected;
    if (!currentPlanId) return;

    this.commit("plans", (currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== currentPlanId) {
          return plan;
        }

        // 혹시 여행 기간 단축으로 인해 현재 선택된 인덱스 범위를 초과하면 0으로 안전 방어
        const nextSelected = plan.selected >= data.length ? 0 : plan.selected;

        return {
          ...plan,
          title: name, // 폼에서 넘어온 여행 명칭을 스토어의 title 키에 매핑
          data: data,
          selected: nextSelected,
          edited: Temporal.Now.plainDateTimeISO(),
        };
      }),
    );
  }

  toggleEditSchedule(changeTo, index = -1) {
    this.commit("ui", (current) => ({
      ...current,
      editSchedule: typeof changeTo === "boolean" ? changeTo : !current.editSchedule,
      editingScheduleIndex: changeTo ? index : -1,
    }));
  }

  get isOpenEditSchedule() {
    return this.state.ui.editSchedule;
  }

  get editingScheduleIndex() {
    return this.state.ui.editingScheduleIndex;
  }

  get editingScheduleItem() {
    const index = this.editingScheduleIndex;
    if (index === -1) return null;
    return this.selectedDayList?.schedule?.[index] || null;
  }

  updateScheduleItem(scheduleIndex, updatedItem) {
    const currentPlanId = this.state.selected;
    if (!currentPlanId) return;

    this.commit("plans", (currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== currentPlanId) {
          return plan;
        }

        const dayIndex = plan.selected;
        const targetDay = plan.data[dayIndex];
        if (!targetDay) return plan;

        let updatedSchedule;
        if (scheduleIndex === -1) {
          updatedSchedule = [...targetDay.schedule, updatedItem];
        } else {
          updatedSchedule = targetDay.schedule.map((item, index) =>
            index === scheduleIndex ? { ...item, ...updatedItem } : item,
          );
        }

        const updatedData = plan.data.map((day, index) =>
          index === dayIndex ? { ...day, schedule: updatedSchedule } : day,
        );

        return {
          ...plan,
          data: updatedData,
          edited: Temporal.Now.plainDateTimeISO(),
        };
      }),
    );
  }

  setDaySchedule(scheduleList, dayName, dayDescription) {
    const currentPlanId = this.state.selected;
    if (!currentPlanId) return;

    this.commit("plans", (currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== currentPlanId) {
          return plan;
        }

        const dayIndex = plan.selected;
        const targetDay = plan.data[dayIndex];
        if (!targetDay) return plan;

        const updatedData = plan.data.map((day, index) => {
          if (index !== dayIndex) return day;

          const updatedDay = { ...day, schedule: scheduleList };
          if (dayName) updatedDay.name = dayName;
          if (dayDescription) updatedDay.description = dayDescription;
          return updatedDay;
        });

        return {
          ...plan,
          data: updatedData,
          edited: Temporal.Now.plainDateTimeISO(),
        };
      }),
    );
  }
}
export const scheduleStore = new ScheduleStore("scheduleStore", {
  plans: [],
  selected: null,
  ui: {
    editTrip: false,
    editSchedule: false,
    editingScheduleIndex: -1,
  },
});

if (typeof window !== "undefined") {
  window.scheduleStore = scheduleStore;
}

/*
현재 만들고 있는 것은 여러 플랜을 저장할 수 있는 앱임.


interface ScheduleData{
  name: string;
  type: "transport" | "hotel" | "food" | "sightseeing" | "etc";
  route: {
    from: string
    to: string;
  }
  ...
}

interface PlanDay{
  day: `${number}-${number}-${number}`;
  description: string;
  name: string;
  schedule: Array<ScheduleData>
}

//selected에는 플랜 속 현재 선택된 날짜의 index 저장
interface PlanData{
  data: Array<PlanDay>;
  edited: Date;
  id: `${string}-${string}-${string}-${string};
  selected: number
}


// selected에는 현재 선택된 플랜의 id 저장
interface Plans {
  plans: Array<PlanData>;
  selected?: string
}

*/
