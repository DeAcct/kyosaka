import { sanitizePrompt } from "../security";
import {
  SCHEDULE_SCHEMA,
  safeJsonParse,
  transformModelToScheduleItem,
  executeAIPrompt,
} from "../helpers";
import { findEasterEgg } from "../easterEggs";

export async function generateScheduleFromPrompt(
  promptText,
  contextSchedules = [],
) {
  const easterEgg = findEasterEgg(promptText);
  if (easterEgg) {
    return easterEgg.itemSchedule;
  }

  const sanitized = sanitizePrompt(promptText);
  const finalPrompt = sanitized
    ? `${sanitized} (반드시 모든 텍스트 필드를 한국어로 작성해줘.)`
    : "여행 일정 추천 (반드시 모든 텍스트 필드를 한국어로 작성해줘.)";

  let contextPrompt = "";
  if (contextSchedules.length > 0) {
    contextPrompt =
      `\n\n[이 날의 기존 일정들]:\n` +
      contextSchedules
        .map((s, idx) => {
          const timeStr = s.time ? `${s.time.from}~${s.time.to}` : "";
          const routeStr = s.route ? ` (${s.route.from} -> ${s.route.to})` : "";
          const posStr =
            s.position && s.position[0] ? ` [장소: ${s.position[0].name}]` : "";
          return `${idx + 1}. [${s.type}] ${s.name} ${timeStr}${routeStr}${posStr}`;
        })
        .join("\n") +
      "\n위 기존 일정들의 동선과 시간 흐름을 고려하여 자연스럽게 이어지도록 새로운 일정을 생성해라. 시간이 겹치지 않게 조율해야 한다.";
  }

  const systemPrompt = `너는 한국인을 위한 여행 계획표 작성을 돕는 AI 어시스턴트이다.
[필수 규칙]: 모든 문자열 필드(name, descriptionText, posName, posAddress 등)의 값은 반드시 한국어로만 작성해야 한다. 영어 장소명이 입력되어도 한국어 발음이나 한글 번역으로 변환하여 입력해라. (예: "Shibuya Station" -> "시부야역")

사용자가 입력한 자연어를 분석하여 하루 일정에 맞는 데이터로 변환해라.
모든 텍스트 필드는 어떠한 꾸밈 기호도 없는 "순수 텍스트(Plain Text)"로만 작성해야 한다.
특수문자(*, _, #, ~, \`)를 절대 섞지 말고 한글과 숫자, 공백으로만 구성해라.
사용자가 구체적인 장소나 시간 대신 테마성 키워드나 제안을 입력한 경우(예: '주변 맛집 추천'), 해당 조건에 어울리는 가상의 구체적인 장소명과 내용을 생성해라.
만약 정보가 부족하다면 자연스러운 기본값(시간은 09:00~10:00, 예산은 0 등)이나 그럴듯한 내용으로 필드를 채워라.${contextPrompt}`;

  try {
    const response = await executeAIPrompt(
      systemPrompt,
      finalPrompt,
      SCHEDULE_SCHEMA,
    );

    const data = safeJsonParse(response.trim());
    return transformModelToScheduleItem(data, finalPrompt);
  } catch (err) {
    console.error("AI 응답 파싱 실패:", err);
    throw new Error("AI 추천 결과를 파싱하는 데 실패했습니다.");
  }
}
