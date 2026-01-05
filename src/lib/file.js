export const getFileFromPrompt = async (options) => {
  const [fileHandle] = await window.showOpenFilePicker(options);
  const file = await fileHandle.getFile();

  return file;
};

/**
 * 파일을 읽는 핵심 베이스 함수
 * @param {File} file - 대상 파일 객체
 * @param {string} readMethod - FileReader 메서드 이름 (default: 'readAsText')
 * @returns {Promise<string|ArrayBuffer>}
 */
const readFile = (file, readMethod = "readAsText") => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("파일이 존재하지 않습니다."));

    const reader = new FileReader();

    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () =>
      reject(new Error("파일 읽기 중 오류가 발생했습니다."));

    // 전달된 메서드(readAsText, readAsDataURL 등)를 실행
    if (typeof reader[readMethod] === "function") {
      reader[readMethod](file);
    } else {
      reject(new Error(`지원하지 않는 읽기 방식입니다: ${readMethod}`));
    }
  });
};

export const readJSONFile = async (file) => {
  try {
    const text = await readFile(file, "readAsText");
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      error.name === "SyntaxError"
        ? "올바른 JSON 형식이 아닙니다."
        : error.message
    );
  }
};

export const readImageFile = async (file) => {
  // 이미지 파일인지 간단히 체크 가능
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드 가능합니다.");
  }
  return await readFile(file, "readAsDataURL"); // <img> 태그의 src에 바로 넣을 수 있는 형태
};
