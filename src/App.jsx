import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { ChatMessage } from "./components/ChatMessage";
import { HotelCard } from "./components/HotelCard";

const HOTELS = [
  { id: "ace", name: "Ace Hotel", area: "SoMa", vibe: "trendy hipster creative artistic", price: "$$", priceNum: 180, nearby: "cafes bars galleries", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { id: "marker", name: "The Marker", area: "Union Square", vibe: "boutique quiet sophisticated elegant", price: "$$$", priceNum: 280, nearby: "shopping theaters", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800" },
  { id: "phoenix", name: "Phoenix Hotel", area: "Tenderloin", vibe: "rock-and-roll edgy vintage", price: "$", priceNum: 120, nearby: "bars clubs", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800" },
  { id: "zephyr", name: "Hotel Zephyr", area: "Fisherman's Wharf", vibe: "nautical family-friendly waterfront", price: "$$", priceNum: 200, nearby: "attractions seafood", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800" },
  { id: "drisco", name: "Hotel Drisco", area: "Pacific Heights", vibe: "luxury peaceful residential quiet", price: "$$$$", priceNum: 400, nearby: "parks cafes", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" },
  { id: "line", name: "The LINE", area: "Mid-Market", vibe: "modern design-forward minimalist social", price: "$$", priceNum: 190, nearby: "restaurants bars", image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800" },
  { id: "zeppelin", name: "Hotel Zeppelin", area: "Union Square", vibe: "psychedelic funky artistic colorful", price: "$$", priceNum: 175, nearby: "shopping dining", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800" },
  { id: "fairmont", name: "The Fairmont", area: "Nob Hill", vibe: "historic grand elegant luxury", price: "$$$$", priceNum: 420, nearby: "cable-cars fine-dining", image: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800" },
  { id: "proper", name: "Proper Hotel", area: "Mid-Market", vibe: "boutique design-forward trendy instagram-worthy", price: "$$$", priceNum: 300, nearby: "restaurants bars cafes", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800" },
  { id: "emblem", name: "Hotel Emblem", area: "Union Square", vibe: "literary cozy quirky writers", price: "$$", priceNum: 160, nearby: "bookstores cafes", image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800" },
  { id: "presidio", name: "Inn at the Presidio", area: "Presidio", vibe: "historic quiet nature peaceful", price: "$$$", priceNum: 320, nearby: "trails parks museums", image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800" },
  { id: "axiom", name: "Axiom Hotel", area: "Union Square", vibe: "eco-friendly modern sustainable", price: "$$", priceNum: 170, nearby: "shopping dining transit", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800" },
  { id: "triton", name: "Hotel Triton", area: "Union Square", vibe: "quirky colorful artistic eco-friendly", price: "$$", priceNum: 165, nearby: "chinatown shopping", image: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800" },
  { id: "palace", name: "Palace Hotel", area: "Financial District", vibe: "historic grand luxury business", price: "$$$$", priceNum: 380, nearby: "business restaurants", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800" },
  { id: "harbor", name: "Harbor Court Hotel", area: "Embarcadero", vibe: "waterfront quiet business maritime", price: "$$$", priceNum: 250, nearby: "bay restaurants ferry", image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800" },
  { id: "nikko", name: "Hotel Nikko", area: "Union Square", vibe: "japanese minimalist zen peaceful", price: "$$$", priceNum: 290, nearby: "shopping japanese-restaurants", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800" },
  { id: "castro", name: "Inn on Castro", area: "Castro", vibe: "lgbtq-friendly neighborhood cozy local", price: "$", priceNum: 140, nearby: "bars cafes nightlife", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800" },
  { id: "cavallo", name: "Cavallo Point Lodge", area: "Sausalito", vibe: "nature retreat peaceful spa luxury", price: "$$$$", priceNum: 450, nearby: "hiking trails nature spa", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800" }
];

const STAGES = { ASK_VIBE: "ASK_VIBE", ASK_BUDGET: "ASK_BUDGET", RESULTS: "RESULTS" };

const BUDGET_RANGES = {
  "budget-friendly": [0, 180],
  budget: [0, 180],
  "mid-range": [150, 300],
  mid: [150, 300],
  luxury: [250, Infinity],
  premium: [250, Infinity]
};

const initialBot = "👋 Hi! I'm your hotel finder assistant. What kind of vibe are you looking for?";

function filterByBudget(budgetLabel) {
  const key = budgetLabel.toLowerCase();
  const [min, max] = BUDGET_RANGES[key] || [0, Infinity];
  return HOTELS.filter((hotel) => hotel.priceNum >= min && hotel.priceNum <= max);
}

function keywordFallback(vibe, budget) {
  const keywords = vibe.toLowerCase().split(/\s+/);
  const budgetFiltered = filterByBudget(budget);
  const scored = (budgetFiltered.length ? budgetFiltered : HOTELS).map((hotel) => {
    const vibeWords = hotel.vibe.toLowerCase().split(/\s+/);
    const matchCount = keywords.reduce((acc, word) => (vibeWords.some((v) => v.includes(word)) ? acc + 1 : acc), 0);
    return { hotel, score: matchCount };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ hotel }) => ({
      ...hotel,
      aiExplanation: `Fits your ${budget} budget and matches your vibe. Near ${hotel.nearby}.`,
      price: hotel.priceNum
    }));
}

async function fetchClaudeMatches(userVibe, userBudget) {
  const apiKey = import.meta.env.REACT_APP_ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing API key");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `User preferences:
- Vibe: ${userVibe}
- Budget: ${userBudget}

Hotels: ${JSON.stringify(HOTELS)}

Return ONLY valid JSON with top 5 matches:
[{"name": "Hotel Name", "reason": "2-3 sentence explanation why it matches", "matchScore": 95}]`
        }
      ]
    })
  });

  if (!response.ok) throw new Error("API request failed");
  const data = await response.json();
  const raw = typeof data?.content?.[0]?.text === "string" ? data.content[0].text : "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const list = Array.isArray(parsed) ? parsed : [];

  return list
    .slice(0, 5)
    .map((item) => {
      const match = HOTELS.find((h) => h.name.toLowerCase() === item.name?.toLowerCase());
      return match
        ? { ...match, aiExplanation: item.reason || "Matches your vibe and budget.", price: match.priceNum }
        : null;
    })
    .filter(Boolean);
}

export default function App() {
  const [messages, setMessages] = useState([{ id: "init", sender: "bot", text: initialBot }]);
  const [stage, setStage] = useState(STAGES.ASK_VIBE);
  const [input, setInput] = useState("");
  const [userVibe, setUserVibe] = useState("");
  const [userBudget, setUserBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    const userMessage = { id: crypto.randomUUID(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    if (stage === STAGES.ASK_VIBE) {
      setUserVibe(userText);
      setStage(STAGES.ASK_BUDGET);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), sender: "bot", text: "What's your budget? (budget-friendly / mid-range / luxury)" }
        ]);
      }, 300);
      return;
    }

    if (stage === STAGES.ASK_BUDGET) {
      setUserBudget(userText);
      await runRanking(userText);
    }
  };

  const runRanking = async (budgetAnswer) => {
    setLoading(true);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "bot", text: "Got it. Thinking with Claude..." }]);

    try {
      const aiHotels = await fetchClaudeMatches(userVibe, budgetAnswer);
      const payload = aiHotels.length ? aiHotels : keywordFallback(userVibe, budgetAnswer);
      showResults(payload);
    } catch (err) {
      const fallback = keywordFallback(userVibe, budgetAnswer);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "bot", text: "API unavailable—using local matching instead." }
      ]);
      showResults(fallback);
    } finally {
      setLoading(false);
      setStage(STAGES.RESULTS);
    }
  };

  const showResults = (list) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "bot",
        text: "🎉 Here are the top 5 hotels for you:",
        hotels: list
      }
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl shadow-lg">
          <h1 className="text-center">Hotel Finder AI</h1>
          <p className="text-center text-blue-100 text-sm mt-2">Describe your vibe, we'll find your perfect stay</p>
        </div>

        <div className="flex-1 bg-white/80 backdrop-blur overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <ChatMessage message={{ text: message.text, sender: message.sender }} />
              {message.hotels && (
                <div className="space-y-3">
                  {message.hotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id || hotel.name}
                      hotel={{
                        id: hotel.id || hotel.name,
                        name: hotel.name,
                        image: hotel.image,
                        price: hotel.priceNum || hotel.price,
                        area: hotel.area,
                        aiExplanation: hotel.aiExplanation
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {stage !== STAGES.RESULTS && (
          <div className="bg-white p-4 rounded-b-2xl shadow-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={stage === STAGES.ASK_VIBE ? "e.g. quiet boutique near cafes" : "budget-friendly / mid-range / luxury"}
                className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {loading ? "Thinking..." : <Send className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">Add `REACT_APP_ANTHROPIC_API_KEY` to .env. Falls back to keyword matching if Claude fails.</div>
          </div>
        )}
      </div>
    </div>
  );
}
