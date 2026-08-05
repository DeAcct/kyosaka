import {
  checkPromptAPIAvailability,
  getUnsupportedReason,
  getAIProvider,
} from "./supports";
import { promptGemini, promptStreamGemini } from "./providers/remoteGemini";

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
      "AI 연산에 필요한 로컬 인공지능 모델을 다운로드하고 있습니다. 다운로드가 끝날 때까지 잠시만 기다리신 후 다시 시도해 주세요.",
    );
  }

  const api = window.LanguageModel || window.ai.languageModel;
  return await api.create({ systemPrompt, language: "en", temperature: 1.0, topK: 10 });
}

export async function executeAIPrompt(systemPrompt, userPrompt, schema) {
  const provider = await getAIProvider();

  if (provider === "chrome-prompt-api") {
    const session = await getLanguageModelSession(systemPrompt);
    return await session.prompt(userPrompt, {
      responseConstraint: schema,
    });
  }

  if (provider === "remote-gemini") {
    return await promptGemini(systemPrompt, userPrompt, schema);
  }

  throw new Error(getUnsupportedReason() || "사용 가능한 AI 서비스가 없습니다.");
}

export async function* executeAIStreamPrompt(systemPrompt, userPrompt, schema) {
  const provider = await getAIProvider();

  if (provider === "chrome-prompt-api") {
    const session = await getLanguageModelSession(systemPrompt);
    const stream = await session.promptStreaming(userPrompt, {
      responseConstraint: schema,
    });
    for await (const chunk of stream) {
      yield chunk;
    }
    return;
  }

  if (provider === "remote-gemini") {
    const stream = promptStreamGemini(systemPrompt, userPrompt, schema);
    for await (const chunk of stream) {
      yield chunk;
    }
    return;
  }

  throw new Error(getUnsupportedReason() || "사용 가능한 AI 서비스가 없습니다.");
}

export function extractPartialSchedule(text) {
  let dayName = "로딩 중...";
  let dayDescription = "일정을 생성하고 있습니다...";
  let schedules = [];

  const nameMatch = text.match(/"dayName"\s*:\s*"([^"]+)/);
  if (nameMatch) dayName = nameMatch[1];

  const descMatch = text.match(/"dayDescription"\s*:\s*"([^"]+)/);
  if (descMatch) dayDescription = descMatch[1];

  const schedulesMatch = text.match(/"schedules"\s*:\s*\[(.*)/s);
  if (schedulesMatch) {
    const schedulesText = schedulesMatch[1];
    let depth = 0;
    let objStart = -1;
    let inString = false;
    let escape = false;

    for (let i = 0; i < schedulesText.length; i++) {
      const char = schedulesText[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') {
          if (depth === 0) objStart = i;
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0 && objStart !== -1) {
            const objStr = schedulesText.substring(objStart, i + 1);
            try {
              schedules.push(JSON.parse(objStr));
            } catch (e) {
            }
          }
        }
      }
    }
  }

  return { dayName, dayDescription, schedules };
}


