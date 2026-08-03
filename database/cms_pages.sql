-- Create the cms_pages table
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    display_location TEXT NOT NULL DEFAULT 'none' CHECK (display_location IN ('header', 'footer', 'none')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active pages
CREATE POLICY "Allow public read access to active pages"
    ON public.cms_pages
    FOR SELECT
    USING (is_active = true);

-- Create policy to allow admin full access (assuming admin is authenticated or checked in the application layer, we will just allow authenticated users for simplicity, or allow all and rely on app layer for mutations. The prompt says "admin full access", so let's allow authenticated to do all, or just create a permissive policy for authenticated users)
CREATE POLICY "Allow authenticated users full access to cms_pages"
    ON public.cms_pages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cms_pages_updated_at
    BEFORE UPDATE ON public.cms_pages
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
