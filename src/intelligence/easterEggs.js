const easterEggMap = new Map([
  [
    "northKorea",
    {
      pattern: /북한|평양|조선민주주의인민공화국|north\s*korea/i,
      daySchedule: {
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
      },
      itemSchedule: {
        name: "국정원 지하 여행계획",
        type: "attractions",
        time: { from: "09:00", to: "18:00" },
        budget: 0,
        position: [
          { name: "국가정보원 지하", address: "서울특별시 서초구 내곡동" },
        ],
        description: [
          "(대한민국에서 방문 불가)",
          "국가보안법에 의해 북한 지역 여행계획 조회가 제한되며, 국정원 지하 심문실로 안내됩니다.",
        ],
      },
    },
  ],
  [
    "isekai",
    {
      pattern:
        /이세계|판타지|트럭|트랙터|경운기|코노스바|멋진\s*세계|이세카이|isekai/i,
      daySchedule: {
        dayName: "트럭인 줄 알았던 경운기에 놀라 전생한 억울한 모험가 라이프",
        dayDescription:
          "트럭이 아니라 서행하던 트랙터였습니다. 잉여 여신을 물귀신 작전으로 끌어들여 시작하는 꿈도 희망도 없는 엑셀 마을 생활!",
        schedules: [
          {
            name: "경운기 착각 쇼크사 및 여신 강제 연행",
            type: "transport",
            time: { from: "09:00", to: "09:30" },
            budget: 0,
            description:
              "달려오는 경운기를 트럭으로 착각해 쇼크사한 뒤, 자신을 비웃는 여신을 특전 아이템 대신 지목하여 이세계로 끌고 떨어집니다.",
            route: { from: "현실 세계 시골길", to: "초보자의 도시 엑셀" },
            position: null,
          },
          {
            name: "모험가 길드 등록 및 최하위 '모험가' 직업 취득",
            type: "attractions",
            time: { from: "10:00", to: "11:30" },
            budget: 200,
            description:
              "운 수치만 기형적으로 높고 나머지는 평범한 최약체 직업 '모험가'로 등록하며, 수수료 때문에 시작부터 빚을 떠안습니다.",
            route: null,
            position: [
              {
                name: "엑셀 모험가 길드 주점",
                address: "시작의 도시 엑셀 1구역",
                map: "",
              },
            ],
          },
          {
            name: "마구간 노숙 및 최저가 튀긴 빵 점심",
            type: "food",
            time: { from: "12:00", to: "13:30" },
            budget: 50,
            description:
              "숙박비를 아끼기 위해 마구간에 짐을 풀고, 울상을 짓는 여신과 함께 딱딱한 빵과 저렴한 술로 끼니를 때웁니다.",
            route: null,
            position: [
              {
                name: "길드 전용 마구간",
                address: "엑셀 외곽 마구간",
                map: "",
              },
            ],
          },
          {
            name: "자이언트 두꺼비 토벌 및 여신 구출",
            type: "attractions",
            time: { from: "14:00", to: "17:00" },
            budget: 0,
            description:
              "두꺼비에게 삼켜진 여신을 겨우 구해주지만, 온몸이 두꺼비 점액 범벅이 되어 보수보다 세탁비가 더 많이 나옵니다.",
            route: null,
            position: [
              {
                name: "엑셀 외곽 평원",
                address: "자이언트 두꺼비 서식지",
                map: "",
              },
            ],
          },
          {
            name: "비상하는 날아다니는 양배추 포획 대작전",
            type: "attractions",
            time: { from: "18:00", to: "21:00" },
            budget: 0,
            description:
              "수확철을 맞아 떼지어 날아오는 양배추들을 온몸으로 받아내며 빚을 청산하기 위해 밤새 고된 노동을 펼칩니다.",
            route: null,
            position: [
              {
                name: "엑셀 성벽 앞",
                address: "양배추 비상 지대",
                map: "",
              },
            ],
          },
        ],
      },
      itemSchedule: {
        name: "경운기 쇼크사 전생 및 자이언트 두꺼비 토벌",
        type: "attractions",
        time: { from: "09:00", to: "18:00" },
        budget: 0,
        position: [{ name: "엑셀 모험가 길드", address: "시작의 도시 엑셀" }],
        description: [
          "경운기 쇼크사 후 잉여 여신과 함께 전생하여 자이언트 두꺼비에게 삼켜지고 마구간에서 노숙합니다.",
        ],
      },
    },
  ],
]);

export function findEasterEgg(promptText = "", planTitle = "") {
  const combined = `${promptText} ${planTitle}`.trim();
  if (!combined) return null;

  for (const entry of easterEggMap.values()) {
    if (entry.pattern.test(combined)) {
      return entry;
    }
  }

  return null;
}
