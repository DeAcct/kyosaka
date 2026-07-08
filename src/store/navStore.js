// store/navStore.js
import Store from "@/lib/store";

class NavStore extends Store {
  toggle() {
    console.log(this);
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
