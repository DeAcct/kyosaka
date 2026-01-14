import Store from "@/lib/store";
class ChecklistStore extends Store {
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

    const _result = items.length && completed / items.length;

    return `${_result * 100}%`;
  }
}

export const checklistStore = new ChecklistStore("checklistStore", {
  items: [{ done: true }],
});
