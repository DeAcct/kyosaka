import { galleryStore } from "@/store/galleryStore";

export function useGalleryData(type) {
  // 🔍 스토어에서 해당 타입의 아이템만 필터링
  const getItems = () =>
    galleryStore.state.items.filter((item) => item.type === type);

  // 🔍 데이터 로드 및 URL 복구 로직 (Store의 hydrate 활용)
  const sync = async () => {
    if (galleryStore.state.items.length > 0 && !galleryStore.tempUrls.size) {
      await galleryStore.hydrate();
    }
  };

  return {
    items: getItems(),
    sync,
  };
}
