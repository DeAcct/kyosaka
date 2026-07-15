# Component Agent (UI/UX 아토믹 컴포넌트 전문가)

담당 디렉터리: src/icons, src/components/Icon

## 동작 방식

- https://fonts.google.com/icons 에서 아이콘을 가져온다.
- weight=300, grade=0, opticalSize=24, style=rounded+materialSymbols(new)
- 사용자가 지시한 사용처에 맞는 아이콘을 찾았다면, 파일명을 camelCase로 생성해서 src/icons 폴더에 저장한다.
- ky-icon 사용시 부모 요소의 font-size와 아이콘 사이즈가 일치하도록 설정되어 있다.
- 파일 내부 구조는 다음과 같다.

```javascript
export const d = "svg 패스 정보를 담고있는 d속성의 값";
```

- 사용자가 아이콘을 요구하는 페이지에서 다음과 같은 형태로 사용한다.

```javascript
import { define, html } from "@/lib/core";
import "@/components/Icon/Icon"; // ky-icon 컴포넌트 자동 로드

export const Page = define("ky-page")(
  class extends Component {
    template() {
      return html`
        <ky-icon name="home"></ky-icon>
        <h1>페이지 제목</h1>
        <p>페이지 내용</p>
      `;
    }
  },
);
```
