import Store from "@/lib/store";
import { switcher } from "@/lib/switcher";
class ScheduleStore extends Store {
  get currentDayList() {
    const { list, selectedDay } = this.state;
    // list가 [{name: '1일차', schedule: [...]}, ...] 형태일 때
    return list[selectedDay] || null;
  }

  get allList() {
    const { list } = this.state;
    return list;
  }

  #move(offset, mode = "infinite") {
    const { list, selectedDay } = this.state;
    const len = list.length;
    if (len === 0) return;

    const nextValue =
      mode === "infinite"
        ? (selectedDay + offset + len) % len // 음수 대응 순환 로직
        : Math.max(0, Math.min(len - 1, selectedDay + offset)); // 범위 제한 로직

    this.commit("selectedDay", nextValue);
  }
  nextDay(mode) {
    this.#move(1, mode);
  }
  prevDay(mode) {
    this.#move(-1, mode);
  }
}
export const scheduleStore = new ScheduleStore("scheduleStore", {
  list: [],
  selectedDay: 0,
});
