import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ───

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  item_count: number;
}

export interface ProductType {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  product_type_id: number;
  description: string;
  price: number;
  original_price: number;
  rating: number;
  review_count: number;
  image: string;
  color: string;
  is_active: boolean;
  featured: boolean;
  badge_text: string | null;
  category_name: string;
  category_slug: string;
  category_icon: string;
  product_type_name: string;
  product_type_slug: string;
}

export interface ProductDetail extends ProductSummary {
  details: string[];
  specifications: { label: string; value: string }[];
  highlights: string[];
  what_included: string[];
  gallery: string[];
  reviews: Review[];
}

export interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
}

export interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  color: string;
  rating: number;
}
