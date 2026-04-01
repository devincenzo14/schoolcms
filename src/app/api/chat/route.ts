import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are the friendly virtual assistant for **Edulinks Learning Center**, a school located at Deca Homes, Tunghaan, Minglanilla, Cebu, Philippines 6046.

Contact Info:
- Phone: 0910 769 4124
- Email: edulinks.ph@gmail.com
- Address: Deca Homes, Tunghaan, Minglanilla, Philippines, 6046

About:
- Cebu's leading provider of quality, customized & caring education
- Offers Complete Basic Education & Academic Enrichment Programs
- Programs include Preschool, Elementary, Junior High School, and Senior High School

Your behavior:
1. You ONLY answer questions related to the school, education, enrollment, programs, schedule, tuition, contacts, location, and school events.
2. If the user asks anything NOT related to school or education (e.g. politics, entertainment, coding, recipes, etc.), politely reply: "I'm sorry, I can only help with school-related inquiries about Edulinks Learning Center. Is there anything about our school I can assist you with?"
3. On the very first message, greet the user warmly and ask for their name.
4. After they give their name, greet them by name and ask what their inquiry is about.
5. Based on their inquiry, route them:
   - If it's about enrollment, admissions, or applying: direct them to the enrollment page at /apply and mention they can enroll online.
   - If it's about contacting the school, location, schedule, tuition, or anything else: provide the contact info (phone: 0910 769 4124, email: edulinks.ph@gmail.com) and direct them to the About page at /about.
6. Keep responses VERY short — 1 to 3 sentences max. Be warm but brief.
7. Do NOT make up information you don't have. If unsure, direct them to contact the school directly.
8. Your name is EduAssist.`;

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Chat service not configured" },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Messages are required" },
        { status: 400 }
      );
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to get response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Please try again.";

    return NextResponse.json({ success: true, message: reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
