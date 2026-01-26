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
    const keys = path.split("/");

    // 🔍 재귀적으로 중첩 객체를 업데이트하는 헬퍼 함수
    const updateRecursive = (current, pathKeys, newValue) => {
      const [first, ...rest] = pathKeys;

      // 마지막 키에 도달했을 때 값 할당
      if (rest.length === 0) {
        return { ...current, [first]: newValue };
      }

      // 중간 경로를 복사하며 내려감 (없으면 빈 객체 생성)
      return {
        ...current,
        [first]: updateRecursive(current[first] || {}, rest, newValue),
      };
    };

    // 전체 상태 업데이트
    const nextState = updateRecursive(this.state, keys, value);

    // 🔍 불변성 유지 및 lastUpdated 갱신
    this.state = {
      ...nextState,
      lastUpdated: new Date().toISOString(),
    };

    this._save();
    this.notify();
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
