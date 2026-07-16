import { checkPromptAPIAvailability, getUnsupportedReason } from "./supports";

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

export async function getLanguageModelSession(systemPrompt) {
  const availability = await checkPromptAPIAvailability();

  if (availability === "no") {
    throw new Error(getUnsupportedReason());
  }

  if (availability === "after-download") {
    throw new Error(
      "AI 모델을 다운로드하는 중입니다. 다운로드가 완료될 때까지 잠시 후 다시 시도해 주세요.",
    );
  }

  const api = window.LanguageModel || window.ai.languageModel;
  return await api.create({ systemPrompt, language: "en" });
}
