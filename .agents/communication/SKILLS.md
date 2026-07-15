# Collaboration & Communication Protocols (에이전트 간 통신 규약)
서브에이전트들은 작업 중 서로의 영역을 참조하거나 상호작용해야 할 때, 다음 3대 소통 규약을 준수하여 아키텍처를 방어합니다.

## 상태 전달 및 바인딩 (Store -> Component -> Page)
### 스토어 정의 (Store Agent):
```javascript
// src/store/todoStore.js
import Store from "@/lib/store";
export const todoStore = new Store("todos", { list: [] });
```
### 컴포넌트 구독 (Component Agent):
```javascript
// src/components/TodoList/TodoList.js
import { Component, define, html, kyFor } from "@/lib/core";
import { todoStore } from "@/store/todoStore";

export const TodoList = define("todo-list", {})(
  class extends Component {
    setup() {
      this.subscribe(todoStore); // 스토어의 변화를 구독하여 자동 비동기 렌더링 큐 예약
    }
    template() {
      return html`
        <ul>
          ${kyFor(todoStore.data.list, (todo) => html`<li>${todo.text}</li>`)}
        </ul>
      `;
    }
  }
);
```

## 페이지 레이아웃 결합 (Router -> Component)
`pages/schedule/page.js`는 비즈니스 컨텍스트(스토어 연결) 및 레이아웃 배치만을 주도하며, 복잡한 마크업 및 스타일은 하위 컴포넌트를 사용합니다.
```javascript
// src/pages/schedule/page.js
import { Component, define, html } from "@/lib/core";
import "@/components/TodoList"; // 의존 컴포넌트 임포트

export const PageSchedule = define("page-schedule", {})(
  class extends Component {
    template() {
      return html`
        <main>
          <h1>Shelter Schedule Tracker</h1>
          <todo-list></todo-list>
        </main>
      `;
    }
  }
);
```

## 조건문 비즈니스 캡슐화 (Component/Page -> Switcher)
복잡한 다중 조건 판단 로직은 가독성 저하를 방지하기 위해 파일 내에 직렬로 적지 않고, 독립된 함수로 분리하여 `switcher()`로 해결합니다.
```javascript
import { switcher } from "@/lib/switcher";

export const evaluateSurvivalRisk = (health, radiation) => {
  return switcher({ health, radiation })
    .case(s => s.radiation > 80, "DEADLY_DANGER")
    .case(s => s.health < 30 || s.radiation > 50, "CRITICAL")
    .case(s => s.health < 60, "WARNING")
    .default("STABLE");
};
```