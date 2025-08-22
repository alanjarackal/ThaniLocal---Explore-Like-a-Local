-- Enable Row Level Security for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);

-- Policies for experiences table
CREATE POLICY "Experiences are viewable by everyone"
ON experiences FOR SELECT
USING (status = 'approved' OR creator_id = auth.uid());

CREATE POLICY "Creators can insert experiences"
ON experiences FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own experiences"
ON experiences FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own experiences"
ON experiences FOR DELETE
USING (auth.uid() = creator_id);

CREATE POLICY "Admins can manage all experiences"
ON experiences FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Policies for bookings table
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM experiences
    WHERE experiences.id = bookings.experience_id
    AND experiences.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Experience creators can view related bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM experiences
    WHERE experiences.id = bookings.experience_id
    AND experiences.creator_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all bookings"
ON bookings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Policies for products table
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

CREATE POLICY "Artisans can manage own products"
ON products FOR ALL
USING (auth.uid() = artisan_id);

CREATE POLICY "Admins can manage all products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is host
CREATE OR REPLACE FUNCTION is_host()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'host'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 