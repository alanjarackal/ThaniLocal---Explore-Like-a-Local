export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          avatar_url: string | null
          role: 'user' | 'admin' | 'host'
          email: string
          is_local: boolean
          status: 'active' | 'inactive'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'host'
          email: string
          is_local?: boolean
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'host'
          email?: string
          is_local?: boolean
          status?: 'active' | 'inactive'
        }
      }
      experiences: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          duration: number
          location: string
          category: string
          max_participants: number
          creator_id: string
          status: 'pending' | 'approved' | 'rejected'
          images: string[] | null
          sustainability_rating: number
          is_cultural: boolean
          is_certified_sustainable: boolean
          estimated_carbon_footprint: number
          local_vendor_spending: number
          cultural_significance: string
          environmental_impact: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          duration: number
          location: string
          category: string
          max_participants: number
          creator_id: string
          status?: 'pending' | 'approved' | 'rejected'
          images?: string[] | null
          sustainability_rating?: number
          is_cultural?: boolean
          is_certified_sustainable?: boolean
          estimated_carbon_footprint?: number
          local_vendor_spending?: number
          cultural_significance?: string
          environmental_impact?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          duration?: number
          location?: string
          category?: string
          max_participants?: number
          creator_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          images?: string[] | null
          sustainability_rating?: number
          is_cultural?: boolean
          is_certified_sustainable?: boolean
          estimated_carbon_footprint?: number
          local_vendor_spending?: number
          cultural_significance?: string
          environmental_impact?: string
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          experience_id: string
          user_id: string
          booking_date: string
          participants: number
          status: 'pending' | 'confirmed' | 'cancelled'
          total_price: number
          carbon_offset: number
          local_impact: number
          cultural_engagement_score: number
        }
        Insert: {
          id?: string
          created_at?: string
          experience_id: string
          user_id: string
          booking_date: string
          participants: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          total_price?: number
          carbon_offset?: number
          local_impact?: number
          cultural_engagement_score?: number
        }
        Update: {
          id?: string
          created_at?: string
          experience_id?: string
          user_id?: string
          booking_date?: string
          participants?: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          total_price?: number
          carbon_offset?: number
          local_impact?: number
          cultural_engagement_score?: number
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          image_url: string
          category: string
          rating: number
          artisan_id: string
          artisan_name: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          image_url: string
          category: string
          rating?: number
          artisan_id: string
          artisan_name: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          image_url?: string
          category?: string
          rating?: number
          artisan_id?: string
          artisan_name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 