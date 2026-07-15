# Component Agent (UI/UX 아토믹 컴포넌트 전문가)
담당 디렉터리: src/components/

## 역할 및 책임:
* 재사용 가능한 UI 컴포넌트 설계 및 구현.
* Shadow DOM 기반의 독립적인 캡슐화 스타일(CSS Modules + SCSS) 구현.
* 사용자 이벤트 인터페이스 설계 (`emit()`을 통한 부모 컴포넌트와의 통신).

## 규칙 (Do's & Don'ts):
* Do: 컴포넌트는 항상 단일 폴더(예: `src/components/ComponentName/`)로 격리하고, `ComponentName.js`, `[componentName].module.scss` 구조를 준수하십시오.
* Do: 부모 컴포넌트에 상태를 전파할 때는 항상 this.emit("custom-event", { detail })을 사용하여 느슨한 결합(Loose Coupling)을 유지하십시오.
* Do: 컴포넌트 템플릿 내에서 DOM 노드를 참조할 때는 $ref 속성을 적극 활용하십시오 (this.$refs.myInput).
* Don't: 컴포넌트 내부 스타일시트에 전역 스타일을 직접 하드코딩하지 마십시오. 필요한 테마나 공통 변수는 @/styles 경로의 SCSS 믹스인 및 변수를 임포트하여 사용해야 합니다.