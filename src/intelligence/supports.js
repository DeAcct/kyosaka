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

export function hasGeminiApiKey() {
  const key = import.meta.env.GEMINI_API_KEY;
  return typeof key === "string" && key.trim().length > 0;
}

export async function getAIProvider() {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (isOnline && hasGeminiApiKey()) {
    return "remote-gemini";
  }

  const promptStatus = await checkPromptAPIAvailability();
  if (promptStatus === "readily" || promptStatus === "after-download") {
    return "chrome-prompt-api";
  }

  return "none";
}

export function getUnsupportedReason() {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (!isOnline) {
    return "이 기기는 오프라인 상태에서 온디바이스 AI를 지원하지 않습니다. 네트워크 연결 후 다시 시도해 주세요.";
  }

  if (hasGeminiApiKey()) return "";

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

  return "온디바이스 AI 기능을 사용하기 위해 브라우저 설정이 필요하거나, .env에 GEMINI_API_KEY 설정이 필요합니다. Google Chrome 최신 버전에서 AI 설정을 켜시거나 API 키를 등록해주세요.";
}


