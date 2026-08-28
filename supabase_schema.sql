-- ====================================================================
-- GitSole Production Supabase Setup Script (Strict Security & RLS)
-- Copy and run this ENTIRE script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wmoqabcoiqjbpwlwzkcs/sql
-- ====================================================================

-- 1. Create Products Table (Full GitSole Schema)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    colourway TEXT DEFAULT '',
    size_eu TEXT DEFAULT '',
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

-- 2. Create Orders Table
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

-- 3. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(date DESC);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 5. PRODUCTS ACCESS POLICIES
-- ====================================================================

-- Rule 1: PUBLIC / Customers can ONLY READ products (SELECT)
DROP POLICY IF EXISTS "Public Read Access on Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" 
ON public.products FOR SELECT 
USING (true);

-- Rule 2: ONLY Admin Service Role can INSERT new products
-- (Normal authenticated customers CANNOT insert products)
DROP POLICY IF EXISTS "Public Insert Access on Products" ON public.products;
DROP POLICY IF EXISTS "Admin Insert Products" ON public.products;
CREATE POLICY "Admin Insert Products" 
ON public.products FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Rule 3: ONLY Admin Service Role can UPDATE products
-- (Normal authenticated customers CANNOT update products)
DROP POLICY IF EXISTS "Public Update Access on Products" ON public.products;
DROP POLICY IF EXISTS "Admin Update Products" ON public.products;
CREATE POLICY "Admin Update Products" 
ON public.products FOR UPDATE 
USING (auth.role() = 'service_role');

-- Rule 4: ONLY Admin Service Role can DELETE products
-- (Normal authenticated customers CANNOT delete products)
DROP POLICY IF EXISTS "Public Delete Access on Products" ON public.products;
DROP POLICY IF EXISTS "Admin Delete Products" ON public.products;
CREATE POLICY "Admin Delete Products" 
ON public.products FOR DELETE 
USING (auth.role() = 'service_role');

-- ====================================================================
-- 6. ORDERS ACCESS POLICIES
-- ====================================================================

-- Rule 1: ONLY Admin Service Role can SELECT / list all orders
-- (Protects customer phone numbers, addresses, and order history from public scraping)
DROP POLICY IF EXISTS "Public Access on Orders" ON public.orders;
DROP POLICY IF EXISTS "Admin and Customer Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Read Orders" ON public.orders;
CREATE POLICY "Admin Read Orders" 
ON public.orders FOR SELECT 
USING (auth.role() = 'service_role');

-- Rule 2: Customers can CREATE orders during checkout
DROP POLICY IF EXISTS "Customer Insert Orders" ON public.orders;
CREATE POLICY "Customer Insert Orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Rule 3: ONLY Admin Service Role can UPDATE orders (status, courier, tracking)
DROP POLICY IF EXISTS "Admin Update Orders" ON public.orders;
CREATE POLICY "Admin Update Orders" 
ON public.orders FOR UPDATE 
USING (auth.role() = 'service_role');

-- Rule 4: ONLY Admin Service Role can DELETE orders
DROP POLICY IF EXISTS "Admin Delete Orders" ON public.orders;
CREATE POLICY "Admin Delete Orders" 
ON public.orders FOR DELETE 
USING (auth.role() = 'service_role');

-- ====================================================================
-- 7. SUPABASE STORAGE BUCKET: product-images
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'product-images', 
    'product-images', 
    true, 
    10485760, -- 10MB limit per image
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- Storage Bucket Policies
-- Rule 1: PUBLIC Read Access to product images (CDN display on mobile/laptop)
DROP POLICY IF EXISTS "Public Access Product Images Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Rule 2: ONLY Admin Service Role can UPLOAD product images
DROP POLICY IF EXISTS "Public Access Product Images Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
CREATE POLICY "Admin Upload Product Images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.role() = 'service_role'
);

-- Rule 3: ONLY Admin Service Role can UPDATE product images
DROP POLICY IF EXISTS "Public Access Product Images Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Product Images" ON storage.objects;
CREATE POLICY "Admin Update Product Images" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'service_role'
);

-- Rule 4: ONLY Admin Service Role can DELETE product images
DROP POLICY IF EXISTS "Public Access Product Images Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;
CREATE POLICY "Admin Delete Product Images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'service_role'
);
