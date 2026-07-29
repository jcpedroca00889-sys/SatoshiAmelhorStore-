import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import TextReveal from "./TextReveal";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background orbs com CSS animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-orange-500/8 blur-[80px] sm:blur-[120px] orb-float-1"
        />
        <div
          className="absolute -bottom-40 -right-40 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-orange-500/8 blur-[80px] sm:blur-[120px] orb-float-2"
        />
        <div
          className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-orange-400/5 blur-[100px] hidden sm:block orb-pulse-1"
        />
        <div
          className="absolute top-2/3 right-1/4 w-[200px] h-[200px] rounded-full bg-orange-300/4 blur-[80px] hidden sm:block orb-pulse-2"
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] sm:opacity-[0.02] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #f97316 1px, transparent 1px), linear-gradient(0deg, #f97316 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating emojis com CSS animation */}
      <div className="hidden sm:block pointer-events-none">
        <span className="absolute" style={{ left: "10%", top: "20%", animation: "float-emoji 6s ease-in-out infinite" }}>🛒</span>
        <span className="absolute" style={{ left: "80%", top: "30%", animation: "float-emoji 7s ease-in-out 0.5s infinite" }}>⚡</span>
        <span className="absolute" style={{ left: "85%", top: "60%", animation: "float-emoji 8s ease-in-out 1.5s infinite" }}>💎</span>
        <span className="absolute" style={{ left: "50%", top: "15%", animation: "float-emoji 6.5s ease-in-out 2s infinite" }}>🚀</span>
      </div>

      {/* Banner de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden lg:block">
        <div className="w-full h-full opacity-[0.12]">
          <img
            src="/banner.png"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-surface/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-surface/10" />
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
          className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 glass-glow rounded-full text-[11px] sm:text-sm text-orange-500 mb-5 sm:mb-8"
        >
          <Sparkles size={12} className="sm:size-[14px]" />
          <span className="hidden xs:inline">Marketplace Premium</span>
          <span className="inline xs:hidden">Premium</span>
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

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 px-2"
        >
          <motion.a
            href="#todos-produtos"
            className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl sm:rounded-2xl text-sm sm:text-base touch-target"
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 12px 40px rgba(249,115,22,0.35)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Explorar Produtos
            <ArrowRight size={16} className="sm:size-[18px]" />
          </motion.a>

          <motion.a
            href="#como-funciona"
            className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 glass text-text-primary font-medium rounded-xl sm:rounded-2xl text-sm sm:text-base touch-target"
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 12px 40px rgba(249,115,22,0.12)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Como Funciona
            <Zap size={16} className="sm:size-[18px] text-orange-400" />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator com CSS animation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:block">
        <div
          className="flex flex-col items-center gap-1.5"
          style={{ animation: "float-scroll 2.5s ease-in-out infinite" }}
        >
          <span className="text-[10px] sm:text-xs text-text-tertiary">Role para explorar</span>
          <div className="w-4 h-6 rounded-full border border-border flex items-start justify-center p-1">
            <div
              className="w-0.5 h-1.5 rounded-full bg-orange-400"
              style={{ animation: "scroll-dot 2.5s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 md:h-48 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
    </section>
  );
}
