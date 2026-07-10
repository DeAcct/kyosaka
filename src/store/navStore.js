// store/navStore.js
import Store from "@/lib/store";

class NavStore extends Store {
  toggle() {
    this.commit("isOpen", (now) => !now);
  }
  open() {
    this.commit("isOpen", true);
  }
  close() {
    this.commit("isOpen", false);
  }
}

export const navStore = new NavStore(
  "navStore",
  {
    isOpen: false,
  },
  { exclude: ["isOpen"] },
);

navStore.subscribe((state) => {
  // classList.toggle의 두 번째 인자로 boolean을 주면 조건에 따라 넣고 빼줍니다.
  document.documentElement.classList.toggle("is-locked", state.isOpen);
});
