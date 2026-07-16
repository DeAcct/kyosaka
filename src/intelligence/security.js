/**
 * AI 프롬프트 인젝션, 탈옥 공격 및 온디바이스 답변 거부를 예방하기 위한 프롬프트 정제 함수
 * @param {string} promptText 사용자가 입력한 프롬프트 원문
 * @returns {string} 정제된 프롬프트
 */
export function sanitizePrompt(promptText) {
  if (!promptText) return "";

  let sanitized = promptText;

  // 1. 길이 제한 (온디바이스 AI 과부하 및 Context Stuffing 공격 방지)
  // 여행 일정 입력 용도라면 150자 내외로도 충분히 모든 정보를 담을 수 있음
  const MAX_LENGTH = 150;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  // 2. HTML/XML 태그 제거 (태그 탈출을 통한 인젝션 원천 차단)
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, "");

  // 3. JSON 구조 붕괴 및 이스케이프 방지 특수문자 제거
  // { }, [ ], `(백틱), \(역슬래시)를 모두 제거하여 프롬프트 탈출 차단
  sanitized = sanitized.replace(/[{}[\]`\\]/g, "");

  // 4. 시스템 프롬프트 유출 및 탈옥 방지 (프롬프트 인젝션 패턴 제거)
  const injectionPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /reveal\s+(your\s+)?system\s+prompt/gi,
    /system\s+instructions/gi,
    /you\s+are\s+now\s+a/gi,
    /translate\s+system\s+prompt/gi,
    /이전\s+지시(사항)?\s*(무시|우회)/gi,
    /시스템\s*프롬프트/gi,
    /탈옥\s*(시도)?/gi,
    /개발자\s*모드/gi,
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }

  // 5. 세이프티 필터(Safety Refusal) 유발 단어 처리
  // - 위해 단어(자살, 테러 등)는 강제 변환 시 오작동을 유도하므로 아예 삭제 처리
  // - 비속어는 맥락을 해치지 않는 중립적인 표현으로 순화
  const refusalKeywords = {
    // [위해 단어 - 삭제 처리]
    폭탄: "", // '폭탄 타코야끼' 등이 변환되어 오동작하는 것을 막기 위해 삭제로 타협하거나 그대로 둠
    테러: "",
    자살: "",
    살인: "",
    전쟁: "",
    마약: "", // '마약 옥수수' 등의 부작용을 막기 위해 그냥 삭제 처리하는 것이 안전함
    도박: "",

    // [비속어 - 순화 처리]
    시발: "진짜",
    씨발: "진짜",
    존나: "매우",
    개새끼: "강아지",
    좆: "",
    병신: "친구",
    미친: "대단한",
  };

  for (const [bad, good] of Object.entries(refusalKeywords)) {
    // 단어 앞뒤 경계 등을 고려한 정규식 처리
    const regex = new RegExp(bad, "gi");
    sanitized = sanitized.replace(regex, good);
  }

  // 6. 연속된 공백 및 줄바꿈을 단일 공백으로 정리
  sanitized = sanitized.replace(/\s+/g, " ");

  return sanitized.trim();
}
