import { checkPromptAPIAvailability } from "./supports";

// 1. 단일 일정을 위한 JSON Schema 정의
export const SCHEDULE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    type: {
      type: "string",
      enum: [
        "transport",
        "hotel",
        "food",
        "attractions",
        "landscape",
        "onsen",
        "shopping",
        "photo_camera",
        "temple_buddhist",
      ],
      pattern: "^[^\\*_`~#]*$",
    },
    timeFrom: {
      type: "string",
      pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$",
    },
    timeTo: {
      type: "string",
      pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$",
    },
    budget: { type: "number" },
    routeFrom: { type: "string" },
    routeTo: { type: "string" },
    posName: { type: "string" },
    posAddress: { type: "string" },
    descriptionText: { type: "string", pattern: "^[^\\*_`~#]*$" },
  },
  required: [
    "name",
    "type",
    "timeFrom",
    "timeTo",
    "budget",
    "routeFrom",
    "routeTo",
    "posName",
    "posAddress",
    "descriptionText",
  ],
  additionalProperties: false,
};

// 2. 하루 전체 일정을 위한 JSON Schema 정의 (SCHEDULE_SCHEMA 재사용)
export const DAY_SCHEDULE_SCHEMA = {
  type: "object",
  properties: {
    dayName: { type: "string", pattern: "^[^\\*_`~#]*$" },
    dayDescription: { type: "string", pattern: "^[^\\*_`~#]*$" },
    schedules: {
      type: "array",
      items: SCHEDULE_SCHEMA,
    },
  },
  required: ["dayName", "dayDescription", "schedules"],
  additionalProperties: false,
};

// 3. 방어적 파싱을 위한 헬퍼 함수
export function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw err;
  }
}

// 4. AI 모델 아웃풋 형식을 프론트엔드/데이터베이스 일정 아이템 형식으로 변환
export function transformModelToScheduleItem(item, fallbackName = "일정") {
  const scheduleItem = {
    name: item.name || fallbackName,
    type: item.type || "attractions",
    time: {
      from: item.timeFrom || "09:00",
      to: item.timeTo || "10:00",
    },
    budget: typeof item.budget === "number" ? item.budget : 0,
    description: item.descriptionText
      ? item.descriptionText.split("\n").filter(Boolean)
      : [],
  };

  if (scheduleItem.type === "transport") {
    scheduleItem.route = {
      from: item.routeFrom || "",
      to: item.routeTo || "",
    };
    scheduleItem.position = null;
  } else {
    scheduleItem.route = null;
    scheduleItem.position = [
      {
        name: item.posName || "",
        address: item.posAddress || "",
        map: "",
      },
    ];
  }

  return scheduleItem;
}

// 5. 공통 Session 생성 준비 및 가용성 체크 헬퍼
export async function getLanguageModelSession(systemPrompt) {
  const availability = await checkPromptAPIAvailability();
  if (availability === "no") {
    throw new Error("Prompt API가 지원되지 않는 환경입니다.");
  }

  const api = window.LanguageModel || window.ai.languageModel;
  return await api.create({ systemPrompt, language: "en" });
}
