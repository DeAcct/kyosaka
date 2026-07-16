export const SUPPORTS_PROMPT_API =
  typeof window !== "undefined" &&
  ("LanguageModel" in window ||
    ("ai" in window && "languageModel" in window.ai));

export async function checkPromptAPIAvailability() {
  if (!SUPPORTS_PROMPT_API) return "no";

  try {
    const api = window.LanguageModel || window.ai.languageModel;
    const status = await api.availability();
    // 'readily' (바로 사용 가능)
    // 'after-download' (모델 다운로드 후 사용 가능)
    // 'no' (지원하지 않음)
    return status;
  } catch (e) {
    return "no";
  }
}
