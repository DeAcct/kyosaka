export function useTimeFormat(dateString) {
  // 1. 방어 코드: 데이터가 아예 없거나 빈 값일 때
  if (!dateString) return "방금 전";

  const now = Temporal.Now.plainDateTimeISO();
  let target;

  try {
    // 2. 오직 Temporal 생태계 안에서만 타입 정제하기
    if (typeof dateString === "number") {
      // Date.now() 같은 밀리초 숫자가 들어온 경우 로컬 PlainDateTime으로 변환
      target = Temporal.Instant.fromEpochMilliseconds(dateString)
        .toZonedDateTimeISO(Temporal.Now.timeZoneId())
        .toPlainDateTime();
    } else if (typeof dateString === "string") {
      // UTC 기호(Z)나 타임존 오프셋(+, -)이 포함된 문자열인지 체크
      const hasOffset =
        dateString.includes("Z") ||
        dateString.includes("+") ||
        (dateString.includes("T") &&
          dateString.slice(dateString.indexOf("T")).includes("-"));

      if (hasOffset) {
        // 절대 시간(Instant)으로 파싱 후 사용자의 로컬 타임존 반영
        target = Temporal.Instant.from(dateString)
          .toZonedDateTimeISO(Temporal.Now.timeZoneId())
          .toPlainDateTime();
      } else {
        // 오프셋이 없는 순수 로컬 날짜 문자열인 경우 바로 파싱
        target = Temporal.PlainDateTime.from(dateString);
      }
    } else if (dateString instanceof Temporal.PlainDateTime) {
      target = dateString;
    } else {
      return "방금 전";
    }
  } catch (e) {
    console.error("Temporal 파싱 실패:", e);
    return "방금 전";
  }

  // 3. 단 한 번의 until 호출로 일, 시간, 분 단위를 쪼개서 Duration 객체 확보
  const diff = target.until(now, { largestUnit: "day" });

  // 4. 큰 단위부터 매칭하여 문자열 반환
  if (diff.days > 0) return `${diff.days}일`;
  if (diff.hours > 0) return `${diff.hours}시간`;
  if (diff.minutes > 0) return `${diff.minutes}분`;

  return "방금";
}
