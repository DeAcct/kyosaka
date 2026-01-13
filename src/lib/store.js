// lib/store.js
export default class Store {
  constructor(key, initialData) {
    // 🔍 1. 네임스페이스 추가 (다른 앱/프로젝트와의 충돌 방지)
    this.key = `kyosaka_${key}`;
    this.subscribers = new Set();

    const savedData = localStorage.getItem(this.key);

    try {
      const parsedData = savedData ? JSON.parse(savedData) : null;

      // 🔍 2. 핵심 수정: 초기 데이터의 구조를 유지하며 저장된 값만 병합
      // 이렇게 하면 localStorage에 'list'만 있어도 'items'가 사라지지 않습니다.
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

  commit(key, value) {
    this.state = {
      ...this.state,
      [key]: value,
      lastUpdated: new Date().toISOString(),
    };

    this._save();
    this.notify();
  }

  _save() {
    localStorage.setItem(this.key, JSON.stringify(this.state));
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach((callback) => callback(this.state));
  }
}
