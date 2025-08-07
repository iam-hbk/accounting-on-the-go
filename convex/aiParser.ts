"use node";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Transaction schema for structured output
const TransactionSchema = z.object({
  date: z.string().describe("Date in YYYY-MM-DD format"),
  description: z.string().describe("Clean transaction description"),
  amount: z.number().positive().describe("Positive amount value"),
  direction: z
    .enum(["credit", "debit"])
    .describe("credit for money in, debit for money out"),
});

const TransactionsSchema = z.object({
  transactions: z.array(TransactionSchema),
});

// AI parsing function using Vercel AI SDK with Google Gemini and file attachments
export async function parseStatementWithAI(
  fileData: ArrayBuffer,
  mediaType: string,
  _fileName?: string
) {
  const apiKey =
    process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY not found");
  }

  try {
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: TransactionsSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Parse this bank statement file and extract all transaction data. 

Rules:
- Convert all dates to YYYY-MM-DD format
- Amount should be positive number (absolute value)
- Direction should be "credit" for money coming in, "debit" for money going out
- Clean up descriptions (remove extra spaces, normalize text)
- Skip header rows and any non-transaction data
- If amount is negative in the statement, it's usually a debit
- If amount is positive in the statement, it's usually a credit
- Handle PDF, CSV, Excel, and image formats
- Extract data from tables, structured text, or scanned documents`,
            },
            {
              type: "file",
              data: fileData,
              mediaType: mediaType,
            },
          ],
        },
      ],
    });

    return result.object.transactions;
  } catch (error) {
    console.error("AI parsing failed", error);
    throw error;
  }
}

// Note: File conversion is now handled in the frontend using FileReader API
