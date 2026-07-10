// src/lib/icon.js
const iconModules = import.meta.glob("@/icons/*.js");

export const IconLoader = Object.entries(iconModules).reduce(
  (acc, [path, loader]) => {
    const name = path.split("/").pop().replace(".js", "");

    // 🔍 캐싱 로직을 추가하면 두 번 로드하지 않아 훨씬 빠릅니다.
    let cache = null;

    acc[name] = async () => {
      if (cache) return cache;
      const mod = await loader();
      // named export(const d)와 default export 모두 대응
      cache = mod.d || mod.default;
      return cache;
    };

    return acc;
  },
  {},
);
