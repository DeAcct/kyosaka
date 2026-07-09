// lib/store.js
export default class Store {
  constructor(key, initialData, options = {}) {
    // 🔍 1. 네임스페이스 추가 (다른 앱/프로젝트와의 충돌 방지)
    this.key = `kyosaka_${key}`;
    this.subscribers = new Set();
    // 로컬스토리지 바이패스 목록 설정
    this.exclude = options.exclude || [];

    const savedData = localStorage.getItem(this.key);

    try {
      const parsedData = savedData ? JSON.parse(savedData) : null;

      this.state = parsedData ? { ...initialData, ...parsedData } : initialData;
    } catch (e) {
      console.error(`[Store:${key}] 데이터 파싱 에러. 초기화합니다.`, e);
      this.state = initialData;
    }

    // 구조가 바뀌었거나 처음인 경우 즉시 저장하여 정합성 유지
    if (!savedData) this._save();
  }

  get data() {
    return this.state;
  }

  commit(path, value) {
    this.#stepInto(path, value, { isPatch: false });
  }

  // 2. 객체의 일부 프로퍼티만 병합(Merge)할 때
  patch(path, value) {
    this.#stepInto(path, value, { isPatch: true });
  }

  #stepInto(path, value, options) {
    const keys = path.split("/");
    const nextState = this.#updateRecursive(this.state, keys, value, options);

    this.state = {
      ...nextState,
      lastUpdated: Temporal.Now.plainDateISO(),
    };

    this._save();
    this.notify();
  }

  // 🔍 내부 핵심 헬퍼 메소드 (프라이빗)
  #updateRecursive(current, pathKeys, newValue, options) {
    const [first, ...rest] = pathKeys;
    const isArray = Array.isArray(current);

    // 목적지(마지막 키)에 도달했을 때
    if (rest.length === 0) {
      // 함수형 업데이트 지원
      let finalValue =
        typeof newValue === "function" ? newValue(current[first]) : newValue;

      // patch 모드이면서 기존 값과 새 값이 모두 객체인 경우 병합 처리
      if (options.isPatch && !isArray) {
        const currentValue = current[first];
        if (
          typeof currentValue === "object" &&
          currentValue !== null &&
          typeof finalValue === "object" &&
          finalValue !== null
        ) {
          finalValue = { ...currentValue, ...finalValue };
        }
      }

      if (isArray) {
        const nextArray = [...current];
        nextArray[first] = finalValue;
        return nextArray;
      }
      return { ...current, [first]: finalValue };
    }

    // 중간 경로를 탐색하며 불변성 유지 복사
    if (isArray) {
      const nextArray = [...current];
      nextArray[first] = this.#updateRecursive(
        current[first] || {},
        rest,
        newValue,
        options,
      );
      return nextArray;
    }

    return {
      ...current,
      [first]: this.#updateRecursive(
        current[first] || {},
        rest,
        newValue,
        options,
      ),
    };
  }

  _save() {
    const toSave = { ...this.state };
    this.exclude.forEach((key) => {
      delete toSave[key];
    });

    localStorage.setItem(this.key, JSON.stringify(toSave));
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach((callback) => callback(this.state));
  }
}
