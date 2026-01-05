// lib/store.js
export default class Store {
  constructor(key, initialData = { list: [], lastUpdated: null }) {
    this.key = key;
    this.subscribers = new Set();

    const savedData = localStorage.getItem(key);
    // 데이터가 없거나 형식이 깨졌을 경우 초기 데이터 사용
    this.state = savedData ? JSON.parse(savedData) : initialData;

    if (!savedData) this._save();
  }

  get data() {
    return this.state;
  }

  /**
   * 특정 키의 데이터를 교체하는 방식 (배열 보존)
   * @param {string} key - 저장할 위치 (예: 'list')
   * @param {any} value - 저장할 값 (배열, 객체 등)
   */
  commit(key, value) {
    // 스프레드 연산자로 루트를 합치지 않고, 특정 키에 직접 할당하여 타입 보존
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
