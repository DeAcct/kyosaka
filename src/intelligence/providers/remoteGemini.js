function convertJsonSchemaToGeminiSchema(schema) {
  if (!schema || typeof schema !== "object") return schema;

  const newSchema = {};

  if (schema.type) {
    const typeMap = {
      string: "STRING",
      number: "NUMBER",
      integer: "INTEGER",
      boolean: "BOOLEAN",
      array: "ARRAY",
      object: "OBJECT",
    };
    newSchema.type = typeMap[schema.type.toLowerCase()] || schema.type.toUpperCase();
  }

  if (schema.description) newSchema.description = schema.description;
  if (schema.enum) newSchema.enum = schema.enum;
  if (schema.required) newSchema.required = schema.required;

  if (schema.properties) {
    newSchema.properties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      newSchema.properties[key] = convertJsonSchemaToGeminiSchema(value);
    }
  }

  if (schema.items) {
    newSchema.items = convertJsonSchemaToGeminiSchema(schema.items);
  }

  return newSchema;
}

export async function promptGemini(systemPrompt, userPrompt, jsonSchema = null) {
  const apiKey = import.meta.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key가 설정되지 않았습니다.");

  const body = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  };

  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const generationConfig = {
    temperature: 1.0,
    topP: 0.95,
  };

  if (jsonSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = convertJsonSchemaToGeminiSchema(jsonSchema);
  }

  body.generationConfig = generationConfig;

  const models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];
  let lastError;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        lastError = new Error(`Gemini API 오류 (${response.status}): ${errorText}`);
        continue; // 다음 모델 시도
      }
      throw new Error(`Gemini API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini API로부터 응답 텍스트를 수신하지 못했습니다.");

    return text;
  }

  throw lastError;
}

export async function* promptStreamGemini(systemPrompt, userPrompt, jsonSchema = null) {
  const apiKey = import.meta.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key가 설정되지 않았습니다.");

  const body = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  };

  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const generationConfig = {
    temperature: 1.0,
    topP: 0.95,
  };

  if (jsonSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = convertJsonSchemaToGeminiSchema(jsonSchema);
  }

  body.generationConfig = generationConfig;

  const models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];
  let lastError;
  let successResponse = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        lastError = new Error(`Gemini API 스트리밍 오류 (${response.status}): ${errorText}`);
        continue;
      }
      throw new Error(`Gemini API 스트리밍 오류 (${response.status}): ${errorText}`);
    }

    successResponse = response;
    break;
  }

  if (!successResponse) {
    throw lastError;
  }

  const reader = successResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const jsonStr = trimmed.slice(5).trim();
      if (jsonStr === "[DONE]") return;

      try {
        const parsed = JSON.parse(jsonStr);
        const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (chunkText) {
          yield chunkText;
        }
      } catch (e) {
        // 무시
      }
    }
  }

  if (buffer.trim().startsWith("data:")) {
    const jsonStr = buffer.trim().slice(5).trim();
    if (jsonStr !== "[DONE]") {
      try {
        const parsed = JSON.parse(jsonStr);
        const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (chunkText) {
          yield chunkText;
        }
      } catch (e) {
        // 무시
      }
    }
  }
}
