import { useEffect, useMemo, useRef, useState } from "react";

const HOTELS = [
  { name: "Ace Hotel", area: "SoMa", vibe: "trendy hipster creative artistic", price: "$$", priceNum: 180, nearby: "cafes bars galleries", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400" },
  { name: "The Marker", area: "Union Square", vibe: "boutique quiet sophisticated elegant", price: "$$$", priceNum: 280, nearby: "shopping theaters", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" },
  { name: "Phoenix Hotel", area: "Tenderloin", vibe: "rock-and-roll edgy vintage", price: "$", priceNum: 120, nearby: "bars clubs", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400" },
  { name: "Hotel Zephyr", area: "Fisherman's Wharf", vibe: "nautical family-friendly waterfront", price: "$$", priceNum: 200, nearby: "attractions seafood", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400" },
  { name: "Hotel Drisco", area: "Pacific Heights", vibe: "luxury peaceful residential quiet", price: "$$$$", priceNum: 400, nearby: "parks cafes", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400" },
  { name: "The LINE", area: "Mid-Market", vibe: "modern design-forward minimalist social", price: "$$", priceNum: 190, nearby: "restaurants bars", image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400" },
  { name: "Hotel Zeppelin", area: "Union Square", vibe: "psychedelic funky artistic colorful", price: "$$", priceNum: 175, nearby: "shopping dining", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400" },
  { name: "The Fairmont", area: "Nob Hill", vibe: "historic grand elegant luxury", price: "$$$$", priceNum: 420, nearby: "cable-cars fine-dining", image: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=400" },
  { name: "Proper Hotel", area: "Mid-Market", vibe: "boutique design-forward trendy instagram-worthy", price: "$$$", priceNum: 300, nearby: "restaurants bars cafes", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400" },
  { name: "Hotel Emblem", area: "Union Square", vibe: "literary cozy quirky writers", price: "$$", priceNum: 160, nearby: "bookstores cafes", image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400" },
  { name: "Inn at the Presidio", area: "Presidio", vibe: "historic quiet nature peaceful", price: "$$$", priceNum: 320, nearby: "trails parks museums", image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400" },
  { name: "Axiom Hotel", area: "Union Square", vibe: "eco-friendly modern sustainable", price: "$$", priceNum: 170, nearby: "shopping dining transit", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400" },
  { name: "Hotel Triton", area: "Union Square", vibe: "quirky colorful artistic eco-friendly", price: "$$", priceNum: 165, nearby: "chinatown shopping", image: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=400" },
  { name: "Palace Hotel", area: "Financial District", vibe: "historic grand luxury business", price: "$$$$", priceNum: 380, nearby: "business restaurants", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400" },
  { name: "Harbor Court Hotel", area: "Embarcadero", vibe: "waterfront quiet business maritime", price: "$$$", priceNum: 250, nearby: "bay restaurants ferry", image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=400" },
  { name: "Hotel Nikko", area: "Union Square", vibe: "japanese minimalist zen peaceful", price: "$$$", priceNum: 290, nearby: "shopping japanese-restaurants", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" },
  { name: "Inn on Castro", area: "Castro", vibe: "lgbtq-friendly neighborhood cozy local", price: "$", priceNum: 140, nearby: "bars cafes nightlife", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400" },
  { name: "Cavallo Point Lodge", area: "Sausalito", vibe: "nature retreat peaceful spa luxury", price: "$$$$", priceNum: 450, nearby: "hiking trails nature spa", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400" }
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

const initialBot = "👋 Hi! I'm your hotel finder. What kind of vibe are you looking for?";

function bubbleBg(sender) {
  return sender === "bot" ? "bg-blue-50 border-blue-100" : "bg-purple-50 border-purple-100";
}

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
      reason: `Fits your ${budget} budget and matches parts of your vibe. Close to ${hotel.nearby}.`,
      matchScore: 50
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
        ? { ...match, reason: item.reason || "Matches your vibe and budget.", matchScore: item.matchScore || 90 }
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
    const userMessage = { id: crypto.randomUUID(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);

    if (stage === STAGES.ASK_VIBE) {
      setUserVibe(input.trim());
      setInput("");
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
      setUserBudget(input.trim());
      setInput("");
      await runRanking(input.trim());
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
        text: "Here are your top 5 matches:",
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

  const hotelsDisplayed = useMemo(
    () => messages.flatMap((m) => (m.hotels ? m.hotels : [])).slice(-5),
    [messages]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto py-10 px-4">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-6 py-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] opacity-70">AI Concierge</p>
            <h1 className="text-2xl font-semibold">Hotel Finder for San Francisco</h1>
            <p className="text-blue-100 text-sm mt-1">Describe the vibe and budget, we find your stay.</p>
          </div>
          <div className="text-sm bg-white/15 px-4 py-2 rounded-full">Claude + local fallback</div>
        </header>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-slate-100 flex flex-col h-[70vh]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`border rounded-2xl px-4 py-3 ${bubbleBg(msg.sender)} shadow-sm`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                  {msg.hotels && (
                    <div className="mt-3 grid sm:grid-cols-2 gap-3">
                      {msg.hotels.map((hotel) => (
                        <HotelCard key={hotel.name} hotel={hotel} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {stage !== STAGES.RESULTS && (
              <div className="border-t border-slate-100 p-3">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={stage === STAGES.ASK_VIBE ? "e.g. quiet boutique near cafes" : "budget-friendly / mid-range / luxury"}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading ? "Thinking..." : "Send"}
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Your choices</p>
              <ul className="text-sm space-y-1">
                <li><strong>Vibe:</strong> {userVibe || "pending"}</li>
                <li><strong>Budget:</strong> {userBudget || "pending"}</li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Top matches</p>
              <div className="space-y-3">
                {hotelsDisplayed.length === 0 && <p className="text-sm text-slate-500">No results yet.</p>}
                {hotelsDisplayed.map((hotel) => (
                  <div key={hotel.name} className="flex gap-3">
                    <img src={hotel.image} alt={hotel.name} className="w-16 h-16 rounded-lg object-cover border border-slate-100" />
                    <div>
                      <p className="font-semibold text-sm">{hotel.name}</p>
                      <p className="text-xs text-slate-500">{hotel.area} • {hotel.price}</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{hotel.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Add `REACT_APP_ANTHROPIC_API_KEY` to your `.env` to enable Claude ranking. Falls back to local keyword matching on errors.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function HotelCard({ hotel }) {
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
      <img src={hotel.image} alt={hotel.name} className="h-28 w-full object-cover" />
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{hotel.name}</span>
          <span>{hotel.price}</span>
        </div>
        <p className="text-xs text-slate-500">{hotel.area} • Near {hotel.nearby}</p>
        <p className="text-xs text-slate-700">{hotel.reason}</p>
      </div>
    </div>
  );
}
