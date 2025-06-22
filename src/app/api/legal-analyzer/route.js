// src/app/api/legal-analyzer/route.js
import { NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/utils";

// Helper: Call OpenRouter LLM API
async function analyzeWithOpenRouter(text, legalClauses) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not configured.");
  }

  // Enhance prompt with specific legal clauses
  const clausesList =
    legalClauses && legalClauses.length > 0
      ? legalClauses.join(", ")
      : "indemnity, termination, confidentiality, jurisdiction, etc.";
  const prompt = `You are a legal document analyzer. Your primary goal is to provide a structured JSON output.
Document:
${text}

Based on the document, provide the following in a JSON object with the keys: 'summary', 'entities', 'clauses', 'risk', 'suggestions'.

1.  **summary**: A concise summary of the document's main purpose and key provisions.
2.  **entities**: A list of all legal entities, including names of individuals, organizations, and significant dates.
3.  **clauses**: A list of important clauses detected in the document. Focus on clauses like ${clausesList}.
4.  **risk**: An assessment of potential risks, liabilities, or unfavorable terms. Flag any risky language.
5.  **suggestions**: Recommendations for improving the document, including any standard clauses that might be missing (e.g., consider adding clauses from the following list if not present: ${clausesList}).

Ensure the output is a valid JSON object. Do not include any other text outside the JSON.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1-0528:free", // You can experiment with other models like 'mistral/mistral-large-latest' or 'google/gemini-pro'
      messages: [
        {
          role: "system",
          content:
            "You are a legal document analyzer that outputs strict JSON.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048, // Increased max_tokens for potentially longer responses
      temperature: 0.2,
      response_format: { type: "json_object" }, // Request JSON object directly from OpenRouter (if supported by model)
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    console.error("OpenRouter API error:", res.status, errorBody);
    throw new Error(
      `OpenRouter API error: ${errorBody.message || res.statusText}`
    );
  }

  const data = await res.json();
  const llmContent = data.choices[0]?.message?.content;

  if (!llmContent) {
    console.error("LLM did not return content:", data);
    throw new Error("AI did not return any content for analysis.");
  }

  // Attempt to parse JSON from LLM output
  try {
    const json = JSON.parse(llmContent);
    // Basic validation to ensure expected keys are present
    const requiredKeys = [
      "summary",
      "entities",
      "clauses",
      "risk",
      "suggestions",
    ];
    const allKeysPresent = requiredKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(json, key)
    );

    if (!allKeysPresent) {
      console.warn("LLM returned incomplete JSON:", json);
      throw new Error("AI response is incomplete or malformed.");
    }
    return json;
  } catch (parseError) {
    console.error(
      "Failed to parse AI response as JSON:",
      llmContent,
      parseError
    );
    throw new Error(
      "Failed to parse AI response. The response was not a valid JSON format."
    );
  }
}

export async function POST(req) {
  try {
    const { file, name, legalClauses } = await req.json();

    if (!file || !name) {
      return NextResponse.json(
        { error: "File data or name is missing." },
        { status: 400 }
      );
    }

    const text = await extractTextFromFile(file, name);
    if (!text || text === "Unsupported file type for text extraction.") {
      // Catch error thrown by utils
      return NextResponse.json(
        { error: text || "Could not extract text from the document." },
        { status: 400 }
      );
    }

    const analysis = await analyzeWithOpenRouter(text, legalClauses);
    return NextResponse.json(analysis);
  } catch (e) {
    console.error("Legal Analyzer API Error:", e);
    // Return a generic error message to the client for security
    const errorMessage = e.message.includes(
      "OpenRouter API key is not configured"
    )
      ? "Server configuration error."
      : e.message;
    return NextResponse.json(
      {
        error: errorMessage || "An unexpected error occurred during analysis.",
      },
      {
        status:
          e.message.includes("File") ||
          e.message.includes("Unsupported") ||
          e.message.includes("parse AI response")
            ? 400
            : 500,
      }
    );
  }
}
