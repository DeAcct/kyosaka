export function useTimeFormat(dateString) {
  // 1. 현재 로컬 날짜와 시간 구하기
  const now = Temporal.Now.plainDateTimeISO();

  // 2. 소수점 아래 자릿수 상관없이 PlainDateTime으로 안전하게 변환
  // (입력값에 'Z'나 '+09:00' 등이 붙어있다면 제거하고 PlainDateTime으로 파싱)
  const cleanString = dateString.split("Z")[0].split("+")[0];
  const targetDateTime = Temporal.PlainDateTime.from(cleanString);

  // 3. 분 단위 차이 계산
  const diffInMinutes = targetDateTime.until(now, {
    largestUnit: "minute",
  }).minutes;

  // 1시간 미만 전
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  // 4. 시간 단위 차이 계산
  const diffInHours = targetDateTime.until(now, { largestUnit: "hour" }).hours;
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  // 5. 그 이외 (1일 이상)
  const diffInDays = targetDateTime.until(now, { largestUnit: "day" }).days;
  return `${diffInDays}일 전`;
}
