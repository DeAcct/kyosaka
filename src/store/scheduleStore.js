import Store from "@/lib/store";
class ScheduleStore extends Store {
  get currentDayData() {
    console.log(this.state);
    const { list, selectedDay } = this.state;
    // list가 [{name: '1일차', schedule: [...]}, ...] 형태일 때
    return list[selectedDay] || null;
  }
}
export const scheduleStore = new ScheduleStore("scheduleStore", {
  list: [], // 전체 일차별 데이터
  selectedDay: 0, // 현재 활성화된 일차 (0 = 1일차)
});
