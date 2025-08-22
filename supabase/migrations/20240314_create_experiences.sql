-- Create experiences table
CREATE TABLE experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration DECIMAL(4,1) NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    max_participants INTEGER NOT NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    images TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create RLS policies
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Policy for viewing experiences
CREATE POLICY "Experiences are viewable by everyone" 
ON experiences FOR SELECT 
TO authenticated
USING (true);

-- Policy for creating experiences
CREATE POLICY "Users can create their own experiences" 
ON experiences FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = creator_id);

-- Policy for updating experiences
CREATE POLICY "Users can update their own experiences" 
ON experiences FOR UPDATE 
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Policy for deleting experiences
CREATE POLICY "Users can delete their own experiences" 
ON experiences FOR DELETE 
TO authenticated
USING (auth.uid() = creator_id);

-- Create storage bucket for experience images
INSERT INTO storage.buckets (id, name, public) VALUES ('experience-images', 'experience-images', true);

-- Storage policy for viewing images
CREATE POLICY "Experience images are viewable by everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'experience-images');

-- Storage policy for uploading images
CREATE POLICY "Authenticated users can upload experience images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'experience-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
); 