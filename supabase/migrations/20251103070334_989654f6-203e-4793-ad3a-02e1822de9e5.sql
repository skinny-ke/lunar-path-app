-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatars
CREATE POLICY "Users can view all avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add avatar_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_url text;

-- Add fertile window and ovulation tracking fields
ALTER TABLE public.profiles 
ADD COLUMN last_period_date date,
ADD COLUMN notification_enabled boolean DEFAULT false,
ADD COLUMN notification_days_before integer DEFAULT 3;

-- Create daily check-ins table
CREATE TABLE public.daily_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL,
  mood text,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  water_intake integer DEFAULT 0,
  sleep_hours numeric(3,1),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily check-ins" 
ON public.daily_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily check-ins" 
ON public.daily_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily check-ins" 
ON public.daily_checkins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily check-ins" 
ON public.daily_checkins 
FOR DELETE 
USING (auth.uid() = user_id);