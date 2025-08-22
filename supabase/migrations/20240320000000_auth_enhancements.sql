-- Create auth_logs table to track authentication events
CREATE TABLE IF NOT EXISTS auth_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add email_verified column to profiles if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add last_sign_in column to profiles if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE;

-- Enable RLS on auth_logs
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Policies for auth_logs
CREATE POLICY "Users can view their own auth logs"
    ON auth_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Insert auth logs on sign in"
    ON auth_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Function to update last_sign_in timestamp
CREATE OR REPLACE FUNCTION public.handle_sign_in()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET last_sign_in = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_sign_in on auth_logs insert
CREATE TRIGGER on_auth_log_inserted
    AFTER INSERT ON auth_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sign_in();

-- Update profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Function to check if email is verified
CREATE OR REPLACE FUNCTION public.is_email_verified(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT email_verified FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER; 