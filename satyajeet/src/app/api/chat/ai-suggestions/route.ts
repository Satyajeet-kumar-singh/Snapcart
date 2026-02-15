import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { message, role } = await req.json();

    const prompt = `
You are a professional delivery assistant chatbot.

You will be given:
- role: either "user" or "delivery_boy"
- last_message: the last message in the conversation

Your task:
- If role is "user", generate 3 short WhatsApp-style reply suggestions that a user could send to the delivery boy.
- If role is "delivery_boy", generate 3 short WhatsApp-style reply suggestions that a delivery boy could send to the user.

Rules:
- Replies must match the context of the last_message.
- Maximum 10 words.
- Max 1 emoji.
- No numbering.
- Return ONLY 3 replies separated by commas.

Input:
role: ${role}
last_message: ${message}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    const replyText = data.candidates?.[0].content.parts?.[0].text || ""
    const suggestions = replyText.split(",").map((s:string)=>s.trim())
    return NextResponse.json(suggestions, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
