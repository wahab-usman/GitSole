-- ==========================================================
-- GitSole Supabase PostgreSQL Database Setup Script
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==========================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    colourway TEXT DEFAULT '',
    size_uk TEXT NOT NULL,
    size_us TEXT DEFAULT '',
    insole_cm NUMERIC(4, 1) DEFAULT 28.0,
    score NUMERIC(3, 1) DEFAULT 9.0,
    tier TEXT DEFAULT 'Excellent',
    condition_notes TEXT DEFAULT '',
    flaws JSONB DEFAULT '[]'::jsonb,
    price NUMERIC(10, 2) NOT NULL,
    retail_price NUMERIC(10, 2) DEFAULT 0,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    photos JSONB DEFAULT '[]'::jsonb,
    box_included BOOLEAN DEFAULT false,
    listed_at TEXT DEFAULT 'Recently listed',
    status TEXT DEFAULT 'available',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Access Policies
-- Anyone can read products (Visitors on mobile, tablet, laptop)
CREATE POLICY "Public Read Access on Products" 
ON public.products 
FOR SELECT 
USING (true);

-- Anyone with Anon Key can insert/update/delete products (Admin Panel)
CREATE POLICY "Public Insert Access on Products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public Update Access on Products" 
ON public.products 
FOR UPDATE 
USING (true);

CREATE POLICY "Public Delete Access on Products" 
ON public.products 
FOR DELETE 
USING (true);

-- 5. Optional: Orders Table for complete multi-device store management
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer JSONB NOT NULL,
    payment_method TEXT DEFAULT 'cod',
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) DEFAULT 0,
    delivery NUMERIC(10, 2) DEFAULT 0,
    cod_fee NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) DEFAULT 0,
    courier TEXT DEFAULT 'Trax / TCS Express',
    tracking_number TEXT,
    status TEXT DEFAULT 'placed',
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access on Orders" 
ON public.orders 
FOR ALL 
USING (true);
