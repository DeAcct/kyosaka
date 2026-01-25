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
    const id = `/gallery/${Date.now()}_${file.name}`;
    const cache = await caches.open(this.CACHE_NAME);

    // 1. 파일은 캐시에 저장
    await cache.put(id, new Response(file));

    // 2. 메모리 맵에 임시 URL 저장
    const url = URL.createObjectURL(file);
    this.tempUrls.set(id, url);

    // 3. 🔍 중요: commit 시에는 'url'을 빼고 메타데이터만 저장!
    const newItem = { id, type, name: customName || file.name };
    this.commit("items", [...this.state.items, newItem]);
  }
}

// 초기 상태 정의
export const galleryStore = new GalleryStore("galleryStore", {
  items: [],
  isLoading: false,
});
