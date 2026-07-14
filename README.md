# 쿄사카 - 여행계획을 읽고, 쓰고, 공유하자

> 쿄사카 == 교토 + 오사카

json 기반 여행 계획표 앱

- 내 일정을 json으로 내보내기
- 여권사진이나 qr, 사진 등은 받은 사람이 직접 채워넣기

## 프로젝트 셋업 및 데이터 기반 다지기

- [x] Vite 프로젝트 생성 및 PWA 플러그인 설정.
- [x] FileReader API를 이용한 JSON 업로드 컴포넌트 완성.
- [x] 기본적인 JSON 데이터 구조 정의 (날짜별 일정, 가족별 서류 정보).

- [x] dayselector 만들고 RENDER 이벤트 쏘기
- [x] RENDER이벤트에 특정 데이터를 넣고 쏠 수 있도록 customevent를 보완

## 폴드7 최적화 레이아웃 (Grid & Details)

갤럭시 폴드7에 걸맞는 <strong>펼침 모드</strong>
핵심 미션: 단일 HTML 마크업으로 접었을 때(아코디언)와 펼쳤을 때(2분할) UI 완성.

- [x] 접었을 때 및 비폴더블 디바이스는 아코디언 ui
- [x] 펼쳤을 때는 display:contents를 통한 2분할 ui
- [x] 좌측에는 summary(for fold)
- [x] 우측에는 position:sticky를 통한 고정ui(for fold)

## 이미지 업로드 및 캐시저장

미리 업로드해두고 현지에서는 보여주기만 하자.
핵심 미션: 일정을 누르면 뜨는 모달창과 그 안의 인물별(엄마/아빠/나) 데이터 전환.

- [x] 이미지를 브라우저 캐시에 저장

## 일정 CRUD

- [x] 계획표 업로드
- [x] 계획표 신규
  - [x] 기본계획표 자동생성(하루의 여행기간, 하나의 계획)
- [ ] 수정
  - [x] date-picker
  - [ ] 여행기간+여행이름+날짜별이름을 수정하는 bottom-sheet
  - [ ] 각 일정별 수정버튼 추가
  - [ ] 각 일정별 수정 bottom-sheet
  - [ ] 새 일정을 추가하는 우측하단 floating-button -> bottom-sheet연결
    - [ ] prompt api(gemini nano, 크롬내장 온디바이스ai) 활용 다음일정 추천
- [ ] 삭제
  - [x] 플랜 자체를 삭제
  - [ ] 일정 개별 삭제

```
// 시간표 json 명세

interface ScheduleData{
  name: string;
  type: "transport" | "hotel" | "food" | "sightseeing" | "etc";
  route: {
    from: string
    to: string;
  }
  ...
}

interface PlanDay{
  day: `${number}-${number}-${number}`;
  description: string;
  name: string;
  schedule: Array<ScheduleData>
}

//selected에는 플랜 속 현재 선택된 날짜의 index 저장
interface PlanData{
  data: Array<PlanDay>;
  edited: Date;
  id: `${string}-${string}-${string}-${string};
  selected: number
}


// selected에는 현재 선택된 플랜의 id 저장
interface Plans {
  plans: Array<PlanData>;
  selected?: string
}
```
