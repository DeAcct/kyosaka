// src/lib/icon.js
const iconModules = import.meta.glob("@/icons/*.js", { eager: true });

export const IconLoader = Object.entries(iconModules).reduce(
  (acc, [path, mod]) => {
    const name = path.split("/").pop().replace(".js", "");

    let cache = null;

    // 1. 만약 내보낸 데이터가 이미 문자열(단순 Path)이라면 객체 형태로 규격화합니다.
    if (typeof mod === "string") {
      cache = { d: mod, viewBox: "0 -960 960 960" };
    } else if (mod && typeof mod.default === "string") {
      cache = { d: mod.default, viewBox: "0 -960 960 960" };
    } else {
      // 2. 객체 형태인 경우 (예: d와 viewBox를 모두 가지고 있는 ai.js)
      cache = {
        d: mod.d || mod.default || "",
        viewBox: mod.viewBox || "0 -960 960 960", // 없으면 기본 960계열로 세팅
      };
    }

    acc[name] = cache;

    return acc;
  },
  {},
);
