import { supabase } from './supabaseClient';
import type { Experience, Product, Booking } from './types';

export async function getExperiences() {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data as Experience[];
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Product[];
}

export async function createBooking(experienceId: string, participants: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to create a booking')

  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        experience_id: experienceId,
        user_id: user.id,
        participants,
        booking_date: new Date().toISOString().split('T')[0]
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

export async function getUserBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      experience:experiences(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}