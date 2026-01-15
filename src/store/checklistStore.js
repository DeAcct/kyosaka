import Store from "@/lib/store";
class ChecklistStore extends Store {
  get items() {
    const { items } = this.state;
    return items;
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

  addItem(text) {
    if (!text.trim()) return;

    const newItem = {
      id: Date.now(), // 🔍 고유 ID 생성
      text,
      checked: false,
    };

    const newItems = [...this.state.items, newItem];
    this.commit("items", newItems);
  }
}

export const checklistStore = new ChecklistStore("checklistStore", {
  items: [
    { id: 1, checked: true, text: "여권 챙기기" },
    { id: 2, checked: true, text: "세면도구" },
    { id: 3, checked: true, text: "3일치 옷" },
  ],
});
