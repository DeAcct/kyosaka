import Store from "@/lib/store";

class ChecklistStore extends Store {
  constructor(key, initialData, options = {}) {
    super(key, initialData, options);
    // 🔍 선택 상태(selectedIds)는 휘발성 데이터이므로 새로고침 시 항상 빈 배열로 초기화
    this.state.selectedIds = [];
  }

  get items() {
    const { items } = this.state;
    return items.map((item) => ({
      ...item,
      day: item.day !== undefined ? item.day : null,
    }));
  }

  get selectedIds() {
    return this.state.selectedIds || [];
  }

  get isSelectMode() {
    return this.selectedIds.length > 0;
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
    return Math.round(this.progress * 100);
  }

  get allChecked() {
    return this.items.filter(({ checked }) => checked);
  }

  // --- Selection Actions ---

  selectItem(id) {
    if (!this.selectedIds.includes(id)) {
      this.commit("selectedIds", [...this.selectedIds, id]);
    }
  }

  toggleSelectItem(id) {
    const current = this.selectedIds;
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    this.commit("selectedIds", next);
  }

  clearSelection() {
    if (this.selectedIds.length > 0) {
      this.commit("selectedIds", []);
    }
  }

  // --- Item Actions ---

  toggleItem(id) {
    const newItems = this.state.items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );
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
      item.id === id ? { ...item, text } : item,
    );
    this.commit("items", newItems);
  }

  removeSelected() {
    if (this.selectedIds.length > 0) {
      this.removeList(this.selectedIds);
    }
  }

  moveSelectedToDay(targetDay) {
    if (this.selectedIds.length > 0) {
      this.moveItemsToDay(this.selectedIds, targetDay);
    }
  }

  removeList(idList) {
    const newItems = this.items.filter(({ id }) => !idList.includes(id));
    this.commit("items", newItems);
    this.commit("selectedIds", []);
  }

  moveItemsToDay(idList, targetDay) {
    const newItems = this.items.map((item) =>
      idList.includes(item.id) ? { ...item, day: targetDay } : item,
    );
    this.commit("items", newItems);
    this.commit("selectedIds", []);
  }
}

export const checklistStore = new ChecklistStore(
  "checklistStore",
  {
    items: [],
    selectedIds: [],
  },
  {
    exclude: ["selectedIds"],
  },
);
