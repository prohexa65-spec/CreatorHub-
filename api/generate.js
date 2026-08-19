import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOOL_INSTRUCTIONS = {
  "AI Video Title Generator": "Generate 5 clickable YouTube titles. Keep them truthful, specific, varied, and suitable for the provided topic.",
  "Description Generator": "Write a polished YouTube description with a strong opening, useful details, natural keywords, a simple call to action, and optional hashtags.",
  "Tag Generator": "Generate a comma-separated list of relevant YouTube tags. Avoid spammy or unrelated tags.",
  "Hashtag Generator": "Generate 10 relevant, clean hashtags for the content. Put each hashtag on its own line.",
  "Thumbnail Idea Generator": "Give 3 practical thumbnail concepts including subject, composition, short text, and visual hook. Do not claim guaranteed clicks.",
  "Video Idea Generator": "Generate 10 original video ideas for the topic, each with a short hook and why it could be interesting.",
  "Upload Checklist": "Create a concise YouTube upload checklist tailored to the user's topic.",
  "SEO Score": "Evaluate the supplied title/topic for YouTube discoverability. Give a score out of 100, explain the main strengths and weaknesses, then give 3 improvements.",
  "BPM Tap Counter": "Explain how to use the supplied BPM/tempo information musically and suggest a suitable genre or groove if enough information is present.",
  "Random Melody Generator": "Create an original short melody using note names, rhythm values, key/scale, BPM, and performance suggestions.",
  "Random Chord Generator": "Create an original chord progression with chord names, key, mood, and a short explanation.",
  "Beat Idea Generator": "Design an original beat concept with BPM, drums, bass, rhythm, sound palette, and arrangement idea.",
  "Song Name Generator": "Generate 15 memorable original song title ideas matching the supplied concept or mood.",
  "Mood Generator": "Describe a coherent music mood including emotion, BPM range, key/scale suggestion, instruments, texture, and energy.",
  "Minecraft Seed Idea Generator": "Create an unusual Minecraft world/seed concept. Clearly label it as a concept rather than a verified seed number.",
  "Challenge Wheel": "Generate one safe, fun gaming challenge suitable for a normal gameplay session. Avoid dangerous real-world challenges.",
  "Random Mob Battle Generator": "Create a fictional Minecraft mob battle using game entities, arena, rules, and a fun win condition.",
  "Survival Challenge Generator": "Create a safe Minecraft survival challenge with clear rules, objective, duration, and difficulty.",
  "Script Generator": "Write a structured creator video script with hook, intro, main sections, transitions, and CTA. Keep it natural and engaging.",
  "Caption Generator": "Generate 10 short social captions for the supplied content. Keep them natural and platform-friendly.",
  "Brainstorm Generator": "Expand the idea into multiple directions, variations, features, risks, and next experiments.",
  "Prompt Generator": "Write a high-quality reusable AI prompt for the supplied task. Include role, goal, context, constraints, and desired output format.",
  "Rewrite Tool": "Rewrite the supplied text to be clearer, more natural, and more engaging while preserving its meaning."
};

const buckets = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

function getClientIp(req) {
  return (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown").split(",")[0].trim();
}

function rateLimited(ip) {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    buckets.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "AI backend is not configured." });

  if (rateLimited(getClientIp(req))) {
    return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
  }

  try {
    const { tool, category, context } = req.body || {};
    const cleanTool = String(tool || "").trim();
    const cleanCategory = String(category || "").trim();
    const cleanContext = String(context || "").trim().slice(0, 2000);

    if (!cleanTool || !cleanContext) {
      return res.status(400).json({ error: "Tool and context are required." });
    }

    const task = TOOL_INSTRUCTIONS[cleanTool] || `Help the user with the ${cleanTool} creator tool.`;
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      store: false,
      instructions: `You are CreatorHub AI, a practical assistant for YouTube creators, musicians, gamers, and creative projects.\n\nCategory: ${cleanCategory}\nTool: ${cleanTool}\nTask: ${task}\n\nReturn useful, ready-to-use content. Do not invent factual claims, guaranteed results, real seed numbers, analytics, or external data that you cannot verify.`,
      input: `User's request/context:\n${cleanContext}`
    });

    return res.status(200).json({ result: response.output_text || "The AI returned no text." });
  } catch (error) {
    console.error("CreatorHub AI error:", error);
    return res.status(500).json({ error: "The AI request failed. Please try again." });
  }
}
