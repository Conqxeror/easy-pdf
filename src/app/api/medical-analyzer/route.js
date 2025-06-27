// src/app/api/medical-analyzer/route.js
import { NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/utils";

// Helper: Call OpenRouter LLM API
async function analyzeWithOpenRouter(text) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const prompt = `You are a medical document analyzer. Your primary goal is to provide a structured JSON output.
Document:
${text}

Based on the document, provide the following in a JSON object with the keys: 'summary', 'patientInfo', 'diagnoses', 'medications', 'labResults', 'recommendations'.

1.  **summary**: A concise summary of the document's main purpose and key medical findings.
2.  **patientInfo**: A list of all relevant patient information, including name, age, gender, and any other demographic details.
3.  **diagnoses**: A list of all diagnoses mentioned in the document.
4.  **medications**: A list of all medications prescribed or mentioned, including dosage and frequency if available.
5.  **labResults**: A list of all significant lab results, including test names and values.
6.  **recommendations**: Recommendations for further action, treatment, or follow-up.

Ensure the output is a valid JSON object. Do not include any other text outside the JSON.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1-0528:free", // You can experiment with other models
      messages: [
        {
          role: "system",
          content:
            "You are a medical document analyzer that outputs strict JSON.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    console.error("OpenRouter API error:", res.status, errorBody);
    const apiErrorMessage =
      errorBody.message ||
      `Server responded with status ${res.status} ${res.statusText}`;
    throw new Error(`External API analysis failed: ${apiErrorMessage}`);
  }

  const data = await res.json();
  const llmContent = data.choices[0]?.message?.content;

  if (!llmContent) {
    console.error("LLM did not return content:", data);
    throw new Error("AI did not return any content for analysis.");
  }

  try {
    const json = JSON.parse(llmContent);
    const requiredKeys = [
      "summary",
      "patientInfo",
      "diagnoses",
      "medications",
      "labResults",
      "recommendations",
    ];
    const allKeysPresent = requiredKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(json, key)
    );

    if (!allKeysPresent) {
      console.warn("LLM returned incomplete JSON:", json);
      const sanitizedJson = {
        summary: json.summary || "No summary provided.",
        patientInfo: Array.isArray(json.patientInfo) ? json.patientInfo : [],
        diagnoses: Array.isArray(json.diagnoses) ? json.diagnoses : [],
        medications: Array.isArray(json.medications) ? json.medications : [],
        labResults: Array.isArray(json.labResults) ? json.labResults : [],
        recommendations: Array.isArray(json.recommendations) ? json.recommendations : [],
      };
      console.warn("Returning partially complete JSON due to missing keys.");
      return sanitizedJson;
    }

    json.patientInfo = Array.isArray(json.patientInfo) ? json.patientInfo : [];
    json.diagnoses = Array.isArray(json.diagnoses) ? json.diagnoses : [];
    json.medications = Array.isArray(json.medications) ? json.medications : [];
    json.labResults = Array.isArray(json.labResults) ? json.labResults : [];
    json.recommendations = Array.isArray(json.recommendations) ? json.recommendations : [];

    return json;
  } catch (parseError) {
    console.error(
      "Failed to parse AI response as JSON:",
      llmContent,
      parseError
    );
    throw new Error(
      "AI response was not a valid JSON format. Please try again."
    );
  }
}

export async function POST(req) {
  try {
    const { file, name } = await req.json();

    if (!file || !name) {
      return NextResponse.json(
        { error: "File data or name is missing." },
        { status: 400 }
      );
    }

    let text;
    try {
      text = await extractTextFromFile(file, name);
    } catch (extractionError) {
      return NextResponse.json(
        {
          error:
            extractionError.message || "Failed to extract text from document.",
        },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            "No readable text extracted from the document. Please ensure it contains text or is a high-quality image.",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeWithOpenRouter(text);
    return NextResponse.json(analysis);
  } catch (e) {
    console.error("Medical Analyzer API Error:", e);
    const errorMessage = e.message.includes(
      "OpenRouter API key is not configured"
    )
      ? "Server configuration error: OpenRouter API key is missing. Please contact support."
      : e.message;
    return NextResponse.json(
      {
        error: errorMessage || "An unexpected error occurred during analysis.",
      },
      {
        status:
          e.message.includes("File data or name is missing") ||
          e.message.includes("Unsupported file type") ||
          e.message.includes("No readable text extracted") ||
          e.message.includes("Failed to parse AI response") ||
          e.message.includes("incomplete or malformed")
            ? 400
            : 500,
      }
    );
  }
}
