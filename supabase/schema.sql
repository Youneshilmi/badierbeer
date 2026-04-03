-- ============================================================
-- BadierBeer – Supabase Database Schema
-- Run this entire script in the Supabase SQL Editor
-- BEFORE running: replace 'hilmi020499@gmail.com' with your email
-- ============================================================

-- Custom ENUM types
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'user');
CREATE TYPE glass_status AS ENUM ('pending', 'approved', 'rejected');

-- -------------------------------------------------------
-- Table: profiles
-- -------------------------------------------------------
CREATE TABLE public.profiles (
  id    UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role  user_role NOT NULL DEFAULT 'user'
);

-- -------------------------------------------------------
-- Table: manufacturers
-- -------------------------------------------------------
CREATE TABLE public.manufacturers (
  id   SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- -------------------------------------------------------
-- Table: glasses
-- -------------------------------------------------------
CREATE TABLE public.glasses (
  id              SERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name            TEXT NOT NULL,
  description     TEXT,
  image_urls      TEXT[] DEFAULT '{}',
  manufacturer_id INT REFERENCES public.manufacturers(id),
  user_id         UUID REFERENCES auth.users(id),
  status          glass_status NOT NULL DEFAULT 'pending'
);

-- -------------------------------------------------------
-- Seed: manufacturers
-- -------------------------------------------------------
INSERT INTO public.manufacturers (name) VALUES
  ('Duvel'),
  ('Chimay'),
  ('Orval'),
  ('Rochefort'),
  ('Westmalle'),
  ('Chouffe'),
  ('Kwak'),
  ('Delirium'),
  ('Paix Dieu'),
  ('Lindemans');

-- -------------------------------------------------------
-- Trigger: auto-create profile on user signup
-- !! Replace 'YOUR_ADMIN_EMAIL_HERE' with your real email !!
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email = 'hilmi020499@gmail.com'
      THEN 'superadmin'::public.user_role
      ELSE 'user'::public.user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glasses       ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles are publicly viewable"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Helper SECURITY DEFINER: bypasses RLS to avoid recursive policy checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  )
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- manufacturers (public read)
CREATE POLICY "Anyone can read manufacturers"
  ON public.manufacturers FOR SELECT
  USING (true);

-- glasses: public read for approved
CREATE POLICY "Anyone can read approved glasses"
  ON public.glasses FOR SELECT
  USING (status = 'approved');

-- glasses: admins can read ALL (pending, approved, rejected)
CREATE POLICY "Admins can read all glasses"
  ON public.glasses FOR SELECT
  USING (public.is_admin());

-- glasses: authenticated users can submit
CREATE POLICY "Authenticated users can insert glasses"
  ON public.glasses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- glasses: admins can update (approve/reject/edit)
CREATE POLICY "Admins can update glasses"
  ON public.glasses FOR UPDATE
  USING (public.is_admin());

-- glasses: admins can delete
CREATE POLICY "Admins can delete glasses"
  ON public.glasses FOR DELETE
  USING (public.is_admin());

-- -------------------------------------------------------
-- Storage bucket: glass-photos
-- -------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('glass-photos', 'glass-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view glass photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'glass-photos');

CREATE POLICY "Authenticated users can upload glass photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'glass-photos'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can delete glass photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'glass-photos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
