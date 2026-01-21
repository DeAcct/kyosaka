// store/galleryStore.js
import { Store } from "@/lib/store";

class GalleryStore extends Store {
  constructor() {
    // items에는 { id, type, name }만 저장 (LocalStorage로 자동 동기화됨)

    this.CACHE_NAME = "kyosaka-gallery-v1";
    this.tempUrls = new Map(); // 🔍 세션 동안만 유지할 URL 캐시 (Store 상태 아님)
  }

  /**
   * 🔍 앱 로드 시 실행: 메타데이터는 이미 LocalStorage에서 복구되었음.
   * 각 아이템의 실제 이미지를 캐시에서 불러와 표시용 URL 생성.
   */
  async hydrate() {
    const cache = await caches.open(this.CACHE_NAME);
    const updatedItems = await Promise.all(
      this.state.items.map(async (item) => {
        const response = await cache.match(item.id);
        if (response) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          this.tempUrls.set(item.id, url); // 메모리 맵에 저장
          return { ...item, url }; // 렌더링용 임시 URL 주입
        }
        return item;
      }),
    );
    // 🔍 다시 commit 하지 않고 내부 변수만 갱신하거나,
    // 표시용 상태를 별도로 관리하여 무한 루프 방지
    this.commit("items", updatedItems);
  }

  async saveItem(file, type) {
    const id = `/gallery/${Date.now()}_${file.name}`; // 고유 식별자
    const cache = await caches.open(this.CACHE_NAME);

    // 1. 파일 본체는 Cache Storage로 (LocalStorage 오염 방지)
    await cache.put(id, new Response(file));

    // 2. 표시를 위한 임시 URL 생성
    const url = URL.createObjectURL(file);
    this.tempUrls.set(id, url);

    // 3. 최소한의 정보만 Store에 commit (이것만 LocalStorage로 전송됨)
    const newItem = { id, type, name: file.name, url };
    this.commit("items", [...this.state.items, newItem]);
  }
}

export const galleryStore = new GalleryStore("galleryStore", {
  items: [],
  isLoading: false,
});
