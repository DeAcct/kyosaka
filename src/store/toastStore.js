// store/toastStore.js
import Store from "@/lib/store";

class ToastStore extends Store {
  /**
   * 🍞 토스트 추가
   * @param {string} message - 표시할 문구
   * @param {string} type - 'success' | 'error' | 'info'
   * @param {number} duration - 유지 시간 (ms)
   */
  add(message, type = "info", duration = 3000) {
    const id = Date.now();
    const newToast = { id, message, type };

    // 1. 기존 토스트 목록에 추가
    this.commit("toasts", [...this.state.toasts, newToast]);

    // 2. 지정된 시간 후 삭제
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id) {
    const nextToasts = this.state.toasts.filter((t) => t.id !== id);
    this.commit("toasts", nextToasts);
  }
}

// UI 전용이므로 localStorage 저장 제외 (exclude: ["toasts"])
export const toastStore = new ToastStore(
  "toastStore",
  {
    toasts: [],
  },
  { exclude: ["toasts"] },
);
