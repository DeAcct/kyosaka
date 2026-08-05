import { sanitizePrompt } from "../security";
import {
  DAY_SCHEDULE_SCHEMA,
  safeJsonParse,
  transformModelToScheduleItem,
  executeAIStreamPrompt,
  extractPartialSchedule,
  isNorthKoreaPrompt,
} from "../helpers";

export async function* generateDayScheduleFromPrompt(promptText, options = {}) {
  const {
    isFirstDay,
    isLastDay,
    planTitle = "",
    contextSchedules = [],
  } = options;

  if (isNorthKoreaPrompt(promptText, planTitle)) {
    yield {
      dayName: "국가정보원 지하 안보 특별 체험",
      dayDescription:
        "북한 관련 검색이 감지되어 검은 승합차가 도착했습니다. 안심하세요, 안전한 정밀 안보 점검 코스입니다.",
      schedules: [
        {
          name: "검은 승합차 탑승 및 긴급 이송",
          type: "transport",
          time: { from: "09:00", to: "10:00" },
          budget: 0,
          description:
            "선글라스를 쓴 요원들의 안내를 받으며 안대 착용 후 내곡동으로 이동합니다.",
          route: { from: "현재 위치", to: "국정원 지하 비밀 시설" },
          position: null,
        },
        {
          name: "절대시계 수령 및 안보 교육",
          type: "attractions",
          time: { from: "10:00", to: "12:00" },
          budget: 0,
          description:
            "간첩 신고 포상 안내를 받고 전설의 국정원 절대시계(실물)를 정식 수령합니다.",
          route: null,
          position: [
            {
              name: "국가정보원 안보전시관",
              address: "서울특별시 서초구 내곡동",
              map: "",
            },
          ],
        },
        {
          name: "국정원 지하 구내식당 안보 비빔밥",
          type: "food",
          time: { from: "12:00", to: "13:00" },
          budget: 0,
          description:
            "요원들과 함께 싹싹 비벼 먹는 영양 만점의 비밀 구내식당 특선 메뉴입니다.",
          route: null,
          position: [
            {
              name: "내곡동 지하 구내식당",
              address: "서울특별시 서초구 내곡동",
              map: "",
            },
          ],
        },
        {
          name: "비밀유지 서약서 작성 및 안전 귀가",
          type: "transport",
          time: { from: "13:00", to: "14:00" },
          budget: 0,
          description:
            "오늘 일어난 일은 아무에게도 말하지 않겠다는 서약서를 작성한 뒤 안전하게 복귀합니다.",
          route: { from: "국가정보원", to: "집" },
          position: null,
        },
      ],
      isDone: true,
    };
    return;
  }

  const sanitized = sanitizePrompt(promptText);

  const sessionNonce = Math.random().toString(36).substring(7);
  let finalPrompt = "";
  if (planTitle && planTitle.trim() && planTitle.trim() !== "제목 없는 여행") {
    finalPrompt += `[전체 여행 제목]: ${planTitle.trim()}\n`;
  }
  if (sanitized && sanitized.trim()) {
    finalPrompt += `[사용자 요청]: ${sanitized.trim()}\n`;
  } else {
    finalPrompt += `[사용자 요청]: 하루 여행 일정 추천\n`;
  }
  finalPrompt += `[요청 식별키]: ${sessionNonce}\n(반드시 모든 텍스트 필드를 한국어로 작성해줘.)`;

  let contextPrompt = "";
  if (Array.isArray(contextSchedules) && contextSchedules.length > 0) {
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
      "\n위 기존 일정의 동선과 시간이 자연스럽게 연결되도록 하루 일정을 구성해라.";
  }

  let airportInstruction = "";
  if (isFirstDay && isLastDay) {
    airportInstruction = `\n[특수 상황 - 1일짜리 여행]: 오늘은 당일치기 여행(출발 및 귀국이 같은 날)이다. 하루 일정의 시작은 공항에서 출발하여 이동하는 일정으로, 하루 일정의 끝은 다시 공항으로 돌아가는 일정으로 양쪽에 공항 관련 일정을 포함해라.`;
  } else if (isFirstDay) {
    airportInstruction = `\n[특수 상황 - 첫째 날]: 오늘은 여행의 첫째 날(출발일)이다. 하루 일정의 맨 처음에는 주요 공항에 도착하여 시내로 이동하는 일정(교통편 등)이 반드시 포함되도록 구성해라.`;
  } else if (isLastDay) {
    airportInstruction = `\n[특수 상황 - 마지막 날]: 오늘은 여행의 마지막 날(귀국일)이다. 하루 일정의 맨 마지막에는 시내에서 주요 공항으로 이동하여 귀국 비행기를 타러 가는 일정(교통편 등)이 반드시 포함되도록 구성해라.`;
  }

  const systemPrompt = `너는 한국인을 위한 여행 하루 일정을 짜주는 AI 어시스턴트이다.
[필수 규칙]: 모든 문자열 필드(name, descriptionText, posName, posAddress 등)의 값은 반드시 한국어로만 작성해야 한다. 영어 장소명이 입력되어도 한국어 발음이나 한글 번역으로 변환하여 입력해라.
${airportInstruction}
${contextPrompt}

[여행지 선정 규칙]:
1. 사용자 요청이나 전체 여행 제목(planTitle)에 특정 도시나 지역이 이미 지정되어 있는 경우에는 반드시 해당 지정 지역을 바탕으로 일정을 작성해라.
2. 사용자 요청 및 여행 제목에 구체적인 지명이나 도시가 전혀 언급되지 않은 경우:
   - '한국인의 하루 일정'이라는 문맥 때문에 후쿠오카, 오사카 등 특정 국가나 가까운 아시아 도시로만 결과가 고정되는 편향을 엄격히 금지한다.
   - 제공된 [요청 식별키]의 영문자와 숫자 조합을 고유한 시드(Seed)로 삼아, 유럽, 남미, 북미, 아프리카, 중동, 오세아니아 등 전 세계 모든 대륙을 대상으로 완전히 무작위의 도시를 하나 도출해라.
   - 매 요청마다 식별키가 다르므로 매번 전혀 다른 대륙과 국가의 새롭고 낯선 도시를 목적지로 설정해야 한다.

반드시 이 일정에 걸맞은 하루의 제목(dayName)과 하루 소개(dayDescription)를 함께 구성해라.
각 일정의 시간대(timeFrom, timeTo)는 겹치지 않고 시간 순서대로 자연스럽게 흘러가도록 배치해라.
날짜는 하루를 넘겨서는 안 되며, 00:00~23:59 사이에서 작성하라.
모든 텍스트 필드는 어떠한 꾸밈 기호도 없는 "순수 텍스트(Plain Text)"로만 작성해야 한다.
특수문자(*, _, #, ~, \`)를 절대 섞지 말고 한글과 숫자, 공백으로만 구성해라.
만약 정보가 부족하다면 자연스러운 기본값이나 그럴듯한 내용으로 필드를 채워라.`;

  try {
    const stream = executeAIStreamPrompt(
      systemPrompt,
      finalPrompt,
      DAY_SCHEDULE_SCHEMA,
    );

    let fullText = "";
    let isAccumulated = null;
    let previousChunk = "";

    let lastYieldedLength = -1;
    let lastDayName = "";

    for await (const chunk of stream) {
      if (isAccumulated === null) {
        if (previousChunk && chunk.startsWith(previousChunk)) {
          isAccumulated = true;
        } else if (previousChunk) {
          isAccumulated = false;
        }
      }

      if (isAccumulated || isAccumulated === null) {
        fullText = chunk;
      } else {
        fullText += chunk;
      }
      previousChunk = chunk;

      const partial = extractPartialSchedule(fullText);

      // 완전히 파싱된 객체가 추가되었거나, dayName이 처음 들어왔을 때만 yield
      if (
        partial.schedules.length > lastYieldedLength ||
        (partial.dayName !== "로딩 중..." && lastDayName !== partial.dayName)
      ) {
        lastYieldedLength = partial.schedules.length;
        if (partial.dayName !== "로딩 중...") {
          lastDayName = partial.dayName;
        }

        yield {
          dayName: partial.dayName,
          dayDescription: partial.dayDescription,
          schedules: partial.schedules.map((item) =>
            transformModelToScheduleItem(item, "일정"),
          ),
          isDone: false,
        };
      }
    }

    const data = safeJsonParse(fullText.trim());
    if (
      !data ||
      !Array.isArray(data.schedules) ||
      !data.dayName ||
      !data.dayDescription
    ) {
      throw new Error("올바른 형식의 응답을 받지 못했습니다.");
    }

    yield {
      dayName: data.dayName,
      dayDescription: data.dayDescription,
      schedules: data.schedules.map((item) =>
        transformModelToScheduleItem(item, "일정"),
      ),
      isDone: true,
    };
  } catch (err) {
    console.error("AI 하루 일정 생성 실패:", err);
    throw new Error("AI 하루 일정을 생성하는 데 실패했습니다.");
  }
}
