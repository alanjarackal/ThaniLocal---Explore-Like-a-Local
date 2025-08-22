/*
  # Initial Schema Setup for ThaniLocal

  1. New Tables
    - `experiences`
      - Core fields for local experiences/activities
      - Includes pricing, location, and capacity info
    - `products`
      - Local marketplace items
      - Includes artisan info and pricing
    - `bookings`
      - Experience booking records
      - Tracks user bookings and spots

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Experiences Table
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  location text NOT NULL,
  price decimal NOT NULL,
  date timestamptz NOT NULL,
  max_participants integer NOT NULL,
  current_participants integer DEFAULT 0,
  rating decimal DEFAULT 0,
  host_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences are viewable by everyone"
  ON experiences
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create experiences"
  ON experiences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  price decimal NOT NULL,
  category text NOT NULL,
  rating decimal DEFAULT 0,
  artisan_id uuid REFERENCES auth.users(id),
  artisan_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = artisan_id);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES experiences(id),
  user_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  participants integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);