-- First, create the update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing table if exists
DROP TABLE IF EXISTS public.profiles;

-- Create enhanced profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    avatar_url text NULL,
    role text NOT NULL,
    bio text NULL,
    location text NULL,
    phone_number text NULL,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    last_sign_in timestamp with time zone NULL,
    account_status text DEFAULT 'active',
    failed_login_attempts integer DEFAULT 0,
    password_last_changed timestamp with time zone NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Primary key constraint
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    
    -- Foreign key constraint
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) 
        REFERENCES auth.users (id) ON DELETE CASCADE,
    
    -- Role check constraint
    CONSTRAINT profiles_role_check CHECK (
        role = ANY (ARRAY['tourist'::text, 'local'::text, 'admin'::text])
    ),
    
    -- Email constraints
    CONSTRAINT profiles_email_unique UNIQUE (email),
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    
    -- Phone number format constraint (optional)
    CONSTRAINT profiles_phone_check CHECK (
        phone_number IS NULL OR 
        phone_number ~ '^\+?[1-9]\d{1,14}$'
    ),
    
    -- Account status check
    CONSTRAINT profiles_status_check CHECK (
        account_status = ANY (ARRAY['active'::text, 'suspended'::text, 'deactivated'::text])
    )
) TABLESPACE pg_default;

-- Create updated_at trigger
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at();

-- Create index on email for faster lookups
CREATE INDEX idx_profiles_email ON profiles(email);

-- Create index on role for faster filtering
CREATE INDEX idx_profiles_role ON profiles(role);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND (
            CASE WHEN role IS NOT NULL 
            THEN role = OLD.role  -- Prevent users from changing their own role
            ELSE true
            END
        )
    );

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        failed_login_attempts = failed_login_attempts + 1,
        account_status = CASE 
            WHEN failed_login_attempts >= 5 THEN 'suspended'
            ELSE account_status
        END
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for failed login attempts
CREATE TRIGGER on_failed_login
    AFTER INSERT ON auth.audit_log_entries
    FOR EACH ROW
    WHEN (NEW.error_description IS NOT NULL)
    EXECUTE FUNCTION handle_failed_login();

-- Function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        failed_login_attempts = 0,
        last_sign_in = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for successful login
CREATE TRIGGER on_successful_login
    AFTER INSERT ON auth.audit_log_entries
    FOR EACH ROW
    WHEN (NEW.error_description IS NULL)
    EXECUTE FUNCTION reset_failed_login_attempts();

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profiles with enhanced authentication features';
COMMENT ON COLUMN profiles.email_verified IS 'Indicates if the user''s email has been verified';
COMMENT ON COLUMN profiles.phone_verified IS 'Indicates if the user''s phone number has been verified';
COMMENT ON COLUMN profiles.account_status IS 'Current status of the account: active, suspended, or deactivated';
COMMENT ON COLUMN profiles.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN profiles.password_last_changed IS 'Timestamp of the last password change';
COMMENT ON COLUMN profiles.last_sign_in IS 'Timestamp of the last successful sign in'; 