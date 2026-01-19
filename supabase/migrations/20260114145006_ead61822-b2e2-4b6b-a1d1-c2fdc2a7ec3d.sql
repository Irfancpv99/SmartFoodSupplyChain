-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'school_admin', 'vendor');

-- Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schools table
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contact_email TEXT,
    contact_phone TEXT,
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_name TEXT,
    vat_number TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contact_email TEXT,
    contact_phone TEXT,
    is_verified BOOLEAN DEFAULT false,
    certifications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    unit TEXT DEFAULT 'kg',
    origin TEXT,
    certifications TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table (for DDT uploads)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ddt_number TEXT NOT NULL UNIQUE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('application/pdf', 'application/xml', 'text/xml')),
    file_size INTEGER,
    file_hash TEXT,
    upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    delivery_date DATE,
    status verification_status DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    blockchain_tx_id TEXT,
    blockchain_anchored_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ingredients table
CREATE TABLE public.ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity DECIMAL(10, 3),
    unit TEXT DEFAULT 'kg',
    origin TEXT,
    lot_number TEXT,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menus table
CREATE TABLE public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id TEXT NOT NULL UNIQUE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    meal_type TEXT DEFAULT 'lunch',
    is_published BOOLEAN DEFAULT false,
    qr_code_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    allergens TEXT[],
    nutritional_info JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_item_ingredients junction table
CREATE TABLE public.menu_item_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10, 3),
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (menu_item_id, ingredient_id)
);

-- Create blockchain_records table
CREATE TABLE public.blockchain_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type TEXT NOT NULL,
    reference_id UUID NOT NULL,
    reference_table TEXT NOT NULL,
    data_hash TEXT NOT NULL,
    previous_hash TEXT,
    tx_id TEXT,
    block_number INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create DDT number sequence
CREATE SEQUENCE public.ddt_number_seq START 1;

-- Function to generate DDT number
CREATE OR REPLACE FUNCTION public.generate_ddt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    year_part TEXT;
    seq_part TEXT;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    seq_part := LPAD(nextval('public.ddt_number_seq')::TEXT, 6, '0');
    RETURN 'DDT-' || year_part || '-' || seq_part;
END;
$$;

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user's vendor_id
CREATE OR REPLACE FUNCTION public.get_user_vendor_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.vendors WHERE user_id = _user_id LIMIT 1
$$;

-- Function to get user's school_id
CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.schools WHERE admin_user_id = _user_id LIMIT 1
$$;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for schools
CREATE POLICY "Schools are viewable by all authenticated users"
    ON public.schools FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage all schools"
    ON public.schools FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins can update their own school"
    ON public.schools FOR UPDATE
    USING (admin_user_id = auth.uid());

-- RLS Policies for vendors
CREATE POLICY "Vendors are viewable by all authenticated users"
    ON public.vendors FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Vendors can update their own record"
    ON public.vendors FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all vendors"
    ON public.vendors FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products
CREATE POLICY "Products are viewable by all authenticated users"
    ON public.products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Vendors can manage their own products"
    ON public.products FOR ALL
    USING (vendor_id = public.get_user_vendor_id(auth.uid()));

CREATE POLICY "Admins can manage all products"
    ON public.products FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for documents
CREATE POLICY "Documents are viewable by authenticated users"
    ON public.documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Vendors can insert their own documents"
    ON public.documents FOR INSERT
    WITH CHECK (vendor_id = public.get_user_vendor_id(auth.uid()));

CREATE POLICY "Vendors can update their own documents"
    ON public.documents FOR UPDATE
    USING (vendor_id = public.get_user_vendor_id(auth.uid()));

CREATE POLICY "Admins can manage all documents"
    ON public.documents FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ingredients
CREATE POLICY "Ingredients are viewable by authenticated users"
    ON public.ingredients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Vendors can manage ingredients from their documents"
    ON public.ingredients FOR ALL
    USING (
        document_id IN (
            SELECT id FROM public.documents 
            WHERE vendor_id = public.get_user_vendor_id(auth.uid())
        )
    );

CREATE POLICY "Admins can manage all ingredients"
    ON public.ingredients FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for menus (public read for verification)
CREATE POLICY "Menus are publicly viewable when published"
    ON public.menus FOR SELECT
    USING (is_published = true);

CREATE POLICY "Authenticated users can view all menus"
    ON public.menus FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "School admins can manage their school menus"
    ON public.menus FOR ALL
    USING (school_id = public.get_user_school_id(auth.uid()));

CREATE POLICY "Admins can manage all menus"
    ON public.menus FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for menu_items (public read for verification)
CREATE POLICY "Menu items are publicly viewable for published menus"
    ON public.menu_items FOR SELECT
    USING (
        menu_id IN (SELECT id FROM public.menus WHERE is_published = true)
    );

CREATE POLICY "Authenticated users can view all menu items"
    ON public.menu_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "School admins can manage their menu items"
    ON public.menu_items FOR ALL
    USING (
        menu_id IN (
            SELECT id FROM public.menus 
            WHERE school_id = public.get_user_school_id(auth.uid())
        )
    );

CREATE POLICY "Admins can manage all menu items"
    ON public.menu_items FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for menu_item_ingredients
CREATE POLICY "Menu item ingredients are publicly viewable for published menus"
    ON public.menu_item_ingredients FOR SELECT
    USING (
        menu_item_id IN (
            SELECT mi.id FROM public.menu_items mi
            JOIN public.menus m ON mi.menu_id = m.id
            WHERE m.is_published = true
        )
    );

CREATE POLICY "Authenticated users can view all menu item ingredients"
    ON public.menu_item_ingredients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "School admins can manage their menu item ingredients"
    ON public.menu_item_ingredients FOR ALL
    USING (
        menu_item_id IN (
            SELECT mi.id FROM public.menu_items mi
            JOIN public.menus m ON mi.menu_id = m.id
            WHERE m.school_id = public.get_user_school_id(auth.uid())
        )
    );

CREATE POLICY "Admins can manage all menu item ingredients"
    ON public.menu_item_ingredients FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for blockchain_records (public read)
CREATE POLICY "Blockchain records are publicly viewable"
    ON public.blockchain_records FOR SELECT
    USING (true);

CREATE POLICY "Only system can insert blockchain records"
    ON public.blockchain_records FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create storage bucket for DDT documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ddt-documents',
    'ddt-documents',
    false,
    10485760,
    ARRAY['application/pdf', 'application/xml', 'text/xml']
);

-- Storage policies for ddt-documents bucket
CREATE POLICY "Authenticated users can upload DDT documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'ddt-documents');

CREATE POLICY "Authenticated users can view DDT documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'ddt-documents');

CREATE POLICY "Vendors can update their own DDT documents"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'ddt-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vendors can delete their own DDT documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'ddt-documents' AND auth.uid()::text = (storage.foldername(name))[1]);