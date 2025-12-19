-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'COMPANY', 'CUSTOMER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create services table
CREATE TABLE services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    cnpj TEXT,
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    whatsapp TEXT,
    location TEXT,
    city TEXT,
    state TEXT,
    image_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    tags TEXT[], -- Array of strings
    website TEXT,
    instagram TEXT,
    business_hours TEXT,
    year_founded INTEGER,
    owner_name TEXT,
    methods TEXT[], -- Array of strings
    gallery TEXT[], -- Array of image URLs
    certifications TEXT[], -- Array of strings
    service_areas TEXT[], -- Array of strings
    specialties TEXT[], -- Array of strings
    services TEXT[], -- Array of strings
    price_range TEXT CHECK (price_range IN ('ECONOMIC', 'STANDARD', 'PREMIUM')),
    profile_views INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    short_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create leads table
CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_id TEXT,
    description TEXT,
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for Services
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);

-- Policies for Companies
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (status = 'APPROVED' OR auth.uid() = owner_id);
CREATE POLICY "Owners can update their own company" ON companies FOR UPDATE USING (auth.uid() = owner_id);

-- Policies for Leads
-- Policies for Leads
CREATE POLICY "Users can see leads they created" ON leads FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Companies can see leads assigned to them" ON leads FOR SELECT USING (
    EXISTS (SELECT 1 FROM companies WHERE id = leads.company_id AND owner_id = auth.uid())
);
CREATE POLICY "Customers can create leads" ON leads FOR INSERT WITH CHECK (true); -- Anyone can create leads (even anonymous if needed, or auth.uid() = profile_id)

-- Additional Policies
CREATE POLICY "Enable insert for authenticated users" ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Triggers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, picture, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'name', 
    new.raw_user_meta_data ->> 'picture',
    'CUSTOMER'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
