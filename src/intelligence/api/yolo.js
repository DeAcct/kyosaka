import { sanitizePrompt } from "../security";
import {
  DAY_SCHEDULE_SCHEMA,
  safeJsonParse,
  transformModelToScheduleItem,
  executeAIStreamPrompt,
  extractPartialSchedule,
} from "../helpers";

export async function* generateDayScheduleFromPrompt(promptText, options = {}) {
  const { isFirstDay, isLastDay } = options;
  const sanitized = sanitizePrompt(promptText);
  const finalPrompt = sanitized
    ? `${sanitized} (반드시 모든 텍스트 필드를 한국어로 작성해줘.)`
    : "하루 여행 일정 추천 (반드시 모든 텍스트 필드를 한국어로 작성해줘.)";

  let airportInstruction = "";
  if (isFirstDay && isLastDay) {
    airportInstruction = `\n[특수 상황 - 1일짜리 여행]: 오늘은 당일치기 여행(출발 및 귀국이 같은 날)이다. 하루 일정의 시작은 공항에서 출발하여 이동하는 일정으로, 하루 일정의 끝은 다시 공항으로 돌아가는 일정으로 양쪽에 공항 관련 일정을 포함해라.`;
  } else if (isFirstDay) {
    airportInstruction = `\n[특수 상황 - 첫째 날]: 오늘은 여행의 첫째 날(출발일)이다. 하루 일정의 맨 처음에는 공항(예: 간사이 공항, 하네다 공항 등)에 도착하여 시내로 이동하는 일정(교통편 등)이 반드시 포함되도록 구성해라.`;
  } else if (isLastDay) {
    airportInstruction = `\n[특수 상황 - 마지막 날]: 오늘은 여행의 마지막 날(귀국일)이다. 하루 일정의 맨 마지막에는 시내에서 공항(예: 간사이 공항, 하네다 공항 등)으로 이동하여 귀국 비행기를 타러 가는 일정(교통편 등)이 반드시 포함되도록 구성해라.`;
  }

  const systemPrompt = `너는 한국인을 위한 여행 하루 일정을 짜주는 AI 어시스턴트이다.
[필수 규칙]: 모든 문자열 필드(name, descriptionText, posName, posAddress 등)의 값은 반드시 한국어로만 작성해야 한다. 영어 장소명이 입력되어도 한국어 발음이나 한글 번역으로 변환하여 입력해라. (예: "Shibuya Station" -> "시부야역")
${airportInstruction}

사용자가 입력한 테마나 지역에 맞게 하루 일정을 생성해라.
반드시 이 일정에 걸맞은 하루의 제목(dayName, 예: "오사카 도심 탐방과 식도락")과 하루 소개(dayDescription, 예: "도톤보리 주변 맛집을 탐방하고 번화가를 걷는 신나는 하루입니다.")를 함께 구성해라.
각 일정의 시간대(timeFrom, timeTo)는 겹치지 않고 시간 순서대로(예: 오전 09:00부터 순차적으로) 자연스럽게 흘러가도록 배치해라.
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
