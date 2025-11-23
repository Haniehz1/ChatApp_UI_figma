import { MapPin, DollarSign } from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  image: string;
  price: number;
  area: string;
  aiExplanation: string;
}

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-purple-100">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-48 h-48 sm:h-auto overflow-hidden">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-900">{hotel.name}</h3>
            <div className="flex items-center gap-1 text-purple-600 shrink-0 ml-2">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">{hotel.price}</span>
              <span className="text-xs text-gray-500">/night</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{hotel.area}</span>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 italic">
              ✨ {hotel.aiExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
