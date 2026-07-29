import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, LayoutGrid, HelpCircle, MessageCircle, Info, X, LogOut, LogIn, ArrowRight, TicketCheck } from "lucide-react";
import { productsData } from "../data/products";
import type { Product } from "../data/products";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { name: "Produtos", href: "#todos-produtos", icon: LayoutGrid },
  { name: "Como Funciona", href: "#como-funciona", icon: HelpCircle },
  { name: "Depoimentos", href: "#depoimentos", icon: MessageCircle },
  { name: "Sobre", href: "#sobre", icon: Info },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { totalItems, openCartFullPage } = useCart();
  const { user, openAuthPage, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setSearchQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return productsData.filter((p) => {
      const name = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cat = p.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const desc = p.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const highlights = p.highlights.join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || cat.includes(q) || desc.includes(q) || highlights.includes(q);
    });
  }, [searchQuery]);

  const handleSelectProduct = (product: Product) => {
    setSearchOpen(false);
    setSearchQuery("");
    window.dispatchEvent(new CustomEvent("open-product", { detail: product.id }));
  };

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside className="fixed left-0 top-0 bottom-0 z-30 w-72 hidden lg:flex flex-col bg-surface/80 backdrop-blur-xl border-r border-border/30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border/20">
          <img src="/logo.png" alt="" className="h-8 w-auto rounded-lg shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight">
              Satoshi <span className="text-orange-500">Store</span>
            </div>
            <div className="text-[10px] text-text-tertiary mt-0.5">Marketplace Premium</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-orange-500 hover:bg-orange-500/5 transition-all duration-200 group"
              >
                <span className="w-8 h-8 rounded-lg bg-surface-2/50 group-hover:bg-orange-500/10 flex items-center justify-center shrink-0 transition-all">
                  <Icon size={15} className="group-hover:text-orange-500 transition-colors" />
                </span>
                {link.name}
              </a>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-border/20">
          {user ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
                <p className="text-[9px] text-text-tertiary truncate">@{user.username}</p>
              </div>
            </div>
          ) : (
            <button onClick={openAuthPage} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-orange-500/5 transition-all group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <LogIn size={13} />
              </div>
              <div className="min-w-0 text-left flex-1">
                <p className="text-xs font-medium text-text-primary truncate group-hover:text-orange-500 transition-colors">Fazer Login</p>
                <p className="text-[9px] text-text-tertiary truncate">Acesse sua conta</p>
              </div>
              <ArrowRight size={12} className="text-text-tertiary group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          )}
        </div>
      </aside>

      {/* ========== TOP BAR ========== */}
      <header className="fixed top-0 left-0 right-0 z-40 lg:left-72 h-14 sm:h-16 lg:h-20 bg-surface/70 backdrop-blur-xl border-b border-border/20 flex items-center">
        <div className="flex items-center justify-between w-full px-3 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2 lg:hidden">
            <img src="/logo.png" alt="Satoshi Store" className="h-7 w-auto sm:h-8 rounded-lg" />
            <span className="text-base sm:text-lg font-semibold tracking-tight">
              Satoshi <span className="text-orange-500">Store</span>
            </span>
          </a>

          {/* Spacer on desktop */}
          <div className="hidden lg:block" />

          <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
            {/* Auth button */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="relative flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl hover:bg-orange-500/10 transition-all duration-200"
                  aria-label="Perfil"
                >
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 py-2 rounded-xl glass border border-border/30 shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border/20">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
                            <p className="text-[9px] text-text-tertiary truncate">@{user.username}</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border/20 pt-1 px-2 pb-2 space-y-0.5">
                        <button
                          onClick={() => { setUserMenuOpen(false); window.dispatchEvent(new CustomEvent("open-support")); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-orange-400 hover:bg-orange-500/5 transition-colors"
                        >
                          <TicketCheck size={14} />
                          Meus Tickets
                        </button>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-red-400 hover:bg-red-500/5 transition-colors"
                        >
                          <LogOut size={14} />
                          Sair da conta
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={openAuthPage}
                className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-xl text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
                aria-label="Entrar"
              >
                <LogIn size={16} className="sm:size-[18px]" />
              </button>
            )}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl text-text-secondary hover:text-orange-500 hover:bg-orange-500/5 transition-all duration-200"
              aria-label="Buscar"
            >
              <Search size={16} className="sm:size-[18px]" />
            </button>
            <button onClick={openCartFullPage} className="relative p-2 sm:p-2.5 rounded-xl text-text-secondary hover:text-orange-500 hover:bg-orange-500/5 transition-all duration-200" aria-label="Carrinho">
              <ShoppingCart size={16} className="sm:size-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-[18px] sm:h-[18px] bg-orange-500 rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========== MOBILE BOTTOM NAV ========== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
          <div className="flex justify-center px-4">
            <div className="bg-surface/80 backdrop-blur-xl rounded-2xl px-2 py-1.5 shadow-[0_-4px_30px_rgba(0,0,0,0.3)] border border-border/20 flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a key={link.name} href={link.href} onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-text-tertiary hover:text-orange-500 transition-colors min-w-[52px] relative group"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-orange-500/10 transition-all">
                      <Icon size={18} className="group-hover:text-orange-500 transition-colors" />
                    </span>
                    <span className="text-[9px] font-medium leading-none">{link.name}</span>
                  </a>
                );
              })}
                      {/* Support button on mobile */}
              <button onClick={() => window.dispatchEvent(new CustomEvent("open-support"))}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-text-tertiary hover:text-orange-500 transition-colors min-w-[52px] relative group"
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-orange-500/10 transition-all">
                  <TicketCheck size={18} className="group-hover:text-orange-500 transition-colors" />
                </span>
                <span className="text-[9px] font-medium leading-none">Suporte</span>
              </button>
              {/* Cart button on mobile */}
              <button onClick={openCartFullPage}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-orange-500 min-w-[52px] relative group"
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-orange-500/10 transition-all relative">
                  <ShoppingCart size={18} className="group-hover:text-orange-500 transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full text-[7px] font-bold flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-medium leading-none text-orange-500">Carrinho</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SEARCH OVERLAY ========== */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          >
            <div
              className="max-w-xl mx-auto mt-16 sm:mt-20 px-3 sm:px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ y: -20, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="bg-surface/95 backdrop-blur-xl rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center gap-2 sm:gap-3 p-2">
                  <Search size={16} className="sm:size-5 text-text-tertiary ml-2 sm:ml-3 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary text-base sm:text-lg py-2.5 sm:py-3 focus:outline-none min-w-0"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-3/50 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-surface-2/50 text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-all shrink-0"
                  >
                    ESC
                  </button>
                </div>

                {searchQuery.trim() && (
                  <div className="border-t border-border/20 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
                    {results.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-10 px-4">
                        <Search size={32} className="text-text-tertiary/30" />
                        <p className="text-sm text-text-tertiary">Nenhum produto encontrado para "<span className="text-text-secondary">{searchQuery}</span>"</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        <p className="text-[10px] text-text-tertiary px-2 py-1 font-medium uppercase tracking-wider">
                          {results.length} produto{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
                        </p>
                        {results.slice(0, 8).map((product, i) => (
                          <motion.button
                            key={product.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => handleSelectProduct(product)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-2/50 transition-colors text-left group"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                              style={{ backgroundColor: product.color + "20" }}
                            >
                              {product.image}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary group-hover:text-orange-500 transition-colors truncate">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-semibold text-orange-500">{product.price}</span>
                                <span className="text-[10px] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded-full">{product.category}</span>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                        {results.length > 8 && (
                          <p className="text-center text-[10px] text-text-tertiary py-2 border-t border-border/10 mt-1">
                            + {results.length - 8} resultado{results.length - 8 !== 1 ? "s" : ""} — refine sua busca
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!searchQuery.trim() && (
                  <div className="flex flex-col items-center gap-3 py-8 px-4">
                    <Search size={28} className="text-text-tertiary/20" />
                    <p className="text-xs text-text-tertiary text-center max-w-xs">
                      Digite o nome de um produto, categoria ou característica para começar a buscar
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-1">
                      {["AirPods", "Câmera", "Gamer", "iPhone", "Smartwatch"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setSearchQuery(suggestion)}
                          className="px-3 py-1 rounded-full bg-surface-2/50 text-[10px] text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
