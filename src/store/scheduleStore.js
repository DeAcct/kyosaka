import Store from "@/lib/store";
class ScheduleStore extends Store {
  newPlan(data) {
    const newItem = {
      id: crypto.randomUUID(),
      edited: Temporal.Now.plainDateTimeISO(),
      data,
      selected: 0,
    };

    this.commit("plans", (currentPlans) => [...currentPlans, newItem]);
  }
  editPlan(id, updatedData) {
    this.commit("plans", (currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              edited: Temporal.Now.plainDateTimeISO(),
              data:
                typeof plan.data === "object" && plan.data !== null
                  ? { ...plan.data, ...updatedData }
                  : updatedData,
            }
          : plan,
      ),
    );
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

  // get currentDayList() {

  //   return list.data[selectedDay];
  // }

  get plans() {
    return this.state.plans;
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
}
export const scheduleStore = new ScheduleStore("scheduleStore", {
  plans: [],
  selected: null,
});

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
