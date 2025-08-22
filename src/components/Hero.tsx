import { Search } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&q=80"
          alt="Local market"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Discover Authentic Local Experiences
        </h1>
        <p className="mt-6 text-xl text-white max-w-3xl">
          Connect with locals, explore hidden gems, and travel sustainably. Experience the world through the eyes of those who know it best.
        </p>
        
        <div className="mt-10 max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for experiences, places, or local guides..."
              className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}