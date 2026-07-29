import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, ShoppingCart, TicketCheck, User, Package } from "lucide-react";
import TextReveal from "./TextReveal";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const { totalItems, openCartFullPage } = useCart();
  const { user } = useAuth();

  const quickActions = [
    {
      icon: ShoppingCart,
      label: "Meu Carrinho",
      desc: `${totalItems} item${totalItems !== 1 ? "s" : ""}`,
      badge: totalItems > 0 ? totalItems : undefined,
      onClick: openCartFullPage,
      color: "from-orange-500 to-orange-600",
    },
    ...(user
      ? [
          {
            icon: User,
            label: "Meu Perfil",
            desc: "Ver pedidos e dados",
            onClick: () => window.dispatchEvent(new CustomEvent("open-profile")),
            color: "from-blue-500 to-blue-600",
          },
          {
            icon: TicketCheck,
            label: "Suporte",
            desc: "Abrir ticket ou chat",
            onClick: () => window.dispatchEvent(new CustomEvent("open-support")),
            color: "from-purple-500 to-purple-600",
          },
        ]
      : [
          {
            icon: User,
            label: "Entrar / Cadastrar",
            desc: "Acesse sua conta",
            onClick: () => window.dispatchEvent(new CustomEvent("open-auth")),
            color: "from-blue-500 to-blue-600",
          },
        ]),
    {
      icon: Package,
      label: "Produtos",
      desc: "Navegar catálogo",
      onClick: () => document.querySelector("#todos-produtos")?.scrollIntoView({ behavior: "smooth" }),
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      {/* Grid pattern ultra-sutil */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #f97316 1px, transparent 1px), linear-gradient(0deg, #f97316 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Conteúdo */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 max-w-6xl mx-auto px-4 text-center w-full"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-[11px] sm:text-sm text-orange-500 mb-5 sm:mb-8"
        >
          <Sparkles size={12} className="sm:size-[14px]" />
          <span>Marketplace Premium</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-[2rem] leading-[1.1] xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-3 sm:mb-4"
        >
          <TextReveal text="SATOSHI" className="text-text-primary" delay={0.2} />
          <br />
          <TextReveal text="STORE" className="gradient-text" delay={0.4} />
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto mb-6 sm:mb-8 leading-relaxed"
        >
          Os melhores produtos em áudio, câmeras, games, smartphones e muito mais. 
          Qualidade premium com entrega digital instantânea.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 px-2"
        >
          <motion.a
            href="#todos-produtos"
            className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 text-white font-medium rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-lg shadow-orange-500/20 touch-target"
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 12px 40px rgba(249,115,22,0.4)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Explorar Produtos
            <ArrowRight size={16} className="sm:size-[18px]" />
          </motion.a>

          <motion.a
            href="#como-funciona"
            className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-surface-2/50 border border-border/30 text-text-primary font-medium rounded-xl sm:rounded-2xl text-sm sm:text-base touch-target"
            whileHover={{ scale: 1.05, y: -2, borderColor: "rgba(249,115,22,0.3)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Como Funciona
          </motion.a>
        </motion.div>

        {/* Quick Access Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
        >
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              onClick={action.onClick}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.08 }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex flex-col items-center gap-2 px-3 py-4 sm:py-5 rounded-2xl bg-surface-2/40 border border-border/30 hover:border-orange-500/40 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg shadow-orange-500/10`}>
                <action.icon size={18} className="text-white" />
                {action.badge !== undefined && action.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[7px] font-bold flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
                    {action.badge > 9 ? "9+" : action.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-text-primary">{action.label}</span>
              <span className="text-[9px] text-text-tertiary -mt-1">{action.desc}</span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-1.5 opacity-40">
          <span className="text-[9px] text-text-tertiary">Role para explorar</span>
          <div className="w-4 h-6 rounded-full border border-border/50 flex items-start justify-center p-1">
            <div className="w-0.5 h-1.5 rounded-full bg-text-tertiary/50" />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
    </section>
  );
}
