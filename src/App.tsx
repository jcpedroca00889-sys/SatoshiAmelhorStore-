import { useState, useEffect, useMemo } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import ProductsByCategory from "./components/ProductsByCategory";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

import Tutorial from "./components/Tutorial";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import CartPageFull from "./components/CartPageFull";
import AuthPage from "./components/AuthPage";
import CheckoutPage from "./components/CheckoutPage";
import AdminPage from "./components/AdminPage";
import ProfilePage from "./components/ProfilePage";
import OrderDetailPage from "./components/OrderDetailPage";
import { CheckCircle2, X } from "lucide-react";
import { CartProvider, useCart } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { productsData } from "./data/products";
import type { Order } from "./data/orders";
import type { Product } from "./data/products";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 20, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-gradient-to-r from-orange-500 to-orange-300 origin-left"
      style={{ scaleY, transformOrigin: "0% 0%" }}
    />
  );
}

function ScrollToTop() {
  const { scrollYProgress } = useScroll();
  const opacity = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  return (
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-2xl glass flex items-center justify-center text-text-secondary hover:text-orange-500 hover:border-orange-500/30 shadow-lg touch-target"
      style={{ opacity }}
      whileHover={{ scale: 1.12, y: -2 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Voltar ao topo"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6" />
      </svg>
    </motion.button>
  );
}

// ========== Background Particles ultra-leves (CSS em vez de framer) ==========
function BackgroundParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1.5 + Math.random() * 3,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 16,
      color: i % 3 === 0 ? "bg-orange-500/10" : i % 3 === 1 ? "bg-orange-400/8" : "bg-orange-300/6",
    })), []);
  // CSS keyframes já definidos no index.css:
  // .particle-float { animation: particle-float var(--dur) ease-in-out var(--delay) infinite; }
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.color} particle-float`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductSelect = (id: string) => {
    const product = productsData.find((p) => p.id === id) || null;
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => setSelectedProduct(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedProduct ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedProduct]);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseDetail();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for search-to-product navigation from Navbar
  useEffect(() => {
    const handleOpenProduct = (e: Event) => {
      const id = (e as CustomEvent).detail;
      handleProductSelect(id);
    };
    window.addEventListener("open-product", handleOpenProduct);
    return () => window.removeEventListener("open-product", handleOpenProduct);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <AppContent handleProductSelect={handleProductSelect} handleCloseDetail={handleCloseDetail} selectedProduct={selectedProduct} />
      </CartProvider>
    </AuthProvider>
  );
}

function AppContent({ handleProductSelect, handleCloseDetail, selectedProduct }: {
  handleProductSelect: (id: string) => void;
  handleCloseDetail: () => void;
  selectedProduct: Product | null;
}) {
  const { isCartFullPage, isCheckoutOpen, addedItemName, clearAddedFeedback } = useCart();
  const { isAuthPageOpen, openAuthPage } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Listen for open-profile custom event from CheckoutPage
  useEffect(() => {
    const handler = () => setIsProfileOpen(true);
    window.addEventListener("open-profile", handler);
    return () => window.removeEventListener("open-profile", handler);
  }, []);

  // Listen for open-auth custom event from ProfilePage (guest login prompt)
  useEffect(() => {
    const handler = () => openAuthPage();
    window.addEventListener("open-auth", handler);
    return () => window.removeEventListener("open-auth", handler);
  }, [openAuthPage]);

  // Detect /admin path
  const isAdmin = window.location.pathname === "/admin";

  const handleAdminLogout = () => {
    window.history.replaceState(null, "", "/");
    window.location.reload();
  };

  // Lock body scroll when modal/page is open
  useEffect(() => {
    document.body.style.overflow = isCartFullPage || selectedProduct || isAuthPageOpen || isCheckoutOpen || isProfileOpen || selectedOrder ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartFullPage, selectedProduct, isAuthPageOpen, isCheckoutOpen, isProfileOpen, selectedOrder]);

  // Admin mode: render only AdminPage
  if (isAdmin) {
    return (
      <div className="relative min-h-screen bg-surface text-text-primary font-sans overflow-x-hidden">
        <AdminPage onLogout={handleAdminLogout} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface text-text-primary font-sans overflow-x-hidden">
      <BackgroundParticles />
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10 lg:ml-72">
        <Hero />
        <HowItWorks />
        <ProductsByCategory onProductSelect={handleProductSelect} />
        <Testimonials />
        <Newsletter />
        <Footer />
      </main>
      <Tutorial />
      <ScrollToTop />
      <CartPage />

      <AnimatePresence>
        {selectedProduct && !isCartFullPage && (
          <ProductPage
            product={selectedProduct}
            onClose={handleCloseDetail}
            onProductSelect={handleProductSelect}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartFullPage && !isCheckoutOpen && (
          <CartPageFull />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthPageOpen && (
          <AuthPage />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutPage />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileOpen && !isCheckoutOpen && (
          <ProfilePage
            onClose={(view?: string) => {
              setIsProfileOpen(false);
              if (view === "order" && selectedOrder) setSelectedOrder(selectedOrder);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && !isProfileOpen && (
          <OrderDetailPage
            order={selectedOrder}
            onBack={() => {
              setSelectedOrder(null);
              setIsProfileOpen(true);
            }}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 lg:left-72 h-32 bg-gradient-to-t from-surface to-transparent pointer-events-none z-0" />

      {/* ─── Cart Feedback Toast ─── */}
      <AnimatePresence>
        {addedItemName && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass border border-green-500/30 bg-green-500/10 shadow-2xl shadow-green-500/10 backdrop-blur-xl whitespace-nowrap">
              <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-green-400">Adicionado ao carrinho!</p>
                <p className="text-[10px] text-text-tertiary max-w-[200px] truncate">{addedItemName}</p>
              </div>
              <button onClick={clearAddedFeedback} className="p-1 rounded-lg text-text-tertiary hover:text-text-primary transition-colors">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
