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
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));

  if (isAndroid || isIOS) {
    return "모바일용 Chrome은 아직 온디바이스 AI를 지원하지 않습니다. 서비스가 확대될 수 있도록 노력하겠습니다.";
  }

  const isCrOS = /CrOS/i.test(ua);
  if (isCrOS) {
    return "일반 Chromebook은 아직 온디바이스 AI를 지원하지 않습니다. 서비스가 확대될 수 있도록 노력하겠습니다.";
  }

  return "온디바이스 AI 기능을 사용하기 위해 브라우저 설정이 필요합니다. Windows 10/11, macOS 13+, Linux, ChromeOS(Chromebook Plus)의 Google Chrome 최신 버전(126 이상)에서 AI 설정을 켜주세요.";
}
