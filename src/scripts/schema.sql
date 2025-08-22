-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Experiences table
CREATE TABLE IF NOT EXISTS experiences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    max_participants INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    images TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    artisan_name TEXT NOT NULL,
    stock INTEGER NOT NULL,
    images TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    num_participants INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
); 