# 쿄사카 - JSON으로 여행계획을 읽고, 쓰고, 공유하자

> 쿄사카 == 교토 + 오사카

json 기반 여행 계획표 앱

- 내 일정을 json으로 내보내기
- 여권사진이나 qr, 사진 등은 받은 사람이 직접 채워넣기

## 1주차: 프로젝트 셋업 및 데이터 기반 다지기

- [x] Vite 프로젝트 생성 및 PWA 플러그인 설정.
- [x] FileReader API를 이용한 JSON 업로드 컴포넌트 완성.
- [x] 기본적인 JSON 데이터 구조 정의 (날짜별 일정, 가족별 서류 정보).

## 2주차: 폴드7 최적화 레이아웃 (Grid & Details)

갤럭시 폴드7에 걸맞는 <strong>펼침 모드</strong>
핵심 미션: 단일 HTML 마크업으로 접었을 때(아코디언)와 펼쳤을 때(2분할) UI 완성.

- [ ] 접었을 때는 아코디언 ui
- [ ] 펼쳤을 때는 display:contents를 통한 2분할 ui
- [ ] 좌측에는 summary(for fold)
- [ ] 우측에는 position:sticky를 통한 고정ui(for fold)

## 3주차: 이미지 업로드 및 캐시저장

미리 업로드해두고 현지에서는 보여주기만 하자.
핵심 미션: 일정을 누르면 뜨는 모달창과 그 안의 인물별(엄마/아빠/나) 데이터 전환.

- [x] 일정(JSON): localStorage의 trip_schedule 키에 저장.
- [ ] QR 이미지: Cache Storage의 /user/my-qr.png 경로로 저장.
- [ ] 여권 이미지: Cache Storage의 /user/my-passport.png 경로로 저장.
- [ ] 여권 번호나 예약 번호는 터치 한 번으로 복사되는 기능 추가(선택 사항).

이미지 캐시저장 함수

```
async function saveImageToCache(file, customUrl) {
  const cache = await caches.open('user-data-cache');
  // 파일을 Response 객체로 만들어 캐시에 저장
  await cache.put(customUrl, new Response(file));
  console.log('이미지가 캐시에 저장되었습니다:', customUrl);
}

// 사용 예시 (input type="file"에서 선택 시)
const file = event.target.files[0];
saveImageToCache(file, '/my-assets/qr-code.png');
```

## 4주차: 오프라인 테스트 및 최종 배포

실전 상황(비행기 모드)에서 완벽하게 돌아가는지 점검합니다.
핵심 미션: 실제 데이터를 넣고 Netlify/Vercel 배포 후 가족들 기기에 설치 테스트.

- [ ] 인터넷을 끄고 앱이 열리는지 확인 (Service Worker 동작 확인).
- [ ] 카톡으로 전달한 실제 JSON 데이터가 제대로 로드되는지 확인.
- [ ] 가족들 폴드나 일반 스마트폰에서 레이아웃이 깨지지 않는지 확인.
