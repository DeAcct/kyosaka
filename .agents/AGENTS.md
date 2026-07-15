---

# Agent Guidelines & Project Context (AGENTS.md)

이 문서는 AI 에이전트가 여행 계획앱인 Kyosaka를 개발할 때 준수해야 하는 규칙과 아키텍처 컨텍스트를 정의합니다. 작업을 시작하기 전에 반드시 이 내용을 마스터해야 합니다.

---

## 1. Project Overview & Tech Stack

* **Project Name:** Kyosaka(쿄사카)
* **Goal:** json 기반 여행 계획표 앱. AI의 도움을 받아 만든 여행 계획표를 사용자가 편집하고, 관리할 수 있도록 한다. 여행지에서 활용하고, 다른 사람과 공유하는데 목적을 둔다.
* **Core Framework:** Vanilla JS 기반 자체 제작 프레임워크 **cocktail JS**
* **Styling:** SCSS + CSS Modules (Vite `?inline` 스타일 로더 활용)
* **State Management:** LocalStorage 자동 동기화 기능이 내장된 반응형 Store
* **Router:** 파일 시스템 기반 중첩 레이아웃(Nested Layout) 지원 **Router**
* **Package Manager:** pnpm



---

## 2. Folder Structure

에이전트는 새로운 파일을 생성할 때 다음 구조를 반드시 준수해야 합니다. 파일 시스템 기반 라우팅이 동작하므로 `pages/` 폴더 구조는 특히 엄격히 관리됩니다.

```text
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   └── MyComponent/
│       ├── MyComponent.js
│       ├── MyComponent.module.scss
│       └── index.js
├── pages/               # 파일 시스템 기반 라우팅 페이지
│   ├── schedule/        # 기본 rootPath 경로 (Router.rootPath에 대응)
│   │   ├── page.js      # "/" 경로에 매핑되는 메인 페이지
│   │   ├── layout.js    # 루트 레이아웃 (하위 모든 페이지 감싸기)
│   │   └── detail/
│   │       ├── [id].js  # 동적 파라미터 매핑 "/detail/123"
│   │       └── page.js
└── store/               # 전역 상태 관리 저장소

```

---

## 3. Core Principles & Coding Rules

### 3.1. General Principles

* **No Tailwind CSS:** 명시적인 사용자 요청이 없는 한 **절대로 Tailwind CSS를 사용하지 마십시오.** 오직 공식 권장 스타일링 툴인 **SCSS + CSS Modules**만 사용합니다.
* **Component Responsibility:** 단일 책임 원칙을 준수하십시오. 한 컴포넌트가 너무 많은 역할을 담당해서는 안 되며, 조금이라도 복잡해지면 즉시 컴포넌트를 분리하십시오.
* **설명 생략 지시**: 코드 설명은 하지 마십시오. 변경된 코드 파일의 전체 내용만 바로 출력하십시오.
* **주석 배제**: 코드 내부의 불필요한 주석을 모두 제거하고 깨끗한 프로덕션 코드만 작성하십시오.
* **마크다운 포맷팅 최소화**: 서론, 결론, 마크다운 볼드체 강조 표현 등을 완전히 배제하고 결과물만 반환하십시오.
* **프롬프트에 직접 대답하지 마시오**: "예, 알겠습니다. 지금부터 지시사항을 모두 준수하여 코드를 수정하겠습니다." 등 대답은 배제한다.

### 3.2. component.js 작성 규칙

`cocktail JS` 컴포넌트를 작성할 때는 다음 명명 규칙과 구조적 문법을 엄격히 준수해야 합니다.

* **명명 규칙 (Naming Conventions):**
* **컴포넌트 클래스 이름:** 반드시 **PascalCase(대문자로 시작)** 및 영문으로 작성합니다. (예: `MyButton`, `UserCard`)
* **커스텀 엘리먼트 태그 이름:** 반드시 kebab-case(소문자와 하이픈)로 작성합니다. (예: `my-button`, `user-card`) Custom Elements 명세에 따라 하이픈(`-`)이 최소 하나 이상 포함되어야 합니다.


* **보일러플레이트 구조:**
* 스타일시트는 항상 `.module.scss`로 정의하며, `?inline` 쿼리를 사용해 로드하여 `define` 데코레이터 함수로 바인딩합니다.



```javascript
import { Component, define, html } from "@/lib/core";
import mapping from "./myComponent.module.scss";
import raw from "./myComponent.module.scss?inline";

export const MyComponent = define("my-component", { mapping, raw })(
  class extends Component {
    // 1. 상태 초기화
    state = {
      count: 0,
    };

    // 2. 초기 라이프사이클 및 구독 설정
    setup() {
      // 전역 Store 구독이 필요한 경우 이곳에서 수행
      // 이 컴포넌트가 알아서 렌더 예약 시스템(schedule)을 통해 비동기 렌더링을 요청합니다.
      // this.subscribe(myGlobalStore);
    }

    // 3. 이벤트 핸들러
    increment() {
      this.setState("count", this.state.count + 1);
    }

    // 4. 템플릿 반환 (html tagged template)
    template() {
      return html`
        <div class="${this.styles.container}">
          <h1 class="${this.styles.title}">Count: ${this.state.count}</h1>
          <button class="${this.styles.button}" @click=${this.increment}>
            Increment
          </button>
        </div>
      `;
    }

    // 5. 렌더 완료 후 동작 제어
    afterRender() {
      // 렌더링이 일어날 때마다 DOM 조작이 필요할 때 실행
    }

    afterOnce() {
      // 컴포넌트 최초 1회 렌더링 완료 시에만 실행
    }
  }
);

```

---

## 4. Templates & Syntax Engine (`diff.js` / `core.js`)

**cocktail JS**의 템플릿 엔진은 일반적인 가상 DOM과는 다른 정밀한 문자열 마커 대조 기반의 Diffing 알고리즘을 사용합니다. 아래의 고급 마크업 문법을 적극 활용하십시오.

### 4.1. DOM 및 프로퍼티 바인딩

* **속성 바인딩:** 일반적인 속성은 기존 방식대로 문자열 플레이스홀더를 활용합니다.
* **불리언 속성 (`?`):** 참/거짓 값에 따라 속성의 존재 여부를 제어할 때 사용합니다.
```html
<button ?disabled="${this.state.isSubmitting}">Submit</button>

```


* **프로퍼티 바인딩 (`:`):** DOM 객체의 단순 문자열 속성이 아닌 JS Property 자체에 값을 대입할 때 사용합니다. (예: 배열, 객체 바인딩)
```html
<custom-list :items="${this.state.todoList}"></custom-list>

```


* **인풋 값 바인딩 (`value`):** `<input>`과 `<textarea>`의 값은 템플릿 마커 업데이트 시 수동 조작하지 않아도 내부적으로 알맞게 치환됩니다.
```html
<input type="text" value="${this.state.username}" />

```



### 4.2. 이벤트 핸들러 (`@` 및 수식어)

* 이벤트 핸들러 바인딩 시 `@이벤트명` 형식으로 연결하며, 온갖 유용한 이벤트 수식어(Modifier)를 지원합니다.
* **수식어 목록:**
* `.prevent`: `event.preventDefault()` 자동 호출
* `.stop`: `event.stopPropagation()` 자동 호출
* `.self`: `event.target === event.currentTarget`일 때만 핸들러 실행
* `.once`: 단 한 번만 실행하는 이벤트 등록
* `.capture`: 캡처링 단계에서 이벤트 감지


```html
<form @submit.prevent="${this.handleSubmit}">
  <button @click.stop="${this.handleButtonClick}">Click</button>
</form>

```



### 4.3. 내부 특수 엘리먼트 (`<host>`, `<global>`)

* **`<host>` 엘리먼트:** 컴포넌트 내부 템플릿에서 컴포넌트 자체(Shadow DOM의 Host)에 속성이나 이벤트를 바인딩하고 싶을 때 사용합니다. 렌더링 시 자동으로 파싱되어 Host 엘리먼트에 병합됩니다.
```html
<template>
  <host class="active-component" @click="${this.handleHostClick}"></host>
  <div class="content">...</div>
</template>

```


* **`<global>` 엘리먼트:** `window` 전역 객체에 이벤트를 바인딩할 때 사용합니다. 컴포넌트가 해제(`disconnectedCallback`)될 때 자동으로 이벤트가 정리(Clean-up)되어 메모리 누수를 방지합니다.
```html
<template>
  <global @resize="${this.handleWindowResize}"></global>
  <div>Window width-sensitive layout</div>
</template>

```



### 4.4. DOM 참조 (`$refs`)

* 엘리먼트에 `$` 기호로 시작하는 속성을 부여하면, 컴포넌트 내부에서 `this.$refs.참조명`으로 해당 DOM 객체에 즉시 접근할 수 있습니다. 동일한 참조명을 여러 곳에 쓰면 자동으로 배열 구조로 수집됩니다.
```html
<input $inputField type="text" />
<button @click="${() => this.$refs.inputField.focus()}">Focus</button>

```



---

## 5. State Management & Utilities

### 5.1. Reactive Store (`store.js`)

`Store` 클래스는 로컬스토리지를 자동으로 미러링하며 중첩된 객체의 변경 사항을 안전하게 추적하여 상태 불변성을 보장합니다.

* **네임스페이스:** 모든 저장소 데이터는 로컬스토리지에 `kyosaka_[key]` 포맷으로 격리 저장됩니다.
* **경로 기반 업데이트:** `/` 구분자를 사용하여 중첩된 객체의 타겟 경로를 명시하고 업데이트할 수 있습니다.
* `commit(path, value)`: 해당 경로의 값을 완전히 교체합니다. (배열/객체 교체 지원)
* `patch(path, value)`: 해당 경로의 기존 객체와 새로운 객체 속성을 얕은 병합(Merge)합니다.


* **함수형 업데이트:** 이전 상태 값을 기반으로 상태를 바꿀 수 있습니다.
```javascript
const todoStore = new Store("todos", { list: [], config: { theme: "dark" } });

// 1. Commit을 활용한 완전 교체 및 함수형 업데이트
todoStore.commit("list", (prevList) => [...prevList, newTodo]);

// 2. Patch를 활용한 부분 병합
todoStore.patch("config", { theme: "light" }); // 기존 config 내역 보존하며 theme만 변경

```



### 5.2. Switcher Utility (`switcher.js`)

복잡한 다중 if-else 분기나 비즈니스 연립 조건 처리가 필요할 때는 절대로 지저분한 switch문을 직접 작성하지 마십시오. 체이닝 방식의 함수형 분기 도구인 `switcher`를 사용하십시오.

```javascript
import { switcher } from "@/lib/switcher";

const status = switcher({ hp, stamina })
  .case(s => s.hp < 20 && s.stamina < 10, "CRITICAL")
  .case(s => s.hp < 50, "WARN")
  .default("STABLE");

```

---

## 6. Rendering Schedule & Optimization (`schedule.js`)

* **렌더 스케줄러:** 컴포넌트의 `setState()`가 연속적으로 일어날 때, 무분별한 리렌더링을 막기 위해 `requestAnimationFrame` 기반의 비동기 렌더 큐인 `queueRender()`를 활용합니다. 동일 프레임 내의 무수한 변경은 단 1번만 일어납니다.
* **동기 플러시 (`flushSync`):** 테스트 코드 작성이나 즉각적인 DOM 갱신 후 사이즈 측정이 필수적인 상황의 경우, `flushSync(callback)` 래퍼를 사용하여 콜백 내부의 모든 `setState`를 동기적으로 강제 렌더링시킬 수 있습니다.
```javascript
import { flushSync } from "@/lib/core";

flushSync(() => {
  this.setState("modalOpen", true);
});
// 여기서 즉시 모달 DOM 조작 가능

```