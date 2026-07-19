import Store from "@/lib/store";
class ChecklistStore extends Store {
  get items() {
    const { items } = this.state;
    return items.map(item => ({
      ...item,
      day: item.day !== undefined ? item.day : null
    }));
  }
  get progress() {
    const { items } = this.state;
    if (!items.length) return 0;

    const completed = this.allChecked.length;
    return completed / items.length;
  }

  /**
   * 🔍 템플릿용 정수 퍼센트 (0 ~ 100)
   */
  get percentage() {
    // Math.round로 반올림 문제를 해결하여 UI 깜빡임을 방지합니다.
    return Math.round(this.progress * 100);
  }

  get allChecked() {
    return this.items.filter(({ checked }) => checked);
  }

  toggleItem(id) {
    const newItems = this.state.items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );

    // 🔍 'items' 키에 직접 꽂아넣어 로컬 스토리지와 뷰를 동기화
    this.commit("items", newItems);
  }

  addItem(text, day = null) {
    if (!text.trim()) return;

    const newItem = {
      id: crypto.randomUUID(),
      text,
      checked: false,
      day,
    };

    const newItems = [...this.state.items, newItem];
    this.commit("items", newItems);
  }

  editItem(id, text) {
    if (!text.trim()) return;

    const newItems = this.items.map((item) =>
      item.id === id ? { ...item, text } : item
    );

    return newItems;
  }

  removeList(idList) {
    const newItems = this.items.filter(({ id }) => !idList.includes(id));
    this.commit("items", newItems);
  }

  moveItemsToDay(idList, targetDay) {
    const newItems = this.items.map((item) =>
      idList.includes(item.id) ? { ...item, day: targetDay } : item
    );
    this.commit("items", newItems);
  }
}

export const checklistStore = new ChecklistStore("checklistStore", {
  items: [],
});
