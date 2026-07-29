import { supabase, type Category, type ProductType, type ProductSummary, type ProductDetail, type RelatedProduct } from "../lib/supabase";

// ─── Tipos ───
export interface UserSession {
  id: string;
  username: string;
  name: string;
}

// ─── Sessão via localStorage ───
const SESSION_KEY = "satoshi_user";

function saveSession(user: UserSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSavedSession(): UserSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    clearSession();
    return null;
  }
}

// ─── Auth helpers ───
export async function signUp(name: string, username: string, password: string) {
  const { data, error } = await supabase.rpc("criar_usuario", {
    p_username: username,
    p_password: password,
    p_name: name,
  });
  if (error) throw new Error(error.message);
  const user = data as unknown as UserSession;
  saveSession(user);
  return { user };
}

export async function signIn(username: string, password: string) {
  const { data, error } = await supabase.rpc("verificar_usuario", {
    p_username: username,
    p_password: password,
  });
  if (error) throw new Error(error.message);
  const user = data as unknown as UserSession;
  saveSession(user);
  return { user };
}

export async function signOut() {
  clearSession();
}

export async function getCurrentUser(): Promise<UserSession | null> {
  return getSavedSession();
}

// ─── Cart helpers ───
export async function getCart(userId: string) {
  const { data, error } = await supabase
    .from("carts")
    .select("product_id, quantity")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function syncCart(userId: string, items: { productId: number; quantity: number }[]) {
  await supabase.from("carts").delete().eq("user_id", userId);
  if (items.length > 0) {
    const { error } = await supabase.from("carts").insert(
      items.map((item) => ({ user_id: userId, product_id: item.productId, quantity: item.quantity }))
    );
    if (error) throw new Error(error.message);
  }
  return true;
}

// ─── Order helpers ───
export async function saveOrder(data: {
  userId?: string;
  items: { productId: number; productName: string; price: number; quantity: number; image: string; color: string }[];
  total: number;
  paymentMethod: string;
  guestName: string;
  guestEmail: string;
}) {
  const orderCode = "SS-" + Date.now().toString(36).toUpperCase();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: data.userId || null,
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      total: data.total,
      payment_method: data.paymentMethod,
      order_code: orderCode,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: itemsError } = await supabase.from("order_items").insert(
    data.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.price,
      quantity: item.quantity,
      image: item.image,
      color: item.color,
    }))
  );
  if (itemsError) throw new Error(itemsError.message);

  return { orderCode };
}

// ─── Product queries ───
export async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.from("categories").select("*").order("item_count", { ascending: false });
  return (data as Category[]) || [];
}

export async function getProductTypes(): Promise<ProductType[]> {
  const { data } = await supabase.from("product_types").select("*");
  return (data as ProductType[]) || [];
}

export async function getProducts(params?: {
  category?: string;
  type?: string;
  featured?: boolean;
  search?: string;
}): Promise<ProductSummary[]> {
  let query = supabase
    .from("products")
    .select(`*, categories!inner(name, slug, icon), product_types!inner(name, slug)`)
    .eq("is_active", true);

  if (params?.category) query = query.eq("categories.slug", params.category);
  if (params?.type) query = query.eq("product_types.slug", params.type);
  if (params?.featured) query = query.eq("featured", true);
  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });

  const { data } = await query;
  return ((data || []) as any[]).map((p) => ({
    ...p,
    category_name: p.categories?.name || "",
    category_slug: p.categories?.slug || "",
    category_icon: p.categories?.icon || "",
    product_type_name: p.product_types?.name || "",
    product_type_slug: p.product_types?.slug || "",
  })) as ProductSummary[];
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const { data: product } = await supabase
    .from("products")
    .select(`*, categories!inner(name, slug, icon, color), product_types!inner(name, slug)`)
    .eq("slug", slug)
    .single();

  if (!product) return null;

  const p = product as any;
  const base = {
    ...p,
    category_name: p.categories?.name || "",
    category_slug: p.categories?.slug || "",
    category_icon: p.categories?.icon || "",
    category_color: p.categories?.color || "",
    product_type_name: p.product_types?.name || "",
    product_type_slug: p.product_types?.slug || "",
  };

  const [detailsRes, specsRes, highlightsRes, includedRes, galleryRes, reviewsRes] = await Promise.all([
    supabase.from("product_details").select("detail_text").eq("product_id", p.id).order("sort_order"),
    supabase.from("product_specifications").select("label, value").eq("product_id", p.id).order("sort_order"),
    supabase.from("product_highlights").select("highlight_text").eq("product_id", p.id).order("sort_order"),
    supabase.from("what_included").select("item_text").eq("product_id", p.id).order("sort_order"),
    supabase.from("product_gallery").select("emoji").eq("product_id", p.id).order("sort_order"),
    supabase.from("reviews").select("*").eq("product_id", p.id).order("created_at", { ascending: false }),
  ]);

  return {
    ...base,
    details: (detailsRes.data || []).map((r: any) => r.detail_text),
    specifications: (specsRes.data || []) as { label: string; value: string }[],
    highlights: (highlightsRes.data || []).map((r: any) => r.highlight_text),
    whatIncluded: (includedRes.data || []).map((r: any) => r.item_text),
    gallery: (galleryRes.data || []).map((r: any) => r.emoji),
    reviews: (reviewsRes.data || []) as any[],
  } as ProductDetail;
}

export async function getRelatedProducts(slug: string): Promise<RelatedProduct[]> {
  const { data: prod } = await supabase.from("products").select("id, category_id").eq("slug", slug).single();
  if (!prod) return [];

  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, image, color, rating")
    .eq("category_id", (prod as any).category_id)
    .neq("id", (prod as any).id)
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("rating", { ascending: false })
    .limit(4);

  return (data as RelatedProduct[]) || [];
}
