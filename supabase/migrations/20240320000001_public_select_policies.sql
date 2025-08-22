-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies for SELECT
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
DROP POLICY IF EXISTS "Allow public read access" ON experiences;
DROP POLICY IF EXISTS "Allow public read access" ON bookings;
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow public read access" ON auth_logs;

-- Create new public SELECT policies
CREATE POLICY "Allow public read access"
    ON profiles
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access"
    ON experiences
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access"
    ON bookings
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access"
    ON products
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access"
    ON auth_logs
    FOR SELECT
    TO public
    USING (true);

-- Verify that RLS is enabled and policies are created
COMMENT ON TABLE profiles IS 'Public read access enabled via RLS';
COMMENT ON TABLE experiences IS 'Public read access enabled via RLS';
COMMENT ON TABLE bookings IS 'Public read access enabled via RLS';
COMMENT ON TABLE products IS 'Public read access enabled via RLS';
COMMENT ON TABLE auth_logs IS 'Public read access enabled via RLS'; 