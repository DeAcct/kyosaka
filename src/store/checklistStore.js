import Store from "@/lib/store";
class ChecklistStore extends Store {
  // get currentDayList() {
  //   const { list, selectedDay } = this.state;
  //   return list[selectedDay] || null;
  // }
  // get allList() {
  //   const { list } = this.state;
  //   return list;
  // }
  // #move(offset, mode = "infinite") {
  //   const { list, selectedDay } = this.state;
  //   const len = list.length;
  //   if (len === 0) return;
  //   const nextValue =
  //     mode === "infinite"
  //       ? (selectedDay + offset + len) % len // 음수 대응 순환 로직
  //       : Math.max(0, Math.min(len - 1, selectedDay + offset)); // 범위 제한 로직
  //   this.commit("selectedDay", nextValue);
  // }
  // nextDay(mode) {
  //   this.#move(1, mode);
  // }
  // prevDay(mode) {
  //   this.#move(-1, mode);
  // }
  get items() {
    const { items } = this.state;
    return items;
  }
  get percentage() {
    const { items } = this.state;
    const completed = items.reduce(
      (prev, { done }) => (done ? prev + 1 : prev),
      0
    );
    console.log(items.length && completed / items.length);

    return items.length && completed / items.length;
  }
}

export const checklistStore = new ChecklistStore("checklistStore", {
  items: [{ done: true }],
});
