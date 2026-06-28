// store/galleryStore.js
import Store from "@/lib/store";

class GalleryStore extends Store {
  CACHE_NAME = "kyosaka-gallery";
  tempUrls = new Map(); // 🔍 메모리에만 존재 (LocalStorage에 저장 안 됨)

  async hydrate() {
    this.commit("isLoading", true);
    const cache = await caches.open(this.CACHE_NAME);

    // 1. 캐시에서 파일을 꺼내 URL만 새로 생성하여 Map에 저장
    await Promise.all(
      this.state.items.map(async (item) => {
        const response = await cache.match(item.id);
        if (response) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          this.tempUrls.set(item.id, url); // 🎯 메모리 맵만 갱신
        }
      }),
    );

    // 2. 상태를 갱신하여 컴포넌트 리렌더링 유도 (url은 포함하지 않음!)
    this.commit("isLoading", false);
  }

  async saveItem(file, type, customName) {
    const id = crypto.randomUUID();

    const cache = await caches.open(this.CACHE_NAME);

    // 1. 파일은 캐시에 저장
    await cache.put(id, new Response(file));

    // 2. 메모리 맵에 임시 URL 저장
    const url = URL.createObjectURL(file);
    this.tempUrls.set(id, url);

    // 3. 메타데이터 저장
    const newItem = { id, type, name: customName || file.name };
    this.commit("items", [...this.state.items, newItem]);
  }

  /**
   * 🔍 편집 모드 진입 시 특정 ID를 즉시 선택하도록 수정
   */
  // toggleUIMode(initialId = null) {
  //   const currentMode = this.state.ui.mode;
  //   const nextMode = currentMode === "view" ? "edit" : "view";

  //   this.commit("ui/mode", nextMode);

  //   if (nextMode === "view") {
  //     this.commit("ui/selected", []);
  //   } else if (initialId) {
  //     // 🎯 편집 모드 진입과 동시에 해당 아이템 선택
  //     this.commit("ui/selected", [initialId]);
  //   }
  // }

  toggleEditMode() {
    this.commit("ui/selected", []);
    const nextMode = this.mode === "view" ? "edit" : "view";
    this.commit("ui/mode", nextMode);
  }

  /**
   * 🔍 선택 상태 토글 (클릭 시 사용)
   */
  toggleItemSelection(id) {
    if (this.state.ui.mode !== "edit") return;

    const selected = this.state.ui.selected;
    const isSelected = selected.includes(id);
    const next = isSelected
      ? selected.filter((v) => v !== id)
      : [...selected, id];

    this.commit("ui/selected", next);
  }

  /**
   * 🗑️ 선택된 아이템 일괄 삭제 (캐시 + 메모리 + 스토어)
   */
  async deleteSelectedItems() {
    const targets = this.state.ui.selected;
    if (targets.length === 0) return;

    const cache = await caches.open(this.CACHE_NAME);

    // 1. 물리적 파일 및 메모리 주소 삭제 루프
    targets.forEach((id) => {
      // 캐시 삭제
      cache.delete(id);

      // Blob URL 해제 (메모리 누수 방지 핵심!)
      if (this.tempUrls.has(id)) {
        URL.revokeObjectURL(this.tempUrls.get(id));
        this.tempUrls.delete(id);
      }
    });

    // 2. 스토어 메타데이터 필터링
    const nextItems = this.state.items.filter(
      (item) => !targets.includes(item.id),
    );

    // 3. 일괄 커밋: 데이터와 UI 상태를 동시에 정렬
    this.commit("items", nextItems);
    // this.commit("ui/selected", []);
    // this.commit("ui/mode", "view");
    this.clearUI();

    console.log(`[Gallery] ${targets.length}개의 항목이 영구 삭제되었습니다.`);
  }

  openOverlay(id) {
    // this.commit("ui", { overlay: id, mode: "overlay" });
    this.commit("ui", { selected: [id], mode: "overlay" });
    // this.commit("ui/overlay", mode:)
  }

  clearUI() {
    this.commit("ui", { selected: [], mode: "view" });
  }

  get mode() {
    return this.state.ui.mode;
  }
  get selected() {
    return this.state.ui.selected;
  }
}

// 초기 상태 정의
export const galleryStore = new GalleryStore(
  "galleryStore",
  {
    items: [],
    isLoading: false,
    ui: {
      selected: [],
      // overlay: null,
      mode: "view",
    },
  },
  { exclude: ["ui"] },
);
