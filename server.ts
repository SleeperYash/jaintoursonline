import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());

// Initialize Google GenAI client if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Low-Usage AI Concierge Endpoint for general destination & travel queries
app.post("/api/chat/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required." });
    }

    const cleanQuestion = question.trim().slice(0, 300);

    // If no AI key available, provide helpful contextual concierge response
    if (!ai) {
      return res.json({
        answer:
          "We'd love to help you with that! Jain Tours & Travels customizes every itinerary with 100% Pure Veg / Jain food options, flights, and handpicked hotels. Feel free to use our Estimator or reach our Goregaon team directly.",
      });
    }

    // Call gemini-3.8-flash with ThinkingLevel.LOW for ultra-low token usage
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: cleanQuestion,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        systemInstruction:
          "You are the warm, polite, and helpful travel assistant for Jain Tours & Travels, based in Goregaon West, Mumbai. " +
          "Provide a concise, helpful answer (2 to 3 short sentences, max 50 words) to the customer's travel or destination query. " +
          "Always highlight that Jain Tours provides customized itineraries, guaranteed 100% Pure Veg and Jain meals, flight bookings, and 24x7 assistance. " +
          "Keep your tone welcoming and professional.",
      },
    });

    const reply = response.text?.trim() ||
      "We'd love to assist you with this destination! Please reach out to our travel specialists at Jain Tours Goregaon for full details.";

    return res.json({ answer: reply });
  } catch (err: unknown) {
    console.error("Gemini AI concierge error:", err);
    return res.json({
      answer:
        "That's a wonderful travel idea! Our travel consultants at Jain Tours & Travels can create a customized package tailored to your dates and preferences with 100% Pure Veg & Jain meals.",
    });
  }
});

// Dev vs Prod Vite Integration
if (!isProduction) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
