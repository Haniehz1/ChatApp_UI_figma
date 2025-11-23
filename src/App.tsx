import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { HotelCard } from './components/HotelCard';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  hotels?: Hotel[];
}

interface Hotel {
  id: string;
  name: string;
  image: string;
  price: number;
  area: string;
  vibe: string[];
  budget: 'budget-friendly' | 'mid-range' | 'luxury';
  aiExplanation: string;
}

type ConversationState = 'initial' | 'waiting-vibe' | 'waiting-budget' | 'complete';

const hotelDatabase: Hotel[] = [
  {
    id: '1',
    name: 'The Quiet Corner Boutique',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    price: 180,
    area: 'Arts District',
    vibe: ['quiet', 'boutique', 'cafes', 'peaceful', 'cozy', 'intimate'],
    budget: 'mid-range',
    aiExplanation: 'Perfect quiet boutique hotel surrounded by artisan cafes and local coffee shops.'
  },
  {
    id: '2',
    name: 'Nightlife Palace Hotel',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    price: 250,
    area: 'Downtown',
    vibe: ['trendy', 'nightlife', 'vibrant', 'party', 'modern', 'energetic'],
    budget: 'luxury',
    aiExplanation: 'Trendy luxury hotel in the heart of nightlife district with rooftop bar access.'
  },
  {
    id: '3',
    name: 'Sunset Beach Resort',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    price: 320,
    area: 'Beachfront',
    vibe: ['beach', 'relaxing', 'resort', 'romantic', 'luxury', 'ocean'],
    budget: 'luxury',
    aiExplanation: 'Luxurious beachfront resort with private beach access and stunning ocean views.'
  },
  {
    id: '4',
    name: 'City Central Hostel',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    price: 45,
    area: 'City Center',
    vibe: ['budget', 'social', 'central', 'backpacker', 'lively', 'affordable'],
    budget: 'budget-friendly',
    aiExplanation: 'Affordable and social accommodation right in the city center, perfect for budget travelers.'
  },
  {
    id: '5',
    name: 'Garden View Inn',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    price: 95,
    area: 'Suburbs',
    vibe: ['quiet', 'garden', 'family', 'peaceful', 'nature', 'relaxing'],
    budget: 'budget-friendly',
    aiExplanation: 'Charming budget-friendly inn with beautiful gardens, ideal for families seeking tranquility.'
  },
  {
    id: '6',
    name: 'The Modern Loft',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
    price: 165,
    area: 'Creative Quarter',
    vibe: ['modern', 'boutique', 'artistic', 'trendy', 'design', 'cafes'],
    budget: 'mid-range',
    aiExplanation: 'Designer boutique hotel in creative district surrounded by galleries and specialty cafes.'
  },
  {
    id: '7',
    name: 'Historic Grand Hotel',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    price: 280,
    area: 'Old Town',
    vibe: ['historic', 'elegant', 'luxury', 'classic', 'sophisticated', 'cultural'],
    budget: 'luxury',
    aiExplanation: 'Elegant historic hotel with old-world charm near cultural landmarks and museums.'
  },
  {
    id: '8',
    name: 'Minimalist Stay',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    price: 110,
    area: 'East Side',
    vibe: ['minimalist', 'modern', 'quiet', 'simple', 'clean', 'budget'],
    budget: 'mid-range',
    aiExplanation: 'Clean, minimalist design at an accessible price point, perfect for those who appreciate simplicity.'
  }
];

function rankHotels(vibe: string, budget: string): Hotel[] {
  const vibeKeywords = vibe.toLowerCase().split(' ');
  
  const budgetMap: { [key: string]: Hotel['budget'] } = {
    'budget-friendly': 'budget-friendly',
    'budget': 'budget-friendly',
    'cheap': 'budget-friendly',
    'affordable': 'budget-friendly',
    'mid-range': 'mid-range',
    'moderate': 'mid-range',
    'luxury': 'luxury',
    'high-end': 'luxury',
    'expensive': 'luxury'
  };
  
  const targetBudget = budgetMap[budget.toLowerCase()] || 'mid-range';
  
  const scored = hotelDatabase.map(hotel => {
    let score = 0;
    
    // Match vibe keywords
    vibeKeywords.forEach(keyword => {
      if (hotel.vibe.some(v => v.includes(keyword) || keyword.includes(v))) {
        score += 10;
      }
      if (hotel.name.toLowerCase().includes(keyword)) {
        score += 5;
      }
      if (hotel.area.toLowerCase().includes(keyword)) {
        score += 3;
      }
    });
    
    // Match budget exactly
    if (hotel.budget === targetBudget) {
      score += 20;
    }
    
    return { hotel, score };
  });
  
  // Sort by score and return top 5
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.hotel);
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your hotel finder assistant. What kind of vibe are you looking for?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [state, setState] = useState<ConversationState>('waiting-vibe');
  const [userVibe, setUserVibe] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (state === 'waiting-vibe') {
      setUserVibe(input);
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Great! What's your budget? (budget-friendly / mid-range / luxury)",
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
        setState('waiting-budget');
      }, 500);
    } else if (state === 'waiting-budget') {
      setTimeout(() => {
        const hotels = rankHotels(userVibe, input);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "🎉 Perfect! Here are the top 5 hotels matching your vibe:",
          sender: 'bot',
          hotels
        };
        setMessages(prev => [...prev, botMessage]);
        setState('complete');
      }, 800);
    }

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl shadow-lg">
          <h1 className="text-center">Hotel Finder AI</h1>
          <p className="text-center text-blue-100 text-sm mt-2">Describe your vibe, we'll find your perfect stay</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white/80 backdrop-blur overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div key={message.id}>
              <ChatMessage message={message} />
              {message.hotels && (
                <div className="mt-4 space-y-3">
                  {message.hotels.map(hotel => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {state !== 'complete' && (
          <div className="bg-white p-4 rounded-b-2xl shadow-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={handleSend}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
