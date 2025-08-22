/*
  # Update Schema with User Profiles and Itineraries

  1. New Tables
    - `profiles`
      - Extended user information
      - Role selection (tourist/local)
    - `itineraries`
      - Personalized travel plans
      - Linked experiences
    - `crowd_levels`
      - Real-time location crowding data

  2. Security
    - Enable RLS on new tables
    - Add policies for profile access
*/

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text NOT NULL,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('tourist', 'local', 'admin')),
  bio text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Itineraries Table
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itineraries"
  ON itineraries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own itineraries"
  ON itineraries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Itinerary Items Table
CREATE TABLE IF NOT EXISTS itinerary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES itineraries(id),
  experience_id uuid REFERENCES experiences(id),
  date date NOT NULL,
  time_slot text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itinerary items"
  ON itinerary_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE id = itinerary_items.itinerary_id
      AND user_id = auth.uid()
    )
  );

-- Crowd Levels Table
CREATE TABLE IF NOT EXISTS crowd_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES experiences(id),
  level text NOT NULL CHECK (level IN ('low', 'medium', 'high')),
  reported_by uuid REFERENCES auth.users(id),
  reported_at timestamptz DEFAULT now()
);

ALTER TABLE crowd_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crowd levels"
  ON crowd_levels
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can report crowd levels"
  ON crowd_levels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_itineraries_updated_at
  BEFORE UPDATE ON itineraries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();