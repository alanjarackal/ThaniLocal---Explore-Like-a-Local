export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  date: string;
  max_participants: number;
  current_participants: number;
  rating: number;
  host_id: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  price: number;
  rating: number;
  artisan_id: string;
  artisan_name: string;
  created_at: string;
  images: string[];
  stock: number;
}

export interface Booking {
  id: string;
  experience_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  participants: number;
  created_at: string;
}

export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ItineraryItem {
  id: string;
  itinerary_id: string;
  experience_id: string;
  date: string;
  time_slot?: string;
  notes?: string;
  created_at: string;
}

export interface CrowdLevel {
  id: string;
  location_id: string;
  level: 'low' | 'medium' | 'high';
  reported_by: string;
  reported_at: string;
}