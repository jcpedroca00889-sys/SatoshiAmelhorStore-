import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Pencil, Trash2, X, Download, Upload,
  ChevronLeft, ChevronRight, LogOut,
  Save, AlertCircle, CheckCircle2, Search, Tags, Copy, AlertTriangle,
} from "lucide-react";
import { productsData, type Product } from "../data/products";

// ─── Storage keys ───
const STORAGE_KEY = "satoshi_store_products";
const CATEGORIES_KEY = "satoshi_store_categories";
const AUTH_KEY = "satoshi_admin_auth";

// ─── Default empty product ───
function emptyProduct(): Product {
  return {
    id: "",
    name: "",
    category: "",
    price: "",
    priceNumber: 0,
    rating: 5,
    reviewCount: 0,
    image: "",
    color: "#f97316",
    description: "",
    details: [""],
    specifications: [{ label: "", value: "" }],
    whatIncluded: [""],
    highlights: [""],
    gallery: [""],
  };
}

// ─── Helpers ───
function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch { /* ignore */ }
  // First load: seed from productsData
  const copy = JSON.parse(JSON.stringify(productsData)) as Product[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  return copy;
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ─── Category helpers ───
const DEFAULT_CATEGORIES = [
  "Áudio", "Câmeras", "Smartphones", "Smartwatches",
  "Games", "Acessórios", "Casa Inteligente", "Outros",
];

function loadCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* ignore */ }
  saveCategories(DEFAULT_CATEGORIES);
  return [...DEFAULT_CATEGORIES];
}

function saveCategories(categories: string[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function generateId(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
}

// ════════════════════════════════════════════════════════════
//  ADMIN PAGE
// ════════════════════════════════════════════════════════════

export default function AdminPage({ onLogout }: { onLogout?: () => void }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const handleLogin = () => {
    const expected = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!expected) {
      setPwError("VITE_ADMIN_PASSWORD não configurado");
      return;
    }
    if (password === expected) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Senha incorreta");
    }
  };

  if (!authed) {
    return (
      <div className="fixed inset-0 z-[80] bg-surface flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="glass-card-3d rounded-2xl border border-border/30 p-6 sm:p-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
              <Package size={22} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-text-primary text-center">Admin</h1>
            <p className="text-xs text-text-tertiary text-center mt-1 mb-6">Satoshi Store</p>

            {pwError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={14} />
                {pwError}
              </div>
            )}

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-surface-2/30 focus-within:border-orange-500/50 transition-all mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
                placeholder="Senha de administrador"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary/60 focus:outline-none"
                autoFocus
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl glass-card-3d card-shine text-white font-semibold text-sm"
            >
              Entrar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard onLogout={onLogout} />;
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════

function AdminDashboard({ onLogout }: { onLogout?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [confirmState, setConfirmState] = useState<{
    title: string; message: string; onConfirm: () => void;
  } | null>(null);
  const PER_PAGE = 10;

  useEffect(() => {
    setProducts(loadProducts());
    setCategories(loadCategories());
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.id.includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }
    return result;
  }, [products, search, categoryFilter]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name, "pt-BR"); break;
        case "price": cmp = a.priceNumber - b.priceNumber; break;
        case "rating": cmp = a.rating - b.rating || a.reviewCount - b.reviewCount; break;
        case "category": cmp = a.category.localeCompare(b.category, "pt-BR"); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paginated = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleSave = (product: Product) => {
    let updated: Product[];
    if (isNew) {
      product.id = generateId(product.name);
      updated = [...products, product];
    } else {
      updated = products.map((p) => (p.id === product.id ? product : p));
    }
    saveProducts(updated);
    setProducts(updated);
    setEditing(null);
    setIsNew(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      title: "Excluir produto",
      message: "Tem certeza que deseja excluir este produto?",
      onConfirm: () => {
        const updated = products.filter((p) => p.id !== id);
        saveProducts(updated);
        setProducts(updated);
        if (editing?.id === id) setEditing(null);
        setConfirmState(null);
      },
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(0);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="ml-1 text-text-tertiary/30">↕</span>;
    return <span className="ml-1 text-orange-500">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const handleDuplicate = (product: Product) => {
    const copy = { ...product, id: "", name: product.name + " (cópia)" };
    setEditing(copy);
    setIsNew(true);
    setPage(0);
  };

  const handleExport = () => {
    const data = { products, categories };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satoshi-store-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // Legacy format (array of products only)
        if (Array.isArray(data)) {
          if (data.length > 0 && !data[0].name) throw new Error("Formato inválido");
          saveProducts(data);
          setProducts(data);
        } else if (data.products) {
          if (!Array.isArray(data.products)) throw new Error("Formato inválido");
          saveProducts(data.products);
          setProducts(data.products);
          if (Array.isArray(data.categories)) {
            saveCategories(data.categories);
            setCategories(data.categories);
          }
        } else {
          throw new Error("Formato inválido");
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        alert("Erro ao importar: " + (err as Error).message);
      }
    };
    input.click();
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    onLogout?.();
    window.location.reload();
  };

  // ─── Category handlers ───
  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    saveCategories(updated);
    setCategories(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    const updated = categories.map((c) => (c === oldName ? trimmed : c));
    saveCategories(updated);
    setCategories(updated);
    // Rename category in products too
    const updatedProducts = products.map((p) =>
      p.category === oldName ? { ...p, category: trimmed } : p
    );
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteCategory = (name: string) => {
    const inUse = products.filter((p) => p.category === name);
    let message = `Deseja excluir a categoria "${name}"?`;
    if (inUse.length > 0) {
      message = `"${name}" está em uso por ${inUse.length} produto(s). Deseja mover esses produtos para "Outros" e excluir a categoria?`;
    }
    setConfirmState({
      title: "Excluir categoria",
      message,
      onConfirm: () => {
        if (inUse.length > 0) {
          const updatedProducts = products.map((p) =>
            p.category === name ? { ...p, category: "Outros" } : p
          );
          saveProducts(updatedProducts);
          setProducts(updatedProducts);
        }
        const updated = categories.filter((c) => c !== name);
        saveCategories(updated);
        setCategories(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setConfirmState(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-text-primary">Admin</span>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface-3/50 rounded-xl p-0.5 border border-border/20">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "products"
                  ? "glass-card-3d text-orange-500"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Produtos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "categories"
                  ? "glass-card-3d text-orange-500"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Categorias ({categories.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleImport} className="p-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-orange-500" title="Importar JSON">
              <Upload size={16} />
            </button>
            <button onClick={handleExport} className="p-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-orange-500" title="Exportar JSON">
              <Download size={16} />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-red-400" title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Saved feedback */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-400 text-sm"
            >
              <CheckCircle2 size={16} />
              Dados salvos com sucesso!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/30 bg-surface-2/30 focus-within:border-orange-500/50 transition-all">
                <Search size={16} className="text-text-tertiary shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Buscar produtos..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary/60 focus:outline-none"
                />
              </div>
              <select
                value={categoryFilter || ""}
                onChange={(e) => { setCategoryFilter(e.target.value || null); setPage(0); }}
                className="px-3 py-2.5 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => { setEditing(emptyProduct()); setIsNew(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card-3d card-shine text-white font-medium text-sm"
              >
                <Plus size={16} />
                Novo
              </button>
            </div>

            {paginated.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <Package size={40} className="text-text-tertiary/30" />
                <p className="text-sm text-text-tertiary">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">
                  <button onClick={() => handleSort("name")} className="col-span-4 flex items-center text-left hover:text-text-primary transition-colors">
                    Produto <SortIcon field="name" />
                  </button>
                  <button onClick={() => handleSort("category")} className="col-span-2 flex items-center text-left hover:text-text-primary transition-colors">
                    Categoria <SortIcon field="category" />
                  </button>
                  <button onClick={() => handleSort("price")} className="col-span-2 flex items-center text-left hover:text-text-primary transition-colors">
                    Preço <SortIcon field="price" />
                  </button>
                  <button onClick={() => handleSort("rating")} className="col-span-2 flex items-center text-left hover:text-text-primary transition-colors">
                    Avaliação <SortIcon field="rating" />
                  </button>
                  <div className="col-span-2 text-right">Ações</div>
                </div>
                {paginated.map((product) => (
                  <div key={product.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center px-4 py-3 rounded-xl glass-card-3d card-shine border border-border/20 hover:border-orange-500/20 transition-all">
                    <div className="col-span-4 flex items-center gap-3">
                      <span className="text-xl shrink-0">{product.image}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                        <p className="text-[10px] text-text-tertiary font-mono truncate">{product.id}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-500">
                        {product.category}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-semibold text-orange-500">{product.price}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-yellow-500">{product.rating}.0</span>
                        <span className="text-[10px] text-text-tertiary">({product.reviewCount})</span>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditing({ ...product }); setIsNew(false); }}
                        className="p-2 rounded-lg glass-card-3d card-shine text-text-secondary hover:text-orange-500"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(product)}
                        className="p-2 rounded-lg glass-card-3d card-shine text-text-secondary hover:text-blue-400"
                        title="Duplicar"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg glass-card-3d card-shine text-text-secondary hover:text-red-400"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-orange-500 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-text-tertiary">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-orange-500 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <CategoriesManager
            categories={categories}
            productCounts={useMemo(() => {
              const counts: Record<string, number> = {};
              products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
              return counts;
            }, [products])}
            onAdd={handleAddCategory}
            onRename={handleRenameCategory}
            onDelete={handleDeleteCategory}
          />
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <ProductFormModal
            product={editing}
            isNew={isNew}
            categories={categories}
            onSave={handleSave}
            onClose={() => { setEditing(null); setIsNew(false); }}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmState && (
          <ConfirmModal
            title={confirmState.title}
            message={confirmState.message}
            onConfirm={confirmState.onConfirm}
            onCancel={() => setConfirmState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  PRODUCT FORM MODAL
// ════════════════════════════════════════════════════════════

function ProductFormModal({
  product, isNew, categories, onSave, onClose,
}: {
  product: Product;
  isNew: boolean;
  categories: string[];
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Product>({ ...product });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório";
    if (!form.category) errs.category = "Categoria é obrigatória";
    if (!form.price.trim()) errs.price = "Preço é obrigatório";
    else if (form.priceNumber <= 0) errs.priceNumber = "Preço deve ser maior que zero";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  const update = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateArray = (key: "details" | "whatIncluded" | "highlights" | "gallery", index: number, value: string) => {
    const arr = [...form[key]];
    arr[index] = value;
    update(key, arr);
  };

  const addArray = (key: "details" | "whatIncluded" | "highlights" | "gallery") => {
    update(key, [...form[key], ""]);
  };

  const removeArray = (key: "details" | "whatIncluded" | "highlights" | "gallery", index: number) => {
    const arr = form[key].filter((_, i) => i !== index);
    update(key, arr.length ? arr : [""]);
  };

  const updateSpec = (index: number, field: "label" | "value", value: string) => {
    const specs = [...form.specifications];
    specs[index] = { ...specs[index], [field]: value };
    update("specifications", specs);
  };

  const addSpec = () => {
    update("specifications", [...form.specifications, { label: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    const specs = form.specifications.filter((_, i) => i !== index);
    update("specifications", specs.length ? specs : [{ label: "", value: "" }]);
  };

  // Auto-fill price string from priceNumber
  const handlePriceNumber = (val: number) => {
    update("priceNumber", val);
    if (!isNaN(val)) {
      update("price", "R$ " + val.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave(form);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onSave, form]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="min-h-screen flex items-start justify-center p-4 pt-8 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          className="w-full max-w-3xl glass rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 bg-surface/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                {isNew ? <Plus size={16} className="text-orange-500" /> : <Pencil size={16} className="text-orange-500" />}
              </div>
              <h2 className="text-sm font-semibold text-text-primary">
                {isNew ? "Novo Produto" : "Editar Produto"}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl glass-card-3d card-shine text-text-tertiary hover:text-text-primary">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-5">
            {/* Row: Image + Color + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Imagem (emoji)</label>
                <input type="text" value={form.image} onChange={(e) => update("image", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Cor (hex)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={(e) => update("color", e.target.value)}
                    className="w-10 h-10 rounded-xl border border-border/30 cursor-pointer bg-transparent" />
                  <input type="text" value={form.color} onChange={(e) => update("color", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Categoria</label>
                <select value={form.category} onChange={(e) => { update("category", e.target.value); setErrors((prev) => ({ ...prev, category: "" })); }}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none transition-all"
                  style={{ borderColor: errors.category ? "rgba(239,68,68,0.5)" : undefined }}
                >
                  {categories.length === 0 && <option value="">Sem categorias</option>}
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-[10px] mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Name + ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Nome</label>
                <input type="text" value={form.name} onChange={(e) => { update("name", e.target.value); setErrors((prev) => ({ ...prev, name: "" })); }}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none transition-all"
                  style={{ borderColor: errors.name ? "rgba(239,68,68,0.5)" : undefined }} />
                {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">ID (automático)</label>
                <input type="text" value={form.id} disabled
                  className="w-full px-3 py-2 rounded-xl border border-border/30 bg-surface-3/50 text-sm text-text-tertiary font-mono cursor-not-allowed" />
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Preço (R$)</label>
                <input type="text" value={form.price} onChange={(e) => { update("price", e.target.value); setErrors((prev) => ({ ...prev, price: "" })); }}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none transition-all"
                  style={{ borderColor: errors.price ? "rgba(239,68,68,0.5)" : undefined }} />
                {errors.price && <p className="text-red-400 text-[10px] mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Preço (número)</label>
                <input type="number" value={form.priceNumber} onChange={(e) => handlePriceNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none transition-all"
                  style={{ borderColor: errors.priceNumber ? "rgba(239,68,68,0.5)" : undefined }} />
                {errors.priceNumber && <p className="text-red-400 text-[10px] mt-1">{errors.priceNumber}</p>}
              </div>
            </div>

            {/* Rating + ReviewCount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Avaliação (1-5)</label>
                <input type="number" min={1} max={5} step={0.5} value={form.rating}
                  onChange={(e) => update("rating", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Nº de avaliações</label>
                <input type="number" min={0} value={form.reviewCount}
                  onChange={(e) => update("reviewCount", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Descrição</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all resize-y" />
            </div>

            {/* Arrays */}
            <ArrayEditor label="Detalhes" items={form.details} onChange={(i, v) => updateArray("details", i, v)} onAdd={() => addArray("details")} onRemove={(i) => removeArray("details", i)} />
            <ArrayEditor label="O que está incluso" items={form.whatIncluded} onChange={(i, v) => updateArray("whatIncluded", i, v)} onAdd={() => addArray("whatIncluded")} onRemove={(i) => removeArray("whatIncluded", i)} />
            <ArrayEditor label="Highlights" items={form.highlights} onChange={(i, v) => updateArray("highlights", i, v)} onAdd={() => addArray("highlights")} onRemove={(i) => removeArray("highlights", i)} />
            <ArrayEditor label="Galeria (emojis)" items={form.gallery} onChange={(i, v) => updateArray("gallery", i, v)} onAdd={() => addArray("gallery")} onRemove={(i) => removeArray("gallery", i)} />

            {/* Specifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-text-secondary">Especificações</label>
                <button onClick={addSpec} className="p-1 rounded-lg glass-card-3d card-shine text-orange-500 hover:text-orange-400">
                  <Plus size={12} />
                </button>
              </div>
              <div className="space-y-2">
                {form.specifications.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={spec.label} onChange={(e) => updateSpec(i, "label", e.target.value)}
                      placeholder="Label"
                      className="flex-1 px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all" />
                    <input type="text" value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)}
                      placeholder="Valor"
                      className="flex-1 px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all" />
                    <button onClick={() => removeSpec(i)} className="p-2 rounded-lg glass-card-3d card-shine text-text-tertiary hover:text-red-400 shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border/30 bg-surface/80 backdrop-blur-sm">
            <button onClick={onClose} className="px-4 py-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-text-primary text-sm">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl glass-card-3d card-shine text-white font-medium text-sm"
            >
              <Save size={15} />
              {isNew ? "Criar" : "Salvar"}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  CATEGORIES MANAGER
// ════════════════════════════════════════════════════════════

function CategoriesManager({
  categories, productCounts, onAdd, onRename, onDelete,
}: {
  categories: string[];
  productCounts: Record<string, number>;
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    onAdd(newName);
    setNewName("");
  };

  const handleStartRename = (index: number) => {
    setEditingIndex(index);
    setEditValue(categories[index]);
  };

  const handleConfirmRename = () => {
    if (editingIndex === null) return;
    onRename(categories[editingIndex], editValue);
    setEditingIndex(null);
    setEditValue("");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/30 bg-surface-2/30 focus-within:border-orange-500/50 transition-all">
          <Tags size={16} className="text-text-tertiary shrink-0" />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="Nova categoria..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary/60 focus:outline-none"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card-3d card-shine text-white font-medium text-sm disabled:opacity-40"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Tags size={40} className="text-text-tertiary/30" />
          <p className="text-sm text-text-tertiary">Nenhuma categoria</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <div key={cat} className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card-3d card-shine border border-border/20 hover:border-orange-500/20 transition-all">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Tags size={14} className="text-orange-500" />
              </div>

              {editingIndex === i ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleConfirmRename(); if (e.key === "Escape") setEditingIndex(null); }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all"
                    autoFocus
                  />
                  <button onClick={handleConfirmRename} className="p-1.5 rounded-lg glass-card-3d card-shine text-green-500 hover:text-green-400">
                    <CheckCircle2 size={14} />
                  </button>
                  <button onClick={() => setEditingIndex(null)} className="p-1.5 rounded-lg glass-card-3d card-shine text-text-tertiary hover:text-text-primary">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-text-primary flex items-center gap-2">
                    {cat}
                    <span className="text-[10px] text-text-tertiary bg-surface-3 px-1.5 py-0.5 rounded-full">
                      {productCounts[cat] || 0} produtos
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartRename(i)}
                      className="p-2 rounded-lg glass-card-3d card-shine text-text-secondary hover:text-orange-500"
                      title="Renomear"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(cat)}
                      className="p-2 rounded-lg glass-card-3d card-shine text-text-secondary hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  CONFIRM MODAL
// ════════════════════════════════════════════════════════════

function ConfirmModal({
  title, message, onConfirm, onCancel,
}: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="w-full max-w-sm glass rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
      >
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <p className="text-xs text-text-tertiary mt-1">{message}</p>
          </div>
          <div className="flex items-center gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-text-primary text-sm">
              Cancelar
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  ARRAY EDITOR (reusable for details, highlights, etc.)
// ════════════════════════════════════════════════════════════

function ArrayEditor({
  label, items, onChange, onAdd, onRemove,
}: {
  label: string;
  items: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-text-secondary">{label}</label>
        <button onClick={onAdd} className="p-1 rounded-lg glass-card-3d card-shine text-orange-500 hover:text-orange-400">
          <Plus size={12} />
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={item} onChange={(e) => onChange(i, e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary focus:border-orange-500/50 focus:outline-none transition-all" />
            <button onClick={() => onRemove(i)} className="p-2 rounded-lg glass-card-3d card-shine text-text-tertiary hover:text-red-400 shrink-0">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
