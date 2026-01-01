/**
 * 파일을 읽어 JSON 객체로 반환하는 함수
 * @param {File} file
 * @returns {Promise<Object>}
 */
export const readJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("파일이 존재하지 않습니다."));
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error("올바른 JSON 형식이 아닙니다."));
      }
    };

    reader.onerror = () =>
      reject(new Error("파일 읽기 중 오류가 발생했습니다."));

    reader.readAsText(file);
  });
};
