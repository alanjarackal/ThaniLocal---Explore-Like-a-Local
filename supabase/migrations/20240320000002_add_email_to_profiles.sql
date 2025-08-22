-- Add email column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Make email column NOT NULL and add unique constraint
ALTER TABLE profiles 
ALTER COLUMN email SET NOT NULL,
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Add comment to the column
COMMENT ON COLUMN profiles.email IS 'User email address';

-- Update RLS policies to include email
CREATE POLICY "Users can update their own email"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create trigger to sync email with auth.users
CREATE OR REPLACE FUNCTION public.handle_email_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update email in auth.users when it's updated in profiles
    IF NEW.email <> OLD.email THEN
        UPDATE auth.users SET email = NEW.email WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_email_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_email_update();

-- Create function to sync new user email
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 