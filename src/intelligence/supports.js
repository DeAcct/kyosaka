export const SUPPORTS_PROMPT_API =
  typeof window !== "undefined" &&
  ("LanguageModel" in window ||
    ("ai" in window && "languageModel" in window.ai));

export async function checkPromptAPIAvailability() {
  if (!SUPPORTS_PROMPT_API) return "no";

  try {
    const api = window.LanguageModel || window.ai.languageModel;
    const status = await api.availability();
    return status;
  } catch (e) {
    return "no";
  }
}

export function getUnsupportedReason() {
  if (typeof window === "undefined") return "";

  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));

  if (isAndroid || isIOS) {
    return "모바일용 Chrome(Android, iOS)은 AI 파운데이션 모델 API를 지원하지 않습니다.";
  }

  const isCrOS = /CrOS/i.test(ua);
  if (isCrOS) {
    return "일반 ChromeOS 기기(non-Chromebook Plus)는 AI 파운데이션 모델 API를 지원하지 않습니다. Chromebook Plus 기기를 사용해 주세요.";
  }

  return "AI 기능은 Windows 10/11, macOS 13+, Linux, ChromeOS(Chromebook Plus)의 Google Chrome 브라우저에서 제공됩니다. Chrome 버전(126 이상) 및 chrome://flags 설정을 확인해 주세요.";
}
