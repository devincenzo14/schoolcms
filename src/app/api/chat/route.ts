import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import Announcement from "@/models/Announcement";
import Gallery from "@/models/Gallery";
import Program from "@/models/Program";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const BASE_PROMPT = `You are the friendly virtual assistant for **Edulinks Learning Center**, a school located at Deca Homes, Tunghaan, Minglanilla, Cebu, Philippines 6046.

Contact Info:
- Phone: 0910 769 4124
- Email: edulinks.ph@gmail.com
- Address: Deca Homes, Tunghaan, Minglanilla, Philippines, 6046

About:
- Cebu's leading provider of quality, customized & caring education
- Offers Complete Basic Education & Academic Enrichment Programs`;

async function buildSystemPrompt(): Promise<string> {
  const parts: string[] = [BASE_PROMPT];

  try {
    await dbConnect();

    // Fetch mission, vision, core values
    const settings = await SiteSettings.find({
      key: { $in: ["mission", "vision", "coreValues"] },
    }).lean();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    if (settingsMap.mission || settingsMap.vision || settingsMap.coreValues) {
      parts.push("\nSchool Identity:");
      if (settingsMap.mission) parts.push(`- Mission: ${settingsMap.mission}`);
      if (settingsMap.vision) parts.push(`- Vision: ${settingsMap.vision}`);
      if (settingsMap.coreValues) parts.push(`- Core Values: ${settingsMap.coreValues}`);
    }

    // Fetch programs
    const programs = await Program.find().sort({ order: 1 }).select("title description").lean();
    if (programs.length > 0) {
      parts.push("\nPrograms Offered:");
      for (const p of programs) {
        parts.push(`- ${p.title}: ${p.description.replace(/<[^>]+>/g, "").slice(0, 120)}`);
      }
      parts.push("(Users can view all programs at /programs)");
    }

    // Fetch recent published announcements (last 5)
    const now = new Date();
    const announcements = await Announcement.find({
      isPublished: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category createdAt")
      .lean();
    if (announcements.length > 0) {
      parts.push("\nRecent Announcements:");
      for (const a of announcements) {
        const date = new Date(a.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
        parts.push(`- "${a.title}" (${a.category}, ${date})`);
      }
      parts.push("(Users can view all announcements at /announcements)");
    }

    // Fetch recent events (last 5)
    const events = await Gallery.find().sort({ createdAt: -1 }).limit(5).select("caption category createdAt").lean();
    if (events.length > 0) {
      parts.push("\nRecent Events:");
      for (const e of events) {
        const date = new Date(e.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
        parts.push(`- "${e.caption || "Untitled"}" (${e.category}, ${date})`);
      }
      parts.push("(Users can view all events at /events)");
    }
  } catch (err) {
    console.error("Failed to fetch dynamic context for chatbot:", err);
  }

  parts.push(`
Your behavior:
1. You ONLY answer questions related to the school, education, enrollment, programs, schedule, tuition, contacts, location, and school events.
2. If the user asks anything NOT related to school or education (e.g. politics, entertainment, coding, recipes, etc.), politely reply: "I'm sorry, I can only help with school-related inquiries about Edulinks Learning Center. Is there anything about our school I can assist you with?"
3. On the very first message, greet the user warmly and ask for their name.
4. After they give their name, greet them by name and ask what their inquiry is about.
5. Based on their inquiry, route them:
   - If it's about enrollment, admissions, or applying: direct them to the enrollment page at /apply and mention they can enroll online.
   - If it's about programs: share details from the Programs Offered above and direct them to /programs.
   - If it's about announcements or news: share relevant recent announcements and direct them to /announcements.
   - If it's about events or activities: share relevant recent events and direct them to /events.
   - If it's about the school's mission, vision, or core values: share them from the School Identity above.
   - If it's about contacting the school, location, schedule, tuition, or anything else: provide the contact info (phone: 0910 769 4124, email: edulinks.ph@gmail.com) and direct them to the About page at /about.
6. Keep responses VERY short — 1 to 3 sentences max. Be warm but brief.
7. Do NOT make up information you don't have. If unsure, direct them to contact the school directly.
8. Your name is EduAssist.`);

  return parts.join("\n");
}

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

    const systemPrompt = await buildSystemPrompt();

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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
