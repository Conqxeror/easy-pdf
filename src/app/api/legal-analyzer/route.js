// src/app/api/legal-analyzer/route.js
import { NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/utils";

// Helper: Call OpenRouter LLM API
async function analyzeWithOpenRouter(text, legalClauses) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const clausesList =
    legalClauses && legalClauses.length > 0
      ? legalClauses.join(", ")
      : "indemnity, termination, confidentiality, jurisdiction, force majeure, arbitration, governing law, limitation of liability, non-compete, severability"; // More complete default list

  const prompt = `You are a legal document analyzer. Your primary goal is to provide a structured JSON output.
Document:
${text}

Based on the document, provide the following in a JSON object with the keys: 'summary', 'entities', 'clauses', 'risk', 'suggestions'.

1.  **summary**: A concise summary of the document's main purpose and key provisions.
2.  **entities**: A list of all legal entities, including names of individuals, organizations, and significant dates mentioned in the document.
3.  **clauses**: A list of important clauses detected in the document. Focus on and explicitly mention if the document *does not* contain clauses like: ${clausesList}.
4.  **risk**: An assessment of potential risks, liabilities, or unfavorable terms. Flag any risky language or omissions.
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
      max_tokens: 2048,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    console.error("OpenRouter API error:", res.status, errorBody);
    // Provide a more secure and informative error message
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
      // Attempt to return what's available or default values instead of throwing
      // This makes the response more resilient to partial LLM outputs.
      const sanitizedJson = {
        summary: json.summary || "No summary provided.",
        entities: Array.isArray(json.entities) ? json.entities : [],
        clauses: Array.isArray(json.clauses) ? json.clauses : [],
        risk: json.risk || "No risk assessment provided.",
        suggestions: Array.isArray(json.suggestions) ? json.suggestions : [],
      };
      // Log a warning but don't fail parsing for incomplete keys unless truly critical
      console.warn("Returning partially complete JSON due to missing keys.");
      return sanitizedJson;
      // Alternatively, to strictly enforce all keys:
      // throw new Error("AI response is incomplete or malformed.");
    }

    // Ensure array types for fields that should be arrays, even if allKeysPresent is true
    // This handles cases where the LLM might return a non-array for these fields.
    json.entities = Array.isArray(json.entities) ? json.entities : [];
    json.clauses = Array.isArray(json.clauses) ? json.clauses : [];
    json.suggestions = Array.isArray(json.suggestions) ? json.suggestions : [];

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
    const { file, name, legalClauses } = await req.json();

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
      // Catch specific extraction errors from utils.js
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

    const analysis = await analyzeWithOpenRouter(text, legalClauses);
    return NextResponse.json(analysis);
  } catch (e) {
    console.error("Legal Analyzer API Error:", e);
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
            ? 400 // Bad Request for client-side issues or invalid inputs/outputs
            : 500, // Internal Server Error for unexpected server issues or external API failures
      }
    );
  }
}
