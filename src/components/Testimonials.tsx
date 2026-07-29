import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Rafael Mendes",
    role: "Desenvolvedor Full Stack",
    avatar: "👨‍💻",
    content:
      "A plataforma mais incrível que já usei. Comprei um curso e em segundos já estava acessando o conteúdo. A experiência é simplesmente impecável!",
    rating: 5,
  },
  {
    name: "Ana Beatriz",
    role: "Designer UX/UI",
    avatar: "👩‍🎨",
    content:
      "Os templates de design que adquiri aqui superaram todas as expectativas. Qualidade impressionante e entrega instantânea. Recomendo de olhos fechados!",
    rating: 5,
  },
  {
    name: "Lucas Oliveira",
    role: "Empreendedor Digital",
    avatar: "👨‍💼",
    content:
      "Finalmente um marketplace focado em produtos digitais de verdade. O processo de compra é super fluido e o suporte é excepcional. Nota 10!",
    rating: 5,
  },
  {
    name: "Juliana Costa",
    role: "Criadora de Conteúdo",
    avatar: "👩‍💻",
    content:
      "Simplesmente amei! A curadoria dos produtos é fantástica, encontrei ferramentas que mudaram meu workflow. A entrega via email foi super rápida.",
    rating: 4,
  },
  {
    name: "Pedro Santos",
    role: "Engenheiro de Software",
    avatar: "👨‍🔬",
    content:
      "A variedade de produtos digitais é impressionante. Desde e-books até softwares completos. E o melhor: tudo entregue na hora!",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, next]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const t = testimonials[current];

  return (
    <section id="depoimentos" className="relative py-8 sm:py-12 overflow-hidden scroll-mt-20">
      {/* Background with gradient orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[120px]"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm text-orange-500 mb-6"
          >
            <Quote size={14} />
            <span>Depoimentos</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            O que nossos{" "}
            <span className="gradient-text">Clientes</span> dizem
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Mais de 5 mil clientes satisfeitos. Veja o que eles estão falando.
          </p>
        </motion.div>

        {/* Carrossel */}
        <div
          className="max-w-2xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="relative min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                }}
                className="w-full"
              >
                <motion.div
                  className="glass-premium rounded-3xl p-8 md:p-10 text-center preserve-3d"
                  whileHover={{ rotateX: 2, rotateY: 2, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: 0.1,
                    }}
                    className="text-5xl mb-6 inline-block"
                  >
                    {t.avatar}
                  </motion.div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                      >
                        <Star
                          size={18}
                          className={
                            i < t.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-border"
                          }
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 italic"
                  >
                    &ldquo;{t.content}&rdquo;
                  </motion.p>

                  {/* Author */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <h4 className="text-text-primary font-medium">{t.name}</h4>
                    <span className="text-sm text-text-tertiary">{t.role}</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <motion.button
              onClick={prev}
              className="p-3 rounded-xl glass text-text-secondary hover:text-orange-500 hover:border-orange-500/30 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </motion.button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 h-2 bg-orange-500"
                      : "w-2 h-2 bg-border hover:bg-border-light"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Depoimento ${i + 1}`}
                />
              ))}
            </div>

            <motion.button
              onClick={next}
              className="p-3 rounded-xl glass text-text-secondary hover:text-orange-500 hover:border-orange-500/30 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Próximo"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
