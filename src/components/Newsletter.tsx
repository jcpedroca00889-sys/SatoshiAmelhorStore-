import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="relative py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border/50"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-surface-2 to-orange-400/5" />

          {/* Animated orbs */}
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-500/10 blur-[80px]"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-orange-500/10 blur-[80px]"
            animate={{
              scale: [1, 1.4, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Content */}
          <div className="relative z-10 px-6 sm:px-12 lg:px-20 py-16 sm:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm text-orange-500 mb-6"
            >
              <Mail size={14} />
              <span>Newsletter</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Fique por dentro das{" "}
              <span className="gradient-text">novidades</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
              Receba ofertas exclusivas, lançamentos e conteúdos especiais diretamente no seu email.
            </p>

            {/* Form */}
            <motion.form
              onSubmit={(e) => e.preventDefault()}
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-text-tertiary" />
                </div>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-3 border border-border rounded-2xl text-text-primary placeholder:text-text-tertiary text-sm focus:outline-none focus:border-orange-500/50 focus:bg-orange-500/5 transition-all duration-300"
                  required
                />
              </div>
              <motion.button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 glass-card-3d card-shine text-white font-medium rounded-2xl shrink-0"
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0 12px 40px rgba(249,115,22,0.3)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="text-orange-500 font-semibold">Inscrever</span>
                <ArrowRight size={16} className="text-orange-500 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
