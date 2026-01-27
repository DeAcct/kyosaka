import { getFileFromPrompt, readJSONFile } from "@/lib/file";

export async function useJSONUpload(cb) {
  try {
    const file = await getFileFromPrompt({
      types: [
        {
          description: "계획표 파일",
          accept: { "application/json": [".json"] },
        },
      ],
      multiple: false,
    });
    if (!file) return;
    const tripData = await readJSONFile(file);
    cb(tripData);
  } catch (error) {
    console.log(error);
  }
}
