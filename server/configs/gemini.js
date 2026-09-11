import { GoogleGenAI } from "@google/genai";

const GEMINI_MODELS = [
  "gemini-3.6-flash",
];

const getClient = () => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please add it to server/.env"
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
};

const generateOnce = async (ai, model, prompt) => {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  return response.text;
};

async function main(prompt) {
  const ai = getClient();

  try {
    return await generateOnce(
      ai,
      GEMINI_MODELS[0],
      prompt
    );
  } catch (error) {
    console.error("Gemini API Error:", error);

    throw new Error(
      JSON.stringify({
        error: {
          code: error?.status || 500,
          message:
            error?.message ||
            "Gemini API request failed.",
        },
      })
    );
  }
}

export default main;