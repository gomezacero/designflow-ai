-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Designers Table
CREATE TABLE IF NOT EXISTS public.designers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Sprints Table
CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Requesters Table
CREATE TABLE IF NOT EXISTS public.requesters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- Enum: 'Search Arbitrage', 'Branding', 'Social Media', 'Other'
    priority TEXT NOT NULL, -- Enum: 'Normal', 'High', 'Critical'
    status TEXT NOT NULL, -- Enum: 'To Do', 'In Progress', 'Review', 'Done'
    points INTEGER DEFAULT 1,
    description TEXT,
    requester TEXT NOT NULL, -- Storing name directly as per current app logic
    manager TEXT,
    designer_id UUID REFERENCES public.designers(id),
    request_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    sprint TEXT, -- Storing sprint name as per current app logic
    reference_images TEXT[] DEFAULT '{}',
    reference_links TEXT[] DEFAULT '{}',
    delivery_link TEXT,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS) but allow anonymous access for now
-- Since auth is currently mocked, we need to allow public operations to make the app work.
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (DEV MODE)
CREATE POLICY "Enable all access for all users" ON public.designers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.sprints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.requesters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- 6. Insert some initial data (Optional - to match constants.ts)
INSERT INTO public.designers (name, avatar) VALUES 
('Ana García', 'https://i.pravatar.cc/150?u=a'),
('Carlos Ruiz', 'https://i.pravatar.cc/150?u=c'),
('Elena Torres', 'https://i.pravatar.cc/150?u=e');

INSERT INTO public.requesters (name) VALUES 
('Marketing Team'),
('Product Team'),
('Sales Team');

INSERT INTO public.sprints (name, start_date, end_date, is_active) VALUES 
('Sprint 34', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '1 day', false),
('Sprint 35', CURRENT_DATE, CURRENT_DATE + INTERVAL '13 days', true);
